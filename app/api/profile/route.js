import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { updateProfile } from '@/lib/db';
import { sanitizePlainText, validateBranch, validateSemester } from '@/lib/validate';

export async function GET() {
  const { profile } = await getCurrentUser();
  if (!profile) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  return NextResponse.json({ profile });
}

export async function PATCH(request) {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) {
      return NextResponse.json({ error: 'Please sign in to update your profile' }, { status: 401 });
    }

    const body = await request.json();
    const updates = {};

    if (body.name !== undefined) {
      updates.name = sanitizePlainText(body.name, 60) || profile.name;
    }
    if (body.branch !== undefined) {
      updates.branch = validateBranch(body.branch);
    }
    if (body.semester !== undefined) {
      updates.semester = validateSemester(body.semester);
    }
    if (body.bio !== undefined) {
      updates.bio = sanitizePlainText(body.bio, 240);
    }

    const updated = await updateProfile(user.id, updates);
    return NextResponse.json({ success: true, profile: updated });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
