-- SQL MIGRATION: Cash Intelligence Database Upgrade (Enterprise Hardened)
-- Ejecutar en Supabase SQL Editor para preparar la base de datos

-- 1. Agregar columnas normalizadas a public.finance_accounts
ALTER TABLE public.finance_accounts 
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS account_alias TEXT,
ADD COLUMN IF NOT EXISTS last_four_digits TEXT,
ADD COLUMN IF NOT EXISTS account_subtype TEXT;

-- 2. Mejorar public.treasury_movements con columnas de trazabilidad y auditoría
ALTER TABLE public.treasury_movements 
ADD COLUMN IF NOT EXISTS direction TEXT CHECK (direction IN ('in', 'out', 'none')),
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS source_module TEXT CHECK (source_module IN ('accounts_receivable', 'accounts_payable', 'expenses', 'treasury', 'payroll')),
ADD COLUMN IF NOT EXISTS balance_after NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- 3. Crear índices de rendimiento para agregaciones rápidas de flujo de caja
CREATE INDEX IF NOT EXISTS idx_finance_accounts_workspace ON public.finance_accounts(workspace);
CREATE INDEX IF NOT EXISTS idx_accounts_payable_workspace_due ON public.accounts_payable(workspace_id, due_date, status);
CREATE INDEX IF NOT EXISTS idx_charge_notes_workspace_due ON public.charge_notes(workspace_id, due_date, status);
CREATE INDEX IF NOT EXISTS idx_finance_payments_workspace ON public.finance_payments(workspace);
CREATE INDEX IF NOT EXISTS idx_treasury_movements_account_date ON public.treasury_movements(account_id, created_at);

-- 4. Función Transaccional (ACID): create_treasury_movement
-- Registra ajustes, depósitos o retiros bloqueando el registro de la cuenta para evitar race conditions
CREATE OR REPLACE FUNCTION public.create_treasury_movement(
    p_workspace_id UUID,
    p_account_id UUID,
    p_movement_type TEXT,
    p_amount NUMERIC,
    p_description TEXT,
    p_direction TEXT,
    p_category TEXT,
    p_source_module TEXT,
    p_reference_id UUID,
    p_user_id UUID
) RETURNS NUMERIC AS $$
DECLARE
    v_current_balance NUMERIC;
    v_new_balance NUMERIC;
    v_delta NUMERIC;
BEGIN
    -- 1. Bloquear la cuenta para prevenir modificaciones concurrentes
    SELECT saldo_actual INTO v_current_balance
    FROM public.finance_accounts
    WHERE id = p_account_id AND workspace = p_workspace_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Cuenta no encontrada o sin acceso en este workspace';
    END IF;

    -- 2. Determinar la dirección del delta
    IF p_direction = 'in' THEN
        v_delta := p_amount;
    ELSIF p_direction = 'out' THEN
        v_delta := -p_amount;
    ELSE
        v_delta := p_amount; -- El ajuste manual pasa el delta neto directamente
    END IF;

    v_new_balance := v_current_balance + v_delta;

    -- Validación de seguridad: no permitir balances negativos imposibles si es caja chica o banco
    IF v_new_balance < 0 AND p_movement_type != 'adjustment' THEN
        RAISE EXCEPTION 'Operación rechazada: Fondos insuficientes para realizar este movimiento';
    END IF;

    -- 3. Actualizar el saldo actual de la cuenta
    UPDATE public.finance_accounts
    SET saldo_actual = v_new_balance,
        updated_at = now()
    WHERE id = p_account_id AND workspace = p_workspace_id;

    -- 4. Insertar el log de movimiento de tesorería para auditoría inmutable
    INSERT INTO public.treasury_movements (
        workspace_id,
        account_id,
        movement_type,
        amount,
        description,
        reference_id,
        direction,
        category,
        source_module,
        balance_after,
        created_by,
        created_at
    ) VALUES (
        p_workspace_id,
        p_account_id,
        p_movement_type,
        p_amount,
        p_description,
        p_reference_id,
        p_direction,
        p_category,
        p_source_module,
        v_new_balance,
        p_user_id,
        now()
    );

    RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Función Transaccional (ACID): transfer_between_accounts_v2
-- Realiza transferencias atómicas previniendo deadlocks bloqueando cuentas de forma ordenada
CREATE OR REPLACE FUNCTION public.transfer_between_accounts_v2(
    p_workspace_id UUID,
    p_source_id UUID,
    p_target_id UUID,
    p_amount NUMERIC,
    p_description TEXT,
    p_user_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_source_balance NUMERIC;
    v_target_balance NUMERIC;
    v_new_source_balance NUMERIC;
    v_new_target_balance NUMERIC;
BEGIN
    -- 1. Evitar transferencias a la misma cuenta
    IF p_source_id = p_target_id THEN
        RAISE EXCEPTION 'La cuenta origen y destino no pueden ser iguales';
    END IF;

    -- 2. Bloquear ambas cuentas en orden determinista por ID para evitar deadlocks
    IF p_source_id < p_target_id THEN
        SELECT saldo_actual INTO v_source_balance FROM public.finance_accounts WHERE id = p_source_id AND workspace = p_workspace_id FOR UPDATE;
        SELECT saldo_actual INTO v_target_balance FROM public.finance_accounts WHERE id = p_target_id AND workspace = p_workspace_id FOR UPDATE;
    ELSE
        SELECT saldo_actual INTO v_target_balance FROM public.finance_accounts WHERE id = p_target_id AND workspace = p_workspace_id FOR UPDATE;
        SELECT saldo_actual INTO v_source_balance FROM public.finance_accounts WHERE id = p_source_id AND workspace = p_workspace_id FOR UPDATE;
    END IF;

    IF v_source_balance IS NULL OR v_target_balance IS NULL THEN
        RAISE EXCEPTION 'Una de las cuentas no existe o pertenece a otro workspace';
    END IF;

    -- Validación de fondos
    IF v_source_balance < p_amount THEN
        RAISE EXCEPTION 'Saldo insuficiente en la cuenta de origen para completar la transferencia';
    END IF;

    v_new_source_balance := v_source_balance - p_amount;
    v_new_target_balance := v_target_balance + p_amount;

    -- 3. Actualizar saldos
    UPDATE public.finance_accounts SET saldo_actual = v_new_source_balance, updated_at = now() WHERE id = p_source_id AND workspace = p_workspace_id;
    UPDATE public.finance_accounts SET saldo_actual = v_new_target_balance, updated_at = now() WHERE id = p_target_id AND workspace = p_workspace_id;

    -- 4. Registrar movimiento de salida
    INSERT INTO public.treasury_movements (
        workspace_id, account_id, movement_type, amount, description,
        direction, category, source_module, balance_after, created_by, created_at
    ) VALUES (
        p_workspace_id, p_source_id, 'transfer_out', p_amount, p_description,
        'out', 'transfer', 'treasury', v_new_source_balance, p_user_id, now()
    );

    -- 5. Registrar movimiento de entrada
    INSERT INTO public.treasury_movements (
        workspace_id, account_id, movement_type, amount, description,
        direction, category, source_module, balance_after, created_by, created_at
    ) VALUES (
        p_workspace_id, p_target_id, 'transfer_in', p_amount, p_description,
        'in', 'transfer', 'treasury', v_new_target_balance, p_user_id, now()
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Recargar el caché de esquema de PostgREST
NOTIFY pgrst, 'reload schema';
