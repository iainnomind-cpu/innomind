import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=');
  if (key && vals.length) {
    envVars[key.trim()] = vals.join('=').trim().replace(/['"]/g, '');
  }
});

const supabaseUrl = envVars['VITE_SUPABASE_URL'];
const supabaseKey = envVars['VITE_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Superbase URL or Key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('accounts_payable_payments')
    .select(`
        *,
        payable:accounts_payable ( *, supplier:suppliers(*) ),
        purchase_order:purchase_orders ( *, supplier:suppliers(*) )
    `)
    .limit(10);

  if (error) {
    console.error("Error:", JSON.stringify(error, null, 2));
  } else {
    console.log("Data length:", data.length);
    console.log("Data snippet:", JSON.stringify(data.slice(0, 2), null, 2));
  }
}

run();
