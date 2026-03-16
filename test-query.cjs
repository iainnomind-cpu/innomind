const fs = require('fs');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config({ path: 'c:/Users/ciria/Music/ProyectoResi/innomind/.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Superbase URL or Key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('accounts_payable_payments')
    .select(`
        *,
        payable:accounts_payable ( *, supplier:suppliers(*) ),
        purchase_order:purchase_orders ( *, supplier:suppliers!fk_supplier(*) )
    `)
    .limit(5);

  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Data:", JSON.stringify(data, null, 2));
  }
}

run();
