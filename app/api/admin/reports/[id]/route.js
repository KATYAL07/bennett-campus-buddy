import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { resolveReport } from '@/lib/db';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const { isAdmin } = await getCurrentUser();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin permission required' }, { status: 403 });
    }

    const report = await resolveReport(id);
    return NextResponse.json({ success: true, report });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
