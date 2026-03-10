-- DEFINITIVE MIGRATION (FIXED): Procurement & Accounts Payable
-- This version corrects the "workspace_id" vs "workspace" column mismatch.

-- 1. Accounts Payable (Cuentas por Pagar)
-- We use workspace_id here to match newer Finance standards
CREATE TABLE IF NOT EXISTS public.accounts_payable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.company_profiles(id),
    supplier_id UUID REFERENCES public.suppliers(id),
    
    concept TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    balance_due NUMERIC(15, 2) NOT NULL DEFAULT 0,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    
    status TEXT NOT NULL CHECK (status IN ('pending', 'scheduled', 'paid', 'overdue')),
    payment_method TEXT,
    payment_reference TEXT,
    notes TEXT,
    
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    paid_at TIMESTAMP WITH TIME ZONE
);

-- 2. Accounts Payable Payments (Pagos Realizados)
CREATE TABLE IF NOT EXISTS public.accounts_payable_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.company_profiles(id),
    account_payable_id UUID NOT NULL REFERENCES public.accounts_payable(id) ON DELETE CASCADE,
    
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    payment_method TEXT NOT NULL,
    reference_number TEXT,
    evidence_file_url TEXT,
    notes TEXT,
    
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Warehouse Receipts (Recepciones de Almacén)
CREATE TABLE IF NOT EXISTS public.warehouse_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE SET NULL,
    workspace_id UUID NOT NULL REFERENCES public.company_profiles(id),
    supplier_id UUID REFERENCES public.suppliers(id),
    
    receipt_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    received_by UUID REFERENCES auth.users(id),
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Warehouse Receipt Items (Items Recibidos)
CREATE TABLE IF NOT EXISTS public.warehouse_receipt_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_id UUID NOT NULL REFERENCES public.warehouse_receipts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    quantity_received NUMERIC(15, 2) NOT NULL DEFAULT 0
);

-- 5. Purchase Approvals (Aprobaciones de OC)
CREATE TABLE IF NOT EXISTS public.purchase_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    approved_by UUID NOT NULL REFERENCES auth.users(id),
    status TEXT NOT NULL, -- Approved, Rejected
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS
ALTER TABLE public.accounts_payable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_payable_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_approvals ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Workspace Context)
-- Note: existing purchase_orders uses "workspace" column
CREATE POLICY "RLS on accounts_payable" ON public.accounts_payable FOR ALL USING (workspace_id = get_current_workspace()::uuid);
CREATE POLICY "RLS on accounts_payable_payments" ON public.accounts_payable_payments FOR ALL USING (workspace_id = get_current_workspace()::uuid);
CREATE POLICY "RLS on warehouse_receipts" ON public.warehouse_receipts FOR ALL USING (workspace_id = get_current_workspace()::uuid);

CREATE POLICY "RLS on warehouse_receipt_items" ON public.warehouse_receipt_items FOR ALL 
USING (EXISTS (SELECT 1 FROM public.warehouse_receipts WHERE id = receipt_id AND workspace_id = get_current_workspace()::uuid));

-- FIXED: Fixed reference to purchase_orders.workspace
CREATE POLICY "RLS on purchase_approvals" ON public.purchase_approvals FOR ALL 
USING (EXISTS (SELECT 1 FROM public.purchase_orders WHERE id = purchase_order_id AND workspace = get_current_workspace()::uuid));

-- Clean Up Schema Cache
NOTIFY pgrst, 'reload schema';
