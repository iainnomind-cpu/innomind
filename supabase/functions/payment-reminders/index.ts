import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        // Using service role key to bypass RLS for background jobs
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 1. Mark past due notes as overdue
        const { error: overdueError } = await supabase
            .from('charge_notes')
            .update({ status: 'overdue' })
            .in('status', ['pending', 'partial'])
            .lt('due_date', new Date().toISOString().split('T')[0]);

        if (overdueError) {
            console.error("Error updating overdue charge notes:", overdueError);
        }

        // 2. Fetch charge notes that need reminders (3, 5, 7 days before due date)
        // In PostgreSQL, you could write a more complex query. We'll do a simple select
        // and filter in memory since we are in an edge function (or use PostgREST filters)

        // Target dates
        const today = new Date();
        const plus3 = new Date(today); plus3.setDate(today.getDate() + 3);
        const plus5 = new Date(today); plus5.setDate(today.getDate() + 5);
        const plus7 = new Date(today); plus7.setDate(today.getDate() + 7);

        const d3 = plus3.toISOString().split('T')[0];
        const d5 = plus5.toISOString().split('T')[0];
        const d7 = plus7.toISOString().split('T')[0];

        const { data: notes, error: notesError } = await supabase
            .from('charge_notes')
            .select(`
        id, 
        note_number, 
        due_date, 
        balance_due, 
        status,
        client_id,
        workspace_id,
        clientes ( nombre, email ),
        company_profiles ( nombre_empresa )
      `)
            .in('status', ['pending', 'partial'])
            .in('due_date', [d3, d5, d7]);

        if (notesError) throw notesError;

        let emailsSent = 0;

        // 3. Send emails
        if (RESEND_API_KEY && notes && notes.length > 0) {
            for (const note of notes) {
                const clientEmail = note.clientes?.email;
                const clientName = note.clientes?.nombre;
                const companyName = note.company_profiles?.nombre_empresa || "Nuestra Empresa";

                if (!clientEmail) continue;

                const daysLeft = note.due_date === d3 ? 3 : (note.due_date === d5 ? 5 : 7);

                const emailHtml = `
          <div style="font-family: Arial, sans-serif; background: #f9fafb; padding: 40px;">
            <div style="background: white; border-radius: 8px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1e293b; margin-top: 0;">Recordatorio de Pago</h2>
              <p style="color: #475569; font-size: 16px;">Hola <strong>${clientName}</strong>,</p>
              <p style="color: #475569; font-size: 16px;">
                Este es un recordatorio amistoso de que tu nota de cargo <strong>${note.note_number}</strong> está próxima a vencer en ${daysLeft} días, el <strong>${note.due_date}</strong>.
              </p>
              <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #1e3a8a; font-size: 18px;">Saldo pendiente: <strong>$${note.balance_due}</strong></p>
              </div>
              <p style="color: #475569; font-size: 16px;">
                Por favor, asegúrate de realizar el pago a tiempo para evitar recargos o interrupciones en el servicio.
              </p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;">
              <p style="color: #94a3b8; font-size: 14px; margin-bottom: 0;">
                Atentamente,<br/>El equipo de ${companyName}
              </p>
            </div>
          </div>
        `;

                const resendResponse = await fetch("https://api.resend.com/emails", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${RESEND_API_KEY}`,
                    },
                    body: JSON.stringify({
                        from: `${companyName} <pagos@resend.dev>`,
                        to: [clientEmail],
                        subject: `Recordatorio de Pago: ${note.note_number} vence pronto`,
                        html: emailHtml,
                    }),
                });

                if (resendResponse.ok) {
                    emailsSent++;
                } else {
                    console.error("Error sending email via Resend:", await resendResponse.json());
                }
            }
        }

        return new Response(
            JSON.stringify({
                success: true,
                processed: notes?.length || 0,
                emailsSent,
                message: "Proceso de recordatorios completado."
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (err: any) {
        console.error("Edge Function error:", err);
        return new Response(
            JSON.stringify({ error: err.message || "Error interno del servidor." }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
