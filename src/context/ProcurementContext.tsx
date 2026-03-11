import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { useAccountsPayable } from './AccountsPayableContext';
import {
    Supplier,
    PurchaseOrder,
    PurchaseOrderItem,
    PurchaseOrderStatus,
    PurchaseApproval,
    WarehouseReceipt
} from '@/types';

interface ProcurementContextType {
    suppliers: Supplier[];
    purchaseOrders: PurchaseOrder[];
    purchaseOrderItems: PurchaseOrderItem[];
    warehouseReceipts: WarehouseReceipt[];
    loading: boolean;
    refreshProcurementData: () => Promise<void>;

    // Suppliers
    addSupplier: (supplier: Omit<Supplier, 'id' | 'workspace' | 'createdAt' | 'updatedAt'>) => Promise<any>;
    updateSupplier: (id: string, updates: Partial<Supplier>) => Promise<any>;
    deleteSupplier: (id: string) => Promise<any>;

    // Purchase Orders
    addPurchaseOrder: (order: Partial<PurchaseOrder>, items: Partial<PurchaseOrderItem>[]) => Promise<any>;
    updatePurchaseOrderStatus: (id: string, status: PurchaseOrderStatus, notes?: string) => Promise<any>;
    approvePurchaseOrder: (id: string, comments: string) => Promise<any>;
    rejectPurchaseOrder: (id: string, comments: string) => Promise<any>;

    // Receptions
    registerReception: (reception: Partial<WarehouseReceipt>, itemsReceived: { product_id: string, quantity_received: number }[]) => Promise<any>;
}

const ProcurementContext = createContext<ProcurementContextType | undefined>(undefined);

export const ProcurementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { session } = useAuth();
    const { addPayable } = useAccountsPayable();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [purchaseOrderItems, setPurchaseOrderItems] = useState<PurchaseOrderItem[]>([]);
    const [warehouseReceipts, setWarehouseReceipts] = useState<WarehouseReceipt[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshProcurementData = async () => {
        if (!session?.user) return;
        setLoading(true);

        try {
            const [suppliersRes, ordersRes, itemsRes, receiptsRes] = await Promise.all([
                supabase.from('suppliers').select('*').order('nombre_comercial', { ascending: true }),
                supabase.from('purchase_orders').select('*').order('created_at', { ascending: false }),
                supabase.from('purchase_order_items').select('*'),
                supabase.from('warehouse_receipts').select('*').order('receipt_date', { ascending: false })
            ]);

            if (suppliersRes.data) setSuppliers(suppliersRes.data.map(mapSupplier));
            if (ordersRes.data) setPurchaseOrders(ordersRes.data.map(mapOrder));
            if (itemsRes.data) setPurchaseOrderItems(itemsRes.data.map(mapOrderItem));
            if (receiptsRes.data) setWarehouseReceipts(receiptsRes.data.map(mapReceipt));

        } catch (error) {
            console.error('Error fetching procurement data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshProcurementData();
    }, [session]);

    const addSupplier = async (supplier: any) => {
        const { data, error } = await supabase.from('suppliers').insert([{
            nombre_comercial: supplier.nombreComercial,
            razon_social: supplier.razonSocial,
            rfc: supplier.rfc,
            email: supplier.email,
            telefono: supplier.telefono,
            condiciones_pago: supplier.condicionesPago,
            calificacion_desempeno: supplier.calificacionDesempeno,
            notas: supplier.notas,
            activo: supplier.activo !== undefined ? supplier.activo : true
        }]).select().single();

        if (error) throw error;
        setSuppliers(prev => [...prev, mapSupplier(data)]);
        return data;
    };

    const updateSupplier = async (id: string, updates: any) => {
        let mappedUpdates: any = {};
        if (updates.nombreComercial) mappedUpdates.nombre_comercial = updates.nombreComercial;
        if (updates.razonSocial !== undefined) mappedUpdates.razon_social = updates.razonSocial;
        if (updates.rfc !== undefined) mappedUpdates.rfc = updates.rfc;
        if (updates.email !== undefined) mappedUpdates.email = updates.email;
        if (updates.telefono !== undefined) mappedUpdates.telefono = updates.telefono;
        if (updates.condicionesPago !== undefined) mappedUpdates.condiciones_pago = updates.condicionesPago;
        if (updates.calificacionDesempeno !== undefined) mappedUpdates.calificacion_desempeno = updates.calificacionDesempeno;
        if (updates.notas !== undefined) mappedUpdates.notas = updates.notas;
        if (updates.activo !== undefined) mappedUpdates.activo = updates.activo;

        const { data, error } = await supabase.from('suppliers').update(mappedUpdates).eq('id', id).select().single();
        if (error) throw error;
        setSuppliers(prev => prev.map(s => s.id === id ? mapSupplier(data) : s));
        return data;
    };

    const deleteSupplier = async (id: string) => {
        return updateSupplier(id, { activo: false });
    };

    const addPurchaseOrder = async (order: Partial<PurchaseOrder>, items: Partial<PurchaseOrderItem>[]) => {
        // En el backend o aquí determinamos si requiere aprobación
        const initialStatus = order.total_amount && order.total_amount > 10000 ? 'pending_approval' : 'approved';

        const { data: orderData, error: orderError } = await supabase.from('purchase_orders').insert([{
            workspace_id: order.workspace_id,
            supplier_id: order.supplier_id,
            order_number: `OC-${Date.now().toString().slice(-6)}`,
            status: initialStatus,
            total_amount: order.total_amount,
            currency: order.currency || 'MXN',
            notes: order.notes,
            created_by: session?.user?.id
        }]).select().single();

        if (orderError) throw orderError;

        const formattedItems = items.map(item => ({
            purchase_order_id: orderData.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price
        }));

        const { data: itemsData, error: itemsError } = await supabase.from('purchase_order_items').insert(formattedItems).select();

        if (itemsError) throw itemsError;

        setPurchaseOrders(prev => [mapOrder(orderData), ...prev]);
        setPurchaseOrderItems(prev => [...prev, ...itemsData.map(mapOrderItem)]);

        return orderData;
    };

    const updatePurchaseOrderStatus = async (id: string, status: PurchaseOrderStatus, notes?: string) => {
        const updates: any = { status };
        if (notes) updates.notes = notes;

        const { data, error } = await supabase.from('purchase_orders').update(updates).eq('id', id).select().single();
        if (error) throw error;
        setPurchaseOrders(prev => prev.map(o => o.id === id ? mapOrder(data) : o));
        return data;
    };

    const approvePurchaseOrder = async (id: string, comments: string) => {
        const { data, error } = await supabase.from('purchase_orders').update({
            status: 'approved',
            approved_by: session?.user?.id,
            approved_at: new Date().toISOString()
        }).eq('id', id).select().single();

        if (error) throw error;

        // Registrar en historial de aprobaciones
        await supabase.from('purchase_approvals').insert([{
            purchase_order_id: id,
            approved_by: session?.user?.id,
            status: 'approved',
            comments
        }]);

        setPurchaseOrders(prev => prev.map(o => o.id === id ? mapOrder(data) : o));
        return data;
    };

    const rejectPurchaseOrder = async (id: string, comments: string) => {
        const { data, error } = await supabase.from('purchase_orders').update({
            status: 'rejected'
        }).eq('id', id).select().single();

        if (error) throw error;

        await supabase.from('purchase_approvals').insert([{
            purchase_order_id: id,
            approved_by: session?.user?.id,
            status: 'rejected',
            comments
        }]);

        setPurchaseOrders(prev => prev.map(o => o.id === id ? mapOrder(data) : o));
        return data;
    };

    const registerReception = async (reception: Partial<WarehouseReceipt>, itemsReceived: { product_id: string, quantity_received: number }[]) => {
        // 1. Insert receipt
        const { data: receiptData, error: recError } = await supabase.from('warehouse_receipts').insert([{
            purchase_order_id: reception.purchase_order_id,
            workspace_id: reception.workspace_id,
            supplier_id: reception.supplier_id,
            receipt_date: new Date().toISOString(),
            received_by: session?.user?.id,
            notes: reception.notes
        }]).select().single();

        if (recError) throw recError;

        // 2. Insert receipt items
        const receiptItems = itemsReceived.map(item => ({
            receipt_id: receiptData.id,
            product_id: item.product_id,
            quantity_received: item.quantity_received
        }));

        const { error: itemsError } = await supabase.from('warehouse_receipt_items').insert(receiptItems);
        if (itemsError) throw itemsError;

        // 3. Mark PO as received
        const { data: orderData, error: orderError } = await supabase.from('purchase_orders').update({
            status: 'received'
        }).eq('id', reception.purchase_order_id).select().single();

        if (orderError) throw orderError;

        // 4. Generate Account Payable
        try {
            const supplier = suppliers.find(s => s.id === reception.supplier_id);
            const po = mapOrder(orderData);

            await addPayable({
                workspace_id: reception.workspace_id!,
                supplier_id: reception.supplier_id!,
                concept: `Orden de compra #${po.order_number}`,
                amount: po.total_amount,
                due_date: supplier?.condicionesPago ?
                    new Date(Date.now() + (supplier.condicionesPago * 24 * 60 * 60 * 1000)) :
                    new Date()
            });
        } catch (financeError) {
            console.error("Caution: Account Payable auto-generation failed", financeError);
        }

        refreshProcurementData();
        return receiptData;
    };

    // Mappers
    const mapSupplier = (row: any): Supplier => ({
        id: row.id,
        workspace: row.workspace,
        nombreComercial: row.nombre_comercial,
        razonSocial: row.razon_social,
        rfc: row.rfc,
        email: row.email,
        telefono: row.telefono,
        condicionesPago: row.condiciones_pago,
        calificacionDesempeno: row.calificacion_desempeno,
        notas: row.notas,
        activo: row.activo,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
    });

    const mapOrder = (row: any): PurchaseOrder => ({
        id: row.id,
        workspace_id: row.workspace_id,
        supplier_id: row.supplier_id,
        order_number: row.order_number,
        status: row.status as PurchaseOrderStatus,
        total_amount: Number(row.total_amount),
        currency: row.currency,
        notes: row.notes,
        created_by: row.created_by,
        created_at: new Date(row.created_at),
        approved_by: row.approved_by,
        approved_at: row.approved_at ? new Date(row.approved_at) : undefined,
        updated_at: new Date(row.updated_at),
        // Aliases legacy
        proveedorId: row.supplier_id,
        numeroOrden: row.order_number,
        estado: row.status as PurchaseOrderStatus,
        fechaCreacion: new Date(row.created_at),
        montoTotal: Number(row.total_amount)
    });

    const mapOrderItem = (row: any): PurchaseOrderItem => ({
        id: row.id,
        purchase_order_id: row.purchase_order_id,
        product_id: row.product_id,
        quantity: Number(row.quantity),
        unit_price: Number(row.unit_price),
        total_price: Number(row.total_price),
        created_at: new Date(row.created_at)
    });

    const mapReceipt = (row: any): WarehouseReceipt => ({
        id: row.id,
        purchase_order_id: row.purchase_order_id,
        workspace_id: row.workspace_id,
        supplier_id: row.supplier_id,
        receipt_date: new Date(row.receipt_date),
        received_by: row.received_by,
        notes: row.notes,
        created_at: new Date(row.created_at)
    });

    return (
        <ProcurementContext.Provider value={{
            suppliers,
            purchaseOrders,
            purchaseOrderItems,
            warehouseReceipts,
            loading,
            refreshProcurementData,
            addSupplier,
            updateSupplier,
            deleteSupplier,
            addPurchaseOrder,
            updatePurchaseOrderStatus,
            approvePurchaseOrder,
            rejectPurchaseOrder,
            registerReception
        }}>
            {children}
        </ProcurementContext.Provider>
    );
};

export const useProcurement = () => {
    const context = useContext(ProcurementContext);
    if (context === undefined) {
        throw new Error('useProcurement must be used within a ProcurementProvider');
    }
    return context;
};
