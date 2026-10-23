import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getReports, createReport } from '@/lib/db';
import { sanitizePlainText } from '@/lib/validate';

export async function GET() {
  const { isAdmin } = await getCurrentUser();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const reports = await getReports();
  return NextResponse.json({ reports });
}

export async function POST(request) {
  try {
    const { user } = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to report content' }, { status: 401 });
    }

    const body = await request.json();
    const target_type = ['post', 'chat_message', 'help_request'].includes(body.target_type)
      ? body.target_type
      : 'post';
    const target_id = sanitizePlainText(body.target_id, 100);
    const reason = sanitizePlainText(body.reason, 300) || 'Flagged for review';

    if (!target_id) {
      return NextResponse.json({ error: 'Target ID required' }, { status: 400 });
    }

    const report = await createReport({
      reporter_id: user.id,
      target_type,
      target_id,
      reason,
    });

    return NextResponse.json({ success: true, report });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
