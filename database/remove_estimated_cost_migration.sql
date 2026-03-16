-- Migration to safely remove estimated_cost from purchase_requests

ALTER TABLE purchase_requests DROP COLUMN IF EXISTS estimated_cost;

-- Notify success
DO $$
BEGIN
  RAISE NOTICE 'Successfully removed estimated_cost from purchase_requests table';
END $$;
