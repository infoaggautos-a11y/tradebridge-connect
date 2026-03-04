import { createClient } from '@supabase/supabase-js';

const stripWrappingQuotes = (value?: string) => value?.replace(/^['"]|['"]$/g, '');

const supabaseUrl = stripWrappingQuotes(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = stripWrappingQuotes(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
