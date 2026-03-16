import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const query = supabase.from('accounts_payable_payments').select('*, payable:accounts_payable ( *, supplier:suppliers(*) ), purchase_order:purchase_orders ( *, supplier:suppliers!fk_supplier(*) )').limit(1);
query.then((res: any) => console.log(JSON.stringify(res, null, 2)));
