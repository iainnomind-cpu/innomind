-- Remove precio_real from purchase_orders

ALTER TABLE purchase_orders DROP COLUMN IF EXISTS precio_real;

DO $$
BEGIN
  RAISE NOTICE 'Successfully removed precio_real from purchase_orders table';
END $$;
