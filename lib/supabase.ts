import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase environment variables are missing! Check your .env.local file.');
}

// Ensure createClient doesn't throw during build by providing dummy values if missing
export const supabase = createClient(
    supabaseUrl || 'https://hyvplgoahszlgdehcsqi.supabase.co',
    supabaseAnonKey || 'sb_publishable_f7uNSBPT-lBIdWSdxHv8dA_U5g45ZTd'
);
