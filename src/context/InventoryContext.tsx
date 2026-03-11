import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, InventoryLocation, InventoryMovement } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { useWorkspace } from './WorkspaceContext';
import { useUsers } from './UserContext';
import { validateWorkspace } from '@/lib/supabaseWorkspaceClient';

interface InventoryContextType {
    products: Product[];
    locations: InventoryLocation[];
    movements: InventoryMovement[];
    isLoadingInventory: boolean;
    refreshInventoryData: () => Promise<void>;

    // Product Master Actions
    addProduct: (product: Omit<Product, 'id' | 'seguimientos' | 'cotizaciones' | 'tareas'>) => Promise<void>;
    updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;

    // Stock Control Actions
    addLocation: (location: Omit<InventoryLocation, 'id' | 'fechaCreacion'>) => Promise<void>;
    updateLocation: (id: string, data: Partial<InventoryLocation>) => Promise<void>;
    deleteLocation: (id: string) => Promise<void>;
    registerMovement: (movement: Omit<InventoryMovement, 'id' | 'fechaMovimiento' | 'userId'>) => Promise<void>;

    // Derived State Helpers
    getProductStock: (productId: string, locationId?: string) => number;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user: authUser } = useAuth();
    const { workspace } = useWorkspace();
    const { isLoadingProfile } = useUsers();

    const [isLoadingInventory, setIsLoadingInventory] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);
    const [locations, setLocations] = useState<InventoryLocation[]>([]);
    const [movements, setMovements] = useState<InventoryMovement[]>([]);

    // Mappers
    const mapProductFromDB = (row: any): Product => ({
        id: row.id,
        codigo: row.codigo,
        nombre: row.nombre,
        descripcion: row.descripcion,
        precio: Number(row.precio),
        costoPromedio: row.costo_promedio ? Number(row.costo_promedio) : 0,
        categoria: row.categoria,
        tipo: row.tipo,
        activo: row.activo,
        unidad: row.unidad_medida,
        stockMinimo: row.stock_minimo,
        trackInventory: row.track_inventory,
        esPaqueteServicios: row.es_paquete_servicios,
        seguimientos: [],
        cotizaciones: [],
        tareas: []
    });

    const mapLocationFromDB = (row: any): InventoryLocation => ({
        id: row.id,
        nombre: row.nombre,
        direccion: row.direccion,
        tipo: row.tipo,
        activo: row.activo,
        fechaCreacion: new Date(row.created_at)
    });

    const mapMovementFromDB = (row: any): InventoryMovement => ({
        id: row.id,
        productId: row.producto_id,
        locationId: row.location_id,
        tipoMovimiento: row.movement_type,
        cantidad: Number(row.cantidad),
        costoUnitario: Number(row.costo_unitario),
        notas: row.notas,
        referenceId: row.reference_id,
        userId: row.user_id,
        fechaMovimiento: new Date(row.fecha_movimiento)
    });

    const refreshInventoryData = async () => {
        const workspaceId = workspace?.id;
        if (!workspaceId || !authUser) {
            setProducts([]);
            setLocations([]);
            setMovements([]);
            setIsLoadingInventory(false);
            return;
        }

        setIsLoadingInventory(true);
        try {
            const [prodRes, locRes, movRes] = await Promise.all([
                supabase.from('products').select('*').eq('workspace_id', workspaceId).order('nombre', { ascending: true }),
                supabase.from('inventory_locations').select('*').eq('workspace_id', workspaceId).order('nombre', { ascending: true }),
                supabase.from('inventory_movements').select('*').eq('workspace_id', workspaceId).order('fecha_movimiento', { ascending: false })
            ]);

            if (prodRes.data) setProducts(prodRes.data.map(mapProductFromDB));
            if (locRes.data) setLocations(locRes.data.map(mapLocationFromDB));
            if (movRes.data) setMovements(movRes.data.map(mapMovementFromDB));

        } catch (error) {
            console.error("Error fetching Inventory Data", error);
        } finally {
            setIsLoadingInventory(false);
        }
    };

    useEffect(() => {
        if (!isLoadingProfile && workspace?.id) {
            refreshInventoryData();
        }
    }, [authUser, workspace?.id, isLoadingProfile]);

    // PRODUCTS
    const addProduct = async (productData: Omit<Product, 'id' | 'seguimientos' | 'cotizaciones' | 'tareas'>) => {
        const workspaceId = validateWorkspace(workspace?.id);
        const payload = {
            codigo: productData.codigo,
            nombre: productData.nombre,
            descripcion: productData.descripcion,
            precio: productData.precio,
            costo_promedio: productData.costoPromedio,
            categoria: productData.categoria,
            tipo: productData.tipo,
            unidad_medida: productData.unidad,
            stock_minimo: productData.stockMinimo,
            track_inventory: productData.trackInventory,
            es_paquete_servicios: productData.esPaqueteServicios,
            activo: productData.activo,
            workspace_id: workspaceId
        };
        const { data, error } = await supabase.from('products').insert(payload).select().single();
        if (error) throw error;
        setProducts(prev => [mapProductFromDB(data), ...prev]);
    };

    const updateProduct = async (id: string, data: Partial<Product>) => {
        const workspaceId = validateWorkspace(workspace?.id);

        const payload: any = { updated_at: new Date().toISOString() };
        if (data.codigo !== undefined) payload.codigo = data.codigo;
        if (data.nombre !== undefined) payload.nombre = data.nombre;
        if (data.precio !== undefined) payload.precio = data.precio;
        if (data.costoPromedio !== undefined) payload.costo_promedio = data.costoPromedio;
        if (data.categoria !== undefined) payload.categoria = data.categoria;
        if (data.tipo !== undefined) payload.tipo = data.tipo;
        if (data.unidad !== undefined) payload.unidad_medida = data.unidad;
        if (data.stockMinimo !== undefined) payload.stock_minimo = data.stockMinimo;
        if (data.trackInventory !== undefined) payload.track_inventory = data.trackInventory;
        if (data.activo !== undefined) payload.activo = data.activo;

        const { error } = await supabase.from('products')
            .update(payload)
            .eq('id', id)
            .eq('workspace_id', workspaceId);

        if (error) throw error;
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    };

    const deleteProduct = async (id: string) => {
        const workspaceId = validateWorkspace(workspace?.id);
        const { error } = await supabase.from('products')
            .delete()
            .eq('id', id)
            .eq('workspace_id', workspaceId);

        if (error) throw error;
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    // LOCATIONS
    const addLocation = async (location: Omit<InventoryLocation, 'id' | 'fechaCreacion'>) => {
        const workspaceId = validateWorkspace(workspace?.id);
        const payload = {
            nombre: location.nombre,
            direccion: location.direccion,
            tipo: location.tipo,
            activo: location.activo,
            workspace_id: workspaceId
        };
        const { data, error } = await supabase.from('inventory_locations').insert(payload).select().single();
        if (error) throw error;
        setLocations(prev => [...prev, mapLocationFromDB(data)]);
    };

    const updateLocation = async (id: string, data: Partial<InventoryLocation>) => {
        const workspaceId = validateWorkspace(workspace?.id);
        const payload: any = { updated_at: new Date().toISOString() };
        if (data.nombre !== undefined) payload.nombre = data.nombre;
        if (data.direccion !== undefined) payload.direccion = data.direccion;
        if (data.tipo !== undefined) payload.tipo = data.tipo;
        if (data.activo !== undefined) payload.activo = data.activo;

        const { error } = await supabase.from('inventory_locations')
            .update(payload)
            .eq('id', id)
            .eq('workspace_id', workspaceId);

        if (error) throw error;
        setLocations(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
    };

    const deleteLocation = async (id: string) => {
        const workspaceId = validateWorkspace(workspace?.id);
        const { error } = await supabase.from('inventory_locations')
            .delete()
            .eq('id', id)
            .eq('workspace_id', workspaceId);

        if (error) throw error;
        setLocations(prev => prev.filter(l => l.id !== id));
    };

    // MOVEMENTS & STOCK CONTROL
    const registerMovement = async (movement: Omit<InventoryMovement, 'id' | 'fechaMovimiento' | 'userId'>) => {
        const workspaceId = validateWorkspace(workspace?.id);
        const payload = {
            producto_id: movement.productId,
            location_id: movement.locationId,
            movement_type: movement.tipoMovimiento,
            cantidad: movement.cantidad,
            costo_unitario: movement.costoUnitario,
            notas: movement.notas,
            reference_id: movement.referenceId,
            user_id: authUser?.id,
            workspace_id: workspaceId
        };
        const { data, error } = await supabase.from('inventory_movements').insert(payload).select().single();
        if (error) throw error;
        setMovements(prev => [mapMovementFromDB(data), ...prev]);
    };

    const getProductStock = (productId: string, locationId?: string) => {
        const productMovements = movements.filter(m => m.productId === productId && (!locationId || m.locationId === locationId));

        return productMovements.reduce((acc, mov) => {
            const isAddition = ['ENTRADA_COMPRA', 'AJUSTE_POSITIVO'].includes(mov.tipoMovimiento);
            const isSubtraction = ['SALIDA_VENTA', 'AJUSTE_NEGATIVO'].includes(mov.tipoMovimiento);

            if (isAddition) return acc + mov.cantidad;
            if (isSubtraction) return acc - mov.cantidad;
            return acc;
        }, 0);
    };

    return (
        <InventoryContext.Provider value={{
            products, locations, movements, isLoadingInventory, refreshInventoryData,
            addProduct, updateProduct, deleteProduct,
            addLocation, updateLocation, deleteLocation, registerMovement, getProductStock
        }}>
            {children}
        </InventoryContext.Provider>
    );
};

export const useInventory = () => {
    const context = useContext(InventoryContext);
    if (context === undefined) {
        throw new Error('useInventory must be used within an InventoryProvider');
    }
    return context;
};
