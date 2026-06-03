import React, { createContext, useContext, useState, useEffect } from 'react';
import { FinanceAccount, FinanceDocument, FinancePayment, Expense, RecurringExpense, BankMovement, TreasuryMovementType } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { useWorkspace } from './WorkspaceContext';
import { useUsers } from './UserContext';
import { validateWorkspace } from '@/lib/supabaseWorkspaceClient';
import { useAccountsPayable } from './AccountsPayableContext';

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
    const { workspace } = useWorkspace();
    const { isLoadingProfile } = useUsers();
    const { fetchPayables } = useAccountsPayable();

    const [isLoadingFinance, setIsLoadingFinance] = useState(true);

    const generateAccountsPayableForExpense = async (expense: Expense, workspaceId: string) => {
        const isApproved = ['approved', 'accepted', 'confirmed', 'paid'].includes(expense.status.toLowerCase());
        if (!isApproved) return;

        try {
            // Prevent duplicates
            const { data: existingPayable, error: checkError } = await supabase
                .from('accounts_payable')
                .select('id')
                .eq('reference_id', expense.id)
                .eq('workspace_id', workspaceId)
                .maybeSingle();

            if (checkError) {
                console.error('Error checking existing accounts_payable:', checkError);
                return;
            }

            if (!existingPayable) {
                const supplier_type = expense.paid_by === 'employee' ? 'employee' : 'company_expense';
                const concept = expense.paid_by === 'employee'
                    ? `Reembolso de gasto: ${expense.description || expense.category || 'Sin descripción'}`
                    : `Pago de gasto directo: ${expense.description || expense.category || 'Sin descripción'}`;
                
                const notes = expense.paid_by === 'employee'
                    ? `Generado automáticamente (Reembolso) desde Gastos ID: ${expense.id}`
                    : `Generado automáticamente (Gasto Directo) desde Gastos ID: ${expense.id}`;

                const payablePayload = {
                    workspace_id: workspaceId,
                    workspace: workspaceId, // User requested alias
                    supplier_type,
                    supplier_id: null,
                    employee_id: expense.paid_by === 'employee' ? expense.employee_id : null,
                    concept,
                    amount: expense.amount,
                    monto: expense.amount, // User requested alias
                    balance_due: expense.amount,
                    due_date: expense.expense_date instanceof Date 
                        ? expense.expense_date.toISOString().split('T')[0] 
                        : new Date(expense.expense_date).toISOString().split('T')[0],
                    status: 'pending',
                    estado: 'pending', // User requested alias
                    notes,
                    reference_id: expense.id,
                    created_by: authUser?.id
                };

                const { error: insertError } = await supabase
                    .from('accounts_payable')
                    .insert(payablePayload);

                if (insertError) {
                    console.error('Error auto-generating accounts_payable:', insertError);
                } else {
                    // Refresh payables context in UI
                    await fetchPayables();
                }
            } else {
                // If it already exists (e.g. generated automatically by the DB trigger),
                // we must refresh the accounts_payable context to show it in the UI immediately.
                await fetchPayables();
            }
        } catch (error) {
            console.error('Error in generateAccountsPayableForExpense:', error);
        }
    };
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
        updatedAt: new Date(row.updated_at),
        bank_name: row.bank_name || (row.tipo === 'CAJA_CHICA' ? 'Caja Física' : 'Banco General'),
        account_alias: row.account_alias || row.nombre,
        last_four_digits: row.last_four_digits || '0000',
        account_subtype: row.account_subtype || (row.tipo === 'CAJA_CHICA' ? 'Caja Chica' : 'Corriente')
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
        const workspaceId = workspace?.id;
        if (!workspaceId || !authUser) {
            setAccounts([]);
            setDocuments([]);
            setExpenses([]);
            setRecurringExpenses([]);
            setPayments([]);
            setIsLoadingFinance(false);
            return;
        }

        setIsLoadingFinance(true);
        try {
            const [accRes, docRes, expRes, recurringRes, payRes] = await Promise.all([
                supabase.from('finance_accounts').select('*').eq('workspace', workspaceId).order('nombre'),
                supabase.from('finance_documents').select('*').eq('workspace', workspaceId).order('created_at', { ascending: false }),
                supabase.from('expenses').select('*').eq('workspace_id', workspaceId).order('expense_date', { ascending: false }),
                supabase.from('recurring_expenses').select('*').eq('workspace_id', workspaceId).order('concept'),
                supabase.from('finance_payments').select('*').eq('workspace', workspaceId).order('fecha_pago', { ascending: false })
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
        if (!isLoadingProfile && workspace?.id) {
            refreshFinanceData();
        }
    }, [authUser, workspace?.id, isLoadingProfile]);

    useEffect(() => {
        const tenantId = workspace?.id;
        if (!tenantId || !authUser) return;

        let timer: any = null;
        const debouncedRefresh = () => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                refreshFinanceData();
            }, 500);
        };

        const channel = supabase
            .channel(`finance-changes-${tenantId}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'finance_accounts', filter: `workspace=eq.${tenantId}` },
                () => debouncedRefresh()
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'finance_documents', filter: `workspace=eq.${tenantId}` },
                () => debouncedRefresh()
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'expenses', filter: `workspace_id=eq.${tenantId}` },
                () => debouncedRefresh()
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'recurring_expenses', filter: `workspace_id=eq.${tenantId}` },
                () => debouncedRefresh()
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'finance_payments', filter: `workspace=eq.${tenantId}` },
                () => debouncedRefresh()
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'treasury_movements', filter: `workspace_id=eq.${tenantId}` },
                () => debouncedRefresh()
            )
            .subscribe();

        return () => {
            if (timer) clearTimeout(timer);
            supabase.removeChannel(channel);
        };
    }, [authUser, workspace?.id]);

    // Recurring Expenses
    const addRecurringExpense = async (data: Omit<RecurringExpense, 'id' | 'created_at' | 'workspace_id'>) => {
        const workspaceId = validateWorkspace(workspace?.id);
        const { data: recData, error } = await supabase.from('recurring_expenses').insert({
            ...data,
            workspace_id: workspaceId
        }).select().single();
        if (error) throw error;
        setRecurringExpenses(prev => [...prev, mapRecurringExpense(recData)]);
    };

    const updateRecurringExpense = async (id: string, updates: Partial<RecurringExpense>) => {
        const workspaceId = validateWorkspace(workspace?.id);
        const { error } = await supabase.from('recurring_expenses')
            .update(updates)
            .eq('id', id)
            .eq('workspace_id', workspaceId);
        if (error) throw error;
        setRecurringExpenses(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    };

    const deleteRecurringExpense = async (id: string) => {
        const workspaceId = validateWorkspace(workspace?.id);
        const { error } = await supabase.from('recurring_expenses')
            .delete()
            .eq('id', id)
            .eq('workspace_id', workspaceId);
        if (error) throw error;
        setRecurringExpenses(prev => prev.filter(r => r.id !== id));
    };

    // Accounts
    const addAccount = async (acc: Omit<FinanceAccount, 'id' | 'saldoActual' | 'updatedAt'>) => {
        const workspaceId = validateWorkspace(workspace?.id);
        const payload = {
            nombre: acc.nombre,
            tipo: acc.tipo,
            moneda: acc.moneda,
            saldo_inicial: acc.saldoInicial,
            saldo_actual: acc.saldoInicial,
            activo: acc.activo,
            workspace: workspaceId,
            bank_name: acc.bank_name || null,
            account_alias: acc.account_alias || null,
            last_four_digits: acc.last_four_digits || null,
            account_subtype: acc.account_subtype || null
        };
        const { data, error } = await supabase.from('finance_accounts').insert(payload).select().single();
        if (error) throw error;
        setAccounts(prev => [...prev, mapAccount(data)]);
    };

    const updateAccount = async (id: string, updates: Partial<FinanceAccount>) => {
        const workspaceId = validateWorkspace(workspace?.id);
        const payload: any = {};
        if (updates.nombre !== undefined) payload.nombre = updates.nombre;
        if (updates.tipo !== undefined) payload.tipo = updates.tipo;
        if (updates.activo !== undefined) payload.activo = updates.activo;
        if (updates.saldoActual !== undefined) payload.saldo_actual = updates.saldoActual;

        if (Object.keys(payload).length > 0) {
            const { error } = await supabase.from('finance_accounts')
                .update(payload)
                .eq('id', id)
                .eq('workspace', workspaceId);
            if (error) throw error;
            refreshFinanceData();
        }
    };

    // Documents
    const addDocument = async (doc: Omit<FinanceDocument, 'id' | 'createdAt' | 'saldoPendiente'>) => {
        const workspaceId = validateWorkspace(workspace?.id);
        const payload = {
            tipo: doc.tipo,
            estado: doc.estado,
            numero_folio: doc.numeroFolio,
            monto_total: doc.montoTotal,
            saldo_pendiente: doc.montoTotal,
            moneda: doc.moneda,
            fecha_emision: doc.fechaEmision.toISOString().split('T')[0],
            fecha_vencimiento: doc.fechaVencimiento ? doc.fechaVencimiento.toISOString().split('T')[0] : null,
            prospect_id: doc.prospectId,
            quote_id: doc.quoteId,
            proveedor_nombre: doc.proveedorNombre,
            categoria: doc.categoria,
            concepto: doc.concepto,
            evidencia_url: doc.evidenciaUrl,
            created_by: authUser?.id,
            workspace: workspaceId
        };

        const { data, error } = await supabase.from('finance_documents').insert(payload).select().single();
        if (error) throw error;
        const newDoc = mapDocument(data);
        setDocuments(prev => [newDoc, ...prev]);
        return newDoc;
    };

    const updateDocumentStatus = async (id: string, estado: FinanceDocument['estado']) => {
        const workspaceId = validateWorkspace(workspace?.id);
        const { error } = await supabase.from('finance_documents')
            .update({ estado })
            .eq('id', id)
            .eq('workspace', workspaceId);
        if (error) throw error;
        setDocuments(prev => prev.map(d => d.id === id ? { ...d, estado } : d));
    };

    // Expenses
    const addExpense = async (expense: Omit<Expense, 'id' | 'created_at' | 'updated_at' | 'status' | 'workspace_id'>) => {
        const workspaceId = validateWorkspace(workspace?.id);
        const payload = {
            ...expense,
            workspace_id: workspaceId,
            expense_date: expense.expense_date.toISOString().split('T')[0],
            status: 'pending_approval'
        };

        const { data, error } = await supabase.from('expenses').insert(payload).select().single();
        if (error) throw error;
        const newExp = mapExpense(data);
        setExpenses(prev => [newExp, ...prev]);

        // Preventative check if status of newExp is approved/accepted/confirmed
        if (['approved', 'accepted', 'confirmed', 'paid'].includes(newExp.status.toLowerCase())) {
            await generateAccountsPayableForExpense(newExp, workspaceId);
        }

        return newExp;
    };

    const updateExpenseStatus = async (id: string, status: Expense['status']) => {
        const workspaceId = validateWorkspace(workspace?.id);
        
        // Find the current expense in state before state becomes updated asynchronously
        const currentExpense = expenses.find(e => e.id === id);
        if (!currentExpense) {
            console.error(`Expense not found in current context state for id: ${id}`);
            return;
        }

        const mergedExpense = { ...currentExpense, status };

        const { error } = await supabase.from('expenses')
            .update({ status })
            .eq('id', id)
            .eq('workspace_id', workspaceId);
        if (error) throw error;

        // Update the local React state for expenses
        setExpenses(prev => prev.map(e => e.id === id ? { ...e, status } : e));

        // Generate accounts payable or refetch it if generated by DB trigger
        if (['approved', 'accepted', 'confirmed', 'paid'].includes(status.toLowerCase())) {
            await generateAccountsPayableForExpense(mergedExpense, workspaceId);
        }

        if (status === 'approved') {
            setTimeout(() => refreshFinanceData(), 500);
        }
    };

    // Payments
    const registerPayment = async (payment: Omit<FinancePayment, 'id' | 'createdAt'>) => {
        const workspaceId = validateWorkspace(workspace?.id);
        const payload = {
            document_id: payment.documentId,
            account_id: payment.accountId,
            monto: payment.monto,
            fecha_pago: payment.fechaPago.toISOString().split('T')[0],
            metodo_pago: payment.metodoPago,
            referencia: payment.referencia,
            comprobante_url: payment.comprobanteUrl,
            notas: payment.notas,
            created_by: authUser?.id,
            workspace: workspaceId
        };

        const targetDoc = documents.find(d => d.id === payment.documentId);
        if (!targetDoc) return;

        const { error: pError } = await supabase.from('finance_payments').insert(payload).select().single();
        if (pError) throw pError;

        const newSaldo = Math.max(0, targetDoc.saldoPendiente - payment.monto);
        const newState = newSaldo <= 0 ? 'PAGADO' : targetDoc.estado;

        await supabase.from('finance_documents')
            .update({ saldo_pendiente: newSaldo, estado: newState })
            .eq('id', targetDoc.id)
            .eq('workspace', workspaceId);

        if (payment.accountId) {
            const targetAcc = accounts.find(a => a.id === payment.accountId);
            if (targetAcc) {
                const representsIncome = targetDoc.tipo === 'NOTA_CARGO';
                
                // Generate treasury movement
                const { error: movError } = await supabase.rpc('create_treasury_movement', {
                    p_workspace_id: workspaceId,
                    p_account_id: payment.accountId,
                    p_movement_type: representsIncome ? 'deposit' : 'withdrawal',
                    p_amount: payment.monto,
                    p_description: `${representsIncome ? 'Cobro' : 'Pago'} Documento (Legacy): ${targetDoc.concepto} - Ref: ${payment.referencia || 'N/A'}`,
                    p_direction: representsIncome ? 'in' : 'out',
                    p_category: representsIncome ? 'Ingreso General' : 'Gasto General',
                    p_source_module: 'finance_legacy',
                    p_reference_id: targetDoc.id,
                    p_user_id: authUser?.id
                });
                
                if (movError) throw movError;
            }
        }
        refreshFinanceData();
    };

    const adjustAccountBalance = async (accountId: string, amount: number, type: 'aumentar' | 'disminuir', reason: string) => {
        const workspaceId = validateWorkspace(workspace?.id);
        const targetAcc = accounts.find(a => a.id === accountId);
        if (!targetAcc) throw new Error("Account not found");

        const { error } = await supabase.rpc('create_treasury_movement', {
            p_workspace_id: workspaceId,
            p_account_id: accountId,
            p_movement_type: 'adjustment',
            p_amount: amount,
            p_description: reason,
            p_direction: type === 'aumentar' ? 'in' : 'out',
            p_category: 'adjustment',
            p_source_module: 'treasury',
            p_reference_id: null,
            p_user_id: authUser?.id
        });

        if (error) throw error;
        await refreshFinanceData();
    };

    const transferBetweenAccounts = async (sourceId: string, targetId: string, amount: number, description: string) => {
        const workspaceId = validateWorkspace(workspace?.id);
        
        const { error } = await supabase.rpc('transfer_between_accounts_v2', {
            p_workspace_id: workspaceId,
            p_source_id: sourceId,
            p_target_id: targetId,
            p_amount: amount,
            p_description: description,
            p_user_id: authUser?.id
        });

        if (error) throw error;
        await refreshFinanceData();
    };

    const getAccountMovements = async (accountId: string): Promise<any[]> => {
        const workspaceId = validateWorkspace(workspace?.id);
        const { data, error } = await supabase
            .from('treasury_movements')
            .select('*')
            .eq('account_id', accountId)
            .eq('workspace_id', workspaceId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map(row => ({
            id: row.id,
            workspace_id: row.workspace_id,
            account_id: row.account_id,
            movement_date: row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
            created_at: row.created_at,
            movement_type: row.movement_type as TreasuryMovementType,
            amount: Number(row.amount),
            description: row.description,
            direction: row.direction,
            category: row.category,
            source_module: row.source_module,
            balance_after: row.balance_after ? Number(row.balance_after) : null,
            created_by: row.created_by
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
