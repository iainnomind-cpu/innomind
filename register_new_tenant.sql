-- Función SECURITY DEFINER para bypass de RLS durante el Onboarding
CREATE OR REPLACE FUNCTION public.register_new_tenant(
  p_user_id uuid,
  p_email text,
  p_full_name text,
  p_company_name text,
  p_workspace_name text,
  p_phone text,
  p_company_size text,
  p_enabled_modules text[] DEFAULT '{}'
) RETURNS text AS $$
DECLARE
  v_workspace_id uuid;
BEGIN
  -- 1. Generar nuevo UUID para la empresa
  v_workspace_id := gen_random_uuid();

  -- 2. Insertar Company Profile (Ignora RLS porque es SECURITY DEFINER)
  INSERT INTO public.company_profiles (
    id,
    workspace,
    nombre_empresa,
    email,
    telefono,
    enabled_modules
  ) VALUES (
    v_workspace_id,
    p_workspace_name,
    p_company_name,
    p_email,
    p_phone,
    p_enabled_modules
  );

  -- 3. Upsert en public.users
  INSERT INTO public.users (
    id,
    email,
    workspace,
    role,
    last_sign_in_at
  ) VALUES (
    p_user_id,
    p_email,
    v_workspace_id::text,
    'ADMIN',
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    workspace = EXCLUDED.workspace,
    role = EXCLUDED.role,
    last_sign_in_at = EXCLUDED.last_sign_in_at;

  -- Retornar el nuevo ID del Workspace en texto para confirmación
  RETURN v_workspace_id::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
