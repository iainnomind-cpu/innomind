-- =======================================================================
-- MIGRACIÓN DE CORRECCIÓN: Transición de Datos, FK y RLS en quote_templates
-- =======================================================================

-- Paso 1: Eliminar la restricción de llave foránea incorrecta actual
ALTER TABLE public.quote_templates 
DROP CONSTRAINT IF EXISTS quote_templates_workspace_id_fkey;

-- Paso 2: Mapear y corregir los datos preexistentes en quote_templates
-- Transfiere el UUID de chat al UUID de la empresa correspondiente (join con workspace_spaces)
UPDATE public.quote_templates qt
SET workspace_id = ws.workspace
FROM public.workspace_spaces ws
WHERE qt.workspace_id = ws.id;

-- Paso 3: Limpiar registros huérfanos que no posean una empresa válida en company_profiles
-- Esto garantiza que la creación de la llave foránea no falle bajo ninguna circunstancia
DELETE FROM public.quote_templates
WHERE workspace_id NOT IN (SELECT id FROM public.company_profiles);

-- Paso 4: Crear la restricción de llave foránea correcta apuntando a public.company_profiles(id)
ALTER TABLE public.quote_templates
ADD CONSTRAINT quote_templates_workspace_id_fkey 
FOREIGN KEY (workspace_id) 
REFERENCES public.company_profiles(id) 
ON DELETE CASCADE;

-- Paso 5: Asegurar la definición de la función trigger set_workspace_on_insert polimórfica
CREATE OR REPLACE FUNCTION public.set_workspace_on_insert()
RETURNS TRIGGER AS $$
DECLARE
    v_current_ws text;
BEGIN
    v_current_ws := public.get_current_workspace();

    -- Si la tabla destino contiene la columna 'workspace', asignar el valor
    IF to_jsonb(NEW) ? 'workspace' THEN
        NEW.workspace := v_current_ws;
    END IF;

    -- Si la tabla destino contiene la columna 'workspace_id', asignar el UUID convertido
    IF to_jsonb(NEW) ? 'workspace_id' THEN
        NEW.workspace_id := v_current_ws::uuid;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 6: Habilitar Row Level Security (RLS) en la tabla
ALTER TABLE public.quote_templates ENABLE ROW LEVEL SECURITY;

-- Paso 7: Eliminar políticas obsoletas o conflictivas para evitar duplicaciones
DROP POLICY IF EXISTS "Users can view workspace quote templates" ON public.quote_templates;
DROP POLICY IF EXISTS "Users can insert workspace quote templates" ON public.quote_templates;
DROP POLICY IF EXISTS "Users can update workspace quote templates" ON public.quote_templates;
DROP POLICY IF EXISTS "Users can delete workspace quote templates" ON public.quote_templates;
DROP POLICY IF EXISTS "Admins/Employees can manage quote templates" ON public.quote_templates;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.quote_templates;

-- Paso 8: Crear políticas robustas y aisladas por tenant/workspace
-- SELECT
CREATE POLICY "Users can view workspace quote templates"
ON public.quote_templates FOR SELECT
USING (workspace_id = get_current_workspace()::uuid);

-- INSERT
CREATE POLICY "Users can insert workspace quote templates"
ON public.quote_templates FOR INSERT
WITH CHECK (workspace_id = get_current_workspace()::uuid);

-- UPDATE
CREATE POLICY "Users can update workspace quote templates"
ON public.quote_templates FOR UPDATE
USING (workspace_id = get_current_workspace()::uuid);

-- DELETE
CREATE POLICY "Users can delete workspace quote templates"
ON public.quote_templates FOR DELETE
USING (workspace_id = get_current_workspace()::uuid);

-- Paso 9: Vincular el trigger para automatizar el autocompletado en el backend
DROP TRIGGER IF EXISTS set_quote_templates_workspace ON public.quote_templates;

CREATE TRIGGER set_quote_templates_workspace
    BEFORE INSERT ON public.quote_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.set_workspace_on_insert();

-- Paso 10: Forzar recarga de PostgREST
NOTIFY pgrst, 'reload schema';
