-- =======================================================================
-- MIGRACIÓN DE CORRECCIÓN: Agregar updated_at a quotes y prospects
-- =======================================================================

-- 1. Agregar columna 'updated_at' a la tabla quotes
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 2. Crear trigger para actualizar 'updated_at' automáticamente en quotes
DROP TRIGGER IF EXISTS update_quotes_updated_at ON public.quotes;
CREATE TRIGGER update_quotes_updated_at
    BEFORE UPDATE ON public.quotes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 3. Agregar columna 'updated_at' a la tabla prospects (para evitar futuros fallos similares en CRM)
ALTER TABLE public.prospects 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 4. Crear trigger para actualizar 'updated_at' automáticamente en prospects
DROP TRIGGER IF EXISTS update_prospects_updated_at ON public.prospects;
CREATE TRIGGER update_prospects_updated_at
    BEFORE UPDATE ON public.prospects
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 5. Forzar la recarga del esquema en PostgREST
NOTIFY pgrst, 'reload schema';
