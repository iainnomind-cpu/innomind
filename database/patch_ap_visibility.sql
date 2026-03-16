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

        -- Insert into accounts_payable with both workspace_id and workspace
        INSERT INTO public.accounts_payable (
            workspace_id,
            workspace,
            supplier_type,
            supplier_id,    
            employee_id,    
            concept,
            amount,
            balance_due,
            due_date,
            status,
            estado,
            notes,
            reference_id,
            created_by
        ) VALUES (
            NEW.workspace_id,
            NEW.workspace_id,
            v_supplier_type,
            NULL,
            CASE WHEN NEW.paid_by = 'employee' THEN NEW.employee_id ELSE NULL END,
            v_concept,
            NEW.amount,
            NEW.amount,
            NEW.expense_date,
            'approved', 
            'approved',
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

ALTER TABLE public.accounts_payable ADD COLUMN IF NOT EXISTS workspace UUID REFERENCES public.company_profiles(id);
ALTER TABLE public.accounts_payable ADD COLUMN IF NOT EXISTS estado TEXT;
ALTER TABLE public.accounts_payable ADD COLUMN IF NOT EXISTS proveedor_id UUID REFERENCES public.suppliers(id);
ALTER TABLE public.accounts_payable ADD COLUMN IF NOT EXISTS purchase_order_id UUID REFERENCES public.purchase_orders(id);
ALTER TABLE public.accounts_payable ADD COLUMN IF NOT EXISTS numero_referencia TEXT;
ALTER TABLE public.accounts_payable ADD COLUMN IF NOT EXISTS monto NUMERIC(15, 2);

UPDATE public.accounts_payable
SET workspace = workspace_id,
    estado = status
WHERE workspace IS NULL OR estado IS NULL;

NOTIFY pgrst, 'reload schema';
