-- Fix trigger to insert 'approved' instead of 'pending' for expenses
-- Also fixes the CHECK constraint

-- Fix check constraint to allow 'approved'
DO $$ 
BEGIN 
    ALTER TABLE public.accounts_payable DROP CONSTRAINT IF EXISTS accounts_payable_status_check;
    ALTER TABLE public.accounts_payable ADD CONSTRAINT accounts_payable_status_check CHECK (status IN ('pending', 'approved', 'paid', 'cancelled'));
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Constraint update failed for accounts_payable.';
END $$;

CREATE OR REPLACE FUNCTION public.handle_expense_approval_refund()
RETURNS TRIGGER AS $$
DECLARE
    v_concept TEXT;
    v_supplier_type TEXT;
    v_notes TEXT;
    v_ap_id UUID;
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

        -- Insert into accounts_payable with 'approved' status (previously was 'pending')
        INSERT INTO public.accounts_payable (
            workspace_id,
            supplier_type,
            supplier_id,    
            employee_id,    
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
            'approved', -- FIX: Set to 'approved' instead of 'pending'
            v_notes,
            NEW.id,
            NEW.employee_id
        ) RETURNING id INTO v_ap_id;
        
        -- Auto-generate the payment record linked to the new accounts_payable
        INSERT INTO public.accounts_payable_payments (
            workspace_id,
            account_payable_id,
            amount,
            payment_method,
            notes,
            created_by
        ) VALUES (
            NEW.workspace_id,
            v_ap_id,
            NEW.amount,
            'Por Definir',
            'Pago generado automáticamente desde aprobación de gasto',
            NEW.employee_id
        );
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Retroactive fix 1: Update existing accounts_payable that belong to an approved expense but are stuck in 'pending'
UPDATE public.accounts_payable ap
SET status = 'approved'
FROM public.expenses e
WHERE ap.reference_id = e.id
  AND e.status = 'approved'
  AND ap.status = 'pending';

-- Retroactive fix 2: Generate missing accounts_payable_payments for accounts_payable that were approved but have no payments
INSERT INTO public.accounts_payable_payments (workspace_id, account_payable_id, amount, payment_method, notes, created_by)
SELECT 
    ap.workspace_id,
    ap.id,
    ap.amount,
    'Por Definir',
    'Pago generado retroactivamente para cuenta por pagar aprobada',
    ap.created_by
FROM public.accounts_payable ap
JOIN public.expenses e ON ap.reference_id = e.id
LEFT JOIN public.accounts_payable_payments app ON ap.id = app.account_payable_id
WHERE e.status = 'approved'
  AND ap.status = 'approved'
  AND app.id IS NULL;

-- Clean Up Schema Cache
NOTIFY pgrst, 'reload schema';
