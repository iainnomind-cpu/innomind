import React, { createContext, useContext, useState, useEffect } from 'react';
import { FinanceAccount, FinanceDocument, FinancePayment } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

interface FinanceContextType {
    accounts: FinanceAccount[];
    documents: FinanceDocument[];
    payments: FinancePayment[];
    isLoadingFinance: boolean;

    // Accounts Fetch & Action (Manual resync)
    refreshFinanceData: () => Promise<void>;

    // Accounts
    addAccount: (acc: Omit<FinanceAccount, 'id' | 'saldoActual' | 'updatedAt'>) => Promise<void>;
    updateAccount: (id: string, updates: Partial<FinanceAccount>) => Promise<void>;

    // Documents
    addDocument: (doc: Omit<FinanceDocument, 'id' | 'createdAt' | 'saldoPendiente'>) => Promise<FinanceDocument | null>;
    updateDocumentStatus: (id: string, estado: FinanceDocument['estado']) => Promise<void>;

    // Payments
    registerPayment: (payment: Omit<FinancePayment, 'id' | 'createdAt'>) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user: authUser } = useAuth();
    const [isLoadingFinance, setIsLoadingFinance] = useState(true);

    const [accounts, setAccounts] = useState<FinanceAccount[]>([]);
    const [documents, setDocuments] = useState<FinanceDocument[]>([]);
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

    const refreshFinanceData = async () => {
        if (!authUser) return;
        setIsLoadingFinance(true);
        try {
            const [accRes, docRes, payRes] = await Promise.all([
                supabase.from('finance_accounts').select('*').order('nombre'),
                supabase.from('finance_documents').select('*').order('created_at', { ascending: false }),
                supabase.from('finance_payments').select('*').order('fecha_pago', { ascending: false })
            ]);

            if (accRes.data) setAccounts(accRes.data.map(mapAccount));
            if (docRes.data) setDocuments(docRes.data.map(mapDocument));
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
            setPayments([]);
            setIsLoadingFinance(false);
            return;
        }
        refreshFinanceData();
    }, [authUser]);

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

    return (
        <FinanceContext.Provider value={{
            accounts, documents, payments, isLoadingFinance,
            refreshFinanceData,
            addAccount, updateAccount,
            addDocument, updateDocumentStatus,
            registerPayment
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
