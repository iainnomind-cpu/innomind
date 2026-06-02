-- =======================================================================
-- MIGRACIÓN DE CORRECCIÓN: Agregar updated_at a products e inventory_locations
-- =======================================================================

-- 1. Agregar columna 'updated_at' a la tabla products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 2. Crear trigger para actualizar 'updated_at' automáticamente en products
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 3. Agregar columna 'updated_at' a la tabla inventory_locations
ALTER TABLE public.inventory_locations 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 4. Crear trigger para actualizar 'updated_at' automáticamente en inventory_locations
DROP TRIGGER IF EXISTS update_inventory_locations_updated_at ON public.inventory_locations;
CREATE TRIGGER update_inventory_locations_updated_at
    BEFORE UPDATE ON public.inventory_locations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 5. Forzar la recarga del esquema en PostgREST
NOTIFY pgrst, 'reload schema';
