-- ============================================
-- TRAK - Notifications System Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Añadir preferencias de alertas a la configuración existente
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trak_workspace_settings' AND column_name = 'alert_low_inventory') THEN
    ALTER TABLE trak_workspace_settings ADD COLUMN alert_low_inventory BOOLEAN DEFAULT true;
    ALTER TABLE trak_workspace_settings ADD COLUMN alert_overdue_tasks BOOLEAN DEFAULT true;
  END IF;
END $$;

-- 2. Crear tabla de notificaciones
CREATE TABLE IF NOT EXISTS trak_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- If null, it's a global workspace alert (for admins)
  type TEXT NOT NULL, -- 'inventory', 'task', 'system'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  link_url TEXT, -- Opcional: url para redirigir al hacer clic (ej. /trak/inventory)
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trak_notifications_workspace ON trak_notifications(workspace_id);
CREATE INDEX IF NOT EXISTS idx_trak_notifications_user ON trak_notifications(user_id);

ALTER TABLE trak_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trak_notifications_policy" ON trak_notifications FOR ALL USING (
  workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid())
);

-- 3. Crear Trigger Automático para Inventario Bajo
-- Este trigger se ejecuta cada vez que se actualiza el stock de un producto.
CREATE OR REPLACE FUNCTION check_low_inventory_trigger()
RETURNS TRIGGER AS $$
DECLARE
  alerts_enabled BOOLEAN;
BEGIN
  -- Verificar si las alertas de inventario están encendidas en la configuración
  SELECT alert_low_inventory INTO alerts_enabled 
  FROM trak_workspace_settings 
  WHERE workspace_id = NEW.workspace_id;

  -- Si están encendidas, la cantidad bajó del mínimo, y antes estaba bien (para no hacer spam)
  IF alerts_enabled = true AND NEW.quantity <= NEW.min_stock AND OLD.quantity > OLD.min_stock THEN
    INSERT INTO trak_notifications (workspace_id, type, title, message, link_url)
    VALUES (
      NEW.workspace_id,
      'inventory',
      'Stock Bajo: ' || NEW.name,
      'El producto "' || NEW.name || '" ha bajado a ' || NEW.quantity || ' ' || NEW.unit || ' (Mínimo: ' || NEW.min_stock || '). Considere reabastecer.',
      '/trak/inventory'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_low_inventory_alert ON trak_inventory;
CREATE TRIGGER trigger_low_inventory_alert
AFTER UPDATE OF quantity ON trak_inventory
FOR EACH ROW
EXECUTE FUNCTION check_low_inventory_trigger();
