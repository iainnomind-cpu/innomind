import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase
      .from('accounts_payable_payments')
      .select('*, payable:accounts_payable(*, supplier:suppliers(*)), purchase_order:purchase_orders(*, supplier:suppliers!fk_supplier(*))')
      .limit(10);
      
  if (error) {
    console.error("Supabase Error:", error);
    return;
  }
  
  fs.writeFileSync('supabase_debug_output.json', JSON.stringify(data, null, 2));
  console.log("Data written to supabase_debug_output.json");
}

run();
