import { createClient } from '@supabase/supabase-js';
import { config } from './env';

// Client for server-side operations (uses service role key)
export const supabaseAdmin = createClient(
    config.supabase.url as string,
    config.supabase.serviceRoleKey as string,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

// Client for user-facing operations (uses anon key)
export const supabase = createClient(
    config.supabase.url as string,
    config.supabase.anonKey as string
);

export default supabase;
