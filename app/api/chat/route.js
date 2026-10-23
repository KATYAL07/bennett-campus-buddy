import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getLatestChatMessages, createChatMessage } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';
import { sanitizePlainText } from '@/lib/validate';
import { APP_CONFIG } from '@/lib/config';

export async function GET() {
  try {
    const messages = await getLatestChatMessages(50);
    return NextResponse.json({ messages });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) {
      return NextResponse.json({ error: 'Please sign in to join the Campus Lounge chat' }, { status: 401 });
    }

    if (profile.is_banned) {
      return NextResponse.json({ error: 'Your account has been restricted from sending messages' }, { status: 403 });
    }

    // Server-side rate limit: max 5 messages per 30 seconds
    const rateCheck = checkRateLimit(user.id, 'chat', 5, 30000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Slow down! Please wait ${Math.ceil(rateCheck.resetInMs / 1000)} seconds before sending another message.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const rawMessage = body.message;

    // Plain text only, max 500 characters
    const message = sanitizePlainText(rawMessage, APP_CONFIG.maxMessageLength);

    if (!message || message.length < 1) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    const newMsg = await createChatMessage({
      author_id: user.id,
      message,
    });

    return NextResponse.json({ success: true, message: newMsg });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
