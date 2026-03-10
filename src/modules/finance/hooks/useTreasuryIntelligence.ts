import { useMemo, useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { useAccountsPayable } from '@/context/AccountsPayableContext';
import { useAccountsReceivable } from '@/context/AccountsReceivableContext';
import { TreasuryProjectionPoint, TreasuryScenario, AccountsPayable, ChargeNote } from '@/types';
import { addDays, isSameDay, startOfDay } from 'date-fns';

export function useTreasuryIntelligence() {
    const { accounts, recurringExpenses } = useFinance();
    const { payables } = useAccountsPayable();
    const { chargeNotes } = useAccountsReceivable();

    const [scenario, setScenario] = useState<TreasuryScenario>('realistic');

    // Simulations (Local temporary state for "What if")
    const [simulatedPayableOverrides, setSimulatedPayableOverrides] = useState<Record<string, { dueDate?: Date, excluded?: boolean }>>({});
    const [simulatedReceivableOverrides, setSimulatedReceivableOverrides] = useState<Record<string, { dueDate?: Date, excluded?: boolean }>>({});

    const initialBalance = useMemo(() => {
        return (accounts || []).reduce((sum, acc) => sum + (acc.saldoActual || 0), 0);
    }, [accounts]);

    const projection = useMemo(() => {
        const points: TreasuryProjectionPoint[] = [];
        const today = startOfDay(new Date());

        // Helper to get adjusted date/amount based on scenario
        const getAdjustedAR = (note: ChargeNote) => {
            let dueDate = startOfDay(new Date(note.due_date));
            let amount = note.balance_due;

            if (simulatedReceivableOverrides[note.id]) {
                const ov = simulatedReceivableOverrides[note.id];
                if (ov.excluded) return null;
                if (ov.dueDate) dueDate = startOfDay(ov.dueDate);
            }

            if (scenario === 'optimistic') {
                dueDate = addDays(dueDate, -3); // Collect 3 days earlier
            } else if (scenario === 'pessimistic') {
                dueDate = addDays(dueDate, 7); // 7 days delay
                amount = amount * 0.95; // 5% risk of non-payment or costs
            }
            return { dueDate, amount };
        };

        const getAdjustedAP = (payable: AccountsPayable) => {
            let dueDate = startOfDay(new Date(payable.due_date));
            let amount = payable.balance_due;

            if (simulatedPayableOverrides[payable.id]) {
                const ov = simulatedPayableOverrides[payable.id];
                if (ov.excluded) return null;
                if (ov.dueDate) dueDate = startOfDay(ov.dueDate);
            }

            if (scenario === 'pessimistic') {
                amount = amount * 1.05; // 5% unexpected cost increase
            }
            return { dueDate, amount };
        };

        // Recalculate daily for 90 days
        let rollingBalance = initialBalance;

        for (let i = 0; i <= 90; i++) {
            const currentDate = addDays(today, i);
            let dayInflow = 0;
            let dayOutflow = 0;

            // 1. AR Inflows
            (chargeNotes || []).forEach(note => {
                if (!note || note.status === 'paid' || note.status === 'cancelled') return;
                const adj = getAdjustedAR(note);
                if (adj && isSameDay(adj.dueDate, currentDate)) {
                    dayInflow += adj.amount;
                }
            });

            // 2. AP Outflows
            (payables || []).forEach(payable => {
                if (!payable || payable.status === 'paid') return;
                const adj = getAdjustedAP(payable);
                if (adj && isSameDay(adj.dueDate, currentDate)) {
                    dayOutflow += adj.amount;
                }
            });

            // 3. Recurring Expenses
            (recurringExpenses || []).forEach(rec => {
                if (!rec || !rec.active) return;
                // Simple logic: if frequency matches day of period
                // For monthly: rec.day_of_period matches currentDate.getDate()
                // For weekly: rec.day_of_period matches currentDate.getDay() (1-7)
                let isDue = false;
                if (rec.frequency === 'monthly') {
                    if (currentDate.getDate() === rec.day_of_period) isDue = true;
                } else if (rec.frequency === 'weekly') {
                    if (currentDate.getDay() === (rec.day_of_period % 7)) isDue = true;
                }

                if (isDue) {
                    let amount = rec.amount || 0;
                    if (scenario === 'pessimistic') amount *= 1.1; // 10% inflation/extra costs
                    dayOutflow += amount;
                }
            });

            rollingBalance = rollingBalance + dayInflow - dayOutflow;

            points.push({
                date: currentDate,
                balance: rollingBalance,
                inflow: dayInflow,
                outflow: dayOutflow
            });
        }

        return points;
    }, [initialBalance, chargeNotes, payables, recurringExpenses, scenario, simulatedPayableOverrides, simulatedReceivableOverrides]);

    // Traffic Light Logic
    const trafficLight = useMemo(() => {
        const firstDeficitPoint = projection.find(p => p.balance < 0);
        const daysToDeficit = firstDeficitPoint
            ? Math.ceil((firstDeficitPoint.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            : 91;

        let status: 'green' | 'yellow' | 'red' = 'green';
        if (daysToDeficit <= 30) status = 'red';
        else if (daysToDeficit <= 90) status = 'yellow';

        return {
            status,
            daysToDeficit: firstDeficitPoint ? daysToDeficit : null,
            deficitAmount: firstDeficitPoint ? Math.abs(firstDeficitPoint.balance) : 0,
            deficitDate: firstDeficitPoint ? firstDeficitPoint.date : null
        };
    }, [projection]);

    const simulatePayable = (id: string, dueDate?: Date, excluded?: boolean) => {
        setSimulatedPayableOverrides(prev => ({
            ...prev,
            [id]: { dueDate, excluded }
        }));
    };

    const simulateReceivable = (id: string, dueDate?: Date, excluded?: boolean) => {
        setSimulatedReceivableOverrides(prev => ({
            ...prev,
            [id]: { dueDate, excluded }
        }));
    };

    const resetSimulations = () => {
        setSimulatedPayableOverrides({});
        setSimulatedReceivableOverrides({});
    };

    return {
        projection,
        scenario,
        setScenario,
        trafficLight,
        simulatePayable,
        simulateReceivable,
        resetSimulations,
        initialBalance,
        simulatedPayableOverrides,
        simulatedReceivableOverrides
    };
}
