import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { useUsers } from './UserContext';
import { useWorkspace } from './WorkspaceContext';
import { validateWorkspace } from '@/lib/supabaseWorkspaceClient';
import { AccountsPayable, AccountsPayablePayment, AccountsPayableStatus } from '@/types';

interface AccountsPayableContextType {
    payables: AccountsPayable[];
    isLoading: boolean;
    fetchPayables: () => Promise<void>;
    getPayableById: (id: string) => AccountsPayable | undefined;
    addPayable: (data: Omit<AccountsPayable, 'id' | 'created_at' | 'balance_due' | 'status'>) => Promise<AccountsPayable | null>;
    addPayment: (payment: Omit<AccountsPayablePayment, 'id' | 'created_at'>, evidenceFile?: File) => Promise<void>;
    updatePayableStatus: (id: string, status: AccountsPayableStatus) => Promise<void>;
}

const AccountsPayableContext = createContext<AccountsPayableContextType | undefined>(undefined);

export const AccountsPayableProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user: authUser } = useAuth();
    const { isLoadingProfile } = useUsers();
    const { workspace } = useWorkspace();

    const [payables, setPayables] = useState<AccountsPayable[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPayables = useCallback(async () => {
        const tenantId = workspace?.id;
        if (!tenantId || !authUser) return;

        setIsLoading(true);
        try {
            // To completely bypass PostgREST embedding bugs due to schema ambiguity/corruption,
            // we fetch each table independently and join them in memory.
            const [
                { data: suppliersData },
                { data: payablesData, error: payablesError },
                { data: paymentsData, error: paymentsError },
                { data: posData }
            ] = await Promise.all([
                supabase.from('suppliers').select('*').eq('workspace', tenantId),
                supabase.from('accounts_payable').select('*').eq('workspace_id', tenantId).order('created_at', { ascending: false }),
                supabase.from('accounts_payable_payments').select('*').eq('workspace_id', tenantId).order('payment_date', { ascending: true }),
                supabase.from('purchase_orders').select('*').eq('workspace', tenantId)
            ]);

            if (payablesError) throw payablesError;
            if (paymentsError) console.error("Error fetching payments data:", paymentsError);

            const mappedPayables: AccountsPayable[] = [];

            // Helper func
            const isValidId = (id: any) => id && typeof id === 'string';

            if (paymentsData && paymentsData.length > 0) {
                console.log("RAW paymentsData fetched:", paymentsData);
                paymentsData.forEach((payment: any) => {
                    // Find the parent explicitly from the independent payables array query
                    const payableRecord = payablesData?.find((p: any) => p.id === payment.account_payable_id);
                    const poRecord = posData?.find((p: any) => p.id === payment.purchase_order_id);

                    if (payableRecord) {
                        const supplierRecord = suppliersData?.find((s: any) => s.id === payableRecord.supplier_id || s.id === payableRecord.proveedor_id);

                        mappedPayables.push({
                            id: payment.id, // For the UI, the unique ID list iterates
                            workspace_id: payment.workspace_id,
                            concept: payableRecord.concept,
                            amount: payableRecord.amount, // Real obligation amount
                            balance_due: payableRecord.balance_due, // Real obligation balance
                            due_date: payableRecord.due_date,
                            status: payableRecord.status,
                            created_at: payableRecord.created_at, // Obligation creation
                            supplier: supplierRecord,
                            supplier_type: payableRecord.supplier_type || 'supplier',
                            account_payable_id: payment.account_payable_id || payableRecord.id,
                            payment_method: payment.payment_method,
                            evidence_file_url: payment.evidence_file_url,
                            reference_id: payableRecord.reference_id,
                            employee_id: payableRecord.employee_id
                        } as unknown as AccountsPayable);
                    } else if (poRecord && isValidId(payment.purchase_order_id)) {
                        const supplierRecord = suppliersData?.find((s: any) => s.id === poRecord.supplier_id || s.id === poRecord.proveedor_id);

                        mappedPayables.push({
                            id: payment.id,
                            workspace_id: payment.workspace_id,
                            concept: `Pago de Orden: ${poRecord.numero_orden || poRecord.codigo || ''}`,
                            amount: payment.amount,
                            balance_due: payment.evidence_file_url ? 0 : payment.amount,
                            due_date: payment.payment_date,
                            status: payment.evidence_file_url ? 'paid' : 'pending',
                            created_at: payment.created_at,
                            supplier: supplierRecord,
                            supplier_type: 'supplier',
                            purchase_order_id: payment.purchase_order_id,
                            payment_method: payment.payment_method,
                            evidence_file_url: payment.evidence_file_url,
                        } as unknown as AccountsPayable);
                    } else {
                        console.warn("Found payment without joined parent. Is it hidden by RLS?", payment, "payablesData length:", payablesData?.length || 0);
                    }
                });
            }

            // Map standard accounts payable rows that have NO payments initialized yet
            if (payablesData && payablesData.length > 0) {
                console.log("RAW payablesData mapped correctly orphans:", payablesData.length);
                payablesData.forEach((record: any) => {
                    const hasPayment = mappedPayables.some(p => p.account_payable_id === record.id);
                    if (!hasPayment) {
                        const supplierRecord = suppliersData?.find((s: any) => s.id === record.supplier_id || s.id === record.proveedor_id);

                        mappedPayables.push({
                            id: record.id, // ID refers to raw obligation
                            workspace_id: record.workspace_id,
                            concept: record.concept,
                            amount: record.amount,
                            balance_due: record.balance_due,
                            due_date: record.due_date,
                            status: record.status,
                            created_at: record.created_at,
                            supplier: supplierRecord,
                            supplier_type: record.supplier_type || 'supplier',
                            employee_id: record.employee_id,
                            account_payable_id: record.id, // Set to self to help identify it was raw
                            payment_method: record.payment_method,
                            payment_reference: record.payment_reference,
                            reference_id: record.reference_id,
                        } as AccountsPayable);
                    }
                });
            }

            // Sort combining created_at
            mappedPayables.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            setPayables(mappedPayables);
        } catch (error) {
            console.error('Error fetching payables:', error);
        } finally {
            setIsLoading(false);
        }
    }, [authUser, workspace?.id]);

    useEffect(() => {
        if (authUser && !isLoadingProfile && workspace?.id) {
            fetchPayables();
        } else if (!authUser) {
            setPayables([]);
            setIsLoading(false);
        }
    }, [authUser, isLoadingProfile, workspace?.id, fetchPayables]);

    const getPayableById = (id: string) => {
        return payables.find(p => p.id === id);
    };

    const addPayable = async (data: Omit<AccountsPayable, 'id' | 'created_at' | 'balance_due' | 'status'>) => {
        const tenantId = validateWorkspace(workspace?.id);

        try {
            const { data: newPayable, error } = await supabase
                .from('accounts_payable')
                .insert({
                    ...data,
                    workspace_id: tenantId,
                    workspace: tenantId, // User requested alias
                    balance_due: data.amount,
                    status: 'pending',
                    estado: 'pending', // User requested alias
                    created_by: authUser?.id,
                    // Map other user requested fields if present in data
                    proveedor_id: data.supplier_id || data.proveedor_id,
                    purchase_order_id: data.purchase_order_id,
                    numero_referencia: data.payment_reference || data.numero_referencia,
                    monto: data.amount || data.monto
                })
                .select('*, supplier:suppliers(*)')
                .single();

            if (error) throw error;
            if (newPayable) {
                const mapped = newPayable as unknown as AccountsPayable;
                setPayables(prev => [...prev, mapped]);
                return mapped;
            }
            return null;
        } catch (error) {
            console.error('Error adding payable:', error);
            throw error;
        }
    };

    const addPayment = async (paymentData: Omit<AccountsPayablePayment, 'id' | 'created_at'>, evidenceFile?: File) => {
        const tenantId = validateWorkspace(workspace?.id);

        try {
            // "account_payable_id" in paymentData is actually the UI's ID map (which could be the Payment ID or the generic Payable ID)
            const paymentId = paymentData.account_payable_id;
            if (!paymentId) throw new Error("Payment ID missing");
            
            const targetPayable = payables.find(p => p.id === paymentId);
            if (!targetPayable) throw new Error("Mapped payable not found in context list");

            let evidenceUrl = paymentData.evidence_file_url;

            if (evidenceFile) {
                const fileExt = evidenceFile.name.split('.').pop();
                const fileName = `${tenantId}/${paymentId}/${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('payment-evidence')
                    .upload(fileName, evidenceFile);

                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage
                    .from('payment-evidence')
                    .getPublicUrl(fileName);

                evidenceUrl = urlData.publicUrl;
            }

            // Determine if the item is a raw obligation or an existing PO pending-payment
            const isRawPayable = targetPayable.account_payable_id === targetPayable.id;

            if (isRawPayable) {
                // 1A. INSERT the missing link since it's a raw obligation from Expenses
                const { error: insertError } = await supabase
                    .from('accounts_payable_payments')
                    .insert({
                        account_payable_id: targetPayable.id,
                        workspace_id: tenantId,
                        amount: paymentData.amount,
                        payment_date: paymentData.payment_date,
                        payment_method: paymentData.payment_method,
                        reference_number: paymentData.reference_number,
                        evidence_file_url: evidenceUrl,
                        notes: 'Pago liquidado desde interfaz',
                        created_by: authUser?.id
                    });
                if (insertError) throw insertError;
            } else {
                // 1B. UPDATE the mock payment record which belongs to the Purchase Order flow
                const { error: paymentError } = await supabase
                    .from('accounts_payable_payments')
                    .update({
                        amount: paymentData.amount,
                        payment_date: paymentData.payment_date,
                        payment_method: paymentData.payment_method,
                        reference_number: paymentData.reference_number,
                        evidence_file_url: evidenceUrl,
                        notes: 'Pago completado desde interfaz'
                    })
                    .eq('id', paymentId)
                    .eq('workspace_id', tenantId);

                if (paymentError) throw paymentError;
            }

            // 2. See if we need to update a parent Accounts Payable
            // If this payment belongs to an Expense/Refund (it has a classic account_payable_id link)
            if (targetPayable.account_payable_id) {
                // In a partial payment scenario, we'd subtract. The UI currently sends the full balance.
                const newBalance = Math.max(0, targetPayable.amount - paymentData.amount);
                const newStatus = newBalance <= 0 ? 'paid' : 'pending';
                const paidAt = newBalance <= 0 ? new Date().toISOString() : null;

                const { error: updateError } = await supabase
                    .from('accounts_payable')
                    .update({
                        balance_due: newBalance,
                        status: newStatus,
                        estado: newStatus,
                        paid_at: paidAt,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', targetPayable.account_payable_id)
                    .eq('workspace_id', tenantId);

                if (updateError) throw updateError;
            }

            await fetchPayables();
        } catch (error) {
            console.error('Error adding payment:', error);
            throw error;
        }
    };

    const updatePayableStatus = async (id: string, status: AccountsPayableStatus) => {
        const tenantId = validateWorkspace(workspace?.id);
        try {
            const { error } = await supabase
                .from('accounts_payable')
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', id)
                .eq('workspace_id', tenantId);

            if (error) throw error;
            setPayables(prev => prev.map(p => p.id === id ? { ...p, status } : p));
        } catch (error) {
            console.error('Error updating status:', error);
            throw error;
        }
    };

    return (
        <AccountsPayableContext.Provider value={{
            payables,
            isLoading,
            fetchPayables,
            getPayableById,
            addPayable,
            addPayment,
            updatePayableStatus
        }}>
            {children}
        </AccountsPayableContext.Provider>
    );
};

export const useAccountsPayable = () => {
    const context = useContext(AccountsPayableContext);
    if (context === undefined) {
        throw new Error('useAccountsPayable must be used within an AccountsPayableProvider');
    }
    return context;
};
