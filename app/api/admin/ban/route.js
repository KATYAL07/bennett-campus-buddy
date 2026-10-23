import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { banUser } from '@/lib/db';

export async function POST(request) {
  try {
    const { isAdmin } = await getCurrentUser();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin permission required' }, { status: 403 });
    }

    const { userId, isBanned } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const updated = await banUser(userId, Boolean(isBanned));
    return NextResponse.json({ success: true, profile: updated });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
