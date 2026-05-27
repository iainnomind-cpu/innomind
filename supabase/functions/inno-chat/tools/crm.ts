import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Crea una nueva cotización comercial.
 */
export async function crearCotizacion(supabase: SupabaseClient, workspaceId: string, args: any, platform: "track" | "crm_erp") {
  if (!args.titulo || !args.items || !Array.isArray(args.items)) {
    throw new Error("El título y la lista de ítems son requeridos para cotizaciones.");
  }

  const quoteNumber = `COT-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;
  const subtotal = args.items.reduce((acc: number, item: any) => acc + (item.precio * item.cantidad), 0);
  const descuento = args.descuento || 0;
  const subtotalMenosDescuento = subtotal - descuento;
  const tax_amount = subtotalMenosDescuento * 0.16;
  const total = subtotalMenosDescuento + tax_amount;

  if (platform === "track") {
    // Cotizaciones en la plataforma TRACK
    const { data: quoteData, error: quoteError } = await supabase
      .from("trak_quotes")
      .insert({
        workspace_id: workspaceId,
        quote_number: quoteNumber,
        title: args.titulo,
        client_id: args.client_id || null,
        subtotal,
        discount: descuento,
        tax_rate: 16,
        tax_amount,
        total,
        status: "draft",
        notes: args.notes || "",
      })
      .select("id")
      .single();

    if (quoteError) throw quoteError;

    if (quoteData) {
      const itemsToInsert = args.items.map((i: any, index: number) => ({
        quote_id: quoteData.id,
        name: i.nombre,
        description: i.descripcion || "",
        quantity: i.cantidad,
        unit_price: i.precio,
        total: i.cantidad * i.precio,
        order_index: index,
      }));
      const { error: itemsError } = await supabase.from("trak_quote_items").insert(itemsToInsert);
      if (itemsError) throw itemsError;
    }

    if (args.client_id) {
      await supabase
        .from("trak_clients")
        .update({ status: "active", pipeline_stage: "won" })
        .eq("id", args.client_id);
    }

    return `Cotización de Track "${args.titulo}" creada exitosamente como Borrador con folio ${quoteNumber}. Total: $${total.toLocaleString("es-MX")}.`;
  } else if (platform === "crm_erp") {
    // Cotizaciones en la plataforma CRM-ERP
    const { data: quoteData, error: quoteError } = await supabase
      .from("quotes")
      .insert({
        workspace: workspaceId,
        numero: quoteNumber,
        fecha: new Date().toISOString().split("T")[0],
        vigencia: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 15 días vigencia
        subtotal,
        descuento,
        iva_porcentaje: 16,
        iva_total: tax_amount,
        total,
        estado: "Borrador",
        condiciones_pago: args.notes || "Pago de contado",
        metodos_pago_aceptados: ["Transferencia", "Tarjeta"],
        notas_adicionales: args.notes || "",
        terminos_condiciones: "Precios en MXN sujetos a cambios.",
        prospect_id: args.client_id || null,
        items: args.items.map((i: any) => ({
          descripcion: i.descripcion || i.nombre,
          cantidad: i.cantidad,
          precioUnitario: i.precio,
          subtotal: i.cantidad * i.precio
        }))
      })
      .select("id")
      .single();

    if (quoteError) throw quoteError;

    // Actualizar etapa de prospecto si aplica
    if (args.client_id) {
      await supabase
        .from("prospects")
        .update({ estado: "Cotizado" })
        .eq("id", args.client_id);
    }

    return `Cotización de CRM-ERP "${args.titulo}" creada exitosamente como Borrador con Folio ${quoteNumber}. Total: $${total.toLocaleString("es-MX")}.`;
  } else {
    throw new Error(`Plataforma no admitida para crearCotizacion: ${platform}`);
  }
}

/**
 * Lee cotizaciones, limitando la cantidad y campos según la plataforma.
 */
export async function leerCotizaciones(supabase: SupabaseClient, workspaceId: string, platform: "track" | "crm_erp") {
  if (platform === "track") {
    const { data, error } = await supabase
      .from("trak_quotes")
      .select("id, quote_number, title, status, total, subtotal, tax_amount, discount, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;
    // Inyectar el parámetro de plataforma de forma explícita
    const mapped = (data || []).map((q: any) => ({
      ...q,
      platform: "track"
    }));
    return JSON.stringify(mapped);
  } else if (platform === "crm_erp") {
    const { data, error } = await supabase
      .from("quotes")
      .select("id, numero, fecha, vigencia, estado, total, subtotal, descuento, iva_total, created_at")
      .eq("workspace", workspaceId)
      .order("fecha", { ascending: false })
      .limit(10);

    if (error) throw error;
    // Adaptar nombres para consistencia de respuesta e inyectar plataforma
    const adapted = (data || []).map((q: any) => ({
      id: q.id,
      quote_number: q.numero,
      title: `Cotización ${q.numero}`,
      status: q.estado,
      total: q.total,
      subtotal: q.subtotal,
      tax_amount: q.iva_total,
      discount: q.descuento,
      created_at: q.fecha || q.created_at,
      platform: "crm_erp"
    }));

    return JSON.stringify(adapted);
  } else {
    throw new Error(`Plataforma no admitida para leerCotizaciones: ${platform}`);
  }
}

/**
 * Crea un nuevo cliente/prospecto.
 */
export async function crearCliente(supabase: SupabaseClient, workspaceId: string, args: any, platform: "track" | "crm_erp") {
  if (!args.nombre) {
    throw new Error("El nombre es requerido.");
  }

  if (platform === "track") {
    if (!args.email) {
      throw new Error("El correo electrónico del cliente es requerido en Track.");
    }
    const { data, error } = await supabase
      .from("trak_clients")
      .insert({
        workspace_id: workspaceId,
        contact_name: args.nombre,
        email: args.email,
        phone: args.telefono || null,
        company_name: args.empresa || args.nombre,
        status: "lead",
        pipeline_stage: "new",
        notes: args.notes || "",
      })
      .select()
      .single();

    if (error) throw error;
    return `Cliente de Track "${args.nombre}" creado exitosamente con ID ${data.id}.`;
  } else if (platform === "crm_erp") {
    // CRM-ERP prospects
    const { data, error } = await supabase
      .from("prospects")
      .insert({
        workspace: workspaceId,
        nombre: args.nombre,
        empresa: args.empresa || "Prospecto Individual",
        correo: args.email || "",
        telefono: args.telefono || "",
        cargo: args.cargo || "Contacto Principal",
        estado: "Contacto", // Estado inicial en CRM-ERP
        plataforma: "Web",
        notas_internas: args.notes || ""
      })
      .select()
      .single();

    if (error) throw error;
    return `Prospecto de CRM-ERP "${args.nombre}" registrado exitosamente en el embudo con ID ${data.id}.`;
  } else {
    throw new Error(`Plataforma no admitida para crearCliente: ${platform}`);
  }
}

/**
 * Lee clientes/prospectos limitando columnas y conteo.
 */
export async function leerClientes(supabase: SupabaseClient, workspaceId: string, platform: "track" | "crm_erp") {
  if (platform === "track") {
    const { data, error } = await supabase
      .from("trak_clients")
      .select("id, company_name, contact_name, email, phone, status, pipeline_stage, industry")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(15);

    if (error) throw error;
    // Inyectar el parámetro de plataforma
    const mapped = (data || []).map((c: any) => ({
      ...c,
      platform: "track"
    }));
    return JSON.stringify(mapped);
  } else if (platform === "crm_erp") {
    // CRM-ERP prospects
    const { data, error } = await supabase
      .from("prospects")
      .select("id, nombre, empresa, cargo, telefono, correo, estado, valor_estimado, origen")
      .eq("workspace", workspaceId)
      .order("created_at", { ascending: false })
      .limit(15);

    if (error) throw error;

    // Adaptar nombres para consistencia de respuesta e inyectar plataforma
    const adapted = (data || []).map((p: any) => ({
      id: p.id,
      company_name: p.empresa,
      contact_name: p.nombre,
      email: p.correo,
      phone: p.telefono,
      status: p.estado,
      pipeline_stage: p.estado,
      industry: p.origen || "CRM",
      platform: "crm_erp"
    }));

    return JSON.stringify(adapted);
  } else {
    throw new Error(`Plataforma no admitida para leerClientes: ${platform}`);
  }
}
