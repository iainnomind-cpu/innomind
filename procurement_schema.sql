-- Schema Módulo de Compras y Proveedores (Procurement)
-- Ejecutar en Supabase SQL Editor

-- 1. Proveedores (Suppliers)
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace UUID NOT NULL REFERENCES public.company_profiles(id) DEFAULT (get_current_workspace()::uuid),
    
    nombre_comercial TEXT NOT NULL,
    razon_social TEXT,
    rfc TEXT,
    email TEXT,
    telefono TEXT,
    
    condiciones_pago INTEGER DEFAULT 0, -- Días de crédito
    calificacion_desempeno INTEGER CHECK (calificacion_desempeno BETWEEN 1 AND 5),
    notas TEXT,
    
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Órdenes de Compra (Purchase Orders)
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace UUID NOT NULL REFERENCES public.company_profiles(id) DEFAULT (get_current_workspace()::uuid),
    
    proveedor_id UUID NOT NULL REFERENCES public.suppliers(id),
    numero_orden TEXT NOT NULL, -- Ej. OC-0001
    
    estado TEXT NOT NULL CHECK (estado IN ('BORRADOR', 'PENDIENTE_APROBACION', 'APROBADA', 'ENVIADA', 'RECIBIDA_PARCIAL', 'COMPLETADA', 'CANCELADA')),
    
    fecha_creacion DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_esperada DATE,
    
    subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0,
    impuestos NUMERIC(15, 2) NOT NULL DEFAULT 0,
    monto_total NUMERIC(15, 2) NOT NULL DEFAULT 0,
    
    notas_internas TEXT,
    terminos_condiciones TEXT,
    
    requiere_aprobacion_gerencial BOOLEAN DEFAULT false,
    aprobado_por UUID REFERENCES auth.users(id),
    
    creado_por UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Items de la Orden de Compra (Purchase Order Items)
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace UUID NOT NULL REFERENCES public.company_profiles(id) DEFAULT (get_current_workspace()::uuid),
    
    purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id), -- Opcional, puede ser un gasto genérico o material sin dar de alta
    
    descripcion TEXT NOT NULL,
    cantidad_solicitada NUMERIC(15, 2) NOT NULL,
    cantidad_recibida NUMERIC(15, 2) NOT NULL DEFAULT 0,
    precio_unitario NUMERIC(15, 2) NOT NULL,
    impuesto_porcentaje NUMERIC(5, 2) DEFAULT 0,
    total_linea NUMERIC(15, 2) NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Recepciones de Mercancía (Purchase Receptions)
CREATE TABLE IF NOT EXISTS public.purchase_receptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace UUID NOT NULL REFERENCES public.company_profiles(id) DEFAULT (get_current_workspace()::uuid),
    
    purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    
    fecha_recepcion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    recibido_por UUID REFERENCES auth.users(id),
    numero_remision TEXT,
    notas TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);


-- TRIGGERS y FUNCIONES

-- Función para actualizar timestamps
CREATE TRIGGER update_suppliers_updated_at
    BEFORE UPDATE ON public.suppliers
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_purchase_orders_updated_at
    BEFORE UPDATE ON public.purchase_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_purchase_order_items_updated_at
    BEFORE UPDATE ON public.purchase_order_items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();


-- RLS POLICIES

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_receptions ENABLE ROW LEVEL SECURITY;

-- Policies para suppliers
CREATE POLICY "Users can view their workspace suppliers"
ON public.suppliers FOR SELECT
USING (workspace = (get_current_workspace()::uuid));

CREATE POLICY "Users can insert suppliers in their workspace"
ON public.suppliers FOR INSERT
WITH CHECK (workspace = (get_current_workspace()::uuid));

CREATE POLICY "Users can update their workspace suppliers"
ON public.suppliers FOR UPDATE
USING (workspace = (get_current_workspace()::uuid));

CREATE POLICY "Users can delete their workspace suppliers"
ON public.suppliers FOR DELETE
USING (workspace = (get_current_workspace()::uuid));


-- Policies para purchase_orders
CREATE POLICY "Users can view their workspace purchase orders"
ON public.purchase_orders FOR SELECT
USING (workspace = (get_current_workspace()::uuid));

CREATE POLICY "Users can insert purchase orders in their workspace"
ON public.purchase_orders FOR INSERT
WITH CHECK (workspace = (get_current_workspace()::uuid));

CREATE POLICY "Users can update their workspace purchase orders"
ON public.purchase_orders FOR UPDATE
USING (workspace = (get_current_workspace()::uuid));

CREATE POLICY "Users can delete their workspace purchase orders"
ON public.purchase_orders FOR DELETE
USING (workspace = (get_current_workspace()::uuid));


-- Policies para purchase_order_items
CREATE POLICY "Users can view their workspace purchase order items"
ON public.purchase_order_items FOR SELECT
USING (workspace = (get_current_workspace()::uuid));

CREATE POLICY "Users can insert purchase order items in their workspace"
ON public.purchase_order_items FOR INSERT
WITH CHECK (workspace = (get_current_workspace()::uuid));

CREATE POLICY "Users can update their workspace purchase order items"
ON public.purchase_order_items FOR UPDATE
USING (workspace = (get_current_workspace()::uuid));

CREATE POLICY "Users can delete their workspace purchase order items"
ON public.purchase_order_items FOR DELETE
USING (workspace = (get_current_workspace()::uuid));


-- Policies para purchase_receptions
CREATE POLICY "Users can view their workspace purchase receptions"
ON public.purchase_receptions FOR SELECT
USING (workspace = (get_current_workspace()::uuid));

CREATE POLICY "Users can insert purchase receptions in their workspace"
ON public.purchase_receptions FOR INSERT
WITH CHECK (workspace = (get_current_workspace()::uuid));

CREATE POLICY "Users can update their workspace purchase receptions"
ON public.purchase_receptions FOR UPDATE
USING (workspace = (get_current_workspace()::uuid));

CREATE POLICY "Users can delete their workspace purchase receptions"
ON public.purchase_receptions FOR DELETE
USING (workspace = (get_current_workspace()::uuid));


-- Triggers de autollenado de workspace
CREATE TRIGGER set_workspace_suppliers
    BEFORE INSERT ON public.suppliers
    FOR EACH ROW
    EXECUTE FUNCTION public.set_workspace_on_insert();

CREATE TRIGGER set_workspace_purchase_orders
    BEFORE INSERT ON public.purchase_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.set_workspace_on_insert();

CREATE TRIGGER set_workspace_purchase_order_items
    BEFORE INSERT ON public.purchase_order_items
    FOR EACH ROW
    EXECUTE FUNCTION public.set_workspace_on_insert();

CREATE TRIGGER set_workspace_purchase_receptions
    BEFORE INSERT ON public.purchase_receptions
    FOR EACH ROW
    EXECUTE FUNCTION public.set_workspace_on_insert();
