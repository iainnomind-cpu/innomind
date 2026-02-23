-- ============================================================
-- ARREGLO RLS PARA MEMBERSHIP DE EQUIPO EN PUBLIC.USERS
-- ============================================================

-- 1. Función Security Definer para obtener el workspace del usuario actual
-- Esto evita la recursión infinita al evaluar políticas RLS en la misma tabla
CREATE OR REPLACE FUNCTION public.get_my_workspace()
RETURNS text AS $$
DECLARE
    v_workspace text;
BEGIN
    SELECT workspace INTO v_workspace FROM public.users WHERE id = auth.uid();
    RETURN v_workspace;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Eliminar política vieja si existe para prevenir duplicados
DROP POLICY IF EXISTS "Users can view members of their own workspace" ON public.users;

-- 3. Crear política para que usuarios del mismo workspace se puedan ver
CREATE POLICY "Users can view members of their own workspace"
ON public.users FOR SELECT
USING (
    workspace = public.get_my_workspace() OR id = auth.uid()
);
