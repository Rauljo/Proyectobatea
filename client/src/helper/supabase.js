import {createClient} from '@supabase/supabase-js';

const supabaseUrl = 'https://wpcbligedufvtiwugaso.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;


