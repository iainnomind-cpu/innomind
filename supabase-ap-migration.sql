
-- Migration: Add Accounts Payable tables

-- 1. Table: accounts_payable
CREATE TABLE IF NOT EXISTS public.accounts_payable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL,
    supplier_id UUID,
    concept TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    balance_due NUMERIC(15, 2) NOT NULL DEFAULT 0,
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'paid', 'overdue')),
    payment_method TEXT,
    payment_reference TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID,
    paid_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT fk_accounts_payable_workspace FOREIGN KEY (workspace_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_accounts_payable_supplier FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE SET NULL
);

-- Index for workspace performance
CREATE INDEX IF NOT EXISTS idx_accounts_payable_workspace ON public.accounts_payable(workspace_id);
CREATE INDEX IF NOT EXISTS idx_accounts_payable_supplier ON public.accounts_payable(supplier_id);

-- RLS for accounts_payable
ALTER TABLE public.accounts_payable ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view accounts_payable from their workspace"
    ON public.accounts_payable FOR SELECT
    USING (workspace_id = (SELECT workspace_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert accounts_payable into their workspace"
    ON public.accounts_payable FOR INSERT
    WITH CHECK (workspace_id = (SELECT workspace_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update accounts_payable from their workspace"
    ON public.accounts_payable FOR UPDATE
    USING (workspace_id = (SELECT workspace_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can delete accounts_payable from their workspace"
    ON public.accounts_payable FOR DELETE
    USING (workspace_id = (SELECT workspace_id FROM users WHERE id = auth.uid()));


-- 2. Table: accounts_payable_payments
CREATE TABLE IF NOT EXISTS public.accounts_payable_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_payable_id UUID NOT NULL,
    workspace_id UUID NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    payment_method TEXT NOT NULL,
    reference_number TEXT,
    evidence_file_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID,
    
    CONSTRAINT fk_accounts_payable_payments_item FOREIGN KEY (account_payable_id) REFERENCES public.accounts_payable(id) ON DELETE CASCADE,
    CONSTRAINT fk_accounts_payable_payments_workspace FOREIGN KEY (workspace_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);

-- Index for payment lookups
CREATE INDEX IF NOT EXISTS idx_accounts_payable_payments_item ON public.accounts_payable_payments(account_payable_id);
CREATE INDEX IF NOT EXISTS idx_accounts_payable_payments_workspace ON public.accounts_payable_payments(workspace_id);

-- RLS for accounts_payable_payments
ALTER TABLE public.accounts_payable_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view accounts_payable_payments from their workspace"
    ON public.accounts_payable_payments FOR SELECT
    USING (workspace_id = (SELECT workspace_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert accounts_payable_payments into their workspace"
    ON public.accounts_payable_payments FOR INSERT
    WITH CHECK (workspace_id = (SELECT workspace_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update accounts_payable_payments from their workspace"
    ON public.accounts_payable_payments FOR UPDATE
    USING (workspace_id = (SELECT workspace_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can delete accounts_payable_payments from their workspace"
    ON public.accounts_payable_payments FOR DELETE
    USING (workspace_id = (SELECT workspace_id FROM users WHERE id = auth.uid()));

-- Add trigger for automatic workspace assignment and balance updates would be ideal, 
-- but we will handle it in the application logic/RPC as per existing patterns.
