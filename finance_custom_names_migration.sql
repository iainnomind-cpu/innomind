-- Migración para soportar "Deudores / Acreedores Libres" en Cuentas por Pagar
-- Agrega un campo para guardar el nombre cuando no existe un supplier_id vinculado.

ALTER TABLE public.accounts_payable
ADD COLUMN IF NOT EXISTS custom_supplier_name VARCHAR(255);

-- Opcionalmente, agregar el campo para notas de cargo por si se ocupa cliente libre a futuro
ALTER TABLE public.charge_notes
ADD COLUMN IF NOT EXISTS custom_client_name VARCHAR(255);
