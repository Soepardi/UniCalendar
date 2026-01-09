import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    // In development/build (without env vars), we might want to fail gracefully or log a warning
    // simpler for now to just let it throw or handle check later
    console.warn('Supabase env vars missing. Check .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
