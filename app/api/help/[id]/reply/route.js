import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { addHelpReply } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';
import { sanitizePlainText } from '@/lib/validate';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) {
      return NextResponse.json({ error: 'Please sign in to reply' }, { status: 401 });
    }

    if (profile.is_banned) {
      return NextResponse.json({ error: 'Your account is suspended' }, { status: 403 });
    }

    const rateCheck = checkRateLimit(user.id, 'help_reply', 10, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'You are replying too fast' }, { status: 429 });
    }

    const body = await request.json();
    const message = sanitizePlainText(body.message, 1500);
    if (!message || message.length < 2) {
      return NextResponse.json({ error: 'Reply message cannot be empty' }, { status: 400 });
    }

    const reply = await addHelpReply(id, {
      author_id: user.id,
      message,
    });

    return NextResponse.json({ success: true, reply });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
