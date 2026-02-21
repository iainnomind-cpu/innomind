-- ==========================================
-- Innomind SaaS - Product Master & Inventory 
-- ==========================================

-- 1. Actualización a public.products (Product Master)
-- Agregamos los nuevos campos requeridos para el ERP
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS costo_promedio numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS unidad_medida text DEFAULT 'pieza',
ADD COLUMN IF NOT EXISTS stock_minimo integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS track_inventory boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS es_paquete_servicios boolean DEFAULT false;

-- 2. Nueva Tabla: inventory_locations (Almacenes / Sucursales)
CREATE TABLE IF NOT EXISTS public.inventory_locations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace text NOT NULL,
  nombre text NOT NULL,
  direccion text,
  tipo text DEFAULT 'Principal', -- Principal, Sucursal, Tránsito
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS para Almacenes
ALTER TABLE public.inventory_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace isolation for locations" 
ON public.inventory_locations FOR ALL 
USING (workspace = get_current_workspace());

CREATE TRIGGER set_locations_workspace
BEFORE INSERT ON public.inventory_locations
FOR EACH ROW EXECUTE FUNCTION set_workspace_on_insert();


-- 3. Nueva Tabla: inventory_movements (Kardex PEPS referencial / Control de Entradas y Salidas)
CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace text NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  location_id uuid REFERENCES public.inventory_locations(id) ON DELETE CASCADE,
  tipo_movimiento text NOT NULL, -- 'ENTRADA_COMPRA', 'SALIDA_VENTA', 'AJUSTE_POSITIVO', 'AJUSTE_NEGATIVO', 'TRANSFERENCIA'
  cantidad numeric NOT NULL, -- SIEMPRE POSITIVO EN LA DB, el tipo define si suma o resta
  costo_unitario numeric NOT NULL DEFAULT 0,
  notas text,
  reference_id text, -- ID de Orden de Compra o Cotización vinculada
  user_id uuid REFERENCES auth.users(id), -- Quien hizo el movimiento
  fecha_movimiento timestamptz DEFAULT now()
);

-- Habilitar RLS para Kardex
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace isolation for movements" 
ON public.inventory_movements FOR ALL 
USING (workspace = get_current_workspace());

CREATE TRIGGER set_movements_workspace
BEFORE INSERT ON public.inventory_movements
FOR EACH ROW EXECUTE FUNCTION set_workspace_on_insert();

-- Insertar un Almacén Principal por defecto para los usuarios actuales si es posible (Opcional, se puede hacer desde UI)
