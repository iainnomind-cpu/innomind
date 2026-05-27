import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Crea un nuevo proyecto.
 */
export async function crearProyecto(supabase: SupabaseClient, workspaceId: string, args: any, platform: "track" | "crm_erp") {
  if (platform === "crm_erp") {
    return "Lo siento, la gestión de proyectos está activa únicamente en la plataforma Track. Puedes cambiar a la pestaña de Track para crear y administrar tus proyectos.";
  } else if (platform === "track") {
    if (!args.nombre) {
      throw new Error("El nombre del proyecto es requerido.");
    }

    const { data, error } = await supabase
      .from("trak_projects")
      .insert({
        workspace_id: workspaceId,
        name: args.nombre,
        description: args.descripcion || "",
        budget: args.presupuesto || 0,
        status: "planning",
        priority: args.prioridad || "medium",
        color: "#9333ea",
        client_id: args.client_id || null,
      })
      .select()
      .single();

    if (error) throw error;

    if (args.client_id) {
      await supabase
        .from("trak_clients")
        .update({ status: "active", pipeline_stage: "won" })
        .eq("id", args.client_id);
    }

    return `Proyecto de Track "${args.nombre}" creado exitosamente con ID ${data.id}.`;
  } else {
    throw new Error(`Plataforma no admitida para crearProyecto: ${platform}`);
  }
}

/**
 * Lee la lista de proyectos del workspace, limitando columnas y cantidad para control de tokens.
 */
export async function leerProyectos(supabase: SupabaseClient, workspaceId: string, platform: "track" | "crm_erp") {
  if (platform === "crm_erp") {
    return "La gestión de proyectos es exclusiva del módulo Track. Puedes dirigirte a la sección de Track para visualizar tus proyectos.";
  } else if (platform === "track") {
    const { data, error } = await supabase
      .from("trak_projects")
      .select("id, name, status, priority, budget, progress, estimated_end_date, color")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(15);

    if (error) throw error;
    // Inyectar el parámetro de plataforma
    const mapped = (data || []).map((p: any) => ({
      ...p,
      platform: "track"
    }));
    return JSON.stringify(mapped);
  } else {
    throw new Error(`Plataforma no admitida para leerProyectos: ${platform}`);
  }
}

/**
 * Crea una nueva tarea en el sistema.
 */
export async function crearTarea(supabase: SupabaseClient, workspaceId: string, args: any, platform: "track" | "crm_erp") {
  if (!args.titulo) {
    throw new Error("El título de la tarea es requerido.");
  }

  if (platform === "track") {
    const insertData: any = {
      workspace_id: workspaceId,
      title: args.titulo,
      description: args.descripcion || "",
      status: "todo",
      priority: args.prioridad || "medium",
    };
    if (args.proyecto_id) insertData.project_id = args.proyecto_id;
    if (args.fecha_limite) insertData.due_date = args.fecha_limite;

    const { data, error } = await supabase
      .from("trak_tasks")
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return `Tarea de Track "${args.titulo}" creada exitosamente con ID ${data.id}.`;
  } else if (platform === "crm_erp") {
    // CRM-ERP workspace_tasks
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;

    if (!userId) {
      throw new Error("No se pudo obtener el ID del usuario autenticado para asignar el creador de la tarea.");
    }

    const priorityMap: Record<string, string> = {
      low: "BAJA",
      medium: "MEDIA",
      high: "ALTA",
      critical: "URGENTE"
    };

    const insertData: any = {
      workspace: workspaceId,
      title: args.titulo,
      description: args.descripcion || "",
      status: "PENDIENTE",
      priority: priorityMap[args.prioridad || "medium"] || "MEDIA",
      created_by: userId
    };

    if (args.fecha_limite) insertData.due_date = args.fecha_limite;

    const { data, error } = await supabase
      .from("workspace_tasks")
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return `Tarea colaborativa de CRM-ERP "${args.titulo}" creada exitosamente con ID ${data.id}.`;
  } else {
    throw new Error(`Plataforma no admitida para crearTarea: ${platform}`);
  }
}

/**
 * Obtiene las tareas pendientes de forma resumida para control de tokens.
 */
export async function obtenerTareasPendientes(supabase: SupabaseClient, workspaceId: string, platform: "track" | "crm_erp") {
  if (platform === "track") {
    const { data, error } = await supabase
      .from("trak_tasks")
      .select("id, title, status, priority, due_date, project_id")
      .eq("workspace_id", workspaceId)
      .neq("status", "done")
      .order("priority", { ascending: false })
      .limit(15);

    if (error) throw error;
    // Inyectar el parámetro de plataforma
    const mapped = (data || []).map((t: any) => ({
      ...t,
      platform: "track"
    }));
    return JSON.stringify(mapped);
  } else if (platform === "crm_erp") {
    // CRM-ERP workspace_tasks
    const { data, error } = await supabase
      .from("workspace_tasks")
      .select("id, title, status, priority, due_date")
      .eq("workspace", workspaceId)
      .neq("status", "COMPLETADA")
      .order("created_at", { ascending: false })
      .limit(15);

    if (error) throw error;

    // Adaptar campos para mantener consistencia con el formato esperado por el orquestador
    const adapted = (data || []).map((t: any) => ({
      id: t.id,
      title: t.title,
      status: t.status.toLowerCase(),
      priority: t.priority.toLowerCase() === "baja" ? "low" : t.priority.toLowerCase() === "urgente" ? "critical" : t.priority.toLowerCase() === "alta" ? "high" : "medium",
      due_date: t.due_date ? t.due_date.split("T")[0] : null,
      platform: "crm_erp"
    }));

    return JSON.stringify(adapted);
  } else {
    throw new Error(`Plataforma no admitida para obtenerTareasPendientes: ${platform}`);
  }
}

/**
 * Obtiene los eventos del calendario unificados según la plataforma.
 */
export async function obtenerEventosCalendario(supabase: SupabaseClient, workspaceId: string, platform: "track" | "crm_erp") {
  const today = new Date().toISOString().split("T")[0];

  if (platform === "track") {
    const [tasksRes, projectsRes, quotesRes] = await Promise.all([
      supabase
        .from("trak_tasks")
        .select("title, due_date, priority, status")
        .eq("workspace_id", workspaceId)
        .neq("status", "done")
        .not("due_date", "is", null)
        .limit(10),
      supabase
        .from("trak_projects")
        .select("name, estimated_end_date, status")
        .eq("workspace_id", workspaceId)
        .neq("status", "completed")
        .not("estimated_end_date", "is", null)
        .limit(10),
      supabase
        .from("trak_quotes")
        .select("title, quote_number, valid_until, status")
        .eq("workspace_id", workspaceId)
        .not("valid_until", "is", null)
        .in("status", ["draft", "sent"])
        .limit(10),
    ]);

    const events = [
      ...(tasksRes.data || []).map((t) => ({
        tipo: "Tarea",
        titulo: t.title,
        fecha: t.due_date || "",
        prioridad: t.priority,
        estado: t.status,
        vencida: t.due_date ? t.due_date < today : false,
        platform: "track"
      })),
      ...(projectsRes.data || []).map((p) => ({
        tipo: "Proyecto",
        titulo: p.name,
        fecha: p.estimated_end_date || "",
        estado: p.status,
        vencida: p.estimated_end_date ? p.estimated_end_date < today : false,
        platform: "track"
      })),
      ...(quotesRes.data || []).map((q) => ({
        tipo: "Cotización",
        titulo: `${q.quote_number} - ${q.title}`,
        fecha: q.valid_until || "",
        estado: q.status,
        vencida: q.valid_until ? q.valid_until < today : false,
        platform: "track"
      })),
    ]
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
      .slice(0, 20);

    return JSON.stringify(events.length > 0 ? events : { mensaje: "No hay eventos próximos en el calendario de Track." });
  } else if (platform === "crm_erp") {
    // CRM-ERP calendar_events
    const { data, error } = await supabase
      .from("calendar_events")
      .select("title, description, start_time, end_time, type")
      .eq("workspace", workspaceId)
      .order("start_time", { ascending: true })
      .limit(15);

    if (error) throw error;

    const events = (data || []).map((e: any) => {
      const fecha = e.start_time ? e.start_time.split("T")[0] : today;
      return {
        tipo: e.type || "Evento",
        titulo: e.title,
        fecha,
        estado: "Activo",
        prioridad: "medium",
        vencida: fecha < today,
        platform: "crm_erp"
      };
    });

    return JSON.stringify(events.length > 0 ? events : { mensaje: "No hay eventos próximos en el calendario de CRM-ERP." });
  } else {
    throw new Error(`Plataforma no admitida para obtenerEventosCalendario: ${platform}`);
  }
}
