import 'dotenv/config.js';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing environment variables. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Checking public.users table...");
    try {
        const { data, error } = await supabase.from('users').select('*');
        if (error) {
            console.error("Error fetching users:", error);
            return;
        }

        console.log("Users found:", data.length);
        console.dir(data, { depth: null });

        if (data.length === 0) {
            console.log("\nNOTE: 0 users found in public.users. If the user is logged in natively, they probably signed up BEFORE we added the users table setup.");
        }
    } catch (e) {
        console.error(e);
    }
}

run();
