import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { email, clientName, companyName, noteNumber, amount, paymentDate, pdfBase64 } = await req.json();

        if (!email || !pdfBase64 || !noteNumber || !amount) {
            return new Response(JSON.stringify({ error: "Faltan datos requeridos (email, pdfBase64, noteNumber, amount)." }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
        if (!RESEND_API_KEY) {
            return new Response(JSON.stringify({ error: "Servicio de correo electrónico no configurado." }), {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const emailHtml = `
      <div style="font-family: Arial, sans-serif; background: #f9fafb; padding: 40px;">
        <div style="background: white; border-radius: 8px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e293b; margin-top: 0;">Comprobante de Pago</h2>
          <p style="color: #475569; font-size: 16px;">Hola <strong>${clientName || 'Cliente'}</strong>,</p>
          <p style="color: #475569; font-size: 16px;">
            Hemos recibido el registro de tu pago por <strong>$${amount}</strong> correspondiente a la nota de cargo <strong>${noteNumber}</strong> con fecha ${paymentDate || new Date().toLocaleDateString()}.
          </p>
          <p style="color: #475569; font-size: 16px;">
            Adjuntamos a este correo tu comprobante de pago en formato PDF.
          </p>
          <p style="color: #475569; font-size: 16px;">
            ¡Gracias por tu confianza y preferencia!
          </p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          <p style="color: #94a3b8; font-size: 14px; margin-bottom: 0;">
            Atentamente,<br/>El equipo de ${companyName || 'Nuestra Empresa'}
          </p>
        </div>
      </div>
    `;

        // Process base64 string to remove data url prefix if it exists
        let cleanBase64 = pdfBase64;
        if (pdfBase64.includes('base64,')) {
            cleanBase64 = pdfBase64.split('base64,')[1];
        }

        const resendResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: `${companyName || 'Finanzas'} <pagos@resend.dev>`,
                to: [email],
                subject: `Comprobante de Pago - Nota ${noteNumber}`,
                html: emailHtml,
                attachments: [
                    {
                        filename: `Comprobante_Pago_${noteNumber}.pdf`,
                        content: cleanBase64,
                    }
                ]
            }),
        });

        const resendData = await resendResponse.json();

        if (!resendResponse.ok) {
            console.error("Resend error:", resendData);
            return new Response(JSON.stringify({ error: "Error enviando el correo con Resend.", details: resendData }), {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        return new Response(
            JSON.stringify({ success: true, message: `Comprobante enviado exitosamente a ${email}.` }),
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
