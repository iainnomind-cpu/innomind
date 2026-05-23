import { useMemo, useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { useAccountsPayable } from '@/context/AccountsPayableContext';
import { useAccountsReceivable } from '@/context/AccountsReceivableContext';
import { TreasuryScenario } from '@/types';
import { addDays, startOfDay } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { FinancialEngine } from '../services/FinancialEngine';
import { AdvisorEngine } from '../services/AdvisorEngine';

export function useTreasuryIntelligence() {
    const { accounts, recurringExpenses } = useFinance();
    const { payables, fetchPayables } = useAccountsPayable();
    const { chargeNotes, fetchChargeNotes } = useAccountsReceivable();

    const [scenario, setScenario] = useState<TreasuryScenario>('conservador');
    const [isApplyingOverrides, setIsApplyingOverrides] = useState(false);

    // Simulations (Local temporary state for "What if" - matches FinancialEngine signatures)
    const [simulatedPayableOverrides, setSimulatedPayableOverrides] = useState<Record<string, { newDueDate?: Date; excluded?: boolean }>>({});
    const [simulatedReceivableOverrides, setSimulatedReceivableOverrides] = useState<Record<string, { newDueDate?: Date; accelerated?: boolean; excluded?: boolean }>>({});

    const initialBalance = useMemo(() => {
        return (accounts || []).reduce((sum, acc) => sum + (acc.saldoActual || 0), 0);
    }, [accounts]);

    const customerScoring = useMemo(() => {
        return AdvisorEngine.calculateCustomerScoring(chargeNotes || []);
    }, [chargeNotes]);

    const projection = useMemo(() => {
        return FinancialEngine.calculateProjection(
            initialBalance,
            chargeNotes || [],
            payables || [],
            recurringExpenses || [],
            scenario,
            simulatedPayableOverrides,
            simulatedReceivableOverrides,
            customerScoring
        );
    }, [
        initialBalance,
        chargeNotes,
        payables,
        recurringExpenses,
        scenario,
        simulatedPayableOverrides,
        simulatedReceivableOverrides,
        customerScoring
    ]);

    const burnRate = useMemo(() => {
        if (!projection || projection.length === 0) return 0;
        const totalOutflow = projection.reduce((sum, pt) => sum + pt.outflow, 0);
        return totalOutflow / projection.length;
    }, [projection]);

    const runwayDays = useMemo(() => {
        const firstDeficitIndex = projection.findIndex(p => p.balance < 0);
        if (firstDeficitIndex !== -1) {
            return firstDeficitIndex; // index corresponds to the day number from today (0-90)
        }
        if (burnRate <= 0) return 999;
        const estimated = Math.floor(initialBalance / burnRate);
        return estimated > 90 ? estimated : 90;
    }, [projection, initialBalance, burnRate]);

    const trafficLight = useMemo(() => {
        let status: 'green' | 'yellow' | 'red' = 'green';
        if (runwayDays < 30) {
            status = 'red';
        } else if (runwayDays <= 90) {
            status = 'yellow';
        }

        const firstDeficitPoint = projection.find(p => p.balance < 0);

        return {
            status,
            daysToDeficit: firstDeficitPoint ? runwayDays : null,
            deficitAmount: firstDeficitPoint ? Math.abs(firstDeficitPoint.balance) : 0,
            deficitDate: firstDeficitPoint ? firstDeficitPoint.date : null,
            runwayDays,
            burnRate
        };
    }, [projection, runwayDays, burnRate]);

    const cfoAlert = useMemo(() => {
        return AdvisorEngine.generateCFOAlerts(
            projection,
            payables || [],
            chargeNotes || [],
            customerScoring,
            -5000 // umbral de seguridad
        );
    }, [projection, payables, chargeNotes, customerScoring]);

    const simulatePayable = (id: string, newDueDate?: Date, excluded?: boolean) => {
        setSimulatedPayableOverrides(prev => {
            const next = { ...prev };
            if (newDueDate === undefined && excluded === undefined) {
                delete next[id];
            } else {
                next[id] = { newDueDate, excluded };
            }
            return next;
        });
    };

    const simulateReceivable = (id: string, newDueDate?: Date, accelerated?: boolean, excluded?: boolean) => {
        setSimulatedReceivableOverrides(prev => {
            const next = { ...prev };
            if (newDueDate === undefined && accelerated === undefined && excluded === undefined) {
                delete next[id];
            } else {
                next[id] = { newDueDate, accelerated, excluded };
            }
            return next;
        });
    };

    const resetSimulations = () => {
        setSimulatedPayableOverrides({});
        setSimulatedReceivableOverrides({});
    };

    const applySimulatedOverridesInDB = async () => {
        setIsApplyingOverrides(true);
        try {
            // Actualizar accounts_payable en Supabase
            const payablePromises = Object.entries(simulatedPayableOverrides).map(async ([id, override]) => {
                if (override.newDueDate) {
                    const { error } = await supabase
                        .from('accounts_payable')
                        .update({ due_date: override.newDueDate.toISOString().split('T')[0] })
                        .eq('id', id);
                    if (error) throw error;
                }
            });

            // Actualizar charge_notes (CxC) en Supabase
            const receivablePromises = Object.entries(simulatedReceivableOverrides).map(async ([id, override]) => {
                let targetDate: Date | null = null;
                if (override.accelerated) {
                    targetDate = addDays(startOfDay(new Date()), 1);
                } else if (override.newDueDate) {
                    targetDate = override.newDueDate;
                }

                if (targetDate) {
                    const { error } = await supabase
                        .from('charge_notes')
                        .update({ 
                            due_date: targetDate.toISOString().split('T')[0],
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', id);
                    if (error) throw error;
                }
            });

            await Promise.all([...payablePromises, ...receivablePromises]);
            
            // Refrescar contextos
            await Promise.all([
                fetchPayables ? fetchPayables() : Promise.resolve(),
                fetchChargeNotes ? fetchChargeNotes() : Promise.resolve()
            ]);

            resetSimulations();
        } catch (error) {
            console.error('Error applying simulated overrides to DB:', error);
            throw error;
        } finally {
            setIsApplyingOverrides(false);
        }
    };

    return {
        projection,
        scenario,
        setScenario,
        trafficLight,
        cfoAlert,
        customerScoring,
        simulatePayable,
        simulateReceivable,
        resetSimulations,
        initialBalance,
        simulatedPayableOverrides,
        simulatedReceivableOverrides,
        applySimulatedOverridesInDB,
        isApplyingOverrides
    };
}
