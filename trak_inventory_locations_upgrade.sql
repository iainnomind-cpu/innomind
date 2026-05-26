-- ========================================================
-- TRAK - Multi-Warehouse & Location Inventory Upgrade
-- Run this in your Supabase SQL Editor.
-- ========================================================

-- ========== 1. ALMACENES / UBICACIONES ==========
CREATE TABLE IF NOT EXISTS trak_warehouse_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trak_warehouse_locations_workspace ON trak_warehouse_locations(workspace_id);

ALTER TABLE trak_warehouse_locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "trak_warehouse_locations_policy" ON trak_warehouse_locations;
CREATE POLICY "trak_warehouse_locations_policy" ON trak_warehouse_locations FOR ALL USING (
  workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid())
);

-- ========== 2. STOCKS DETALLADOS POR ALMACÉN ==========
CREATE TABLE IF NOT EXISTS trak_inventory_stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID NOT NULL REFERENCES trak_inventory(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES trak_warehouse_locations(id) ON DELETE CASCADE,
  quantity NUMERIC(12,2) NOT NULL DEFAULT 0,
  min_stock NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(inventory_id, location_id)
);

CREATE INDEX IF NOT EXISTS idx_trak_inventory_stocks_inv ON trak_inventory_stocks(inventory_id);
CREATE INDEX IF NOT EXISTS idx_trak_inventory_stocks_loc ON trak_inventory_stocks(location_id);

ALTER TABLE trak_inventory_stocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "trak_inventory_stocks_policy" ON trak_inventory_stocks;
CREATE POLICY "trak_inventory_stocks_policy" ON trak_inventory_stocks FOR ALL USING (
  inventory_id IN (
    SELECT id FROM trak_inventory WHERE workspace_id IN (
      SELECT workspace_id FROM users WHERE id = auth.uid()
    )
  )
);

-- ========== 3. ENLAZAR MOVIMIENTOS A ALMACENES (Upgrade) ==========
-- Agregar columnas opcionales de almacenes a trak_inventory_movements para soportar transferencias y trazabilidad de locación
ALTER TABLE trak_inventory_movements ADD COLUMN IF NOT EXISTS from_location_id UUID REFERENCES trak_warehouse_locations(id) ON DELETE SET NULL;
ALTER TABLE trak_inventory_movements ADD COLUMN IF NOT EXISTS to_location_id UUID REFERENCES trak_warehouse_locations(id) ON DELETE SET NULL;

-- Actualizar la validación de CHECK de tipo para incluir transferencias
ALTER TABLE trak_inventory_movements DROP CONSTRAINT IF EXISTS trak_inventory_movements_type_check;
ALTER TABLE trak_inventory_movements ADD CONSTRAINT trak_inventory_movements_type_check CHECK (type IN ('entrada', 'salida', 'ajuste', 'proyecto', 'transferencia'));

-- ========== 4. CREAR ALMACÉN POR DEFECTO PARA CADA EMPRESA ==========
-- Esto asegura que todas las empresas tengan al menos una locación inicial y migra los stocks antiguos
DO $$
DECLARE
    r RECORD;
    v_default_loc_id UUID;
BEGIN
    FOR r IN SELECT id FROM company_profiles LOOP
        -- Verificar si ya tiene locaciones
        IF NOT EXISTS (SELECT 1 FROM trak_warehouse_locations WHERE workspace_id = r.id) THEN
            -- Crear bodega general por defecto
            INSERT INTO trak_warehouse_locations (workspace_id, name, description)
            VALUES (r.id, 'Almacén General', 'Bodega principal de almacenamiento por defecto')
            RETURNING id INTO v_default_loc_id;

            -- Migrar stock antiguo de la tabla trak_inventory a la bodega por defecto
            INSERT INTO trak_inventory_stocks (inventory_id, location_id, quantity, min_stock)
            SELECT id, v_default_loc_id, quantity, min_stock
            FROM trak_inventory
            WHERE workspace_id = r.id;
        END IF;
    END LOOP;
END $$;
