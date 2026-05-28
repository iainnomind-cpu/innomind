import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Obtiene saldos de cuentas bancarias y un resumen de cobros, pagos o gastos del ERP.
 */
export async function leerFinanzas(supabase: SupabaseClient, workspaceId: string, args: any, platform: "track" | "crm_erp") {
  if (platform !== "crm_erp") {
    throw new Error(`Finanzas es un módulo exclusivo de la plataforma CRM-ERP. Intento de acceso no autorizado desde: ${platform}`);
  }

  console.log("=== FINANCE_SUMMARY_START ===");
  console.log("workspaceId recibido:", workspaceId);
  console.log("currentRoute recibido:", args.currentRoute || "No especificado");
  console.log("=== [leerFinanzas] INICIANDO DIAGNÓSTICO FINANCIERO CONSOLIDADO ===");

  const diagnostics: any[] = [];
  const results: any = {
    cuentas: [],
    cuentas_cobrar: [],
    cuentas_pagar: [],
    gastos: [],
    movimientos_bancarios: [],
    movimientos_tesoreria: [],
    diagnosticos: diagnostics
  };

  // Helper para ejecutar consultas con filtros tolerantes (workspace y workspace_id)
  const safeQuery = async (
    tableName: string, 
    selectFields: string, 
    filterColumn: "workspace" | "workspace_id"
  ) => {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select(selectFields)
        .eq(filterColumn, workspaceId);

      if (error) {
        console.error("FINANCE_SUMMARY_ERROR", {
          table: tableName,
          errorCode: error.code,
          message: error.message,
          details: error.details
        });
        return { success: false, error, data: null };
      }
      return { success: true, error: null, data };
    } catch (err: any) {
      console.error("FINANCE_SUMMARY_ERROR", {
        table: tableName,
        errorCode: err.code || "FATAL_CATCH",
        message: err.message,
        details: err.stack
      });
      return { success: false, error: err, data: null };
    }
  };

  const executeResilientQuery = async (
    tableName: string,
    selectFields: string,
    preferredColumn: "workspace" | "workspace_id"
  ) => {
    // Intentar con la columna preferida
    let res = await safeQuery(tableName, selectFields, preferredColumn);
    if (!res.success) {
      // Si falla, intentar con la columna alternativa
      const alternativeColumn = preferredColumn === "workspace" ? "workspace_id" : "workspace";
      console.log(`[Diagnostic] Query a '${tableName}' falló con ${preferredColumn}. Intentando con '${alternativeColumn}'...`);
      const altRes = await safeQuery(tableName, selectFields, alternativeColumn);
      if (altRes.success) {
        res = altRes;
      }
    }
    return res;
  };

  // 1. Cuentas Financieras (finance_accounts)
  const qAccounts = await executeResilientQuery("finance_accounts", "id, nombre, tipo, saldo_actual, moneda, activo", "workspace");
  diagnostics.push({
    tabla: "finance_accounts",
    exitoso: qAccounts.success,
    registros: qAccounts.data ? qAccounts.data.length : 0,
    error: qAccounts.error ? qAccounts.error.message : null,
    platform: "crm_erp"
  });
  if (qAccounts.success && qAccounts.data) {
    results.cuentas = qAccounts.data.map((a: any) => ({ ...a, platform: "crm_erp" }));
  }

  // 2. Cuentas por cobrar (charge_notes)
  const qReceivables = await executeResilientQuery("charge_notes", "id, note_number, total_amount, balance_due, status, due_date, issue_date", "workspace_id");
  diagnostics.push({
    tabla: "charge_notes",
    exitoso: qReceivables.success,
    registros: qReceivables.data ? qReceivables.data.length : 0,
    error: qReceivables.error ? qReceivables.error.message : null,
    platform: "crm_erp"
  });
  if (qReceivables.success && qReceivables.data) {
    results.cuentas_cobrar = qReceivables.data.map((r: any) => ({ ...r, platform: "crm_erp" }));
  }

  // 3. Cuentas por pagar (accounts_payable)
  const qPayables = await executeResilientQuery("accounts_payable", "id, concept, amount, balance_due, status, due_date", "workspace_id");
  diagnostics.push({
    tabla: "accounts_payable",
    exitoso: qPayables.success,
    registros: qPayables.data ? qPayables.data.length : 0,
    error: qPayables.error ? qPayables.error.message : null,
    platform: "crm_erp"
  });
  if (qPayables.success && qPayables.data) {
    results.cuentas_pagar = qPayables.data.map((p: any) => ({ ...p, platform: "crm_erp" }));
  }

  // 4. Gastos directos (expenses)
  const qExpenses = await executeResilientQuery("expenses", "id, amount, category, description, expense_date", "workspace_id");
  diagnostics.push({
    tabla: "expenses",
    exitoso: qExpenses.success,
    registros: qExpenses.data ? qExpenses.data.length : 0,
    error: qExpenses.error ? qExpenses.error.message : null,
    platform: "crm_erp"
  });
  if (qExpenses.success && qExpenses.data) {
    results.gastos = qExpenses.data.map((e: any) => ({ ...e, platform: "crm_erp" }));
  }

  // 5. Movimientos bancarios (bank_movements)
  const qBankMovements = await executeResilientQuery("bank_movements", "id, amount, movement_date, movement_type, description", "workspace_id");
  diagnostics.push({
    tabla: "bank_movements",
    exitoso: qBankMovements.success,
    registros: qBankMovements.data ? qBankMovements.data.length : 0,
    error: qBankMovements.error ? qBankMovements.error.message : null,
    platform: "crm_erp"
  });
  if (qBankMovements.success && qBankMovements.data) {
    results.movimientos_bancarios = qBankMovements.data.map((m: any) => ({ ...m, platform: "crm_erp" }));
  }

  // 6. Movimientos de tesorería (treasury_movements)
  const qTreasuryMovements = await executeResilientQuery("treasury_movements", "id, amount, created_at, movement_type, description", "workspace_id");
  diagnostics.push({
    tabla: "treasury_movements",
    exitoso: qTreasuryMovements.success,
    registros: qTreasuryMovements.data ? qTreasuryMovements.data.length : 0,
    error: qTreasuryMovements.error ? qTreasuryMovements.error.message : null,
    platform: "crm_erp"
  });
  if (qTreasuryMovements.success && qTreasuryMovements.data) {
    results.movimientos_tesoreria = qTreasuryMovements.data.map((t: any) => ({ ...t, platform: "crm_erp" }));
  }

  console.log("=== [leerFinanzas] RESULTADOS DE DIAGNÓSTICO FINANCIERO ===");
  console.log(JSON.stringify(diagnostics, null, 2));
  console.log("===============================================================");

  return JSON.stringify(results);
}

/**
 * Registra un nuevo egreso/gasto en el ERP de CRM-ERP.
 */
export async function crearGasto(supabase: SupabaseClient, workspaceId: string, args: any, platform: "track" | "crm_erp") {
  if (platform !== "crm_erp") {
    throw new Error(`Finanzas es un módulo exclusivo de la plataforma CRM-ERP. Intento de escritura no autorizado desde: ${platform}`);
  }

  if (!args.concepto || !args.monto) {
    throw new Error("El concepto y el monto del gasto son requeridos.");
  }

  const { data, error } = await supabase
    .from("finance_documents")
    .insert({
      workspace: workspaceId,
      tipo: "GASTO",
      estado: "PENDIENTE",
      concepto: args.concepto,
      monto_total: args.monto,
      saldo_pendiente: args.monto,
      moneda: "MXN",
      fecha_emision: args.fecha_emision || new Date().toISOString().split("T")[0],
      proveedor_nombre: args.proveedor || "Gastos Diversos",
      categoria: args.categoria || "General",
      numero_folio: `GST-${Math.floor(Math.random() * 100000)}`
    })
    .select()
    .single();

  if (error) throw error;
  return `Gasto de $${args.monto.toLocaleString("es-MX")} por "${args.concepto}" registrado exitosamente en CRM-ERP con Folio ${data.numero_folio}.`;
}

/**
 * Registra una cuenta por pagar a proveedores.
 */
export async function crearCuentaPagar(supabase: SupabaseClient, workspaceId: string, args: any, platform: "track" | "crm_erp") {
  if (platform !== "crm_erp") {
    throw new Error(`Finanzas es un módulo exclusivo de la plataforma CRM-ERP. Intento de escritura no autorizado desde: ${platform}`);
  }

  if (!args.concepto || !args.monto || !args.proveedor || !args.fecha_vencimiento) {
    throw new Error("El concepto, monto, proveedor y fecha de vencimiento son requeridos.");
  }

  const { data, error } = await supabase
    .from("finance_documents")
    .insert({
      workspace: workspaceId,
      tipo: "CUENTA_PAGAR",
      estado: "PENDIENTE",
      concepto: args.concepto,
      monto_total: args.monto,
      saldo_pendiente: args.monto,
      moneda: "MXN",
      fecha_emision: args.fecha_emision || new Date().toISOString().split("T")[0],
      fecha_vencimiento: args.fecha_vencimiento,
      proveedor_nombre: args.proveedor,
      numero_folio: `CXP-${Math.floor(Math.random() * 100000)}`
    })
    .select()
    .single();

  if (error) throw error;
  return `Cuenta por Pagar a "${args.proveedor}" de $${args.monto.toLocaleString("es-MX")} (Vence: ${args.fecha_vencimiento}) registrada exitosamente en CRM-ERP con Folio ${data.numero_folio}.`;
}

/**
 * Registra una cuenta por cobrar (Nota de Cargo).
 */
export async function crearCuentaCobrar(supabase: SupabaseClient, workspaceId: string, args: any, platform: "track" | "crm_erp") {
  if (platform !== "crm_erp") {
    throw new Error(`Finanzas es un módulo exclusivo de la plataforma CRM-ERP. Intento de escritura no autorizado desde: ${platform}`);
  }

  if (!args.concepto || !args.monto) {
    throw new Error("El concepto y el monto de la cuenta por cobrar son requeridos.");
  }

  const { data, error } = await supabase
    .from("finance_documents")
    .insert({
      workspace: workspaceId,
      tipo: "NOTA_CARGO",
      estado: "PENDIENTE",
      concepto: args.concepto,
      monto_total: args.monto,
      saldo_pendiente: args.monto,
      moneda: "MXN",
      fecha_emision: args.fecha_emision || new Date().toISOString().split("T")[0],
      fecha_vencimiento: args.fecha_vencimiento || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // default 30 days
      prospect_id: args.prospect_id || null,
      numero_folio: `CXC-${Math.floor(Math.random() * 100000)}`
    })
    .select()
    .single();

  if (error) throw error;
  return `Cuenta por Cobrar de $${args.monto.toLocaleString("es-MX")} por "${args.concepto}" registrada exitosamente en CRM-ERP con Folio ${data.numero_folio}.`;
}
