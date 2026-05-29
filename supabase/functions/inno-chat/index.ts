import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "./utils/cors.ts";
import { validateWorkspaceAccess } from "./security/validator.ts";
import { orchestrateInnoChat } from "./orchestrator/index.ts";

/**
 * Punto de entrada principal de la Supabase Edge Function 'inno-chat' (Producción)
 */
serve(async (req) => {
  // Manejar el preflight de CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Cabecera de autorización faltante." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // 1. Instanciar cliente Supabase con el JWT del usuario autenticado para respetar RLS
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // 2. Obtener identidad del usuario del JWT
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Token de autenticación inválido o expirado." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Extraer y validar los parámetros del cuerpo
    const body = await req.json();
    console.log("=== [Edge Function inno-chat] PAYLOAD RECIBIDO ===");
    console.log("platform:", body.platform);
    console.log("moduleContext:", body.moduleContext);
    console.log("currentRoute:", body.currentRoute);
    console.log("workspaceId:", body.workspaceId);
    console.log("messagesCount:", body.messages ? body.messages.length : 0);
    console.log("==================================================");
    const { workspaceId, platform } = body;

    if (!workspaceId) {
      return new Response(JSON.stringify({ error: "El workspaceId es obligatorio." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!platform) {
      return new Response(JSON.stringify({
        error: 'Missing platform context'
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (platform !== "track" && platform !== "crm_erp") {
      return new Response(JSON.stringify({
        error: 'Invalid platform context'
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Validar pertenencia del usuario al workspace solicitado (Barrera de Seguridad Adicional)
    // Instanciamos el cliente de Supabase Admin con el Service Role Key para evadir bloqueos de RLS
    // en la consulta de lectura de la tabla de usuarios, cayendo en el cliente estándar de forma tolerante.
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseAdmin = supabaseServiceKey
      ? createClient(supabaseUrl, supabaseServiceKey)
      : supabase;

    const hasAccess = await validateWorkspaceAccess(supabaseAdmin, user.id, workspaceId);
    if (!hasAccess) {
      console.warn(`[Security] Usuario ${user.id} intentó acceder de forma inválida al workspace ${workspaceId}.`);
      return new Response(JSON.stringify({ error: "Acceso no autorizado al workspace solicitado." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 5. Orquestar la llamada a la IA de manera segura
    const result = await orchestrateInnoChat(supabase, user.id, workspaceId, body);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("[Fatal Error] Edge Function error:", err);
    return new Response(
      JSON.stringify({
        error: err.message || "Error interno del orquestador de IA.",
        fallback: true
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
