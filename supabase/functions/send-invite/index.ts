import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, role, fullName } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "El correo es obligatorio." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Create Supabase client with the user's JWT (to maintain RLS/auth context)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authHeader = req.headers.get("Authorization")!;

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // 2. Call the RPC to create the invitation in the DB
    const { data, error } = await supabase.rpc("invite_team_member", {
      p_email: email,
      p_role: role || "EMPLOYEE",
      p_full_name: fullName || email.split("@")[0],
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If the RPC returned success: false (duplicate email, etc.)
    if (data && !data.success) {
      return new Response(JSON.stringify({ error: data.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Get the admin's company name for the email
    const { data: profileData } = await supabase
      .from("company_profiles")
      .select("nombre_empresa")
      .single();

    const companyName = profileData?.nombre_empresa || "Innomind ERP";

    // 4. Send email via Resend
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      // Still return success since the invitation was created in DB
      return new Response(
        JSON.stringify({
          success: true,
          message: "Invitación creada, pero el servicio de email no está configurado.",
          emailSent: false,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const APP_URL = Deno.env.get("APP_URL") || "https://innomind.app";

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%);border-radius:16px;border:1px solid #334155;overflow:hidden;">
              
              <!-- Header -->
              <tr>
                <td style="padding:40px 40px 20px;text-align:center;">
                  <h1 style="margin:0;color:#f8fafc;font-size:28px;font-weight:700;letter-spacing:4px;">INNOMIND</h1>
                  <p style="margin:4px 0 0;color:#64748b;font-size:11px;letter-spacing:2px;">MAKE IT BETTER WITH AI</p>
                </td>
              </tr>

              <!-- Main Content -->
              <tr>
                <td style="padding:20px 40px 30px;">
                  <div style="background:linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.1));border-radius:12px;padding:30px;border:1px solid rgba(99,102,241,0.2);">
                    <h2 style="margin:0 0 8px;color:#f8fafc;font-size:22px;font-weight:600;">¡Te han invitado! 🎉</h2>
                    <p style="margin:0;color:#94a3b8;font-size:15px;line-height:1.6;">
                      <strong style="color:#c4b5fd;">${companyName}</strong> te ha invitado a unirte a su equipo en Innomind como <strong style="color:#c4b5fd;">${role || "EMPLOYEE"}</strong>.
                    </p>
                  </div>
                </td>
              </tr>

              <!-- CTA Button -->
              <tr>
                <td style="padding:0 40px 30px;text-align:center;">
                  <a href="${APP_URL}/?invite=${encodeURIComponent(email)}" 
                     style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;border-radius:12px;letter-spacing:0.5px;">
                    Aceptar Invitación
                  </a>
                  <p style="margin:16px 0 0;color:#64748b;font-size:13px;">
                    Haz clic en el botón o ve a <a href="${APP_URL}" style="color:#818cf8;text-decoration:underline;">${APP_URL}</a> y regístrate con el correo <strong style="color:#94a3b8;">${email}</strong>
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding:20px 40px;border-top:1px solid #1e293b;text-align:center;">
                  <p style="margin:0;color:#475569;font-size:12px;">
                    © ${new Date().getFullYear()} Innomind · ERP Inteligente
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>`;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Innomind <onboarding@resend.dev>",
        to: [email],
        subject: `${companyName} te invita a unirte a Innomind`,
        html: emailHtml,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend error:", resendData);
      return new Response(
        JSON.stringify({
          success: true,
          message: "Invitación creada en el sistema, pero hubo un error al enviar el correo.",
          emailSent: false,
          emailError: resendData,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Invitación enviada exitosamente a ${email}.`,
        emailSent: true,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Edge Function error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Error interno del servidor." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
