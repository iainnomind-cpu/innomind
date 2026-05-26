-- ========================================================
-- TRAK - Fix Existing Catalog Products & Set Defaults
-- Run this in Supabase SQL Editor to make existing
-- products visible in Quote Form and Templates catalog.
-- ========================================================

-- 1. Asegurar que la columna exists
ALTER TABLE trak_products ADD COLUMN IF NOT EXISTS is_active BOOLEAN;

-- 2. Actualizar todos los productos existentes para que estén activos
UPDATE trak_products 
SET is_active = true 
WHERE is_active IS NULL OR is_active = false;

-- 3. Configurar restricciones físicas para prevenir nulos en el futuro
ALTER TABLE trak_products ALTER COLUMN is_active SET DEFAULT true;
ALTER TABLE trak_products ALTER COLUMN is_active SET NOT NULL;
