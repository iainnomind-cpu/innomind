import { ChargeNote, AccountsPayable, RecurringExpense, TreasuryProjectionPoint, TreasuryScenario } from '@/types';
import { addDays } from 'date-fns';

/**
 * Utilidad para normalizar cualquier fecha a UTC medianoche (00:00:00.000 UTC).
 * Esto evita desfases horarios del cliente o del servidor en las proyecciones.
 */
export function toUTCDate(dateInput: Date | string | number): Date {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return new Date();
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

/**
 * Obtener la representación YYYY-MM-DD UTC de una fecha.
 */
export function toISODateString(date: Date): string {
    return date.toISOString().split('T')[0];
}

export class FinancialEngine {
    /**
     * Calcula los 90 días de proyecciones financieras para todos los escenarios de forma paralela.
     * Complejidad: O(90 + N) utilizando agrupaciones en mapas asociativos.
     */
    static calculateProjection(
        initialBalance: number,
        chargeNotes: ChargeNote[],
        payables: AccountsPayable[],
        recurringExpenses: RecurringExpense[],
        activeScenario: TreasuryScenario,
        simulatedPayableOverrides: Record<string, { newDueDate?: Date; excluded?: boolean }> = {},
        simulatedReceivableOverrides: Record<string, { newDueDate?: Date; accelerated?: boolean; excluded?: boolean }> = {},
        customerScoringCache: Record<string, 'low' | 'medium' | 'high'> = {}
    ): TreasuryProjectionPoint[] {
        const points: TreasuryProjectionPoint[] = [];
        const todayUTC = toUTCDate(new Date());

        // 1. Preprocesar CxC (Cobros/Entradas) en mapas agrupados por fecha para cada escenario
        const inflowMapOptimista: Record<string, number> = {};
        const inflowMapConservador: Record<string, number> = {};
        const inflowMapCritico: Record<string, number> = {};

        (chargeNotes || []).forEach(note => {
            if (!note || note.status === 'paid' || note.status === 'cancelled') return;
            const originalDueDate = toUTCDate(note.due_date);
            const amount = note.balance_due || note.total_amount || 0;
            const clientId = note.client_id;
            const scoring = customerScoringCache[clientId] || 'low';

            // Determinar si hay simulación en memoria
            const sim = simulatedReceivableOverrides[note.id];
            const isExcluded = sim?.excluded ?? false;
            
            let simDueDate = sim?.newDueDate || (sim as any)?.dueDate ? toUTCDate(sim.newDueDate || (sim as any).dueDate) : null;
            if (sim?.accelerated) {
                // Acelerar cobro: programarlo para mañana
                simDueDate = addDays(todayUTC, 1);
            }

            if (isExcluded) return;

            // --- Escenario Optimista ---
            // Cobranza del 100% de CxC (incluyendo alto riesgo) adelantada 3 días.
            let dateOpt = simDueDate || addDays(originalDueDate, -3);
            if (dateOpt.getTime() < todayUTC.getTime()) dateOpt = todayUTC;
            const keyOpt = toISODateString(dateOpt);
            inflowMapOptimista[keyOpt] = (inflowMapOptimista[keyOpt] || 0) + amount;

            // --- Escenario Conservador (Realista) ---
            // Cobranza a fecha pactada. Se excluyen de alto riesgo y se pondera a 75% los de medio riesgo.
            let dateCons = simDueDate || originalDueDate;
            const keyCons = toISODateString(dateCons);
            let factorCons = 1;
            if (!simDueDate) { // Solo aplicar penalización si no es una fecha simulada explícitamente
                if (scoring === 'high' || note.status === 'overdue') {
                    factorCons = 0; // Exclusión
                } else if (scoring === 'medium') {
                    factorCons = 0.75; // Ponderado al 75%
                }
            }
            inflowMapConservador[keyCons] = (inflowMapConservador[keyCons] || 0) + (amount * factorCons);

            // --- Escenario Crítico ---
            // Retrasos de 12 días en toda cobranza de CxC y exclusión del 20% por impago.
            let dateCrit = simDueDate || addDays(originalDueDate, 12);
            if (dateCrit.getTime() < todayUTC.getTime()) dateCrit = todayUTC;
            const keyCrit = toISODateString(dateCrit);
            inflowMapCritico[keyCrit] = (inflowMapCritico[keyCrit] || 0) + (amount * 0.80);
        });

        // 2. Preprocesar CxP (Pagos/Salidas) en mapas agrupados por fecha para cada escenario
        const outflowMapOptimista: Record<string, number> = {};
        const outflowMapConservador: Record<string, number> = {};
        const outflowMapCritico: Record<string, number> = {};

        (payables || []).forEach(payable => {
            if (!payable || payable.status === 'paid' || payable.status === 'cancelled') return;
            const originalDueDate = toUTCDate(payable.due_date);
            const amount = payable.balance_due || payable.amount || 0;

            // Determinar si el concepto es de Alta Prioridad
            const conceptLower = (payable.concept || '').toLowerCase();
            const isHighPriority = conceptLower.includes('nomina') ||
                conceptLower.includes('sueldo') ||
                conceptLower.includes('renta') ||
                conceptLower.includes('arrendamiento') ||
                conceptLower.includes('sat') ||
                conceptLower.includes('impuesto') ||
                conceptLower.includes('luz') ||
                conceptLower.includes('agua') ||
                conceptLower.includes('internet') ||
                conceptLower.includes('cfe') ||
                conceptLower.includes('servicio critico') ||
                conceptLower.includes('servicio crítico');

            // Determinar si hay simulación en memoria
            const sim = simulatedPayableOverrides[payable.id];
            const isExcluded = sim?.excluded ?? false;
            const simDueDate = sim?.newDueDate || (sim as any)?.dueDate ? toUTCDate(sim.newDueDate || (sim as any).dueDate) : null;

            if (isExcluded) return;

            // --- Escenario Optimista ---
            // Egresos en fecha pactada.
            const keyOpt = toISODateString(simDueDate || originalDueDate);
            outflowMapOptimista[keyOpt] = (outflowMapOptimista[keyOpt] || 0) + amount;

            // --- Escenario Conservador ---
            // Egresos en fecha pactada.
            const keyCons = toISODateString(simDueDate || originalDueDate);
            outflowMapConservador[keyCons] = (outflowMapConservador[keyCons] || 0) + amount;

            // --- Escenario Crítico ---
            // Solo se pagan egresos de Alta Prioridad, y aumentan un 10% por inflación/emergencia.
            if (isHighPriority) {
                const keyCrit = toISODateString(simDueDate || originalDueDate);
                outflowMapCritico[keyCrit] = (outflowMapCritico[keyCrit] || 0) + (amount * 1.10);
            }
            // Los egresos de prioridad baja/media simplemente no se pagan en este escenario (no se agregan al flujo)
        });

        // 3. Preprocesar Gastos Recurrentes en mapas llaveados por fecha
        const recOutflowMapOptimista: Record<string, number> = {};
        const recOutflowMapConservador: Record<string, number> = {};
        const recOutflowMapCritico: Record<string, number> = {};

        for (let i = 0; i <= 90; i++) {
            const currentDate = addDays(todayUTC, i);
            const dateKey = toISODateString(currentDate);

            let dayRecAmount = 0;
            (recurringExpenses || []).forEach(rec => {
                if (!rec || !rec.active) return;
                let isDue = false;
                if (rec.frequency === 'monthly') {
                    if (currentDate.getUTCDate() === rec.day_of_period) isDue = true;
                } else if (rec.frequency === 'weekly') {
                    if (currentDate.getUTCDay() === (rec.day_of_period % 7)) isDue = true;
                }

                if (isDue) {
                    dayRecAmount += (rec.amount || 0);
                }
            });

            recOutflowMapOptimista[dateKey] = dayRecAmount;
            recOutflowMapConservador[dateKey] = dayRecAmount;
            recOutflowMapCritico[dateKey] = dayRecAmount * 1.10; // +10% en crítico
        }

        // 4. Simulación diaria rolling balance
        let balanceOpt = initialBalance;
        let balanceCons = initialBalance;
        let balanceCrit = initialBalance;

        for (let i = 0; i <= 90; i++) {
            const currentDate = addDays(todayUTC, i);
            const dateKey = toISODateString(currentDate);

            // Integrar Inflows/Outflows por escenario
            const infOpt = inflowMapOptimista[dateKey] || 0;
            const outOpt = (outflowMapOptimista[dateKey] || 0) + (recOutflowMapOptimista[dateKey] || 0);

            const infCons = inflowMapConservador[dateKey] || 0;
            const outCons = (outflowMapConservador[dateKey] || 0) + (recOutflowMapConservador[dateKey] || 0);

            const infCrit = inflowMapCritico[dateKey] || 0;
            const outCrit = (outflowMapCritico[dateKey] || 0) + (recOutflowMapCritico[dateKey] || 0);

            balanceOpt = balanceOpt + infOpt - outOpt;
            balanceCons = balanceCons + infCons - outCons;
            balanceCrit = balanceCrit + infCrit - outCrit;

            // Determinar valores del escenario activo para los campos simplificados
            let activeBalance = balanceCons;
            let activeInflow = infCons;
            let activeOutflow = outCons;

            if (activeScenario === 'optimista') {
                activeBalance = balanceOpt;
                activeInflow = infOpt;
                activeOutflow = outOpt;
            } else if (activeScenario === 'critico') {
                activeBalance = balanceCrit;
                activeInflow = infCrit;
                activeOutflow = outCrit;
            }

            points.push({
                date: currentDate,
                balance: activeBalance,
                inflow: activeInflow,
                outflow: activeOutflow,
                balanceOptimista: balanceOpt,
                balanceConservador: balanceCons,
                balanceCritico: balanceCrit,
                inflowOptimista: infOpt,
                outflowOptimista: outOpt,
                inflowConservador: infCons,
                outflowConservador: outCons,
                inflowCritico: infCrit,
                outflowCritico: outCrit
            });
        }

        return points;
    }
}
