-- Ejecutar en el Editor SQL de Supabase

-- 1. CORREGIR AL USUARIO ACTUAL (ia.innomind@gmail.com)
-- Esto lo asignará al workspace del administrador (cuentaparbolt@gmail.com)
UPDATE public.users 
SET 
    workspace = (SELECT workspace FROM public.users WHERE email = 'cuentaparbolt@gmail.com' LIMIT 1),
    role = 'EMPLOYEE'
WHERE email = 'ia.innomind@gmail.com';

-- 2. MEJORAR EL TRIGGER PARA EL FUTURO (Insensible a mayúsculas/minúsculas)
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS trigger AS $$
DECLARE
    v_invite record;
BEGIN
    -- Buscar invitación pendiente ignorando mayúsculas/minúsculas
    SELECT * INTO v_invite 
    FROM public.invitations 
    WHERE lower(email) = lower(NEW.email) AND status = 'pending'
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_invite IS NOT NULL THEN
        -- USUARIO INVITADO: asignar al workspace del admin que lo invitó
        INSERT INTO public.users (id, email, full_name, workspace, role, created_at)
        VALUES (NEW.id, NEW.email, COALESCE(v_invite.full_name, split_part(NEW.email, '@', 1)), v_invite.workspace, v_invite.role, now())
        ON CONFLICT (id) DO UPDATE SET
            workspace = EXCLUDED.workspace,
            role = EXCLUDED.role,
            full_name = EXCLUDED.full_name;

        -- Marcar invitación como aceptada
        UPDATE public.invitations 
        SET status = 'accepted', accepted_at = now() 
        WHERE id = v_invite.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
