-- MIGRATION: Expenses & Automatic Refunds
-- Execute this in your Supabase SQL Editor.

-- 1. Enhance accounts_payable with flexibility for employees
ALTER TABLE public.accounts_payable ADD COLUMN IF NOT EXISTS supplier_type TEXT DEFAULT 'supplier' CHECK (supplier_type IN ('supplier', 'employee'));
ALTER TABLE public.accounts_payable ADD COLUMN IF NOT EXISTS reference_id UUID; -- Link to the source expense or PO

-- 2. Create Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.company_profiles(id),
    employee_id UUID NOT NULL REFERENCES auth.users(id),
    
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    category TEXT,
    description TEXT,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    paid_by TEXT NOT NULL CHECK (paid_by IN ('employee', 'company')),
    status TEXT NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved', 'rejected', 'paid')),
    
    evidence_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS for expenses
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "RLS on expenses" ON public.expenses FOR ALL 
USING (workspace_id = get_current_workspace()::uuid);

-- 3. Trigger Function: Generate Account Payable for Employee Refund
CREATE OR REPLACE FUNCTION public.handle_expense_approval_refund()
RETURNS TRIGGER AS $$
BEGIN
    -- Only proceed if status changed to 'approved' and it was paid by employee
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') AND NEW.paid_by = 'employee' THEN
        
        -- Check if a payable already exists for this expense (avoid duplicates)
        IF EXISTS (SELECT 1 FROM public.accounts_payable WHERE reference_id = NEW.id) THEN
            RETURN NEW;
        END IF;

        -- Insert into accounts_payable
        INSERT INTO public.accounts_payable (
            workspace_id,
            supplier_type,
            supplier_id, -- Note: we might need a separate column for employee_id or reuse if no FK constraint blocks it. 
                         -- Assuming supplier_id can handle the UUID or we just use reference_id for tracking.
            concept,
            amount,
            balance_due,
            due_date,
            status,
            notes,
            reference_id
        ) VALUES (
            NEW.workspace_id,
            'employee',
            NULL, -- We don't link to suppliers table for employees
            'Reembolso de gasto: ' || COALESCE(NEW.description, NEW.category),
            NEW.amount,
            NEW.amount,
            NEW.expense_date,
            'pending',
            'Generado automáticamente desde Gastos ID: ' || NEW.id,
            NEW.id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Trigger
DROP TRIGGER IF EXISTS trigger_expense_refund ON public.expenses;
CREATE TRIGGER trigger_expense_refund
    AFTER UPDATE ON public.expenses
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_expense_approval_refund();

-- Update updated_at trigger
CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON public.expenses
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Clean Up Schema Cache
NOTIFY pgrst, 'reload schema';
