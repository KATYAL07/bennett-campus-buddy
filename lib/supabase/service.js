import { createClient } from '@supabase/supabase-js';

// Server-side only Supabase service role client
// Bypasses Row Level Security (RLS) for our secure server-side API Route Handlers.
// NEVER import or use this client in client components!

export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
