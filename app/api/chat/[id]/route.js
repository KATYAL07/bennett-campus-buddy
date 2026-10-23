import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { deleteChatMessage } from '@/lib/db';

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const { user, isAdmin } = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!isAdmin) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    await deleteChatMessage(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
