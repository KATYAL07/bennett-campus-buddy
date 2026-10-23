import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { APP_CONFIG, isAdminEmail } from '@/lib/config';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';

  if (!code) {
    return NextResponse.redirect(`${requestUrl.origin}/login?error=Missing+authorization+code`);
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.redirect(`${requestUrl.origin}/login?error=Supabase+not+configured`);
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data?.user) {
    return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent(error?.message || 'Authentication failed')}`);
  }

  const user = data.user;
  const email = user.email || '';

  // SERVER-SIDE DOMAIN ENFORCEMENT
  if (APP_CONFIG.allowedEmailDomain) {
    const domain = email.split('@')[1] || '';
    if (domain.toLowerCase() !== APP_CONFIG.allowedEmailDomain.toLowerCase()) {
      // Sign out immediately
      await supabase.auth.signOut();
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=${encodeURIComponent(
          `Only accounts from @${APP_CONFIG.allowedEmailDomain} are permitted to sign in to Bennett Campus Buddy.`
        )}`
      );
    }
  }

  // Ensure user profile exists or create on first login
  try {
    const serviceClient = createServiceClient();
    if (serviceClient) {
      const { data: existingProfile } = await serviceClient
        .from('profiles')
        .select('id, branch, semester')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        // Create initial profile
        await serviceClient.from('profiles').insert({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || email.split('@')[0],
          avatar_url: user.user_metadata?.avatar_url || null,
          branch: 'CSE',
          semester: 1,
          bio: '',
          role: isAdminEmail(user.email) ? 'admin' : 'student',
          is_banned: false,
        });

        // Redirect to onboarding / profile setup on first login
        return NextResponse.redirect(`${requestUrl.origin}/onboarding`);
      }
    }
  } catch (err) {
    console.error('Failed to sync profile in auth callback:', err);
  }

  return NextResponse.redirect(`${requestUrl.origin}${next}`);
}
