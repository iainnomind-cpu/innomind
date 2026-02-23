-- ============================================================
-- SISTEMA DE INVITACIONES MULTI-TENANT SEGURO
-- Ejecutar en SQL Editor de Supabase
-- ============================================================

-- 1. Crear tabla de invitaciones pendientes
CREATE TABLE IF NOT EXISTS public.invitations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text NOT NULL,
    full_name text,
    role text DEFAULT 'EMPLOYEE',
    workspace text NOT NULL,
    invited_by uuid REFERENCES auth.users(id),
    status text DEFAULT 'pending', -- pending, accepted, expired
    created_at timestamptz DEFAULT now(),
    accepted_at timestamptz
);

-- Índice único: solo una invitación activa por email+workspace
CREATE UNIQUE INDEX IF NOT EXISTS invitations_email_workspace_idx 
ON public.invitations(email, workspace) WHERE status = 'pending';

-- RLS para invitations
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage their workspace invitations" ON public.invitations;
CREATE POLICY "Admins can manage their workspace invitations"
ON public.invitations FOR ALL USING (
    workspace = (SELECT workspace FROM public.users WHERE id = auth.uid())
);

-- 2. Asegurar columna 'role' existe en users
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema='public' AND table_name='users' AND column_name='role') THEN
        ALTER TABLE public.users ADD COLUMN role text DEFAULT 'EMPLOYEE';
    END IF;
END $$;

-- 3. Función para CREAR INVITACIÓN (no crea usuario directamente)
CREATE OR REPLACE FUNCTION public.invite_team_member(
    p_email text,
    p_role text,
    p_full_name text
) RETURNS json AS $$
DECLARE
    v_caller_role text;
    v_caller_workspace text;
    v_existing_user uuid;
    v_existing_invite uuid;
BEGIN
    -- A. Verificar permisos del que invita
    SELECT role, workspace INTO v_caller_role, v_caller_workspace 
    FROM public.users WHERE id = auth.uid();

    IF v_caller_role != 'ADMIN' THEN
        RAISE EXCEPTION 'Sólo los Administradores pueden invitar nuevos miembros al equipo.';
    END IF;

    IF v_caller_workspace IS NULL THEN
        RAISE EXCEPTION 'El administrador no tiene un Workspace válido asignado.';
    END IF;

    -- B. Verificar si el usuario ya existe en este workspace
    SELECT id INTO v_existing_user 
    FROM public.users WHERE email = p_email AND workspace = v_caller_workspace;

    IF v_existing_user IS NOT NULL THEN
        RETURN json_build_object('success', false, 'message', 'Este usuario ya pertenece a tu equipo.');
    END IF;

    -- C. Verificar si ya hay una invitación pendiente
    SELECT id INTO v_existing_invite 
    FROM public.invitations WHERE email = p_email AND workspace = v_caller_workspace AND status = 'pending';

    IF v_existing_invite IS NOT NULL THEN
        RETURN json_build_object('success', false, 'message', 'Ya existe una invitación pendiente para este correo.');
    END IF;

    -- D. Crear la invitación
    INSERT INTO public.invitations (email, full_name, role, workspace, invited_by)
    VALUES (p_email, p_full_name, p_role, v_caller_workspace, auth.uid());

    RETURN json_build_object(
        'success', true, 
        'message', 'Invitación creada exitosamente. El usuario será añadido al registrarse con este correo.'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Función que se ejecuta cuando un NUEVO usuario se registra en Auth
--    Revisa si tiene una invitación pendiente y lo asigna al workspace correcto
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS trigger AS $$
DECLARE
    v_invite record;
BEGIN
    -- Buscar invitación pendiente para este email
    SELECT * INTO v_invite 
    FROM public.invitations 
    WHERE email = NEW.email AND status = 'pending'
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_invite IS NOT NULL THEN
        -- USUARIO INVITADO: asignar al workspace del admin que lo invitó
        INSERT INTO public.users (id, email, full_name, workspace, role, created_at)
        VALUES (NEW.id, NEW.email, COALESCE(v_invite.full_name, split_part(NEW.email, '@', 1)), v_invite.workspace, v_invite.role, now())
        ON CONFLICT (id) DO UPDATE SET
            workspace = v_invite.workspace,
            role = v_invite.role,
            full_name = COALESCE(v_invite.full_name, public.users.full_name);

        -- Marcar invitación como aceptada
        UPDATE public.invitations 
        SET status = 'accepted', accepted_at = now() 
        WHERE id = v_invite.id;
    END IF;
    -- Si NO tiene invitación, el flujo normal de register_new_tenant se encarga

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Crear trigger en auth.users para detectar nuevos registros
DROP TRIGGER IF EXISTS on_auth_user_created_check_invite ON auth.users;
CREATE TRIGGER on_auth_user_created_check_invite
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();
