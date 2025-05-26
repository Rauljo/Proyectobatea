import {createClient} from '@supabase/supabase-js';

const supabaseUrl = 'https://wpcbligedufvtiwugaso.supabase.co';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;


