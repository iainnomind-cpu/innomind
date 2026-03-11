import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { useUsers } from './UserContext';
import { useWorkspace } from './WorkspaceContext';

import {
    ChargeNote,
    ChargeNoteItem,
    ChargeNotePayment,
    ChargeNoteStatus,
    BankMovement,
    ProspectData
} from '@/types';

interface AccountsReceivableContextType {
    chargeNotes: ChargeNote[];
    bankMovements: BankMovement[];
    isLoading: boolean;

    fetchChargeNotes: () => Promise<void>;
    getChargeNoteById: (id: string) => ChargeNote | undefined;
    addChargeNote: (data: Partial<ChargeNote>, items: Omit<ChargeNoteItem, 'id' | 'charge_note_id'>[]) => Promise<ChargeNote | null>;
    addPayment: (payment: Omit<ChargeNotePayment, 'id' | 'created_at'>) => Promise<void>;

    fetchBankMovements: () => Promise<void>;
    importBankMovements: (movements: Omit<BankMovement, 'id' | 'workspace_id' | 'imported_at' | 'matched_payment_id'>[]) => Promise<void>;
    reconcileMovement: (movementId: string, paymentId: string) => Promise<void>;
    ignoreMovement: (movementId: string) => Promise<void>; // Or unmatch

    selectedNote: ChargeNote | null;
    setSelectedNote: (note: ChargeNote | null) => void;

    sendReceiptEmail: (email: string, clientName: string, noteNumber: string, amount: number, paymentDate: string, pdfBase64: string) => Promise<boolean>;
}

const AccountsReceivableContext = createContext<AccountsReceivableContextType | undefined>(undefined);

export const AccountsReceivableProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user: authUser } = useAuth();
    const { companyProfile, isLoadingProfile } = useUsers();
    const { activeSpace } = useWorkspace();

    const [chargeNotes, setChargeNotes] = useState<ChargeNote[]>([]);
    const [bankMovements, setBankMovements] = useState<BankMovement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedNote, setSelectedNote] = useState<ChargeNote | null>(null);

    const getTenantId = useCallback(() => {
        if (companyProfile) {
            return typeof companyProfile === 'object' ? companyProfile.id : (companyProfile as any);
        }
        return null;
    }, [companyProfile]);

    const fetchChargeNotes = useCallback(async () => {
        const tenantId = getTenantId();
        if (!tenantId || !authUser) return;

        setIsLoading(true);
        try {
            // Fetch charge notes with client data
            const { data: notesData, error: notesError } = await supabase
                .from('charge_notes')
                .select(`
          *,
          prospect:prospects(id, nombre, correo, empresa),
          items:charge_note_items(*),
          payments:charge_note_payments(*)
        `)
                .eq('workspace_id', tenantId)
                .order('created_at', { ascending: false });

            if (notesError) throw notesError;

            if (notesData) {
                setChargeNotes(notesData as unknown as ChargeNote[]);

                // Update selected note if it's currently open
                if (selectedNote) {
                    const updated = notesData.find(n => n.id === selectedNote.id);
                    if (updated) setSelectedNote(updated as unknown as ChargeNote);
                }
            }
        } catch (error) {
            console.error('Error fetching charge notes:', error);
        } finally {
            setIsLoading(false);
        }
    }, [authUser, getTenantId, selectedNote]);

    const fetchBankMovements = useCallback(async () => {
        const tenantId = getTenantId();
        if (!tenantId || !authUser) return;

        try {
            const { data, error } = await supabase
                .from('bank_movements')
                .select('*')
                .eq('workspace_id', tenantId)
                .order('movement_date', { ascending: false });

            if (error) throw error;
            if (data) setBankMovements(data as BankMovement[]);
        } catch (error) {
            console.error('Error fetching bank movements:', error);
        }
    }, [authUser, getTenantId]);

    useEffect(() => {
        if (authUser && !isLoadingProfile && getTenantId()) {
            fetchChargeNotes();
            fetchBankMovements();
        } else if (!authUser) {
            setChargeNotes([]);
            setBankMovements([]);
            setIsLoading(false);
        }
    }, [authUser, isLoadingProfile, getTenantId, fetchChargeNotes, fetchBankMovements]);

    const getChargeNoteById = (id: string) => {
        return chargeNotes.find(note => note.id === id);
    };

    const addChargeNote = async (data: Partial<ChargeNote>, items: Omit<ChargeNoteItem, 'id' | 'charge_note_id'>[]) => {
        const tenantId = getTenantId();
        if (!tenantId) throw new Error("No active workspace");

        try {
            // Call RPC to handle client_id resolution safely ignoring RLS client constraints
            const { data: noteId, error: noteError } = await supabase.rpc('create_manual_charge_note', {
                p_workspace_id: tenantId,
                p_prospect_id: data.prospect_id,
                p_note_number: data.note_number,
                p_issue_date: data.issue_date,
                p_due_date: data.due_date,
                p_subtotal: data.subtotal,
                p_total_amount: data.total_amount
            });

            if (noteError) throw noteError;

            // Insert items
            if (noteId && items.length > 0) {
                const itemsToInsert = items.map(item => ({
                    ...item,
                    charge_note_id: noteId
                }));

                const { error: itemsError } = await supabase
                    .from('charge_note_items')
                    .insert(itemsToInsert);

                if (itemsError) throw itemsError;
            }

            await fetchChargeNotes();

            // To return full object to UI without querying immediately, we just return a partial or fetch it
            return getChargeNoteById(noteId) || null;

        } catch (error) {
            console.error('Error adding charge note:', error);
            throw error;
        }
    };

    const addPayment = async (paymentData: Omit<ChargeNotePayment, 'id' | 'created_at'>) => {
        const tenantId = getTenantId();
        if (!tenantId) throw new Error("No active workspace");

        try {
            // Registrar el pago histórico
            const { error: paymentError } = await supabase
                .from('charge_note_payments')
                .insert({
                    ...paymentData,
                    workspace_id: tenantId
                });

            if (paymentError) throw paymentError;

            // Actualizar la nota de cargo explícitamente a estado Pagado
            const { error: noteError } = await supabase
                .from('charge_notes')
                .update({
                    status: 'paid',
                    balance_due: 0,
                    // Idealmente sumamos al paid_amount anterior, pero como es liquidación total en el UI:
                    updated_at: new Date().toISOString()
                })
                .eq('id', paymentData.charge_note_id)
                .eq('workspace_id', tenantId);

            if (noteError) throw noteError;

            await fetchChargeNotes();

        } catch (error) {
            console.error('Error adding payment:', error);
            throw error;
        }
    };

    const importBankMovements = async (movements: Omit<BankMovement, 'id' | 'workspace_id' | 'imported_at' | 'matched_payment_id'>[]) => {
        const tenantId = getTenantId();
        if (!tenantId) throw new Error("No active workspace");

        try {
            const movementsToInsert = movements.map(m => ({
                ...m,
                workspace_id: tenantId
            }));

            const { error } = await supabase
                .from('bank_movements')
                .insert(movementsToInsert);

            if (error) throw error;

            await fetchBankMovements();
        } catch (error) {
            console.error('Error importing bank movements:', error);
            throw error;
        }
    };

    const reconcileMovement = async (movementId: string, paymentId: string) => {
        const tenantId = getTenantId();
        if (!tenantId) return;

        try {
            const { error } = await supabase
                .from('bank_movements')
                .update({ matched_payment_id: paymentId })
                .eq('id', movementId)
                .eq('workspace_id', tenantId);

            if (error) throw error;

            setBankMovements(prev =>
                prev.map(m => m.id === movementId ? { ...m, matched_payment_id: paymentId } : m)
            );
        } catch (error) {
            console.error('Error reconciling movement:', error);
            throw error;
        }
    };

    const ignoreMovement = async (movementId: string) => {
        // A simplified ignore: just mark it reconciled to a dummy ID or leave it handling as deleted
        // For this implementation, we'll just delete the unneeded movement
        const tenantId = getTenantId();
        if (!tenantId) return;

        try {
            const { error } = await supabase
                .from('bank_movements')
                .delete()
                .eq('id', movementId)
                .eq('workspace_id', tenantId);

            if (error) throw error;

            setBankMovements(prev => prev.filter(m => m.id !== movementId));
        } catch (error) {
            console.error('Error ignoring movement:', error);
            throw error;
        }
    };

    const sendReceiptEmail = async (email: string, clientName: string, noteNumber: string, amount: number, paymentDate: string, pdfBase64: string) => {
        try {
            const companyName = typeof companyProfile === 'object' ? companyProfile.nombre_empresa : 'Nuestra Empresa';

            const { data, error } = await supabase.functions.invoke('send-receipt', {
                body: {
                    email,
                    clientName,
                    companyName,
                    noteNumber,
                    amount,
                    paymentDate,
                    pdfBase64
                }
            });

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error invoking send-receipt function:', error);
            return false;
        }
    };

    const value = {
        chargeNotes,
        bankMovements,
        isLoading,
        fetchChargeNotes,
        getChargeNoteById,
        addChargeNote,
        addPayment,
        fetchBankMovements,
        importBankMovements,
        reconcileMovement,
        ignoreMovement,
        selectedNote,
        setSelectedNote,
        sendReceiptEmail
    };

    return (
        <AccountsReceivableContext.Provider value={value}>
            {children}
        </AccountsReceivableContext.Provider>
    );
};

export const useAccountsReceivable = () => {
    const context = useContext(AccountsReceivableContext);
    if (context === undefined) {
        throw new Error('useAccountsReceivable must be used within an AccountsReceivableProvider');
    }
    return context;
};
