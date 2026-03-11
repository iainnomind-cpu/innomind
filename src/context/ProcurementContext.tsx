import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { useWorkspace } from './WorkspaceContext';
import { useUsers } from './UserContext';
import { useAccountsPayable } from './AccountsPayableContext';
import { validateWorkspace } from '@/lib/supabaseWorkspaceClient';
import {
    Supplier,
    PurchaseOrder,
    PurchaseOrderItem,
    PurchaseOrderStatus,
    WarehouseReceipt,
    PurchaseRequest,
    PurchaseBudget,
    RecurringPurchase
} from '@/types';

interface ProcurementContextType {
    suppliers: Supplier[];
    purchaseOrders: PurchaseOrder[];
    purchaseOrderItems: PurchaseOrderItem[];
    warehouseReceipts: WarehouseReceipt[];
    purchaseRequests: PurchaseRequest[];
    budgets: PurchaseBudget[];
    recurringPurchases: RecurringPurchase[];
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
    registerReception: (reception: Partial<WarehouseReceipt>, itemsReceived: { product_id: string, quantity_received: number, condition?: any, notes?: string }[]) => Promise<any>;

    // Requests
    addPurchaseRequest: (request: Partial<PurchaseRequest>) => Promise<any>;
    updatePurchaseRequest: (id: string, updates: Partial<PurchaseRequest>) => Promise<any>;
    convertRequestToOrder: (request: PurchaseRequest, supplierId: string) => Promise<any>;

    // Budgets
    getBudgetStatus: (category: string, date: Date) => Promise<{ limit: number, spent: number }>;
}

const ProcurementContext = createContext<ProcurementContextType | undefined>(undefined);

export const ProcurementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user: authUser } = useAuth();
    const { workspace } = useWorkspace();
    const { isLoadingProfile } = useUsers();
    const { addPayable } = useAccountsPayable();

    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [purchaseOrderItems, setPurchaseOrderItems] = useState<PurchaseOrderItem[]>([]);
    const [warehouseReceipts, setWarehouseReceipts] = useState<WarehouseReceipt[]>([]);
    const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
    const [budgets, setBudgets] = useState<PurchaseBudget[]>([]);
    const [recurringPurchases, setRecurringPurchases] = useState<RecurringPurchase[]>([]);
    const [loading, setLoading] = useState(true);

    // Mappers
    const mapSupplier = (row: any): Supplier => ({
        id: row.id,
        workspace: row.workspace,
        nombreComercial: row.nombre_comercial,
        razonSocial: row.razon_social,
        rfc: row.rfc,
        direccionFiscal: row.direccion_fiscal,
        pais: row.pais,
        estado: row.estado,
        ciudad: row.ciudad,
        codigoPostal: row.codigo_postal,
        email: row.email,
        telefono: row.telefono,
        categoria: row.categoria,
        tipoProveedor: row.tipo_proveedor,
        moneda: row.moneda,
        condicionesPago: row.condiciones_pago,
        tiempoEntregaPromedio: row.tiempo_entrega_promedio,
        calificacionDesempeno: row.calificacion_desempeno,
        notas: row.notas,
        website: row.website,
        activo: row.activo,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
    });

    const mapOrder = (row: any): PurchaseOrder => ({
        id: row.id,
        workspace_id: row.workspace_id,
        proveedor_id: row.proveedor_id,
        request_id: row.request_id,
        numero_orden: row.numero_orden,
        estado: row.estado as PurchaseOrderStatus,
        total_amount: Number(row.total_amount || 0),
        currency: row.currency || 'MXN',
        notes: row.notes,
        created_by: row.created_by,
        created_at: new Date(row.created_at),
        approved_by: row.approved_by,
        approved_at: row.approved_at ? new Date(row.approved_at) : undefined,
        payment_terms: row.payment_terms,
        estimated_delivery_date: row.estimated_delivery_date ? new Date(row.estimated_delivery_date) : undefined,
        precio_real: row.precio_real ? Number(row.precio_real) : undefined,
        evidencia_url: row.evidencia_url,
        updated_at: new Date(row.updated_at),
        // Legado UI (Mantenido para compatibilidad temporal)
        proveedorId: row.proveedor_id,
        numeroOrden: row.numero_orden,
        fechaCreacion: new Date(row.created_at),
        montoTotal: Number(row.total_amount || 0)
    });

    const mapOrderItem = (row: any): PurchaseOrderItem => ({
        id: row.id,
        purchase_order_id: row.purchase_order_id,
        product_id: row.product_id,
        descripcion: row.descripcion || 'Item sin descripción',
        cantidad_solicitada: Number(row.cantidad_solicitada || 0),
        precio_unitario: Number(row.precio_unitario || 0),
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

    const mapRequest = (row: any): PurchaseRequest => ({
        id: row.id,
        workspace_id: row.workspace_id,
        product_id: row.product_id,
        title: row.title,
        description: row.description,
        custom_item_name: row.custom_item_name,
        quantity: Number(row.quantity),
        estimated_cost: Number(row.estimated_cost),
        uom: row.uom,
        reason: row.reason,
        priority: row.priority as any,
        required_date: row.required_date ? new Date(row.required_date) : undefined,
        department: row.department,
        status: row.status as any,
        created_by: row.created_by,
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at)
    });

    const mapBudget = (row: any): PurchaseBudget => ({
        id: row.id,
        workspace_id: row.workspace_id,
        category: row.category,
        period_date: new Date(row.period_date),
        limit_amount: Number(row.limit_amount),
        spent_amount: Number(row.spent_amount),
        created_at: new Date(row.created_at)
    });

    const mapRecurring = (row: any): RecurringPurchase => ({
        id: row.id,
        workspace_id: row.workspace_id,
        supplier_id: row.supplier_id,
        title: row.title,
        frequency: row.frequency as any,
        next_run_date: row.next_run_date ? new Date(row.next_run_date) : undefined,
        last_run_date: row.last_run_date ? new Date(row.last_run_date) : undefined,
        items: row.items,
        total_estimated: Number(row.total_estimated),
        active: row.active
    });

    const refreshProcurementData = async () => {
        const workspaceId = workspace?.id;
        if (!workspaceId || !authUser) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const [suppliersRes, ordersRes, itemsRes, receiptsRes, requestsRes, budgetsRes, recurringRes] = await Promise.all([
                supabase.from('suppliers').select('*').eq('workspace', workspaceId).order('nombre_comercial', { ascending: true }),
                supabase.from('purchase_orders').select('*').eq('workspace_id', workspaceId).order('created_at', { ascending: false }),
                supabase.from('purchase_order_items').select('*').order('created_at', { ascending: true }), // Items usually loaded per order but master fetch works
                supabase.from('warehouse_receipts').select('*').eq('workspace_id', workspaceId).order('receipt_date', { ascending: false }),
                supabase.from('purchase_requests').select('*').eq('workspace_id', workspaceId).order('created_at', { ascending: false }),
                supabase.from('purchase_budgets').select('*').eq('workspace_id', workspaceId),
                supabase.from('recurring_purchases').select('*').eq('workspace_id', workspaceId)
            ]);

            if (suppliersRes.data) setSuppliers(suppliersRes.data.map(mapSupplier));
            if (ordersRes.data) setPurchaseOrders(ordersRes.data.map(mapOrder));
            if (itemsRes.data) setPurchaseOrderItems(itemsRes.data.map(mapOrderItem));
            if (receiptsRes.data) setWarehouseReceipts(receiptsRes.data.map(mapReceipt));
            if (requestsRes.data) setPurchaseRequests(requestsRes.data.map(mapRequest));
            if (budgetsRes.data) setBudgets(budgetsRes.data.map(mapBudget));
            if (recurringRes.data) setRecurringPurchases(recurringRes.data.map(mapRecurring));

        } catch (error) {
            console.error('Error fetching procurement data:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateOrderNumber = () => {
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 9000 + 1000);
        return `OC-${year}-${random}`;
    };

    useEffect(() => {
        if (!isLoadingProfile && workspace?.id) {
            refreshProcurementData();
        }
    }, [authUser, workspace?.id, isLoadingProfile]);

    const addSupplier = async (supplier: any) => {
        const workspaceId = validateWorkspace(workspace?.id);
        const { data, error } = await supabase.from('suppliers').insert([{
            nombre_comercial: supplier.nombreComercial,
            razon_social: supplier.razonSocial,
            rfc: supplier.rfc,
            direccion_fiscal: supplier.direccionFiscal,
            pais: supplier.pais,
            estado: supplier.estado,
            ciudad: supplier.ciudad,
            codigo_postal: supplier.codigoPostal,
            email: supplier.email,
            telefono: supplier.telefono,
            categoria: supplier.categoria,
            tipo_proveedor: supplier.tipoProveedor,
            moneda: supplier.moneda,
            condiciones_pago: supplier.condicionesPago,
            tiempo_entrega_promedio: supplier.tiempoEntregaPromedio,
            calificacion_desempeno: supplier.calificacionDesempeno,
            notas: supplier.notas,
            website: supplier.website,
            activo: supplier.activo !== undefined ? supplier.activo : true,
            workspace: workspaceId
        }]).select().single();

        if (error) throw error;
        setSuppliers(prev => [...prev, mapSupplier(data)]);
        return data;
    };

    const updateSupplier = async (id: string, updates: any) => {
        const workspaceId = validateWorkspace(workspace?.id);
        let mappedUpdates: any = { updated_at: new Date().toISOString() };
        if (updates.nombreComercial) mappedUpdates.nombre_comercial = updates.nombreComercial;
        if (updates.razonSocial !== undefined) mappedUpdates.razon_social = updates.razonSocial;
        if (updates.rfc !== undefined) mappedUpdates.rfc = updates.rfc;
        if (updates.direccionFiscal !== undefined) mappedUpdates.direccion_fiscal = updates.direccionFiscal;
        if (updates.pais !== undefined) mappedUpdates.pais = updates.pais;
        if (updates.estado !== undefined) mappedUpdates.estado = updates.estado;
        if (updates.ciudad !== undefined) mappedUpdates.ciudad = updates.ciudad;
        if (updates.codigoPostal !== undefined) mappedUpdates.codigo_postal = updates.codigoPostal;
        if (updates.email !== undefined) mappedUpdates.email = updates.email;
        if (updates.telefono !== undefined) mappedUpdates.telefono = updates.telefono;
        if (updates.categoria !== undefined) mappedUpdates.categoria = updates.categoria;
        if (updates.tipoProveedor !== undefined) mappedUpdates.tipo_proveedor = updates.tipoProveedor;
        if (updates.moneda !== undefined) mappedUpdates.moneda = updates.moneda;
        if (updates.condicionesPago !== undefined) mappedUpdates.condiciones_pago = updates.condicionesPago;
        if (updates.tiempoEntregaPromedio !== undefined) mappedUpdates.tiempo_entrega_promedio = updates.tiempoEntregaPromedio;
        if (updates.calificacionDesempeno !== undefined) mappedUpdates.calificacion_desempeno = updates.calificacionDesempeno;
        if (updates.notas !== undefined) mappedUpdates.notas = updates.notas;
        if (updates.website !== undefined) mappedUpdates.website = updates.website;
        if (updates.activo !== undefined) mappedUpdates.activo = updates.activo;

        const { data, error } = await supabase.from('suppliers')
            .update(mappedUpdates)
            .eq('id', id)
            .eq('workspace', workspaceId)
            .select().single();

        if (error) throw error;
        setSuppliers(prev => prev.map(s => s.id === id ? mapSupplier(data) : s));
        return data;
    };

    const deleteSupplier = async (id: string) => {
        return updateSupplier(id, { activo: false });
    };

    const addPurchaseOrder = async (order: Partial<PurchaseOrder>, items: Partial<PurchaseOrderItem>[]) => {
        const workspaceId = validateWorkspace(workspace?.id);
        const initialStatus: PurchaseOrderStatus = 'pending';
        const orderNumber = order.numero_orden || generateOrderNumber();

        if (!order.proveedor_id) throw new Error("Debe asignar un proveedor a la orden");

        const { data: orderData, error: orderError } = await supabase.from('purchase_orders').insert([{
            workspace_id: workspaceId,
            proveedor_id: order.proveedor_id,
            numero_orden: orderNumber,
            estado: initialStatus,
            total_amount: order.total_amount,
            currency: order.currency || 'MXN',
            payment_terms: order.payment_terms,
            estimated_delivery_date: order.estimated_delivery_date,
            request_id: order.request_id,
            notes: order.notes,
            created_by: authUser?.id
        }]).select().single();

        if (orderError) throw orderError;

        const formattedItems = items.map(item => ({
            purchase_order_id: orderData.id,
            workspace_id: workspaceId,
            product_id: item.product_id,
            descripcion: item.descripcion || 'Item sin descripción',
            cantidad_solicitada: item.cantidad_solicitada || 1,
            precio_unitario: item.precio_unitario || 0,
            total_linea: (item.cantidad_solicitada || 1) * (item.precio_unitario || 0)
        }));

        const { data: itemsData, error: itemsError } = await supabase.from('purchase_order_items').insert(formattedItems).select();
        if (itemsError) throw itemsError;

        setPurchaseOrders(prev => [mapOrder(orderData), ...prev]);
        if (itemsData) setPurchaseOrderItems(prev => [...prev, ...itemsData.map(mapOrderItem)]);

        return orderData;
    };

    const updatePurchaseOrderStatus = async (id: string, estado: PurchaseOrderStatus, notes?: string) => {
        const workspaceId = validateWorkspace(workspace?.id);
        const updates: any = { estado, updated_at: new Date().toISOString() };
        if (notes) updates.notes = notes;

        const { data, error } = await supabase.from('purchase_orders')
            .update(updates)
            .eq('id', id)
            .eq('workspace_id', workspaceId)
            .select().single();

        if (error) throw error;
        setPurchaseOrders(prev => prev.map(o => o.id === id ? mapOrder(data) : o));
        return data;
    };

    const approvePurchaseOrder = async (id: string, comments: string) => {
        const workspaceId = validateWorkspace(workspace?.id);
        const { data, error } = await supabase.from('purchase_orders').update({
            estado: 'approved',
            approved_by: authUser?.id,
            approved_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }).eq('id', id).eq('workspace_id', workspaceId).select().single();

        if (error) throw error;

        await supabase.from('purchase_approvals').insert([{
            purchase_order_id: id,
            approved_by: authUser?.id,
            status: 'approved',
            comments,
            workspace_id: workspaceId
        }]);

        const mappedOrder = mapOrder(data);
        setPurchaseOrders(prev => prev.map(o => o.id === id ? mappedOrder : o));

        // Create Account Payable automatically
        try {
            const supplier = suppliers.find(s => s.id === (data.proveedor_id));
            const amount = mappedOrder.precio_real && mappedOrder.precio_real > 0 ? mappedOrder.precio_real : mappedOrder.total_amount;

            await addPayable({
                workspace_id: workspaceId,
                workspace: workspaceId, // Alias
                supplier_id: data.proveedor_id,
                proveedor_id: data.proveedor_id, // Alias
                purchase_order_id: id, // Critical relation
                concept: `Orden de compra #${mappedOrder.numero_orden}`,
                numero_referencia: mappedOrder.numero_orden, // Alias
                amount: amount,
                monto: amount, // Alias
                due_date: supplier?.condicionesPago ?
                    new Date(Date.now() + (supplier.condicionesPago * 24 * 60 * 60 * 1000)) :
                    new Date()
            });
        } catch (financeError) {
            console.error("Caution: Account Payable auto-generation failed during approval", financeError);
        }

        return data;
    };

    const rejectPurchaseOrder = async (id: string, comments: string) => {
        const workspaceId = validateWorkspace(workspace?.id);
        const { data, error } = await supabase.from('purchase_orders').update({
            estado: 'rejected',
            updated_at: new Date().toISOString()
        }).eq('id', id).eq('workspace_id', workspaceId).select().single();

        if (error) throw error;

        await supabase.from('purchase_approvals').insert([{
            purchase_order_id: id,
            approved_by: authUser?.id,
            status: 'rejected',
            comments,
            workspace_id: workspaceId
        }]);

        setPurchaseOrders(prev => prev.map(o => o.id === id ? mapOrder(data) : o));
        return data;
    };

    const registerReception = async (reception: Partial<WarehouseReceipt>, itemsReceived: { product_id: string, quantity_received: number, condition?: any, notes?: string }[]) => {
        const workspaceId = validateWorkspace(workspace?.id);

        const { data: receiptData, error: recError } = await supabase.from('warehouse_receipts').insert([{
            purchase_order_id: reception.purchase_order_id,
            workspace_id: workspaceId,
            supplier_id: reception.supplier_id,
            receipt_date: new Date().toISOString(),
            received_by: authUser?.id,
            notes: reception.notes
        }]).select().single();

        if (recError) throw recError;

        const receiptItems = itemsReceived.map(item => ({
            receipt_id: receiptData.id,
            product_id: item.product_id,
            quantity_received: item.quantity_received,
            condition: item.condition || 'good',
            notes: item.notes,
            workspace_id: workspaceId
        }));

        const { error: itemsError } = await supabase.from('warehouse_receipt_items').insert(receiptItems);
        if (itemsError) throw itemsError;

        const { error: orderError } = await supabase.from('purchase_orders').update({
            estado: 'approved', // If received, we can consider it approved/completed in this simplified flow, or keep it approved.
            updated_at: new Date().toISOString()
        }).eq('id', reception.purchase_order_id).eq('workspace_id', workspaceId).select().single();

        if (orderError) throw orderError;

        // CxP auto-generation removed from here, now handled in approvePurchaseOrder
        // to avoid duplicates and ensure it's created upon manager approval.

        refreshProcurementData();
        return receiptData;
    };

    const addPurchaseRequest = async (request: Partial<PurchaseRequest>) => {
        const workspaceId = validateWorkspace(workspace?.id);
        const { data, error } = await supabase.from('purchase_requests').insert([{
            workspace_id: workspaceId,
            product_id: request.product_id,
            title: request.title,
            description: request.description,
            custom_item_name: request.custom_item_name,
            quantity: request.quantity,
            uom: request.uom,
            estimated_cost: request.estimated_cost,
            reason: request.reason,
            priority: request.priority || 'normal',
            required_date: request.required_date,
            department: request.department,
            status: 'pending',
            created_by: authUser?.id
        }]).select().single();

        if (error) throw error;
        setPurchaseRequests(prev => [mapRequest(data), ...prev]);
        return data;
    };

    const updatePurchaseRequest = async (id: string, updates: Partial<PurchaseRequest>) => {
        const workspaceId = validateWorkspace(workspace?.id);
        const { data, error } = await supabase.from('purchase_requests')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('workspace_id', workspaceId)
            .select().single();

        if (error) throw error;
        setPurchaseRequests(prev => prev.map(r => r.id === id ? mapRequest(data) : r));
        return data;
    };

    const convertRequestToOrder = async (request: PurchaseRequest, supplierId: string) => {
        const workspaceId = validateWorkspace(workspace?.id);

        // Validation before creating the OC
        if (!request.id) throw new Error("ID de solicitud faltante");
        if (!request.workspace_id) throw new Error("Workspace ID de la solicitud faltante");
        if (!supplierId) throw new Error("Debe seleccionar un proveedor antes de crear la Orden de Compra");
        if (request.estimated_cost === undefined || request.estimated_cost === null) {
            throw new Error("La solicitud debe tener un costo estimado para generar una OC");
        }

        const orderNumber = generateOrderNumber();
        const totalAmount = (request.quantity || 0) * (request.estimated_cost || 0);

        // 1. Create Purchase Order
        const { data: orderData, error: orderError } = await supabase.from('purchase_orders').insert([{
            workspace_id: workspaceId,
            request_id: request.id,
            proveedor_id: supplierId,
            numero_orden: orderNumber,
            total_amount: totalAmount,
            currency: 'MXN',
            estado: 'pending',
            notes: `Generada automáticamente desde solicitud: ${request.title || request.custom_item_name}`,
            created_by: authUser?.id
        }]).select().single();

        if (orderError) {
            console.error("Error creando Orden de Compra:", orderError);
            throw orderError;
        }

        console.log("Orden creada:", orderData);

        // 2. Create Order Item
        const itemsToInsert = [{
            purchase_order_id: orderData.id,
            workspace_id: workspaceId,
            product_id: request.product_id,
            descripcion: request.title || request.custom_item_name || 'Item sin descripción',
            cantidad_solicitada: request.quantity || 1,
            precio_unitario: request.estimated_cost || 0,
            total_linea: (request.quantity || 1) * (request.estimated_cost || 0)
        }];

        console.log("Items a insertar:", itemsToInsert);

        const { error: itemError } = await supabase.from('purchase_order_items').insert(itemsToInsert);

        if (itemError) {
            console.error("Error creando Items de Orden de Compra:", itemError);
            throw itemError;
        }

        // 3. Update Request Status to 'ordered'
        const { error: reqError } = await supabase.from('purchase_requests')
            .update({ status: 'ordered', updated_at: new Date().toISOString() })
            .eq('id', request.id)
            .eq('workspace_id', workspaceId);

        if (reqError) {
            console.error("Error actualizando estado de solicitud:", reqError);
            throw reqError;
        }

        refreshProcurementData();
        return orderData;
    };

    const getBudgetStatus = async (category: string, date: Date) => {
        const periodDate = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
        const budget = budgets.find(b => b.category === category && b.period_date.toISOString() === periodDate);
        return {
            limit: budget?.limit_amount || 0,
            spent: budget?.spent_amount || 0
        };
    };

    return (
        <ProcurementContext.Provider value={{
            suppliers,
            purchaseOrders,
            purchaseOrderItems,
            warehouseReceipts,
            purchaseRequests,
            budgets,
            recurringPurchases,
            loading,
            refreshProcurementData,
            addSupplier,
            updateSupplier,
            deleteSupplier,
            addPurchaseOrder,
            updatePurchaseOrderStatus,
            approvePurchaseOrder,
            rejectPurchaseOrder,
            registerReception,
            addPurchaseRequest,
            updatePurchaseRequest,
            convertRequestToOrder,
            getBudgetStatus
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
