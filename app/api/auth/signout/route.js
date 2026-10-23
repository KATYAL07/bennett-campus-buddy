import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { DEMO_COOKIE_NAME } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request) {
  const cookieStore = await cookies();
  cookieStore.set(DEMO_COOKIE_NAME, '', { path: '/', maxAge: 0 });

  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (_) {}
  }

  const url = new URL('/', request.url);
  return NextResponse.redirect(url, { status: 303 });
}

export async function GET(request) {
  const cookieStore = await cookies();
  cookieStore.set(DEMO_COOKIE_NAME, '', { path: '/', maxAge: 0 });

  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (_) {}
  }

  const url = new URL('/', request.url);
  return NextResponse.redirect(url);
}
