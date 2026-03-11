-- MIGRATION: Consolidated Expense Automation Fix
-- This script fixes the automation that generates Accounts Payable for approved expenses.

-- 1. Ensure accounts_payable has the necessary flexible columns
ALTER TABLE public.accounts_payable ADD COLUMN IF NOT EXISTS supplier_type TEXT DEFAULT 'supplier' CHECK (supplier_type IN ('supplier', 'employee'));
ALTER TABLE public.accounts_payable ADD COLUMN IF NOT EXISTS reference_id UUID; -- Link to source expense
ALTER TABLE public.accounts_payable ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES auth.users(id); -- Direct link to employee for refunds

-- 2. Ensure supplier_id is optional (it should be, but let's confirm no NOT NULL constraint exists)
ALTER TABLE public.accounts_payable ALTER COLUMN supplier_id DROP NOT NULL;

-- 3. Fix/Create robust Trigger Function
CREATE OR REPLACE FUNCTION public.handle_expense_approval_refund()
RETURNS TRIGGER AS $$
BEGIN
    -- Only proceed if status changed to 'approved' and it was paid by employee
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') AND NEW.paid_by = 'employee' THEN
        
        -- Prevent duplicates: Check if a payable already exists for this expense
        IF EXISTS (SELECT 1 FROM public.accounts_payable WHERE reference_id = NEW.id) THEN
            RETURN NEW;
        END IF;

        -- Insert into accounts_payable
        INSERT INTO public.accounts_payable (
            workspace_id,
            supplier_type,
            supplier_id,    -- Keep NULL for employees to avoid FK violation with suppliers table
            employee_id,    -- Store the actual employee UUID here
            concept,
            amount,
            balance_due,
            due_date,
            status,
            notes,
            reference_id,
            created_by
        ) VALUES (
            NEW.workspace_id,
            'employee',
            NULL,           -- No supplier for this record
            NEW.employee_id, -- Link to the employee who made the expense
            'Reembolso de gasto: ' || COALESCE(NEW.description, NEW.category, 'Sin descripción'),
            NEW.amount,
            NEW.amount,
            NEW.expense_date,
            'pending',
            'Generado automáticamente desde Gastos ID: ' || NEW.id,
            NEW.id,
            NEW.employee_id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Re-attach Trigger
DROP TRIGGER IF EXISTS trigger_expense_refund ON public.expenses;
CREATE TRIGGER trigger_expense_refund
    AFTER UPDATE ON public.expenses
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_expense_approval_refund();

-- 5. Ensure updated_at trigger exists for consistency
DROP TRIGGER IF EXISTS update_expenses_updated_at ON public.expenses;
CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON public.expenses
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Clean Up Schema Cache
NOTIFY pgrst, 'reload schema';
