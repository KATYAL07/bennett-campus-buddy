import { cookies } from 'next/headers';
import { isDemoMode, getProfileById, getProfileByEmail } from './db';
import { createServerSupabaseClient } from './supabase/server';
import { isAdminEmail } from './config';

export const DEMO_COOKIE_NAME = 'campus_buddy_demo_user';

export async function getCurrentUser() {
  const cookieStore = await cookies();

  // 1. Check Demo Mode Auth
  if (isDemoMode()) {
    const demoUserId = cookieStore.get(DEMO_COOKIE_NAME)?.value;
    if (!demoUserId) {
      return { user: null, profile: null, isDemo: true, isAdmin: false };
    }
    const profile = await getProfileById(demoUserId);
    if (!profile) {
      return { user: null, profile: null, isDemo: true, isAdmin: false };
    }
    const isAdmin = profile.role === 'admin' || isAdminEmail(profile.email);
    return {
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
      },
      profile,
      isDemo: true,
      isAdmin,
    };
  }

  // 2. Production Supabase Auth
  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return { user: null, profile: null, isDemo: true, isAdmin: false };
    }
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return { user: null, profile: null, isDemo: false, isAdmin: false };
    }

    let profile = await getProfileById(user.id);
    if (!profile && user.email) {
      profile = await getProfileByEmail(user.email);
    }

    const isAdmin = isAdminEmail(user.email) || profile?.role === 'admin';

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email?.split('@')[0],
      },
      profile,
      isDemo: false,
      isAdmin,
    };
  } catch (err) {
    console.error('Error in getCurrentUser:', err);
    return { user: null, profile: null, isDemo: false, isAdmin: false };
  }
}
