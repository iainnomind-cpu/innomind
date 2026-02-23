import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load directly from .env.local
import { readFileSync } from 'fs';
const envFile = readFileSync('.env', 'utf-8');
const envVars = envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) process.env[key.trim()] = value.trim();
});

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Faltan variables de entorno");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("Chequeando invitations...");
    const { data: invs, error: e1 } = await supabase.from('invitations').select('*');
    console.log(invs, e1);

    console.log("\nChequeando users...");
    const { data: users, error: e2 } = await supabase.from('users').select('id, email, full_name, workspace, role');
    console.log(users, e2);
}

check();
