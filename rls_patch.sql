-- Este parche asegura que los usuarios que iniciaron sesión ANTES de crear
-- la tabla `users` (y por ende, no tienen un 'workspace' registrado)
-- no se queden bloqueados por el sistema de seguridad (RLS).
-- Al no encontrar su workspace, usará 'Innomind' por defecto.

CREATE OR REPLACE FUNCTION get_current_workspace()
RETURNS text AS $$
  SELECT COALESCE(
    (SELECT workspace FROM public.users WHERE id = auth.uid()),
    (SELECT id::text FROM public.company_profiles LIMIT 1)
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;
