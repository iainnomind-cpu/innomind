import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { useFinance } from './FinanceContext';
import { Supplier, PurchaseOrder, PurchaseOrderItem, PurchaseReception, PurchaseOrderStatus } from '@/types';

interface ProcurementContextType {
    suppliers: Supplier[];
    purchaseOrders: PurchaseOrder[];
    purchaseOrderItems: PurchaseOrderItem[];
    receptions: PurchaseReception[];
    loading: boolean;
    refreshProcurementData: () => Promise<void>;

    // Suppliers
    addSupplier: (supplier: Omit<Supplier, 'id' | 'workspace' | 'createdAt' | 'updatedAt'>) => Promise<any>;
    updateSupplier: (id: string, updates: Partial<Supplier>) => Promise<any>;
    deleteSupplier: (id: string) => Promise<any>;

    // Purchase Orders
    addPurchaseOrder: (order: Omit<PurchaseOrder, 'id' | 'workspace' | 'estado' | 'numeroOrden' | 'createdAt' | 'updatedAt'>, items: Omit<PurchaseOrderItem, 'id' | 'workspace' | 'purchaseOrderId' | 'createdAt'>[]) => Promise<any>;
    updatePurchaseOrderStatus: (id: string, status: PurchaseOrderStatus, notes?: string) => Promise<any>;

    // Receptions
    registerReception: (reception: Omit<PurchaseReception, 'id' | 'workspace' | 'createdAt'>, itemsReceived: { id: string, cantidadRecibida: number }[]) => Promise<any>;
}

const ProcurementContext = createContext<ProcurementContextType | undefined>(undefined);

export const ProcurementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { session } = useAuth();
    const { addDocument } = useFinance();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [purchaseOrderItems, setPurchaseOrderItems] = useState<PurchaseOrderItem[]>([]);
    const [receptions, setReceptions] = useState<PurchaseReception[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshProcurementData = async () => {
        if (!session?.user) return;
        setLoading(true);

        try {
            const [suppliersRes, ordersRes, itemsRes, receptionsRes] = await Promise.all([
                supabase.from('suppliers').select('*').order('nombre_comercial', { ascending: true }),
                supabase.from('purchase_orders').select('*').order('created_at', { ascending: false }),
                supabase.from('purchase_order_items').select('*'),
                supabase.from('purchase_receptions').select('*').order('fecha_recepcion', { ascending: false })
            ]);

            if (suppliersRes.data) setSuppliers(suppliersRes.data.map(mapSupplier));
            if (ordersRes.data) setPurchaseOrders(ordersRes.data.map(mapOrder));
            if (itemsRes.data) setPurchaseOrderItems(itemsRes.data.map(mapItem));
            if (receptionsRes.data) setReceptions(receptionsRes.data.map(mapReception));

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
        // Soft delete by setting active to false
        return updateSupplier(id, { activo: false });
    };

    const addPurchaseOrder = async (order: any, items: any[]) => {
        const isManagerRequired = order.montoTotal > 10000; // configurable threshold
        const initialStatus = isManagerRequired ? 'PENDIENTE_APROBACION' : 'APROBADA';

        // 1. Insert Order
        const { data: orderData, error: orderError } = await supabase.from('purchase_orders').insert([{
            proveedor_id: order.proveedorId,
            numero_orden: `OC-${Date.now().toString().slice(-6)}`, // Auto generate temp folios for V1
            estado: initialStatus,
            fecha_creacion: new Date().toISOString(),
            fecha_esperada: order.fechaEsperada ? order.fechaEsperada.toISOString() : null,
            subtotal: order.subtotal,
            impuestos: order.impuestos,
            monto_total: order.montoTotal,
            notas_internas: order.notasInternas,
            terminos_condiciones: order.terminosCondiciones,
            requiere_aprobacion_gerencial: isManagerRequired,
            creado_por: session?.user?.id
        }]).select().single();

        if (orderError) throw orderError;

        // 2. Insert Items
        const formattedItems = items.map(item => ({
            purchase_order_id: orderData.id,
            product_id: item.productId,
            descripcion: item.descripcion,
            cantidad_solicitada: item.cantidadSolicitada,
            cantidad_recibida: 0,
            precio_unitario: item.precioUnitario,
            impuesto_porcentaje: item.impuestoPorcentaje || 0,
            total_linea: item.totalLinea
        }));

        const { data: itemsData, error: itemsError } = await supabase.from('purchase_order_items').insert(formattedItems).select();

        if (itemsError) throw itemsError;

        setPurchaseOrders(prev => [mapOrder(orderData), ...prev]);
        setPurchaseOrderItems(prev => [...prev, ...itemsData.map(mapItem)]);

        return orderData;
    };

    const updatePurchaseOrderStatus = async (id: string, status: PurchaseOrderStatus, notes?: string) => {
        const updates: any = { estado: status };
        if (status === 'APROBADA') {
            updates.aprobado_por = session?.user?.id;
        }
        if (notes) {
            // fetch current order to append notes ideally, here overwriting for simplicity if provided
            updates.notas_internas = notes;
        }

        const { data, error } = await supabase.from('purchase_orders').update(updates).eq('id', id).select().single();
        if (error) throw error;
        setPurchaseOrders(prev => prev.map(o => o.id === id ? mapOrder(data) : o));
        return data;
    };

    const registerReception = async (reception: any, itemsReceived: any[]) => {
        // 1. Insert reception record
        const { data: receptionData, error: recError } = await supabase.from('purchase_receptions').insert([{
            purchase_order_id: reception.purchaseOrderId,
            fecha_recepcion: reception.fechaRecepcion.toISOString(),
            recibido_por: session?.user?.id,
            numero_remision: reception.numeroRemision,
            notas: reception.notas
        }]).select().single();

        if (recError) throw recError;

        // 2. Update Items received amounts
        for (const item of itemsReceived) {
            const { error: itemError } = await supabase.from('purchase_order_items')
                .update({ cantidad_recibida: item.cantidadRecibida })
                .eq('id', item.id);
            if (itemError) console.error("Error updating item qty", itemError);
        }

        // 3. Determine if partial or full reception
        // In a real scenario we need to calculate total requested vs total received across all receptions.
        // For V1 we just mark as COMPLETADA if they perform a reception.
        const { data: orderData, error: orderError } = await supabase.from('purchase_orders').update({
            estado: 'COMPLETADA'
        }).eq('id', reception.purchaseOrderId).select().single();

        if (orderError) throw orderError;

        // 4. Auto-generate Cuenta por Pagar in Finance Module
        try {
            // Fetch order to get total amount and supplier info
            const order = mapOrder(orderData);
            const supplier = suppliers.find(s => s.id === order.proveedorId);

            await addDocument({
                tipo: 'CUENTA_PAGAR',
                estado: 'PENDIENTE',
                numeroFolio: order.numeroOrden,
                montoTotal: order.montoTotal,
                moneda: 'MXN', // Defaulting to MXN for V1
                fechaEmision: new Date(),
                fechaVencimiento: supplier?.condicionesPago ?
                    new Date(Date.now() + supplier.condicionesPago * 24 * 60 * 60 * 1000) :
                    new Date(), // If no credit, due today
                quoteId: order.id, // Reusing quoteId field to link to Purchase Order id internally for now
                proveedorNombre: supplier?.nombreComercial || 'Proveedor Desconocido',
                concepto: `Pago a Proveedor por OC: ${order.numeroOrden}`,
                categoria: 'Proveedores'
            });
            console.log("Finance payable created automatically");
        } catch (financeError) {
            console.error("Warning: Could not create finance payable link automtically", financeError);
            // Non-blocking error for procurement flow 
        }

        refreshProcurementData(); // Refresh all to get latest item quantities and order status
        return receptionData;
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
        workspace: row.workspace,
        proveedorId: row.proveedor_id,
        numeroOrden: row.numero_orden,
        estado: row.estado as PurchaseOrderStatus,
        fechaCreacion: new Date(row.fecha_creacion),
        fechaEsperada: row.fecha_esperada ? new Date(row.fecha_esperada) : undefined,
        subtotal: Number(row.subtotal),
        impuestos: Number(row.impuestos),
        montoTotal: Number(row.monto_total),
        notasInternas: row.notas_internas,
        terminosCondiciones: row.terminos_condiciones,
        requiereAprobacionGerencial: row.requiere_aprobacion_gerencial,
        aprobadoPor: row.aprobado_por,
        creadoPor: row.creado_por,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
    });

    const mapItem = (row: any): PurchaseOrderItem => ({
        id: row.id,
        workspace: row.workspace,
        purchaseOrderId: row.purchase_order_id,
        productId: row.product_id,
        descripcion: row.descripcion,
        cantidadSolicitada: Number(row.cantidad_solicitada),
        cantidadRecibida: Number(row.cantidad_recibida),
        precioUnitario: Number(row.precio_unitario),
        impuestoPorcentaje: Number(row.impuesto_porcentaje),
        totalLinea: Number(row.total_linea),
        createdAt: new Date(row.created_at)
    });

    const mapReception = (row: any): PurchaseReception => ({
        id: row.id,
        workspace: row.workspace,
        purchaseOrderId: row.purchase_order_id,
        fechaRecepcion: new Date(row.fecha_recepcion),
        recibidoPor: row.recibido_por,
        numeroRemision: row.numero_remision,
        notas: row.notas,
        createdAt: new Date(row.created_at)
    });


    return (
        <ProcurementContext.Provider value={{
            suppliers,
            purchaseOrders,
            purchaseOrderItems,
            receptions,
            loading,
            refreshProcurementData,
            addSupplier,
            updateSupplier,
            deleteSupplier,
            addPurchaseOrder,
            updatePurchaseOrderStatus,
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
