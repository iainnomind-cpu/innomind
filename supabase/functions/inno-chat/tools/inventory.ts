import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Lee productos del inventario con su stock actual.
 */
export async function leerInventario(supabase: SupabaseClient, workspaceId: string, platform: "track" | "crm_erp") {
  if (platform === "track") {
    const { data, error } = await supabase
      .from("trak_inventory")
      .select("id, name, sku, category, quantity, unit, unit_cost, min_stock, description")
      .eq("workspace_id", workspaceId)
      .order("name", { ascending: true })
      .limit(15);

    if (error) throw error;
    // Inyectar plataforma
    const mapped = (data || []).map((i: any) => ({
      ...i,
      platform: "track"
    }));
    return JSON.stringify(mapped);
  } else if (platform === "crm_erp") {
    // CRM-ERP Products
    const { data, error } = await supabase
      .from("products")
      .select("id, nombre, codigo, categoria, precio, costo_promedio, unidad_medida, stock_minimo, descripcion, activo")
      .eq("workspace", workspaceId)
      .order("nombre", { ascending: true })
      .limit(15);

    if (error) throw error;

    // Adaptar nombres para consistencia de respuesta e inyectar plataforma
    const adapted = (data || []).map((p: any) => ({
      id: p.id,
      name: p.nombre,
      sku: p.codigo,
      category: p.categoria,
      quantity: 0, // El catálogo maestro lista existencias que se registran reactivamente
      unit: p.unidad_medida,
      unit_cost: p.costo_promedio,
      min_stock: p.stock_minimo,
      description: p.descripcion,
      price: p.precio,
      active: p.activo,
      platform: "crm_erp"
    }));

    return JSON.stringify(adapted);
  } else {
    throw new Error(`Plataforma no admitida para leerInventario: ${platform}`);
  }
}

/**
 * Registra un nuevo producto en el inventario.
 */
export async function crearProducto(supabase: SupabaseClient, workspaceId: string, args: any, platform: "track" | "crm_erp") {
  if (!args.nombre) {
    throw new Error("El nombre del producto es requerido.");
  }

  if (platform === "track") {
    const { data, error } = await supabase
      .from("trak_inventory")
      .insert({
        workspace_id: workspaceId,
        name: args.nombre,
        sku: args.sku || `SKU-${Math.floor(Math.random() * 100000)}`,
        category: args.categoria || "General",
        quantity: args.cantidad || 0,
        unit: args.unidad || "pieza",
        unit_cost: args.precio_unitario || 0,
        min_stock: args.stock_minimo || 5,
        description: args.descripcion || "",
      })
      .select()
      .single();

    if (error) throw error;
    return `Producto de Track "${args.nombre}" registrado exitosamente con ID ${data.id}.`;
  } else if (platform === "crm_erp") {
    // CRM-ERP products
    const { data, error } = await supabase
      .from("products")
      .insert({
        workspace: workspaceId,
        nombre: args.nombre,
        codigo: args.sku || `SKU-${Math.floor(Math.random() * 100000)}`,
        categoria: args.categoria || "General",
        precio: args.precio_unitario || 0,
        costo_promedio: args.precio_unitario || 0,
        unidad_medida: args.unidad || "pieza",
        stock_minimo: args.stock_minimo || 5,
        descripcion: args.descripcion || "",
        activo: true,
        tipo: "PRODUCTO",
        track_inventory: true
      })
      .select()
      .single();

    if (error) throw error;
    return `Producto de CRM-ERP "${args.nombre}" registrado exitosamente en el catálogo maestro con ID ${data.id}.`;
  } else {
    throw new Error(`Plataforma no admitida para crearProducto: ${platform}`);
  }
}
