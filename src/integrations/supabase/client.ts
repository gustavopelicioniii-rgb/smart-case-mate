import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
    if (import.meta.env.PROD) {
        throw new Error(
            'Supabase URL or Anon Key is missing. ' +
            'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
        );
    }
    console.warn(
        '[Supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing. ' +
        'Database features will not work until you add them to .env'
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
