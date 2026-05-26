-- ============================================
-- TRAK - Quotes, Products, and Templates Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- ========== 1. CATÁLOGO DE PRODUCTOS / SERVICIOS ==========
CREATE TABLE IF NOT EXISTS trak_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('product', 'service')),
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  sku TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trak_products_workspace ON trak_products(workspace_id);

ALTER TABLE trak_products ENABLE ROW LEVEL SECURITY;

-- Evitar error 42710 (policy already exists) eliminándola antes de recrear
DROP POLICY IF EXISTS "trak_products_policy" ON trak_products;
CREATE POLICY "trak_products_policy" ON trak_products FOR ALL USING (
  workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid())
);

-- ========== 2. COTIZACIONES ==========
CREATE TABLE IF NOT EXISTS trak_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
  quote_number TEXT NOT NULL,
  title TEXT NOT NULL,
  client_id UUID REFERENCES trak_clients(id) ON DELETE SET NULL,
  project_id UUID REFERENCES trak_projects(id) ON DELETE SET NULL,
  valid_until DATE,
  payment_terms TEXT,
  notes TEXT,
  tax_rate NUMERIC(5,2) DEFAULT 16,
  discount NUMERIC(12,2) DEFAULT 0,
  subtotal NUMERIC(12,2) DEFAULT 0,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trak_quotes_workspace ON trak_quotes(workspace_id);
CREATE INDEX IF NOT EXISTS idx_trak_quotes_client ON trak_quotes(client_id);
CREATE INDEX IF NOT EXISTS idx_trak_quotes_project ON trak_quotes(project_id);

ALTER TABLE trak_quotes ENABLE ROW LEVEL SECURITY;

-- Evitar error 42710 (policy already exists) eliminándola antes de recrear
DROP POLICY IF EXISTS "trak_quotes_policy" ON trak_quotes;
CREATE POLICY "trak_quotes_policy" ON trak_quotes FOR ALL USING (
  workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid())
);

-- ========== 3. CONCEPTOS / ÍTEMS DE COTIZACIÓN ==========
CREATE TABLE IF NOT EXISTS trak_quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES trak_quotes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  quantity NUMERIC(12,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trak_quote_items_quote ON trak_quote_items(quote_id);

ALTER TABLE trak_quote_items ENABLE ROW LEVEL SECURITY;

-- Evitar error 42710 (policy already exists) eliminándola antes de recrear
DROP POLICY IF EXISTS "trak_quote_items_policy" ON trak_quote_items;
CREATE POLICY "trak_quote_items_policy" ON trak_quote_items FOR ALL USING (
  quote_id IN (
    SELECT id FROM trak_quotes WHERE workspace_id IN (
      SELECT workspace_id FROM users WHERE id = auth.uid()
    )
  )
);

-- ========== 4. PLANTILLAS DE COTIZACIÓN ==========
CREATE TABLE IF NOT EXISTS trak_quote_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  payment_terms TEXT,
  notes TEXT,
  tax_rate NUMERIC(5,2) DEFAULT 16,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trak_quote_templates_workspace ON trak_quote_templates(workspace_id);

ALTER TABLE trak_quote_templates ENABLE ROW LEVEL SECURITY;

-- Evitar error 42710 (policy already exists) eliminándola antes de recrear
DROP POLICY IF EXISTS "trak_quote_templates_policy" ON trak_quote_templates;
CREATE POLICY "trak_quote_templates_policy" ON trak_quote_templates FOR ALL USING (
  workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid())
);

-- ========== 5. CONCEPTOS / ÍTEMS DE PLANTILLA DE COTIZACIÓN ==========
CREATE TABLE IF NOT EXISTS trak_quote_template_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES trak_quote_templates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  quantity NUMERIC(12,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trak_quote_template_items_template ON trak_quote_template_items(template_id);

ALTER TABLE trak_quote_template_items ENABLE ROW LEVEL SECURITY;

-- Evitar error 42710 (policy already exists) eliminándola antes de recrear
DROP POLICY IF EXISTS "trak_quote_template_items_policy" ON trak_quote_template_items;
CREATE POLICY "trak_quote_template_items_policy" ON trak_quote_template_items FOR ALL USING (
  template_id IN (
    SELECT id FROM trak_quote_templates WHERE workspace_id IN (
      SELECT workspace_id FROM users WHERE id = auth.uid()
    )
  )
);
