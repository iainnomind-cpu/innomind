-- ============================================
-- TRAK - Workspace Settings Schema
-- Run this in Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS trak_workspace_settings (
  workspace_id UUID PRIMARY KEY REFERENCES company_profiles(id) ON DELETE CASCADE,
  default_currency TEXT DEFAULT 'MXN',
  default_tax_rate NUMERIC(5,2) DEFAULT 16.00,
  default_project_phases TEXT[] DEFAULT ARRAY['Planificación', 'Ejecución', 'Cierre'],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE trak_workspace_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trak_workspace_settings_policy" ON trak_workspace_settings FOR ALL USING (
  workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid())
);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_trak_workspace_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_trak_workspace_settings_updated_at ON trak_workspace_settings;
CREATE TRIGGER update_trak_workspace_settings_updated_at
BEFORE UPDATE ON trak_workspace_settings
FOR EACH ROW
EXECUTE FUNCTION update_trak_workspace_settings_updated_at();
