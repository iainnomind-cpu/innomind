import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { useUsers } from './UserContext';
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
    const { companyProfile, isLoadingProfile } = useUsers();

    const [payables, setPayables] = useState<AccountsPayable[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const getTenantId = useCallback(() => {
        if (companyProfile) {
            return typeof companyProfile === 'object' ? companyProfile.id : (companyProfile as any);
        }
        return null;
    }, [companyProfile]);

    const fetchPayables = useCallback(async () => {
        const tenantId = getTenantId();
        if (!tenantId || !authUser) return;

        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('accounts_payable')
                .select('*, supplier:suppliers(*)')
                .eq('workspace_id', tenantId)
                .order('due_date', { ascending: true });

            if (error) throw error;
            if (data) setPayables(data as unknown as AccountsPayable[]);
        } catch (error) {
            console.error('Error fetching payables:', error);
        } finally {
            setIsLoading(false);
        }
    }, [authUser, getTenantId]);

    useEffect(() => {
        if (authUser && !isLoadingProfile && getTenantId()) {
            fetchPayables();
        } else if (!authUser) {
            setPayables([]);
            setIsLoading(false);
        }
    }, [authUser, isLoadingProfile, getTenantId, fetchPayables]);

    const getPayableById = (id: string) => {
        return payables.find(p => p.id === id);
    };

    const addPayable = async (data: Omit<AccountsPayable, 'id' | 'created_at' | 'balance_due' | 'status'>) => {
        const tenantId = getTenantId();
        if (!tenantId) throw new Error("No active workspace");

        try {
            const { data: newPayable, error } = await supabase
                .from('accounts_payable')
                .insert({
                    ...data,
                    workspace_id: tenantId,
                    balance_due: data.amount,
                    status: 'pending',
                    created_by: authUser?.id
                })
                .select('*, supplier:suppliers(*)')
                .single();

            if (error) throw error;
            if (newPayable) {
                setPayables(prev => [...prev, newPayable as unknown as AccountsPayable]);
                return newPayable as unknown as AccountsPayable;
            }
            return null;
        } catch (error) {
            console.error('Error adding payable:', error);
            throw error;
        }
    };

    const addPayment = async (paymentData: Omit<AccountsPayablePayment, 'id' | 'created_at'>, evidenceFile?: File) => {
        const tenantId = getTenantId();
        if (!tenantId) throw new Error("No active workspace");

        try {
            let evidenceUrl = paymentData.evidence_file_url;

            // Upload evidence if provided
            if (evidenceFile) {
                const fileExt = evidenceFile.name.split('.').pop();
                const fileName = `${tenantId}/${paymentData.account_payable_id}/${Date.now()}.${fileExt}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('payment-evidence')
                    .upload(fileName, evidenceFile);

                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage
                    .from('payment-evidence')
                    .getPublicUrl(fileName);

                evidenceUrl = urlData.publicUrl;
            }

            // 1. Register payment
            const { error: paymentError } = await supabase
                .from('accounts_payable_payments')
                .insert({
                    ...paymentData,
                    evidence_file_url: evidenceUrl,
                    workspace_id: tenantId,
                    created_by: authUser?.id
                });

            if (paymentError) throw paymentError;

            // 2. Update payable
            const targetPayable = payables.find(p => p.id === paymentData.account_payable_id);
            if (!targetPayable) return;

            const newBalance = Math.max(0, targetPayable.balance_due - paymentData.amount);
            const newStatus = newBalance <= 0 ? 'paid' : targetPayable.status;
            const paidAt = newBalance <= 0 ? new Date().toISOString() : null;

            const { error: updateError } = await supabase
                .from('accounts_payable')
                .update({
                    balance_due: newBalance,
                    status: newStatus,
                    paid_at: paidAt
                })
                .eq('id', targetPayable.id);

            if (updateError) throw updateError;

            await fetchPayables();
        } catch (error) {
            console.error('Error adding payment:', error);
            throw error;
        }
    };

    const updatePayableStatus = async (id: string, status: AccountsPayableStatus) => {
        try {
            const { error } = await supabase
                .from('accounts_payable')
                .update({ status })
                .eq('id', id);

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
