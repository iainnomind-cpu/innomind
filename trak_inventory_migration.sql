-- ============================================
-- TRAK - Inventory & Project Costs Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- ========== MÓDULOS OPCIONALES (settings) ==========
CREATE TABLE IF NOT EXISTS trak_module_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
  module_key TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(workspace_id, module_key)
);

ALTER TABLE trak_module_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trak_module_settings_policy" ON trak_module_settings FOR ALL USING (
  workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid())
);

-- ========== INVENTARIO ==========
CREATE TABLE IF NOT EXISTS trak_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT,
  category TEXT,
  unit TEXT DEFAULT 'pza',
  quantity NUMERIC(12,2) DEFAULT 0,
  min_stock NUMERIC(12,2) DEFAULT 0,
  unit_cost NUMERIC(12,2) DEFAULT 0,
  unit_price NUMERIC(12,2) DEFAULT 0,
  location TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trak_inventory_workspace ON trak_inventory(workspace_id);

ALTER TABLE trak_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trak_inventory_policy" ON trak_inventory FOR ALL USING (
  workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid())
);

-- ========== MOVIMIENTOS DE INVENTARIO ==========
CREATE TABLE IF NOT EXISTS trak_inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
  inventory_id UUID NOT NULL REFERENCES trak_inventory(id) ON DELETE CASCADE,
  project_id UUID REFERENCES trak_projects(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('entrada', 'salida', 'ajuste', 'proyecto')),
  quantity NUMERIC(12,2) NOT NULL,
  unit_cost NUMERIC(12,2),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trak_inv_movements_inventory ON trak_inventory_movements(inventory_id);
CREATE INDEX IF NOT EXISTS idx_trak_inv_movements_project ON trak_inventory_movements(project_id);

ALTER TABLE trak_inventory_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trak_inventory_movements_policy" ON trak_inventory_movements FOR ALL USING (
  workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid())
);

-- ========== MATERIALES ASIGNADOS A PROYECTOS ==========
CREATE TABLE IF NOT EXISTS trak_project_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES trak_projects(id) ON DELETE CASCADE,
  inventory_id UUID REFERENCES trak_inventory(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  quantity NUMERIC(12,2) DEFAULT 1,
  unit_cost NUMERIC(12,2) DEFAULT 0,
  total_cost NUMERIC(12,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trak_project_materials_project ON trak_project_materials(project_id);

ALTER TABLE trak_project_materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trak_project_materials_policy" ON trak_project_materials FOR ALL USING (
  project_id IN (SELECT id FROM trak_projects WHERE workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid()))
);

-- ========== GASTOS DE PROYECTOS ==========
CREATE TABLE IF NOT EXISTS trak_project_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES trak_projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'general',
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trak_project_expenses_project ON trak_project_expenses(project_id);

ALTER TABLE trak_project_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trak_project_expenses_policy" ON trak_project_expenses FOR ALL USING (
  project_id IN (SELECT id FROM trak_projects WHERE workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid()))
);
