import { createClient } from '@supabase/supabase-js';

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
    .limit(10);

  if (error) {
    console.error("Error:", JSON.stringify(error, null, 2));
  } else {
    console.log("Data:", JSON.stringify(data, null, 2));
  }
}

run();
