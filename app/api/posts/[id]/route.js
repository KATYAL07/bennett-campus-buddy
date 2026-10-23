import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getPostById, deletePost } from '@/lib/db';

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const { user, isAdmin } = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const post = await getPostById(id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.author_id !== user.id && !isAdmin) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    await deletePost(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
