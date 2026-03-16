const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase
      .from('accounts_payable_payments')
      .select('*, payable:accounts_payable(*), purchase_order:purchase_orders(*)')
      .limit(10);
      
  if (error) {
    console.error("Supabase Error:", error);
    return;
  }
  
  fs.writeFileSync('supabase_debug_output.json', JSON.stringify(data, null, 2));
  console.log("Data written to supabase_debug_output.json");
}

run();
