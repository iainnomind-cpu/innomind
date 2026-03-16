-- Migration to rename 'sent' state to 'pending_review' in purchase_orders

DO $$ 
BEGIN 
    -- 1. Update existing records
    UPDATE public.purchase_orders SET estado = 'pending_review' WHERE estado = 'sent';

    -- 2. Drop the old constraint
    ALTER TABLE public.purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_estado_check;

    -- 3. Add the new constraint
    ALTER TABLE public.purchase_orders ADD CONSTRAINT purchase_orders_estado_check CHECK (estado IN ('pending', 'pending_review', 'approved', 'rejected'));

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Failed to update constraint or state for purchase_orders.';
END $$;
