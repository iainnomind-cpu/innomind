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
            const { data, error } = await supabase
                .from('accounts_payable')
                .select('*, supplier:suppliers!supplier_id(*)')
                .eq('workspace_id', tenantId)
                .order('due_date', { ascending: true });

            if (error) throw error;
            if (data) setPayables(data as unknown as AccountsPayable[]);
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

    useEffect(() => {
        const tenantId = workspace?.id;
        if (!tenantId || !authUser) return;

        let timer: any = null;
        const debouncedRefresh = () => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                fetchPayables();
            }, 500);
        };

        const channel = supabase
            .channel(`ap-changes-${tenantId}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'accounts_payable', filter: `workspace_id=eq.${tenantId}` },
                () => debouncedRefresh()
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'accounts_payable_payments', filter: `workspace_id=eq.${tenantId}` },
                () => debouncedRefresh()
            )
            .subscribe();

        return () => {
            if (timer) clearTimeout(timer);
            supabase.removeChannel(channel);
        };
    }, [authUser, workspace?.id, fetchPayables]);

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
                .select('*, supplier:suppliers!supplier_id(*)')
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
            if (paymentData.amount <= 0) {
                throw new Error('El monto del pago debe ser mayor a 0');
            }
            if (!paymentData.account_id) {
                throw new Error('Debe seleccionar una cuenta bancaria de origen');
            }

            // Fetch the current payable to get the correct balance
            const { data: currentPayable, error: fetchError } = await supabase
                .from('accounts_payable')
                .select('balance_due, concept')
                .eq('id', paymentData.account_payable_id)
                .single();

            if (fetchError) throw fetchError;

            const currentBalance = Number(currentPayable?.balance_due || 0);

            if (paymentData.amount > currentBalance) {
                throw new Error(`El monto del pago excede el saldo pendiente ($${currentBalance.toLocaleString()})`);
            }

            let evidenceUrl = paymentData.evidence_file_url;

            if (evidenceFile) {
                const fileExt = evidenceFile.name.split('.').pop();
                const fileName = `${tenantId}/${paymentData.account_payable_id}/${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('payment-evidence')
                    .upload(fileName, evidenceFile);

                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage
                    .from('payment-evidence')
                    .getPublicUrl(fileName);

                evidenceUrl = urlData.publicUrl;
            }

            const { error: paymentError } = await supabase
                .from('accounts_payable_payments')
                .insert({
                    ...paymentData,
                    evidence_file_url: evidenceUrl,
                    workspace_id: tenantId,
                    created_by: authUser?.id
                });

            if (paymentError) throw paymentError;

            const newBalance = Math.max(0, currentBalance - paymentData.amount);
            const newStatus = newBalance <= 0 ? 'paid' : 'partial';
            const paidAt = newBalance <= 0 ? new Date().toISOString() : null;

            const { error: updateError } = await supabase
                .from('accounts_payable')
                .update({
                    balance_due: newBalance,
                    status: newStatus,
                    estado: newStatus,
                    paid_at: paidAt
                })
                .eq('id', paymentData.account_payable_id)
                .eq('workspace_id', tenantId);

            if (updateError) throw updateError;

            // Generate treasury movement
            const { error: movError } = await supabase.rpc('create_treasury_movement', {
                p_workspace_id: tenantId,
                p_account_id: paymentData.account_id,
                p_movement_type: 'payment_sent',
                p_amount: paymentData.amount,
                p_description: `Pago a Proveedor: ${currentPayable.concept} - Ref: ${paymentData.reference_number || 'N/A'}`,
                p_direction: 'out',
                p_category: 'Pago a Proveedores',
                p_source_module: 'accounts_payable',
                p_reference_id: paymentData.account_payable_id,
                p_user_id: authUser?.id
            });

            if (movError) throw movError;

            if (newStatus === 'paid') {
                const targetPayable = payables.find(p => p.id === paymentData.account_payable_id);
                if (targetPayable?.reference_id) {
                    await supabase
                        .from('expenses')
                        .update({ status: 'paid' })
                        .eq('id', targetPayable.reference_id)
                        .eq('workspace_id', tenantId);
                }
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
                .update({ status, estado: status })
                .eq('id', id)
                .eq('workspace_id', tenantId);

            if (error) throw error;
            setPayables(prev => prev.map(p => p.id === id ? { ...p, status } : p));

            if (status === 'paid') {
                const payable = payables.find(p => p.id === id);
                if (payable && payable.reference_id) {
                    await supabase
                        .from('expenses')
                        .update({ status: 'paid' })
                        .eq('id', payable.reference_id)
                        .eq('workspace_id', tenantId);
                }
            }
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
