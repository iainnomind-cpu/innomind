-- =======================================================================
-- FIX COMPLETO: get_current_workspace() retorna NULL
-- Ejecutar paso a paso en Supabase SQL Editor
-- =======================================================================

-- PASO 1: Verificar el usuario actual y su workspace
SELECT 
    u.id,
    u.email,
    u.workspace,
    auth.uid() as auth_uid
FROM public.users u
WHERE u.id = auth.uid();

-- PASO 2: Ver TODOS los usuarios registrados en public.users
SELECT id, email, workspace, created_at 
FROM public.users 
ORDER BY created_at DESC;

-- PASO 3: Ver los company_profiles disponibles
SELECT id, workspace, nombre_empresa 
FROM public.company_profiles;

-- PASO 4: Ver los auth.users registrados (para cruzar IDs)
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- -----------------------------------------------------------------------
-- DIAGNÓSTICO: Si PASO 1 devuelve NULL en workspace o sin filas:
-- Significa que el campo workspace de public.users no está asignado
-- -----------------------------------------------------------------------

-- PASO 5: Si el usuario SÍ existe en public.users pero workspace = NULL:
-- Actualiza el workspace del usuario con el slug del company_profile correcto.
-- Primero mira el company_profile para obtener el valor correcto:
-- (Verifica en PASO 3 cuál es el 'workspace' del company_profile de tu empresa)

-- EJEMPLO: Reemplaza 'TU_WORKSPACE_SLUG' con el valor de la columna 'workspace' de company_profiles
/*
UPDATE public.users
SET workspace = 'TU_WORKSPACE_SLUG'   -- valor de la columna 'workspace' de company_profiles
WHERE id = auth.uid();
*/

-- PASO 6: Si el usuario NO existe en public.users (no aparece en PASO 2):
-- Inserta el registro manualmente. Primero toma el email y workspace del company_profile.
/*
INSERT INTO public.users (id, email, workspace)
SELECT 
    auth.uid(),
    (SELECT email FROM auth.users WHERE id = auth.uid()),
    (SELECT workspace FROM public.company_profiles LIMIT 1)
ON CONFLICT (id) DO UPDATE 
SET workspace = EXCLUDED.workspace;
*/

-- PASO 7: Verificar que ya funciona después del fix
SELECT get_current_workspace();

-- PASO 8: Verificar que las cuentas ahora son visibles
SELECT id, nombre, workspace, saldo_actual 
FROM public.finance_accounts 
LIMIT 10;
