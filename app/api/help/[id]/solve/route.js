import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getHelpRequestById, markHelpSolved } from '@/lib/db';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const { user, isAdmin } = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const helpReq = await getHelpRequestById(id);
    if (!helpReq) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    if (helpReq.author_id !== user.id && !isAdmin) {
      return NextResponse.json({ error: 'Only the author can mark this solved' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const isSolved = body.is_solved !== undefined ? Boolean(body.is_solved) : !helpReq.is_solved;

    const updated = await markHelpSolved(id, isSolved);
    return NextResponse.json({ success: true, request: updated });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
