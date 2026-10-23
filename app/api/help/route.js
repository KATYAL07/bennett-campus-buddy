import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getHelpRequests, createHelpRequest } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';
import { sanitizePlainText } from '@/lib/validate';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const solved = searchParams.get('solved');

    const requests = await getHelpRequests({ subject, solved });
    return NextResponse.json({ requests });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) {
      return NextResponse.json({ error: 'Please sign in to ask for help' }, { status: 401 });
    }

    if (profile.is_banned) {
      return NextResponse.json({ error: 'Your account has been suspended from posting' }, { status: 403 });
    }

    const rateCheck = checkRateLimit(user.id, 'help', 5, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Please wait ${Math.ceil(rateCheck.resetInMs / 1000)} seconds before posting another question.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const title = sanitizePlainText(body.title, 140);
    const description = sanitizePlainText(body.description, 2000);
    const subject = sanitizePlainText(body.subject, 60);

    if (!title || title.length < 5) {
      return NextResponse.json({ error: 'Title must be at least 5 characters long' }, { status: 400 });
    }
    if (!description || description.length < 10) {
      return NextResponse.json({ error: 'Please explain your problem in at least 10 characters' }, { status: 400 });
    }
    if (!subject) {
      return NextResponse.json({ error: 'Subject is required' }, { status: 400 });
    }

    let tags = [];
    if (Array.isArray(body.tags)) {
      tags = body.tags.map((t) => sanitizePlainText(t, 25).toLowerCase()).filter(Boolean).slice(0, 5);
    } else if (typeof body.tags === 'string') {
      tags = body.tags.split(',').map((t) => sanitizePlainText(t, 25).toLowerCase()).filter(Boolean).slice(0, 5);
    }

    const newReq = await createHelpRequest({
      author_id: user.id,
      title,
      description,
      subject,
      tags,
    });

    return NextResponse.json({ success: true, request: newReq });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
