import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getPosts, createPost } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';
import { sanitizePlainText, isValidHttpUrl, validateBranch, validateSemester } from '@/lib/validate';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const branch = searchParams.get('branch');
    const semester = searchParams.get('semester');
    const type = searchParams.get('type');
    const subject = searchParams.get('subject');
    const search = searchParams.get('search');
    const authorId = searchParams.get('authorId');
    const forYou = searchParams.get('forYou') === 'true';

    let forUserBranch = null;
    let forUserSemester = null;

    if (forYou) {
      const { profile } = await getCurrentUser();
      if (profile) {
        forUserBranch = profile.branch;
        forUserSemester = profile.semester;
      }
    }

    const posts = await getPosts({
      branch,
      semester,
      type,
      subject,
      search,
      authorId,
      forUserBranch,
      forUserSemester,
    });

    return NextResponse.json({ posts });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) {
      return NextResponse.json({ error: 'Please sign in to publish study materials' }, { status: 401 });
    }

    if (profile.is_banned) {
      return NextResponse.json({ error: 'Your account has been suspended from publishing' }, { status: 403 });
    }

    // Best effort rate limit: max 5 posts per minute
    const rateCheck = checkRateLimit(user.id, 'post', 5, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `You are posting too quickly. Please wait ${Math.ceil(rateCheck.resetInMs / 1000)} seconds.` },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Checkbox verification: I have the right to share this
    if (!body.has_rights) {
      return NextResponse.json(
        { error: 'You must confirm that you have the right to share this educational material.' },
        { status: 400 }
      );
    }

    const title = sanitizePlainText(body.title, 120);
    const subject = sanitizePlainText(body.subject, 60);
    const description = sanitizePlainText(body.description, 1000);
    const type = ['notes', 'PYQ', 'video', 'link', 'other'].includes(body.type) ? body.type : 'notes';
    const branch = validateBranch(body.branch || profile.branch);
    const semester = validateSemester(body.semester || profile.semester);

    if (!title || title.length < 5) {
      return NextResponse.json({ error: 'Title must be at least 5 characters long' }, { status: 400 });
    }
    if (!subject) {
      return NextResponse.json({ error: 'Subject is required' }, { status: 400 });
    }

    let link_url = null;
    if (body.link_url && body.link_url.trim()) {
      if (!isValidHttpUrl(body.link_url)) {
        return NextResponse.json({ error: 'Link must be a valid http or https URL' }, { status: 400 });
      }
      link_url = body.link_url.trim();
    }

    const file_path = body.file_path ? sanitizePlainText(body.file_path, 255) : null;

    if (!link_url && !file_path && !description) {
      return NextResponse.json(
        { error: 'Please provide either a resource link, an uploaded document, or a description.' },
        { status: 400 }
      );
    }

    const newPost = await createPost({
      author_id: user.id,
      title,
      subject,
      branch,
      semester,
      type,
      description,
      link_url,
      file_path,
    });

    return NextResponse.json({ success: true, post: newPost });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
