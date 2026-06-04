import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Crea una nueva nota en la Base de Conocimiento (Nodo).
 */
export async function crearNota(supabase: SupabaseClient, workspaceId: string, args: any, platform: "track" | "crm_erp") {
  if (platform !== "crm_erp") {
    return "Las notas colaborativas solo están disponibles en el contexto de CRM-ERP (Nodo/Workspace).";
  }

  if (!args.titulo) {
    throw new Error("El título de la nota es requerido.");
  }

  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || null;

  if (!userId) {
    throw new Error("No se pudo obtener el ID del usuario autenticado para asignar el creador de la nota.");
  }

  // Si no se proporciona un spaceId, buscar o crear un espacio general por defecto
  let spaceId = args.spaceId;
  if (!spaceId) {
    const { data: spaces } = await supabase
      .from("workspace_spaces")
      .select("id")
      .eq("workspace", workspaceId)
      .eq("type", "GENERAL")
      .limit(1);
    
    if (spaces && spaces.length > 0) {
      spaceId = spaces[0].id;
    } else {
      // Crear espacio general por defecto si no existe
      const { data: newSpace } = await supabase
        .from("workspace_spaces")
        .insert({
          workspace: workspaceId,
          name: "General",
          type: "GENERAL",
          is_private: false,
          created_by: userId
        })
        .select()
        .single();
      if (newSpace) spaceId = newSpace.id;
    }
  }

  if (!spaceId) {
    throw new Error("No se pudo resolver un canal/espacio para guardar la nota.");
  }

  const { data, error } = await supabase
    .from("workspace_notes")
    .insert({
      workspace: workspaceId,
      space_id: spaceId,
      title: args.titulo,
      content_json: args.contenido || "",
      created_by: userId
    })
    .select()
    .single();

  if (error) throw error;
  return `Nota "${args.titulo}" creada exitosamente.`;
}

/**
 * Crea un evento o recordatorio en el calendario (CRM-ERP).
 */
export async function crearRecordatorio(supabase: SupabaseClient, workspaceId: string, args: any, platform: "track" | "crm_erp") {
  if (platform !== "crm_erp") {
    return "La creación de eventos de calendario directa está disponible en CRM-ERP.";
  }

  if (!args.titulo || !args.fecha_inicio) {
    throw new Error("El título y la fecha de inicio son requeridos.");
  }

  let start_time = args.fecha_inicio;
  let end_time = args.fecha_fin;

  // Si solo mandan fecha (YYYY-MM-DD), agregar hora por defecto
  if (start_time.length === 10) start_time += "T09:00:00Z";
  if (!end_time) {
    // Por defecto 1 hora después del inicio
    const d = new Date(start_time);
    d.setHours(d.getHours() + 1);
    end_time = d.toISOString();
  } else if (end_time.length === 10) {
    end_time += "T10:00:00Z";
  }

  const { data, error } = await supabase
    .from("calendar_events")
    .insert({
      workspace: workspaceId,
      title: args.titulo,
      description: args.descripcion || "",
      start_time,
      end_time,
      type: args.tipo || "recordatorio",
    })
    .select()
    .single();

  if (error) throw error;
  return `Evento de calendario "${args.titulo}" (Tipo: ${args.tipo || 'recordatorio'}) creado exitosamente para el ${start_time.split("T")[0]}.`;
}
