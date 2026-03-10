import React, { createContext, useContext, useState, useEffect } from 'react';
import { FinanceAccount, FinanceDocument, FinancePayment, Expense, RecurringExpense, BankMovement, TreasuryMovementType } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

interface FinanceContextType {
    accounts: FinanceAccount[];
    documents: FinanceDocument[];
    expenses: Expense[];
    recurringExpenses: RecurringExpense[];
    payments: FinancePayment[];
    isLoadingFinance: boolean;

    // Accounts Fetch & Action (Manual resync)
    refreshFinanceData: () => Promise<void>;

    // Recurring Expenses
    addRecurringExpense: (data: Omit<RecurringExpense, 'id' | 'created_at' | 'workspace_id'>) => Promise<void>;
    updateRecurringExpense: (id: string, updates: Partial<RecurringExpense>) => Promise<void>;
    deleteRecurringExpense: (id: string) => Promise<void>;

    // Accounts
    addAccount: (acc: Omit<FinanceAccount, 'id' | 'saldoActual' | 'updatedAt'>) => Promise<void>;
    updateAccount: (id: string, updates: Partial<FinanceAccount>) => Promise<void>;

    // Documents (Legacy/Generic)
    addDocument: (doc: Omit<FinanceDocument, 'id' | 'createdAt' | 'saldoPendiente'>) => Promise<FinanceDocument | null>;
    updateDocumentStatus: (id: string, estado: FinanceDocument['estado']) => Promise<void>;

    // Expenses (New)
    addExpense: (expense: Omit<Expense, 'id' | 'created_at' | 'updated_at' | 'status' | 'workspace_id'>) => Promise<Expense | null>;
    updateExpenseStatus: (id: string, status: Expense['status']) => Promise<void>;

    // Payments
    registerPayment: (payment: Omit<FinancePayment, 'id' | 'createdAt'>) => Promise<void>;

    // Treasury Management
    adjustAccountBalance: (accountId: string, amount: number, type: 'aumentar' | 'disminuir', reason: string) => Promise<void>;
    transferBetweenAccounts: (sourceAccountId: string, targetAccountId: string, amount: number, description: string) => Promise<void>;
    getAccountMovements: (accountId: string) => Promise<BankMovement[]>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user: authUser } = useAuth();
    const [isLoadingFinance, setIsLoadingFinance] = useState(true);

    const [accounts, setAccounts] = useState<FinanceAccount[]>([]);
    const [documents, setDocuments] = useState<FinanceDocument[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
    const [payments, setPayments] = useState<FinancePayment[]>([]);

    const mapAccount = (row: any): FinanceAccount => ({
        id: row.id,
        nombre: row.nombre,
        tipo: row.tipo,
        moneda: row.moneda,
        saldoInicial: Number(row.saldo_inicial),
        saldoActual: Number(row.saldo_actual),
        activo: row.activo,
        updatedAt: new Date(row.updated_at)
    });

    const mapDocument = (row: any): FinanceDocument => ({
        id: row.id,
        tipo: row.tipo,
        estado: row.estado,
        numeroFolio: row.numero_folio,
        montoTotal: Number(row.monto_total),
        saldoPendiente: Number(row.saldo_pendiente),
        moneda: row.moneda,
        fechaEmision: new Date(row.fecha_emision),
        fechaVencimiento: row.fecha_vencimiento ? new Date(row.fecha_vencimiento) : undefined,
        prospectId: row.prospect_id,
        quoteId: row.quote_id,
        proveedorNombre: row.proveedor_nombre,
        categoria: row.categoria,
        concepto: row.concepto,
        evidenciaUrl: row.evidencia_url,
        createdAt: new Date(row.created_at)
    });

    const mapExpense = (row: any): Expense => ({
        id: row.id,
        workspace_id: row.workspace_id,
        employee_id: row.employee_id,
        amount: Number(row.amount),
        category: row.category,
        description: row.description,
        expense_date: new Date(row.expense_date),
        paid_by: row.paid_by,
        status: row.status,
        receipt_url: row.receipt_url,
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at)
    });

    const mapPayment = (row: any): FinancePayment => ({
        id: row.id,
        documentId: row.document_id,
        accountId: row.account_id,
        monto: Number(row.monto),
        fechaPago: new Date(row.fecha_pago),
        metodoPago: row.metodo_pago,
        referencia: row.referencia,
        comprobanteUrl: row.comprobante_url,
        notas: row.notas,
        createdAt: new Date(row.created_at)
    });

    const mapRecurringExpense = (row: any): RecurringExpense => ({
        id: row.id,
        workspace_id: row.workspace_id,
        concept: row.concept,
        amount: Number(row.amount),
        category: row.category,
        frequency: row.frequency,
        day_of_period: row.day_of_period,
        start_date: new Date(row.start_date),
        end_date: row.end_date ? new Date(row.end_date) : undefined,
        active: row.active,
        created_at: new Date(row.created_at)
    });

    const refreshFinanceData = async () => {
        if (!authUser) return;
        setIsLoadingFinance(true);
        try {
            const [accRes, docRes, expRes, recurringRes, payRes] = await Promise.all([
                supabase.from('finance_accounts').select('*').order('nombre'),
                supabase.from('finance_documents').select('*').order('created_at', { ascending: false }),
                supabase.from('expenses').select('*').order('expense_date', { ascending: false }),
                supabase.from('recurring_expenses').select('*').order('concept'),
                supabase.from('finance_payments').select('*').order('fecha_pago', { ascending: false })
            ]);

            if (accRes.data) setAccounts(accRes.data.map(mapAccount));
            if (docRes.data) setDocuments(docRes.data.map(mapDocument));
            if (expRes.data) setExpenses(expRes.data.map(mapExpense));
            if (recurringRes.data) setRecurringExpenses(recurringRes.data.map(mapRecurringExpense));
            if (payRes.data) setPayments(payRes.data.map(mapPayment));
        } catch (error) {
            console.error('Error fetching finance data:', error);
        } finally {
            setIsLoadingFinance(false);
        }
    };

    useEffect(() => {
        if (!authUser) {
            setAccounts([]);
            setDocuments([]);
            setExpenses([]);
            setRecurringExpenses([]);
            setPayments([]);
            setIsLoadingFinance(false);
            return;
        }
        refreshFinanceData();
    }, [authUser]);

    // Recurring Expenses
    const addRecurringExpense = async (data: Omit<RecurringExpense, 'id' | 'created_at' | 'workspace_id'>) => {
        const { data: recData, error } = await supabase.from('recurring_expenses').insert(data).select().single();
        if (recData && !error) {
            setRecurringExpenses(prev => [...prev, mapRecurringExpense(recData)]);
        }
    };

    const updateRecurringExpense = async (id: string, updates: Partial<RecurringExpense>) => {
        const { error } = await supabase.from('recurring_expenses').update(updates).eq('id', id);
        if (!error) {
            setRecurringExpenses(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
        }
    };

    const deleteRecurringExpense = async (id: string) => {
        const { error } = await supabase.from('recurring_expenses').delete().eq('id', id);
        if (!error) {
            setRecurringExpenses(prev => prev.filter(r => r.id !== id));
        }
    };

    // Accounts
    const addAccount = async (acc: Omit<FinanceAccount, 'id' | 'saldoActual' | 'updatedAt'>) => {
        const payload = {
            nombre: acc.nombre,
            tipo: acc.tipo,
            moneda: acc.moneda,
            saldo_inicial: acc.saldoInicial,
            saldo_actual: acc.saldoInicial, // init saldo_actual with saldo_inicial
            activo: acc.activo
        };
        const { data, error } = await supabase.from('finance_accounts').insert(payload).select().single();
        if (data && !error) {
            setAccounts(prev => [...prev, mapAccount(data)]);
        }
    };

    const updateAccount = async (id: string, updates: Partial<FinanceAccount>) => {
        const payload: any = {};
        if (updates.nombre !== undefined) payload.nombre = updates.nombre;
        if (updates.tipo !== undefined) payload.tipo = updates.tipo;
        if (updates.activo !== undefined) payload.activo = updates.activo;
        if (updates.saldoActual !== undefined) payload.saldo_actual = updates.saldoActual; // Caution: Manual override

        if (Object.keys(payload).length > 0) {
            await supabase.from('finance_accounts').update(payload).eq('id', id);
            refreshFinanceData(); // Fetch to keep consistent state via views
        }
    };

    // Documents
    const addDocument = async (doc: Omit<FinanceDocument, 'id' | 'createdAt' | 'saldoPendiente'>) => {
        const payload = {
            tipo: doc.tipo,
            estado: doc.estado,
            numero_folio: doc.numeroFolio,
            monto_total: doc.montoTotal,
            saldo_pendiente: doc.montoTotal, // Starts full
            moneda: doc.moneda,
            fecha_emision: doc.fechaEmision.toISOString().split('T')[0],
            fecha_vencimiento: doc.fechaVencimiento ? doc.fechaVencimiento.toISOString().split('T')[0] : null,
            prospect_id: doc.prospectId,
            quote_id: doc.quoteId,
            proveedor_nombre: doc.proveedorNombre,
            categoria: doc.categoria,
            concepto: doc.concepto,
            evidencia_url: doc.evidenciaUrl,
            created_by: authUser?.id
        };

        const { data, error } = await supabase.from('finance_documents').insert(payload).select().single();
        if (data && !error) {
            const newDoc = mapDocument(data);
            setDocuments(prev => [newDoc, ...prev]);
            return newDoc;
        }
        return null;
    };

    const updateDocumentStatus = async (id: string, estado: FinanceDocument['estado']) => {
        const { error } = await supabase.from('finance_documents').update({ estado }).eq('id', id);
        if (!error) {
            setDocuments(prev => prev.map(d => d.id === id ? { ...d, estado } : d));
        }
    };

    // Expenses
    const addExpense = async (expense: Omit<Expense, 'id' | 'created_at' | 'updated_at' | 'status' | 'workspace_id'>) => {
        if (!authUser) return null;

        const { data: companyData } = await supabase.from('company_profiles').select('id').single();
        const workspaceId = companyData?.id;

        if (!workspaceId) return null;

        const payload = {
            ...expense,
            workspace_id: workspaceId,
            expense_date: expense.expense_date.toISOString().split('T')[0],
            status: 'pending_approval'
        };

        const { data, error } = await supabase.from('expenses').insert(payload).select().single();
        if (data && !error) {
            const newExp = mapExpense(data);
            setExpenses(prev => [newExp, ...prev]);
            return newExp;
        }
        if (error) console.error("Error adding expense:", error);
        return null;
    };

    const updateExpenseStatus = async (id: string, status: Expense['status']) => {
        const { error } = await supabase.from('expenses').update({ status }).eq('id', id);
        if (!error) {
            setExpenses(prev => prev.map(e => e.id === id ? { ...e, status } : e));
            // Also refresh just in case trigger generated new AP
            if (status === 'approved') {
                // Short delay to let trigger finish
                setTimeout(() => refreshFinanceData(), 500);
            }
        }
    };

    // Payments
    const registerPayment = async (payment: Omit<FinancePayment, 'id' | 'createdAt'>) => {
        const payload = {
            document_id: payment.documentId,
            account_id: payment.accountId,
            monto: payment.monto,
            fecha_pago: payment.fechaPago.toISOString().split('T')[0],
            metodo_pago: payment.metodoPago,
            referencia: payment.referencia,
            comprobante_url: payment.comprobanteUrl,
            notas: payment.notas,
            created_by: authUser?.id
        };

        const targetDoc = documents.find(d => d.id === payment.documentId);
        if (!targetDoc) return;

        // 1. Insert Payment
        const { data: pData, error: pError } = await supabase.from('finance_payments').insert(payload).select().single();
        if (pError || !pData) {
            console.error("Error creating payment", pError);
            return;
        }

        // 2. Reduce document Saldo Pendiente 
        const newSaldo = Math.max(0, targetDoc.saldoPendiente - payment.monto);
        const newState = newSaldo <= 0 ? (targetDoc.tipo === 'GASTO' || targetDoc.tipo === 'CUENTA_PAGAR' ? 'PAGADO' : 'PAGADO') : targetDoc.estado;

        await supabase.from('finance_documents')
            .update({ saldo_pendiente: newSaldo, estado: newState })
            .eq('id', targetDoc.id);

        // 3. Optional: Update Account Balance
        if (payment.accountId) {
            const targetAcc = accounts.find(a => a.id === payment.accountId);
            if (targetAcc) {
                // For Receivables (NOTA_CARGO) money goes IN. For Payables/Expenses money goes OUT.
                const representsIncome = targetDoc.tipo === 'NOTA_CARGO';
                const newAccBalance = representsIncome
                    ? targetAcc.saldoActual + payment.monto
                    : targetAcc.saldoActual - payment.monto;

                await supabase.from('finance_accounts')
                    .update({ saldo_actual: newAccBalance })
                    .eq('id', targetAcc.id);
            }
        }

        // Sync local state completely to ensure math is valid
        refreshFinanceData();
    };

    const adjustAccountBalance = async (accountId: string, amount: number, type: 'aumentar' | 'disminuir', reason: string) => {
        if (!accountId || amount <= 0 || !reason) {
            console.error("Invalid adjustment parameters");
            return;
        }

        try {
            const { data: companyData } = await supabase.from('company_profiles').select('id').single();
            const workspaceId = companyData?.id;
            if (!workspaceId) throw new Error("Workspace not found");

            const targetAcc = accounts.find(a => a.id === accountId);
            if (!targetAcc) throw new Error("Account not found");

            const delta = type === 'aumentar' ? amount : -amount;
            const newBalance = (targetAcc.saldoActual || 0) + delta;

            // 1. Update Account
            const { error: accError } = await supabase.from('finance_accounts').update({ saldo_actual: newBalance }).eq('id', accountId);
            if (accError) throw accError;

            // 2. Register Movement
            const { error: movError } = await supabase.from('bank_movements').insert({
                workspace_id: workspaceId,
                account_id: accountId,
                movement_type: 'adjustment',
                amount: amount,
                description: reason,
                movement_date: new Date().toISOString().split('T')[0],
                created_by: authUser?.id
            });
            if (movError) throw movError;

            await refreshFinanceData();
        } catch (error) {
            console.error('Error adjusting balance:', error);
            throw error;
        }
    };

    const transferBetweenAccounts = async (sourceId: string, targetId: string, amount: number, description: string) => {
        if (!sourceId || !targetId || amount <= 0) {
            console.error("Invalid transfer parameters");
            return;
        }

        try {
            const { data: companyData } = await supabase.from('company_profiles').select('id').single();
            const workspaceId = companyData?.id;
            if (!workspaceId) throw new Error("Workspace not found");

            const sourceAcc = accounts.find(a => a.id === sourceId);
            const targetAcc = accounts.find(a => a.id === targetId);
            if (!sourceAcc || !targetAcc) throw new Error("Source or target account not found");

            // 1. Update Source Account
            const { error: sError } = await supabase.from('finance_accounts').update({ saldo_actual: (sourceAcc.saldoActual || 0) - amount }).eq('id', sourceId);
            if (sError) throw sError;

            // 2. Update Target Account
            const { error: tError } = await supabase.from('finance_accounts').update({ saldo_actual: (targetAcc.saldoActual || 0) + amount }).eq('id', targetId);
            if (tError) throw tError;

            // 3. Register Movements
            const movements = [
                {
                    workspace_id: workspaceId,
                    account_id: sourceId,
                    movement_type: 'transfer_out',
                    amount: amount,
                    description: `Transferencia a ${targetAcc.nombre}: ${description}`,
                    movement_date: new Date().toISOString().split('T')[0],
                    created_by: authUser?.id
                },
                {
                    workspace_id: workspaceId,
                    account_id: targetId,
                    movement_type: 'transfer_in',
                    amount: amount,
                    description: `Transferencia desde ${sourceAcc.nombre}: ${description}`,
                    movement_date: new Date().toISOString().split('T')[0],
                    created_by: authUser?.id
                }
            ];

            const { error: movError } = await supabase.from('bank_movements').insert(movements);
            if (movError) throw movError;

            await refreshFinanceData();
        } catch (error) {
            console.error('Error in transfer:', error);
            throw error;
        }
    };

    const getAccountMovements = async (accountId: string): Promise<BankMovement[]> => {
        const { data, error } = await supabase
            .from('bank_movements')
            .select('*')
            .eq('account_id', accountId)
            .order('movement_date', { ascending: false });

        if (error) {
            console.error("Error fetching movements", error);
            return [];
        }

        return (data || []).map(row => ({
            id: row.id,
            workspace_id: row.workspace_id,
            account_id: row.account_id,
            movement_date: row.movement_date,
            movement_type: row.movement_type as TreasuryMovementType,
            amount: Number(row.amount),
            description: row.description,
            reference: row.reference,
            created_by: row.created_by,
            matched_payment_id: row.matched_payment_id,
            imported_at: row.imported_at
        }));
    };

    return (
        <FinanceContext.Provider value={{
            accounts, documents, expenses, recurringExpenses, payments, isLoadingFinance,
            refreshFinanceData,
            addAccount, updateAccount,
            addDocument, updateDocumentStatus,
            addExpense, updateExpenseStatus,
            addRecurringExpense, updateRecurringExpense, deleteRecurringExpense,
            registerPayment,
            adjustAccountBalance, transferBetweenAccounts, getAccountMovements
        }}>
            {children}
        </FinanceContext.Provider>
    );
};

export const useFinance = () => {
    const context = useContext(FinanceContext);
    if (context === undefined) {
        throw new Error('useFinance must be used within a FinanceProvider');
    }
    return context;
};
