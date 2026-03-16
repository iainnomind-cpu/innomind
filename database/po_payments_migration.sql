-- Migration: Allow Accounts Payable Payments to link directly to Purchase Orders
-- This allows Purchase Orders to be paid directly without creating an intermediate "Accounts Payable" (which is meant for expenses/reimbursements).

-- 1. Make the existing account_payable_id column optional
ALTER TABLE public.accounts_payable_payments
ALTER COLUMN account_payable_id DROP NOT NULL;

-- 2. Add the new purchase_order_id column linked to purchase_orders
ALTER TABLE public.accounts_payable_payments
ADD COLUMN purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE CASCADE;

-- 3. Create an index for faster lookups on the new column
CREATE INDEX IF NOT EXISTS idx_accounts_payable_payments_po ON public.accounts_payable_payments(purchase_order_id);

-- 4. Add a check constraint to ensure that a payment is linked either to an expense OR a purchase order, but not neither.
ALTER TABLE public.accounts_payable_payments
ADD CONSTRAINT ap_payments_link_check
CHECK (
  (account_payable_id IS NOT NULL AND purchase_order_id IS NULL) OR 
  (account_payable_id IS NULL AND purchase_order_id IS NOT NULL)
);
