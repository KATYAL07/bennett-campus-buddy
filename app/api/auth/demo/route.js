import { NextResponse } from 'next/server';
import { DEMO_COOKIE_NAME } from '@/lib/auth';
import { getProfileById, getDemoStore } from '@/lib/db';

export async function POST(request) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const profile = await getProfileById(userId);
    if (!profile) {
      return NextResponse.json({ error: 'Demo user not found' }, { status: 404 });
    }

    const response = NextResponse.json({ success: true, profile });
    response.cookies.set(DEMO_COOKIE_NAME, userId, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return response;
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  const store = getDemoStore();
  return NextResponse.json({
    users: (store?.profiles || []).map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      branch: p.branch,
      semester: p.semester,
      role: p.role,
      avatar_url: p.avatar_url,
    })),
  });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(DEMO_COOKIE_NAME, '', {
    path: '/',
    maxAge: 0,
  });
  return response;
}
