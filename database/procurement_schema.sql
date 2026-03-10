-- Tablas para el Módulo de Compras (Procurement)

-- 1. Órdenes de Compra
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected', 'received', 'cancelled')),
    total_amount NUMERIC NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'MXN',
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Items de la Orden de Compra
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity NUMERIC NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL DEFAULT 0,
    total_price NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Historial de Aprobaciones
CREATE TABLE IF NOT EXISTS purchase_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    approved_by UUID NOT NULL REFERENCES auth.users(id),
    status TEXT NOT NULL,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Recepciones de Almacén
CREATE TABLE IF NOT EXISTS warehouse_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    receipt_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    received_by UUID NOT NULL REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Items Recibidos
CREATE TABLE IF NOT EXISTS warehouse_receipt_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_id UUID NOT NULL REFERENCES warehouse_receipts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity_received NUMERIC NOT NULL DEFAULT 0
);

-- Habilitar RLS
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_receipt_items ENABLE ROW LEVEL SECURITY;

-- Políticas (Asumiendo que el campo es workspace_id)
-- Nota: purchase_order_items y warehouse_receipt_items heredan seguridad por el padre si se usa JOIN, 
-- pero para consultas directas añadimos políticas.

-- purchase_orders
CREATE POLICY "Users can view purchase_orders from their workspace" 
ON purchase_orders FOR SELECT USING (workspace_id IN (SELECT id FROM workspaces));

CREATE POLICY "Users can create purchase_orders in their workspace" 
ON purchase_orders FOR INSERT WITH CHECK (workspace_id IN (SELECT id FROM workspaces));

CREATE POLICY "Users can update purchase_orders in their workspace" 
ON purchase_orders FOR UPDATE USING (workspace_id IN (SELECT id FROM workspaces));

-- purchase_order_items (usando un pequeño truco para heredar via parent)
CREATE POLICY "Users can view purchase_order_items via parent" 
ON purchase_order_items FOR SELECT USING (
    purchase_order_id IN (SELECT id FROM purchase_orders)
);

CREATE POLICY "Users can insert purchase_order_items via parent" 
ON purchase_order_items FOR INSERT WITH CHECK (
    purchase_order_id IN (SELECT id FROM purchase_orders)
);

-- purchase_approvals
CREATE POLICY "Users can view purchase_approvals via parent" 
ON purchase_approvals FOR SELECT USING (
    purchase_order_id IN (SELECT id FROM purchase_orders)
);

CREATE POLICY "Users can insert purchase_approvals" 
ON purchase_approvals FOR INSERT WITH CHECK (
    purchase_order_id IN (SELECT id FROM purchase_orders)
);

-- warehouse_receipts
CREATE POLICY "Users can view warehouse_receipts from their workspace" 
ON warehouse_receipts FOR SELECT USING (workspace_id IN (SELECT id FROM workspaces));

CREATE POLICY "Users can create warehouse_receipts in their workspace" 
ON warehouse_receipts FOR INSERT WITH CHECK (workspace_id IN (SELECT id FROM workspaces));

-- warehouse_receipt_items
CREATE POLICY "Users can view warehouse_receipt_items via parent" 
ON warehouse_receipt_items FOR SELECT USING (
    receipt_id IN (SELECT id FROM warehouse_receipts)
);

CREATE POLICY "Users can insert warehouse_receipt_items via parent" 
ON warehouse_receipt_items FOR INSERT WITH CHECK (
    receipt_id IN (SELECT id FROM warehouse_receipts)
);
