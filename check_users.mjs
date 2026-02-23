import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Faltan variables de entorno");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("Chequeando invitations...");
    const { data: invs, error: e1 } = await supabase.from('invitations').select('*');
    console.log(invs, e1);

    console.log("Chequeando users...");
    const { data: users, error: e2 } = await supabase.from('users').select('id, email, full_name, workspace, role');
    console.log(users, e2);
}

check();
