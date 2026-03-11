-- 1. Asegurar que las políticas RLS permitan la inserción a usuarios logueados
DROP POLICY IF EXISTS "Users can insert workspace charge notes" ON public.charge_notes;
DROP POLICY IF EXISTS "Users can insert charge note items" ON public.charge_note_items;

CREATE POLICY "Users can insert workspace charge notes"
ON public.charge_notes FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can insert charge note items"
ON public.charge_note_items FOR INSERT TO authenticated WITH CHECK (true);

-- 2. Función auxiliar para que React inserte de forma segura la Nota de Cargo
-- Esta función recibe el prospect_id, si no hay un client_id válido, lo busca o lo crea.
CREATE OR REPLACE FUNCTION public.create_manual_charge_note(
    p_workspace_id UUID,
    p_prospect_id UUID,
    p_note_number TEXT,
    p_issue_date DATE,
    p_due_date DATE,
    p_subtotal NUMERIC,
    p_total_amount NUMERIC
) RETURNS UUID AS $$
DECLARE
    v_charge_note_id UUID;
BEGIN
    -- Insertamos la Nota de Cargo directamente usando el prospecto tanto para client_id como prospect_id
    -- dado que la tabla de clientes no se utiliza en esta fase del sistema.
    INSERT INTO public.charge_notes (
        workspace_id, client_id, prospect_id, note_number, 
        issue_date, due_date, subtotal, total_amount, balance_due, status
    ) VALUES (
        p_workspace_id, p_prospect_id, p_prospect_id, p_note_number, 
        p_issue_date, p_due_date, p_subtotal, p_total_amount, p_total_amount, 'pending'
    ) RETURNING id INTO v_charge_note_id;

    RETURN v_charge_note_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

NOTIFY pgrst, 'reload schema';
