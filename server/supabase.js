const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wpcbligedufvtiwugaso.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = supabase;


