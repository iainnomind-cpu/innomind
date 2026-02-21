-- Schema Módulo de Finanzas y Tesorería
-- Ejecutar en Supabase SQL Editor

-- 1. Cuentas Financieras (Cajas y Bancos)
CREATE TABLE IF NOT EXISTS public.finance_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace UUID NOT NULL REFERENCES public.company_profiles(id) DEFAULT (get_current_workspace()::uuid),
    nombre TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('BANCO', 'CAJA_CHICA', 'TARJETA_CREDITO')),
    moneda TEXT NOT NULL DEFAULT 'MXN',
    saldo_inicial NUMERIC(15, 2) NOT NULL DEFAULT 0,
    saldo_actual NUMERIC(15, 2) NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Documentos Financieros (Notas de Cargo, CxP, Gastos)
CREATE TABLE IF NOT EXISTS public.finance_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace UUID NOT NULL REFERENCES public.company_profiles(id) DEFAULT (get_current_workspace()::uuid),
    
    tipo TEXT NOT NULL CHECK (tipo IN ('NOTA_CARGO', 'CUENTA_PAGAR', 'GASTO')),
    estado TEXT NOT NULL CHECK (estado IN ('PENDIENTE', 'PAGADO', 'VENCIDO', 'PENDIENTE_APROBACION', 'RECHAZADO', 'CANCELADO')),
    numero_folio TEXT, -- Generado o ingresado manualmente (ej. número de factura de proveedor)
    
    -- Montos
    monto_total NUMERIC(15, 2) NOT NULL,
    saldo_pendiente NUMERIC(15, 2) NOT NULL,
    moneda TEXT NOT NULL DEFAULT 'MXN',
    
    -- Fechas
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE,
    
    -- Relaciones e información descriptiva
    prospect_id UUID REFERENCES public.prospects(id), -- Para CxC (Notas de Cargo) vinculadas a cliente
     quote_id UUID REFERENCES public.quotes(id), -- Referencia opcional a la cotización de origen
    proveedor_nombre TEXT, -- Para CxP y Gastos
    categoria TEXT, -- Para agrupar gastos (ej. Viáticos, Marketing)
    concepto TEXT NOT NULL, -- Descripción general del cobro o pago
    
    -- Evidencias
    evidencia_url TEXT,
    
    -- Auditoría
    created_by UUID REFERENCES auth.users(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Pagos / Abonos
CREATE TABLE IF NOT EXISTS public.finance_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace UUID NOT NULL REFERENCES public.company_profiles(id) DEFAULT (get_current_workspace()::uuid),
    
    document_id UUID NOT NULL REFERENCES public.finance_documents(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.finance_accounts(id), -- A qué cuenta ingresó o de dónde salió
    
    monto NUMERIC(15, 2) NOT NULL,
    fecha_pago DATE NOT NULL,
    metodo_pago TEXT NOT NULL, -- Transferencia, Efectivo, Tarjeta, etc.
    referencia TEXT,
    comprobante_url TEXT,
    
    notas TEXT,
    
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- TRIGGERS y FUNCIONES

-- Función para actualizar timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_finance_accounts_updated_at
    BEFORE UPDATE ON public.finance_accounts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_finance_documents_updated_at
    BEFORE UPDATE ON public.finance_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();


-- RLS POLICIES

-- Habilitar RLS
ALTER TABLE public.finance_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_payments ENABLE ROW LEVEL SECURITY;

-- Policies para finance_accounts
CREATE POLICY "Users can view their workspace accounts"
ON public.finance_accounts FOR SELECT
USING (workspace = (get_current_workspace()::uuid));

CREATE POLICY "Users can insert accounts in their workspace"
ON public.finance_accounts FOR INSERT
WITH CHECK (workspace = (get_current_workspace()::uuid));

CREATE POLICY "Users can update their workspace accounts"
ON public.finance_accounts FOR UPDATE
USING (workspace = (get_current_workspace()::uuid));

CREATE POLICY "Users can delete their workspace accounts"
ON public.finance_accounts FOR DELETE
USING (workspace = (get_current_workspace()::uuid));


-- Policies para finance_documents
CREATE POLICY "Users can view their workspace documents"
ON public.finance_documents FOR SELECT
USING (workspace = (get_current_workspace()::uuid));

CREATE POLICY "Users can insert documents in their workspace"
ON public.finance_documents FOR INSERT
WITH CHECK (workspace = (get_current_workspace()::uuid));

CREATE POLICY "Users can update their workspace documents"
ON public.finance_documents FOR UPDATE
USING (workspace = (get_current_workspace()::uuid));

CREATE POLICY "Users can delete their workspace documents"
ON public.finance_documents FOR DELETE
USING (workspace = (get_current_workspace()::uuid));


-- Policies para finance_payments
CREATE POLICY "Users can view their workspace payments"
ON public.finance_payments FOR SELECT
USING (workspace = (get_current_workspace()::uuid));

CREATE POLICY "Users can insert payments in their workspace"
ON public.finance_payments FOR INSERT
WITH CHECK (workspace = (get_current_workspace()::uuid));

CREATE POLICY "Users can update their workspace payments"
ON public.finance_payments FOR UPDATE
USING (workspace = (get_current_workspace()::uuid));

CREATE POLICY "Users can delete their workspace payments"
ON public.finance_payments FOR DELETE
USING (workspace = (get_current_workspace()::uuid));

-- Triggers de autollenado de workspace
CREATE TRIGGER set_workspace_finance_accounts
    BEFORE INSERT ON public.finance_accounts
    FOR EACH ROW
    EXECUTE FUNCTION public.set_workspace_on_insert();

CREATE TRIGGER set_workspace_finance_documents
    BEFORE INSERT ON public.finance_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.set_workspace_on_insert();

CREATE TRIGGER set_workspace_finance_payments
    BEFORE INSERT ON public.finance_payments
    FOR EACH ROW
    EXECUTE FUNCTION public.set_workspace_on_insert();
