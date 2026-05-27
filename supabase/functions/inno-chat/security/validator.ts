import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Valida que el usuario tenga acceso legítimo al workspace que está consultando.
 * Esto actúa como una barrera de seguridad de nivel de API adicional a RLS.
 */
export async function validateWorkspaceAccess(
  supabase: SupabaseClient,
  userId: string,
  workspaceId: string
): Promise<boolean> {
  if (!userId || !workspaceId) return false;

  try {
    // Consultar el workspace del usuario autenticado
    const { data, error } = await supabase
      .from("users")
      .select("workspace")
      .eq("id", userId)
      .single();

    if (error || !data) {
      console.error(`[Security] Error al validar workspace para usuario ${userId}:`, error);
      return false;
    }

    return data.workspace === workspaceId;
  } catch (err) {
    console.error("[Security] Error en validateWorkspaceAccess:", err);
    return false;
  }
}
