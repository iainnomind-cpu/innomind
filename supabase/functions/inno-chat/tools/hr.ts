import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Obtiene el directorio de empleados de Recursos Humanos.
 */
export async function leerEmpleados(supabase: SupabaseClient, workspaceId: string, platform: "track" | "crm_erp") {
  if (platform !== "track") {
    throw new Error(`Recursos Humanos es un módulo exclusivo de la plataforma Track. Intento de acceso no autorizado desde: ${platform}`);
  }

  const { data, error } = await supabase
    .from("trak_employees")
    .select("id, first_name, last_name, email, position, department, status, hire_date")
    .eq("workspace_id", workspaceId)
    .order("first_name", { ascending: true })
    .limit(15);

  if (error) throw error;

  // Inyectar el parámetro de plataforma
  const mapped = (data || []).map((e: any) => ({
    ...e,
    platform: "track"
  }));

  return JSON.stringify(mapped);
}

/**
 * Registra un nuevo empleado en Recursos Humanos.
 */
export async function crearEmpleado(supabase: SupabaseClient, workspaceId: string, args: any, platform: "track" | "crm_erp") {
  if (platform !== "track") {
    throw new Error(`Recursos Humanos es un módulo exclusivo de la plataforma Track. Intento de escritura no autorizado desde: ${platform}`);
  }

  if (!args.nombre || !args.email) {
    throw new Error("El nombre y el correo electrónico del empleado son requeridos.");
  }

  const { data, error } = await supabase
    .from("trak_employees")
    .insert({
      workspace_id: workspaceId,
      first_name: args.nombre,
      last_name: args.apellido || "",
      email: args.email,
      phone: args.telefono || null,
      position: args.puesto || "",
      department: args.departamento || "General",
      status: "active",
      birth_date: null,
      hire_date: args.fecha_ingreso || new Date().toISOString().split("T")[0],
    })
    .select()
    .single();

  if (error) throw error;
  return `Empleado "${args.nombre} ${args.apellido || ""}" registrado exitosamente en Recursos Humanos con ID ${data.id}.`;
}
