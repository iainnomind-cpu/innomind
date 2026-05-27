import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Obtiene saldos de cuentas bancarias y un resumen de cobros, pagos o gastos del ERP.
 */
export async function leerFinanzas(supabase: SupabaseClient, workspaceId: string, args: any, platform: "track" | "crm_erp") {
  if (platform !== "crm_erp") {
    throw new Error(`Finanzas es un módulo exclusivo de la plataforma CRM-ERP. Intento de acceso no autorizado desde: ${platform}`);
  }

  const seccion = args.seccion || "todo";
  const tipoDoc = args.tipo_documento;

  const results: any = {};

  try {
    // 1. Cuentas Financieras (Bancos, Cajas)
    if (seccion === "todo" || seccion === "cuentas") {
      const { data: accounts, error: accError } = await supabase
        .from("finance_accounts")
        .select("id, nombre, tipo, moneda, saldo_actual, activo")
        .eq("workspace", workspaceId)
        .eq("activo", true)
        .order("nombre", { ascending: true });

      if (accError) throw accError;
      results.cuentas = (accounts || []).map((a: any) => ({
        ...a,
        platform: "crm_erp"
      }));
    }

    // 2. Documentos Financieros (CxP, CxC, Gastos)
    if (seccion === "todo" || seccion === "documentos") {
      let query = supabase
        .from("finance_documents")
        .select("id, tipo, estado, numero_folio, monto_total, saldo_pendiente, fecha_emision, fecha_vencimiento, concepto, proveedor_nombre, categoria")
        .eq("workspace", workspaceId);

      if (tipoDoc) {
        query = query.eq("tipo", tipoDoc);
      }

      const { data: docs, error: docError } = await query
        .order("fecha_emision", { ascending: false })
        .limit(15);

      if (docError) throw docError;
      results.documentos = (docs || []).map((d: any) => ({
        ...d,
        platform: "crm_erp"
      }));
    }

    return JSON.stringify(results);
  } catch (err: any) {
    throw new Error(`Error al leer información financiera: ${err.message}`);
  }
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
