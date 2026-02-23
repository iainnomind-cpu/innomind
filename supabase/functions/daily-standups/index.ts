import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async (req) => {
    // Basic authorization check (e.g. cron secret)
    const authHeader = req.headers.get('Authorization');
    const expectedAuth = `Bearer ${Deno.env.get('CRON_SECRET') || SUPABASE_SERVICE_ROLE_KEY}`;

    if (authHeader !== expectedAuth) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        // Fetch all TEAM spaces
        const { data: spaces, error: spacesError } = await supabase
            .from('workspace_spaces')
            .select('id, workspace, created_by')
            .eq('type', 'TEAM');

        if (spacesError) throw spacesError;
        if (!spaces || spaces.length === 0) {
            return new Response(JSON.stringify({ message: 'No TEAM spaces found.' }), { headers: { 'Content-Type': 'application/json' } });
        }

        const botMessage = `🌞 **Daily Standup**\n\n¡Buenos días equipo! Por favor compartan su actualización de hoy:\n\n1. ¿Qué lograste ayer?\n2. ¿En qué trabajarás hoy?\n3. ¿Tienes algún bloqueador?`;

        const messagesToInsert = spaces.map(space => ({
            workspace: space.workspace,
            space_id: space.id,
            sender_id: space.created_by, // Using the creator as the 'bot' sender. In prod, use a dedicated BOT_USER_ID
            content: botMessage,
            has_attachments: false,
            is_pinned: false
        }));

        const { error: insertError } = await supabase
            .from('workspace_messages')
            .insert(messagesToInsert);

        if (insertError) throw insertError;

        return new Response(JSON.stringify({
            message: `Standup messages sent to ${spaces.length} spaces.`
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error generating daily standups:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
});
