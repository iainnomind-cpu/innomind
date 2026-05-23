import { ChargeNote, AccountsPayable, TreasuryProjectionPoint } from '@/types';
import { differenceInDays, isBefore, startOfDay } from 'date-fns';

export interface CFOAlert {
    hasAlert: boolean;
    gapAmount: number;
    criticalDate: Date | null;
    riskInflows: ChargeNote[];
    suggestedDeferrals: AccountsPayable[];
    suggestedAccelerations: ChargeNote[];
}

export class AdvisorEngine {
    /**
     * Calcula el perfil de riesgo dinámico ('low' | 'medium' | 'high') de cada cliente
     * basándose en el historial de cobros (charge_notes pagadas con retraso).
     */
    static calculateCustomerScoring(chargeNotes: ChargeNote[]): Record<string, 'low' | 'medium' | 'high'> {
        const clientStats: Record<string, { totalPaid: number; totalDelayed: number; totalDelayDays: number }> = {};

        (chargeNotes || []).forEach(note => {
            if (!note || note.status !== 'paid' || !note.client_id) return;

            const clientId = note.client_id;
            const dueDate = note.due_date ? new Date(note.due_date) : null;
            
            // Si no tiene pagos registrados, no podemos evaluar su historial de pago
            if (!note.payments || note.payments.length === 0 || !dueDate) return;

            // Determinar la fecha del último pago
            const paymentDates = note.payments
                .map(p => p.payment_date ? new Date(p.payment_date) : null)
                .filter((d): d is Date => d !== null);

            if (paymentDates.length === 0) return;
            const lastPaymentDate = new Date(Math.max(...paymentDates.map(d => d.getTime())));

            const delayDays = differenceInDays(startOfDay(lastPaymentDate), startOfDay(dueDate));

            if (!clientStats[clientId]) {
                clientStats[clientId] = { totalPaid: 0, totalDelayed: 0, totalDelayDays: 0 };
            }

            const stats = clientStats[clientId];
            stats.totalPaid += 1;
            if (delayDays > 0) {
                stats.totalDelayed += 1;
                stats.totalDelayDays += delayDays;
            }
        });

        const scoring: Record<string, 'low' | 'medium' | 'high'> = {};

        Object.entries(clientStats).forEach(([clientId, stats]) => {
            if (stats.totalPaid === 0) {
                scoring[clientId] = 'low';
                return;
            }

            const averageDelay = stats.totalDelayDays / stats.totalPaid;
            const delayFrequency = stats.totalDelayed / stats.totalPaid;

            if (averageDelay > 15) {
                scoring[clientId] = 'high'; // Moroso frecuente / Alto riesgo
            } else if (averageDelay > 5 || delayFrequency > 0.25) {
                scoring[clientId] = 'medium'; // Riesgo medio
            } else {
                scoring[clientId] = 'low'; // Buen pagador / Bajo riesgo
            }
        });

        return scoring;
    }

    /**
     * Define la prioridad de un egreso o gasto recurrente.
     * Prioridad alta para nómina, rentas, impuestos, servicios indispensables.
     */
    static getOutflowPriority(concept: string): 'high' | 'low' {
        const conceptLower = (concept || '').toLowerCase();
        const highPriorityKeywords = [
            'nomina', 'nómina', 'sueldo', 'renta', 'arrendamiento', 'sat', 
            'impuesto', 'luz', 'agua', 'internet', 'cfe', 'servicio critico', 
            'servicio crítico', 'impuestos', 'sat'
        ];

        const matches = highPriorityKeywords.some(keyword => conceptLower.includes(keyword));
        return matches ? 'high' : 'low';
    }

    /**
     * Genera alertas financieras CFO evitando falsos positivos:
     * - Dispara alerta solo si el balance acumulado cae por debajo del threshold de seguridad
     *   y persiste por al menos 2 días consecutivos.
     * - Sugiere acciones de remediación con base en el flujo en riesgo y egresos diferibles.
     */
    static generateCFOAlerts(
        projection: TreasuryProjectionPoint[],
        payables: AccountsPayable[],
        chargeNotes: ChargeNote[],
        customerScoring: Record<string, 'low' | 'medium' | 'high'>,
        safetyThreshold: number = -5000
    ): CFOAlert {
        let hasAlert = false;
        let criticalIndex = -1;

        // 1. Detectar si el déficit persiste por lo menos 2 días
        for (let i = 0; i < projection.length - 1; i++) {
            if (projection[i].balance < safetyThreshold && projection[i + 1].balance < safetyThreshold) {
                hasAlert = true;
                criticalIndex = i;
                break;
            }
        }

        if (!hasAlert || criticalIndex === -1) {
            return {
                hasAlert: false,
                gapAmount: 0,
                criticalDate: null,
                riskInflows: [],
                suggestedDeferrals: [],
                suggestedAccelerations: []
            };
        }

        const criticalDate = projection[criticalIndex].date;

        // Calcular el Gap Financiero máximo en los 90 días (el balance más bajo respecto al threshold de seguridad)
        let minBalance = safetyThreshold;
        projection.forEach(pt => {
            if (pt.balance < minBalance) {
                minBalance = pt.balance;
            }
        });
        const gapAmount = Math.abs(minBalance - safetyThreshold);

        // 2. Cobros en riesgo (inflows) vencidos o por vencer entre hoy y la fecha crítica
        const riskInflows = (chargeNotes || []).filter(note => {
            if (!note || note.status === 'paid' || note.status === 'cancelled') return false;
            
            const dueDate = note.due_date ? new Date(note.due_date) : null;
            if (!dueDate) return false;

            const isBeforeOrOnCritical = isBefore(dueDate, criticalDate) || 
                dueDate.getTime() === criticalDate.getTime();

            if (!isBeforeOrOnCritical) return false;

            const scoring = customerScoring[note.client_id] || 'low';
            return scoring === 'high' || scoring === 'medium' || note.status === 'overdue';
        });

        // 3. Sugerir pagos a diferir (CxP) de prioridad baja con vencimiento cercano a la fecha crítica
        const suggestedDeferrals = (payables || []).filter(p => {
            if (!p || p.status === 'paid' || p.status === 'cancelled') return false;
            
            const dueDate = p.due_date ? new Date(p.due_date) : null;
            if (!dueDate) return false;

            const isEssential = this.getOutflowPriority(p.concept) === 'high';
            if (isEssential) return false;

            // Pagos que vencen antes de la fecha crítica o dentro de los siguientes 7 días de holgura
            const criticalDatePlus7 = new Date(criticalDate.getTime() + 7 * 24 * 60 * 60 * 1000);
            return isBefore(dueDate, criticalDatePlus7);
        }).sort((a, b) => (b.balance_due || b.amount || 0) - (a.balance_due || a.amount || 0)); // Priorizar diferir montos grandes

        // 4. Sugerir cobros a acelerar (CxC) de prioridad o facturación importante
        const suggestedAccelerations = (chargeNotes || []).filter(note => {
            if (!note || note.status === 'paid' || note.status === 'cancelled') return false;
            
            const dueDate = note.due_date ? new Date(note.due_date) : null;
            if (!dueDate) return false;

            // Cobros con fecha de vencimiento dentro de los 15 días posteriores o anteriores a la fecha crítica
            const criticalDatePlus15 = new Date(criticalDate.getTime() + 15 * 24 * 60 * 60 * 1000);
            return isBefore(dueDate, criticalDatePlus15);
        }).sort((a, b) => (b.balance_due || b.total_amount || 0) - (a.balance_due || a.total_amount || 0)); // Priorizar montos grandes

        return {
            hasAlert,
            gapAmount,
            criticalDate,
            riskInflows,
            suggestedDeferrals,
            suggestedAccelerations
        };
    }
}
