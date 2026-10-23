import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { toggleRsvp } from '@/lib/db';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const { user } = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to RSVP for campus events' }, { status: 401 });
    }

    const result = await toggleRsvp(id, user.id);
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
