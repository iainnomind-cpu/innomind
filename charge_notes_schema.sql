-- Cuentas por Cobrar (Accounts Receivable) Schema
-- Ejecutar este archivo en Supabase SQL Editor

-- 1. Tabla: charge_notes (Notas de Cargo)
CREATE TABLE IF NOT EXISTS public.charge_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.company_profiles(id) DEFAULT (get_current_workspace()::uuid),
    client_id UUID NOT NULL REFERENCES public.clientes(id),
    prospect_id UUID REFERENCES public.prospects(id),
    note_number TEXT,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    subtotal NUMERIC(15, 2) DEFAULT 0,
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    paid_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    balance_due NUMERIC(15, 2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Tabla: charge_note_items (Items de la Nota de Cargo)
CREATE TABLE IF NOT EXISTS public.charge_note_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    charge_note_id UUID NOT NULL REFERENCES public.charge_notes(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    description TEXT,
    quantity NUMERIC(15, 2) NOT NULL DEFAULT 1,
    unit_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
    total NUMERIC(15, 2) NOT NULL DEFAULT 0
);

-- 2.5 Tabla: charge_note_payments (Pagos Registrados de Cuentas por Cobrar)
CREATE TABLE IF NOT EXISTS public.charge_note_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.company_profiles(id) DEFAULT (get_current_workspace()::uuid),
    charge_note_id UUID NOT NULL REFERENCES public.charge_notes(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clientes(id),
    payment_method TEXT,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reference TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Tabla: bank_movements (Movimientos Bancarios para Conciliación)
CREATE TABLE IF NOT EXISTS public.bank_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.company_profiles(id) DEFAULT (get_current_workspace()::uuid),
    movement_date DATE NOT NULL,
    description TEXT NOT NULL,
    reference TEXT,
    amount NUMERIC(15, 2) NOT NULL,
    matched_payment_id UUID, -- Se relacionará con finance_payments
    imported_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ==========================================
-- Triggers and Functions
-- ==========================================

-- Trigger: update updated_at para charge_notes
CREATE TRIGGER update_charge_notes_updated_at
    BEFORE UPDATE ON public.charge_notes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Función: Auto-generar Nota de Cargo al ganar la Oportunidad
CREATE OR REPLACE FUNCTION public.handle_prospect_won_create_charge_note()
RETURNS TRIGGER AS $$
DECLARE
    v_client_id UUID;
    v_subtotal NUMERIC;
    v_total NUMERIC;
    v_charge_note_id UUID;
    v_quote_item RECORD;
BEGIN
    -- Verificar si el estado cambió a "VENTA CERRADA - Compra realizada"
    IF NEW.estado = 'VENTA CERRADA - Compra realizada' AND (OLD.estado IS NULL OR OLD.estado != 'VENTA CERRADA - Compra realizada') THEN
        
        -- Obtener o deducir un client_id (se asume que el prospecto ya tiene datos para el cliente o es un cliente)
        -- Si el sistema convierte prospect->cliente, necesitaríamos el ID. Por ahora referenciamos el prospect_id
        -- o creamos temporalmente si no hay conexión directa. (Si la lógica de negocio requiere un client_id estricto, 
        -- aquí lo ideal es buscar el cliente asociado por email, o en su defecto usar un "Dummy" o adaptar el foreign key).
        -- NOTA: Como la tabla pide client_id not null y referenciado a clientes, busquemos el email.
        SELECT id INTO v_client_id FROM public.clientes WHERE email = NEW.email LIMIT 1;
        
        IF v_client_id IS NULL THEN
            -- Autocrear cliente basico si no existe (opcional, dependiendo de tus otras reglas de negocio)
            INSERT INTO public.clientes (nombre, email, telefono, empresa) 
            VALUES (NEW.nombre, NEW.email, NEW.telefono, NEW.empresa)
            RETURNING id INTO v_client_id;
        END IF;

        -- Calcular total desde las cotizaciones si existen (sumar todos los items cotizados aprobados o la mas reciente)
        SELECT COALESCE(SUM(total), 0), COALESCE(SUM(subtotal), 0) INTO v_total, v_subtotal
        FROM public.quotes
        WHERE prospect_id = NEW.id;

        -- Si no hay monto en cotizaciones, usar el valor estimado del prospecto
        IF v_total = 0 THEN
            v_total := NEW.valor_estimado;
            v_subtotal := NEW.valor_estimado;
        END IF;

        -- Crear la nota de cargo (a 30 días de vencimiento por defecto)
        INSERT INTO public.charge_notes (
            workspace_id, client_id, prospect_id, note_number, 
            issue_date, due_date, subtotal, total_amount, balance_due, status
        ) VALUES (
            NEW.workspace, v_client_id, NEW.id, 'NC-' || to_char(now(), 'YYYYMMDD-HH12MI'), 
            CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', v_subtotal, v_total, v_total, 'pending'
        ) RETURNING id INTO v_charge_note_id;

        -- Copiar items de cotizaciones si existen
        FOR v_quote_item IN 
            SELECT ci.* FROM public.quote_items ci 
            JOIN public.quotes q ON q.id = ci.quote_id 
            WHERE q.prospect_id = NEW.id
        LOOP
            INSERT INTO public.charge_note_items (
                charge_note_id, item_name, description, quantity, unit_price, total
            ) VALUES (
                v_charge_note_id, v_quote_item.name, v_quote_item.description, v_quote_item.quantity, v_quote_item.price, v_quote_item.total
            );
        END LOOP;

        -- Si no se encontraron items, insertar un item genérico con el valor prospectado
        IF NOT FOUND AND v_total > 0 THEN
            INSERT INTO public.charge_note_items (
                charge_note_id, item_name, quantity, unit_price, total
            ) VALUES (
                v_charge_note_id, 'Servicios pactados (Generado Auto)', 1, v_total, v_total
            );
        END IF;

    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Disparador en la tabla prospects
DROP TRIGGER IF EXISTS trigger_prospect_won_charge_note ON public.prospects;
CREATE TRIGGER trigger_prospect_won_charge_note
    AFTER UPDATE ON public.prospects
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_prospect_won_create_charge_note();


-- Función: Auto-actualizar saldo de Nota de Cargo al registrar pago
CREATE OR REPLACE FUNCTION public.handle_payment_update_charge_note()
RETURNS TRIGGER AS $$
DECLARE
    v_total_amount NUMERIC;
    v_new_paid NUMERIC;
    v_new_balance NUMERIC;
BEGIN
    -- Sumar todos los pagos para la nota de cargo
    SELECT COALESCE(SUM(amount), 0) INTO v_new_paid
    FROM public.charge_note_payments
    WHERE charge_note_id = NEW.charge_note_id;

    -- Obtener el total_amount
    SELECT total_amount INTO v_total_amount
    FROM public.charge_notes
    WHERE id = NEW.charge_note_id;

    v_new_balance := v_total_amount - v_new_paid;

    -- Actualizar la nota de cargo, definiendo el nuevo status
    UPDATE public.charge_notes
    SET paid_amount = v_new_paid,
        balance_due = v_new_balance,
        status = CASE 
            WHEN v_new_balance <= 0 THEN 'paid'
            WHEN v_new_paid > 0 AND v_new_balance > 0 THEN 'partial'
            ELSE 'pending'
        END,
        updated_at = now()
    WHERE id = NEW.charge_note_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Disparador en la tabla charge_note_payments
DROP TRIGGER IF EXISTS trigger_update_charge_note_balance ON public.charge_note_payments;
CREATE TRIGGER trigger_update_charge_note_balance
    AFTER INSERT OR UPDATE OR DELETE ON public.charge_note_payments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_payment_update_charge_note();


-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Habilitar RLS
ALTER TABLE public.charge_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charge_note_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_movements ENABLE ROW LEVEL SECURITY;

-- Policies para charge_notes
CREATE POLICY "Users can view workspace charge notes"
ON public.charge_notes FOR SELECT USING (workspace_id = get_current_workspace()::uuid);

CREATE POLICY "Users can insert workspace charge notes"
ON public.charge_notes FOR INSERT WITH CHECK (workspace_id = get_current_workspace()::uuid);

CREATE POLICY "Users can update workspace charge notes"
ON public.charge_notes FOR UPDATE USING (workspace_id = get_current_workspace()::uuid);

CREATE POLICY "Users can delete workspace charge notes"
ON public.charge_notes FOR DELETE USING (workspace_id = get_current_workspace()::uuid);

-- Policies para charge_note_items (Heredan permiso via la nota de cargo padre)
CREATE POLICY "Users can view charge note items"
ON public.charge_note_items FOR SELECT
USING (EXISTS (SELECT 1 FROM public.charge_notes WHERE id = charge_note_id AND workspace_id = get_current_workspace()::uuid));

CREATE POLICY "Users can insert charge note items"
ON public.charge_note_items FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.charge_notes WHERE id = charge_note_id AND workspace_id = get_current_workspace()::uuid));

CREATE POLICY "Users can update charge note items"
ON public.charge_note_items FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.charge_notes WHERE id = charge_note_id AND workspace_id = get_current_workspace()::uuid));

CREATE POLICY "Users can delete charge note items"
ON public.charge_note_items FOR DELETE
USING (EXISTS (SELECT 1 FROM public.charge_notes WHERE id = charge_note_id AND workspace_id = get_current_workspace()::uuid));


-- Policies para bank_movements
CREATE POLICY "Users can view workspace bank movements"
ON public.bank_movements FOR SELECT USING (workspace_id = get_current_workspace()::uuid);

CREATE POLICY "Users can insert workspace bank movements"
ON public.bank_movements FOR INSERT WITH CHECK (workspace_id = get_current_workspace()::uuid);

CREATE POLICY "Users can update workspace bank movements"
ON public.bank_movements FOR UPDATE USING (workspace_id = get_current_workspace()::uuid);

CREATE POLICY "Users can delete workspace bank movements"
ON public.bank_movements FOR DELETE USING (workspace_id = get_current_workspace()::uuid);

-- Policies para charge_note_payments
ALTER TABLE public.charge_note_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workspace charge note payments"
ON public.charge_note_payments FOR SELECT USING (workspace_id = get_current_workspace()::uuid);

CREATE POLICY "Users can insert workspace charge note payments"
ON public.charge_note_payments FOR INSERT WITH CHECK (workspace_id = get_current_workspace()::uuid);

CREATE POLICY "Users can update workspace charge note payments"
ON public.charge_note_payments FOR UPDATE USING (workspace_id = get_current_workspace()::uuid);

CREATE POLICY "Users can delete workspace charge note payments"
ON public.charge_note_payments FOR DELETE USING (workspace_id = get_current_workspace()::uuid);
N O T I F Y   p g r s t ,   ' r e l o a d   s c h e m a ' ;  
 