import {createClient} from '@supabase/supabase-js';

const supabaseUrl = 'https://wpcbligedufvtiwugaso.supabase.co';
//const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwY2JsaWdlZHVmdnRpd3VnYXNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MjgxMTQsImV4cCI6MjA2MzQwNDExNH0.TW2uSmrlSxkbMCO1wn0g0d0RVMAXHy2Hh3aGUBxz-O0";
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;


