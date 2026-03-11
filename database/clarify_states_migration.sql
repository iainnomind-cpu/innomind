-- Migration: Separate PO and AP State Logic
-- Target: Aligning with the new core ERP flow

-- 1. Purchase Orders Status Clean-up
-- Map old statuses to the new clarified ones
UPDATE public.purchase_orders SET estado = 'pending' WHERE estado IN ('BORRADOR', 'PENDIENTE_APROBACION', 'draft', 'RECIBIDA_PARCIAL');
UPDATE public.purchase_orders SET estado = 'approved' WHERE estado IN ('APROBADA', 'approved', 'COMPLETADA');
UPDATE public.purchase_orders SET estado = 'sent' WHERE estado IN ('ENVIADA', 'sent');
UPDATE public.purchase_orders SET estado = 'rejected' WHERE estado IN ('CANCELADA', 'RECHAZADA', 'cancelled', 'rejected');

-- Update the check constraint for purchase_orders
DO $$ 
BEGIN 
    ALTER TABLE public.purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_estado_check;
    ALTER TABLE public.purchase_orders ADD CONSTRAINT purchase_orders_estado_check CHECK (estado IN ('pending', 'sent', 'approved', 'rejected'));
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Constraint update failed, might already be updated or data violates it.';
END $$;

-- 2. Accounts Payable Column and Status Alignment
-- Ensure columns requested by the user exist in accounts_payable
ALTER TABLE public.accounts_payable ADD COLUMN IF NOT EXISTS estado TEXT;
ALTER TABLE public.accounts_payable ADD COLUMN IF NOT EXISTS workspace UUID REFERENCES public.company_profiles(id);
ALTER TABLE public.accounts_payable ADD COLUMN IF NOT EXISTS proveedor_id UUID REFERENCES public.suppliers(id);
ALTER TABLE public.accounts_payable ADD COLUMN IF NOT EXISTS purchase_order_id UUID REFERENCES public.purchase_orders(id);
ALTER TABLE public.accounts_payable ADD COLUMN IF NOT EXISTS numero_referencia TEXT;
ALTER TABLE public.accounts_payable ADD COLUMN IF NOT EXISTS monto NUMERIC(15, 2);

-- Initial sync of data from existing columns (assuming data exists)
UPDATE public.accounts_payable SET 
    estado = status,
    workspace = workspace_id,
    proveedor_id = supplier_id,
    monto = amount
WHERE estado IS NULL;

-- Update AP statuses to the new set: pending, paid, cancelled
UPDATE public.accounts_payable SET status = 'pending' WHERE status IN ('scheduled', 'overdue');
UPDATE public.accounts_payable SET estado = status;

-- Update the check constraint for accounts_payable.status
DO $$ 
BEGIN 
    ALTER TABLE public.accounts_payable DROP CONSTRAINT IF EXISTS accounts_payable_status_check;
    ALTER TABLE public.accounts_payable ADD CONSTRAINT accounts_payable_status_check CHECK (status IN ('pending', 'paid', 'cancelled'));
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Constraint update failed for accounts_payable.';
END $$;

-- 3. Trigger to keep 'estado' and 'status' synced (optional but helpful for migration)
CREATE OR REPLACE FUNCTION sync_ap_statuses() 
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR NEW.status <> OLD.status THEN
        NEW.estado = NEW.status;
    ELSIF NEW.estado <> OLD.estado THEN
        NEW.status = NEW.estado;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_ap_statuses ON public.accounts_payable;
CREATE TRIGGER trigger_sync_ap_statuses
    BEFORE INSERT OR UPDATE ON public.accounts_payable
    FOR EACH ROW EXECUTE FUNCTION sync_ap_statuses();
