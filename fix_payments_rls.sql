-- Habilitar RLS explícitamente y permitir la inserción de pagos desde el frontend para usuarios con sesión.
DROP POLICY IF EXISTS "Users can insert workspace charge note payments" ON public.charge_note_payments;

CREATE POLICY "Users can insert workspace charge note payments"
ON public.charge_note_payments FOR INSERT TO authenticated WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
