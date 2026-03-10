-- MIGRATION: Unified Expense Automation
-- This script implements the flow where ALL approved expenses generate an Accounts Payable record.

-- 1. Update accounts_payable schema for unified types
ALTER TABLE public.accounts_payable DROP CONSTRAINT IF EXISTS accounts_payable_supplier_type_check;
ALTER TABLE public.accounts_payable ADD COLUMN IF NOT EXISTS supplier_type TEXT DEFAULT 'supplier';
ALTER TABLE public.accounts_payable ADD CONSTRAINT accounts_payable_supplier_type_check 
    CHECK (supplier_type IN ('supplier', 'employee', 'company_expense'));

ALTER TABLE public.accounts_payable ADD COLUMN IF NOT EXISTS reference_id UUID; -- Link to source expense
ALTER TABLE public.accounts_payable ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES auth.users(id);

-- 2. Update trigger function for Unified Flow (Cases 1 & 2)
CREATE OR REPLACE FUNCTION public.handle_expense_approval_refund()
RETURNS TRIGGER AS $$
DECLARE
    v_concept TEXT;
    v_supplier_type TEXT;
    v_notes TEXT;
BEGIN
    -- Only proceed if status changed to 'approved'
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
        
        -- Prevent duplicates
        IF EXISTS (SELECT 1 FROM public.accounts_payable WHERE reference_id = NEW.id) THEN
            RETURN NEW;
        END IF;

        -- Determine Concept and Type based on paid_by
        IF NEW.paid_by = 'employee' THEN
            v_concept := 'Reembolso de gasto: ' || COALESCE(NEW.description, NEW.category, 'Sin descripción');
            v_supplier_type := 'employee';
            v_notes := 'Generado automáticamente (Reembolso) desde Gastos ID: ' || NEW.id;
        ELSE
            v_concept := 'Pago de gasto directo: ' || COALESCE(NEW.description, NEW.category, 'Sin descripción');
            v_supplier_type := 'company_expense';
            v_notes := 'Generado automáticamente (Gasto Directo) desde Gastos ID: ' || NEW.id;
        END IF;

        -- Insert into accounts_payable
        INSERT INTO public.accounts_payable (
            workspace_id,
            supplier_type,
            supplier_id,    -- NULL for both employees and direct company expenses for now
            employee_id,    -- Linked for refunds
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
            v_supplier_type,
            NULL,
            CASE WHEN NEW.paid_by = 'employee' THEN NEW.employee_id ELSE NULL END,
            v_concept,
            NEW.amount,
            NEW.amount,
            NEW.expense_date,
            'pending',
            v_notes,
            NEW.id,
            NEW.employee_id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Ensure trigger is re-attached
DROP TRIGGER IF EXISTS trigger_expense_refund ON public.expenses;
CREATE TRIGGER trigger_expense_refund
    AFTER UPDATE ON public.expenses
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_expense_approval_refund();

-- Clean Up Schema Cache
NOTIFY pgrst, 'reload schema';
