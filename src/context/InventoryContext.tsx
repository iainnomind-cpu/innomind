import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, InventoryLocation, InventoryMovement } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

interface InventoryContextType {
    products: Product[];
    locations: InventoryLocation[];
    movements: InventoryMovement[];
    isLoadingInventory: boolean;

    // Product Master Actions
    addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
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
        esPaqueteServicios: row.es_paquete_servicios
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
        productId: row.product_id,
        locationId: row.location_id,
        tipoMovimiento: row.tipo_movimiento,
        cantidad: Number(row.cantidad),
        costoUnitario: Number(row.costo_unitario),
        notas: row.notas,
        referenceId: row.reference_id,
        userId: row.user_id,
        fechaMovimiento: new Date(row.fecha_movimiento)
    });

    // Master Fetch
    useEffect(() => {
        if (!authUser) {
            setProducts([]);
            setLocations([]);
            setMovements([]);
            setIsLoadingInventory(false);
            return;
        }

        const fetchAllData = async () => {
            setIsLoadingInventory(true);
            try {
                // Fetch Products
                const { data: prodData } = await supabase.from('products').select('*').order('nombre', { ascending: true });
                if (prodData) setProducts(prodData.map(mapProductFromDB));

                // Fetch Locations
                const { data: locData } = await supabase.from('inventory_locations').select('*').order('nombre', { ascending: true });
                if (locData) setLocations(locData.map(mapLocationFromDB));

                // Fetch Movements
                const { data: movData } = await supabase.from('inventory_movements').select('*').order('fecha_movimiento', { ascending: false });
                if (movData) setMovements(movData.map(mapMovementFromDB));

            } catch (error) {
                console.error("Error fetching Inventory Data", error);
            } finally {
                setIsLoadingInventory(false);
            }
        };

        fetchAllData();
    }, [authUser]);

    // PRODUCTS
    const addProduct = async (productData: Omit<Product, 'id'>) => {
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
            activo: productData.activo
        };
        const { data, error } = await supabase.from('products').insert(payload).select().single();
        if (data && !error) {
            setProducts(prev => [mapProductFromDB(data), ...prev]);
        }
    };

    const updateProduct = async (id: string, data: Partial<Product>) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));

        const payload: any = {};
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

        if (Object.keys(payload).length > 0) {
            await supabase.from('products').update(payload).eq('id', id);
        }
    };

    const deleteProduct = async (id: string) => {
        setProducts(prev => prev.filter(p => p.id !== id));
        await supabase.from('products').delete().eq('id', id);
    };

    // LOCATIONS
    const addLocation = async (location: Omit<InventoryLocation, 'id' | 'fechaCreacion'>) => {
        const payload = {
            nombre: location.nombre,
            direccion: location.direccion,
            tipo: location.tipo,
            activo: location.activo
        };
        const { data, error } = await supabase.from('inventory_locations').insert(payload).select().single();
        if (data && !error) {
            setLocations(prev => [...prev, mapLocationFromDB(data)]);
        }
    };

    const updateLocation = async (id: string, data: Partial<InventoryLocation>) => {
        setLocations(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));

        const payload: any = {};
        if (data.nombre !== undefined) payload.nombre = data.nombre;
        if (data.direccion !== undefined) payload.direccion = data.direccion;
        if (data.tipo !== undefined) payload.tipo = data.tipo;
        if (data.activo !== undefined) payload.activo = data.activo;

        if (Object.keys(payload).length > 0) {
            await supabase.from('inventory_locations').update(payload).eq('id', id);
        }
    };

    const deleteLocation = async (id: string) => {
        setLocations(prev => prev.filter(l => l.id !== id));
        await supabase.from('inventory_locations').delete().eq('id', id);
    };

    // MOVEMENTS & STOCK CONTROL
    const registerMovement = async (movement: Omit<InventoryMovement, 'id' | 'fechaMovimiento' | 'userId'>) => {
        const payload = {
            product_id: movement.productId,
            location_id: movement.locationId,
            tipo_movimiento: movement.tipoMovimiento,
            cantidad: movement.cantidad,
            costo_unitario: movement.costoUnitario,
            notas: movement.notas,
            reference_id: movement.referenceId,
            user_id: authUser?.id
        };
        const { data, error } = await supabase.from('inventory_movements').insert(payload).select().single();
        if (data && !error) {
            setMovements(prev => [mapMovementFromDB(data), ...prev]);

            // Si es una compra/entrada que costó dinero real, deberíamos opcionalmente 
            // recalcular el "costo_promedio" del producto. Por brevedad, lo mantenemos simple.
        } else {
            console.error("Error registering movement", error);
        }
    };

    const getProductStock = (productId: string, locationId?: string) => {
        const productMovements = movements.filter(m => m.productId === productId && (!locationId || m.locationId === locationId));

        return productMovements.reduce((acc, mov) => {
            const isAddition = ['ENTRADA_COMPRA', 'AJUSTE_POSITIVO'].includes(mov.tipoMovimiento);
            const isSubtraction = ['SALIDA_VENTA', 'AJUSTE_NEGATIVO'].includes(mov.tipoMovimiento);

            if (isAddition) return acc + mov.cantidad;
            if (isSubtraction) return acc - mov.cantidad;
            return acc; // TRANSFERENCIA handled differently depending on origin/destination view needed
        }, 0);
    };

    return (
        <InventoryContext.Provider value={{
            products, locations, movements, isLoadingInventory,
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
