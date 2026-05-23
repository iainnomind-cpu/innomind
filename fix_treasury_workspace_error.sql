-- =======================================================================
-- MIGRACIÓN DE CORRECCIÓN: Trigger set_workspace_on_insert polimórfico
-- Corrige el error en tablas con la columna 'workspace_id' como treasury_movements
-- =======================================================================

CREATE OR REPLACE FUNCTION public.set_workspace_on_insert()
RETURNS TRIGGER AS $$
DECLARE
    v_current_ws text;
BEGIN
    -- Obtener el workspace actual del usuario logueado (retorna el UUID como string)
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

-- Forzar la recarga del esquema en PostgREST
NOTIFY pgrst, 'reload schema';
