-- ==========================================
-- Innomind SaaS Multi-tenant Database Setup
-- ==========================================
-- Instrucciones: Ejecuta este script entero en el 
-- SQL Editor de tu panel de Supabase.

-- 1. Tabla: users (Ya puede existir, pero la ajustamos)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  email text NOT NULL,
  workspace text NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_sign_in_at timestamptz
);
-- Habilita RLS en Users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);


-- 2. Helper de Seguridad
-- Función que nos dice rápidamente a qué workspace pertenece la sesión actual
CREATE OR REPLACE FUNCTION get_current_workspace()
RETURNS text AS $$
  SELECT workspace FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- 3. Tabla: company_profiles (Para el branding del PDF de cada empresa)
CREATE TABLE IF NOT EXISTS public.company_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace text NOT NULL,
  nombre_empresa text NOT NULL,
  rfc text,
  direccion text,
  telefono text,
  email text,
  logo_url text,
  sitio_web text,
  color_primario text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Asegurar que solo hay 1 profile por workspace para simplificar
CREATE UNIQUE INDEX IF NOT EXISTS company_profiles_workspace_idx ON public.company_profiles (workspace);

ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access own company profile" 
ON public.company_profiles FOR ALL 
USING (workspace = get_current_workspace());


-- 4. Tabla: prospects (Clientes del CRM)
CREATE TABLE IF NOT EXISTS public.prospects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace text NOT NULL,
  nombre text NOT NULL,
  empresa text,
  cargo text,
  telefono text,
  correo text,
  servicio_interes text,
  plataforma text,
  estado text DEFAULT 'Nuevo',
  responsable text,
  fecha_contacto timestamptz DEFAULT now(),
  tamano_empresa text,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Workspace isolation for prospects" 
ON public.prospects FOR ALL 
USING (workspace = get_current_workspace());


-- 5. Tabla: quotes (Cotizaciones)
CREATE TABLE IF NOT EXISTS public.quotes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace text NOT NULL,
  prospect_id uuid REFERENCES public.prospects(id) ON DELETE CASCADE,
  numero text NOT NULL,
  fecha timestamptz DEFAULT now(),
  vigencia timestamptz,
  estado text DEFAULT 'Borrador',
  subtotal numeric DEFAULT 0,
  descuento numeric DEFAULT 0,
  iva_porcentaje numeric DEFAULT 16,
  iva_total numeric DEFAULT 0,
  total numeric DEFAULT 0,
  condiciones_pago text,
  metodos_pago_aceptados jsonb,
  notas_adicionales text,
  terminos_condiciones text,
  user_id uuid REFERENCES auth.users(id),
  items jsonb DEFAULT '[]'::jsonb, -- items de la cotización guardados como JSON para simplificar
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Workspace isolation for quotes" 
ON public.quotes FOR ALL 
USING (workspace = get_current_workspace());


-- 6. Tabla: products (Catálogo de Inventario/Servicios)
CREATE TABLE IF NOT EXISTS public.products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace text NOT NULL,
  codigo text,
  nombre text NOT NULL,
  descripcion text,
  precio numeric NOT NULL,
  categoria text,
  tipo text,
  activo boolean DEFAULT true
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Workspace isolation for products" 
ON public.products FOR ALL 
USING (workspace = get_current_workspace());


-- 7. Triggers para inyectar automáticamente el workspace antes de un Insert ()
-- Esto evita que el front-end pueda manipular o corromper a qué workspace van sus datos
CREATE OR REPLACE FUNCTION set_workspace_on_insert()
RETURNS TRIGGER AS $$
DECLARE
  v_current_ws text;
BEGIN
  -- Forza el workspace a la fila insertada desde los datos del usuario logueado
  v_current_ws := get_current_workspace();

  -- Si la tabla destino contiene la columna 'workspace', asignar el valor
  IF to_jsonb(NEW) ? 'workspace' THEN
    NEW.workspace := v_current_ws;
  END IF;

  -- Si la tabla destino contiene la columna 'workspace_id', asignar el UUID convertido
  IF to_jsonb(NEW) ? 'workspace_id' THEN
    NEW.workspace_id := v_current_ws::uuid;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar a Prospectos
CREATE TRIGGER set_prospects_workspace
BEFORE INSERT ON public.prospects
FOR EACH ROW EXECUTE FUNCTION set_workspace_on_insert();

-- Aplicar a Quotes
CREATE TRIGGER set_quotes_workspace
BEFORE INSERT ON public.quotes
FOR EACH ROW EXECUTE FUNCTION set_workspace_on_insert();

-- Aplicar a Products
CREATE TRIGGER set_products_workspace
BEFORE INSERT ON public.products
FOR EACH ROW EXECUTE FUNCTION set_workspace_on_insert();

-- Aplicar a Company Profiles
CREATE TRIGGER set_company_profiles_workspace
BEFORE INSERT ON public.company_profiles
FOR EACH ROW EXECUTE FUNCTION set_workspace_on_insert();

-- Trigger de updated_at para prospects y quotes
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_prospects_updated_at
BEFORE UPDATE ON public.prospects
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_quotes_updated_at
BEFORE UPDATE ON public.quotes
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
