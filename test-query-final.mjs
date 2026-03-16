import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

let envVars = {};
try {
  const envFile = fs.readFileSync('.env', 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) {
      envVars[key.trim()] = vals.join('=').trim().replace(/['"]/g, '');
    }
  });
} catch (e) {
  console.log('Error reading .env', e.message);
}

const supabaseUrl = envVars['VITE_SUPABASE_URL'];
const supabaseKey = envVars['VITE_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Superbase URL or Key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Fetching accounts_payable_payments...');
  const { data: paymentsData, error: paymentsError } = await supabase
      .from('accounts_payable_payments')
      .select(`
          *,
          payable:accounts_payable ( *, supplier:suppliers(*) ),
          accounts_payable ( *, supplier:suppliers(*) ),
          purchase_order:purchase_orders ( *, supplier:suppliers!fk_supplier(*) ),
          purchase_orders ( *, supplier:suppliers!fk_supplier(*) )
      `)
      .limit(5);

  if (paymentsError) {
      console.error("Error payments:", JSON.stringify(paymentsError, null, 2));
  } else {
      console.log("Payments returned:", paymentsData.length);
      console.log(JSON.stringify(paymentsData, null, 2));
  }
  
  console.log('\nFetching accounts_payable...');
  const { data: payablesData, error: payablesError } = await supabase
      .from('accounts_payable')
      .select('*, supplier:suppliers(*)')
      .limit(5);
      
  if (payablesError) {
      console.error("Error payables:", JSON.stringify(payablesError, null, 2));
  } else {
      console.log("Payables returned:", payablesData.length);
      console.log(JSON.stringify(payablesData, null, 2));
  }
}

run();
