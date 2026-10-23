import { NextResponse } from 'next/server';
import { isDemoMode } from '@/lib/db';
import { createServiceClient } from '@/lib/supabase/service';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get('path');

  if (!filePath) {
    return NextResponse.json({ error: 'File path required' }, { status: 400 });
  }

  if (isDemoMode()) {
    return NextResponse.json({ error: 'Direct file downloads are disabled in demo mode.' }, { status: 400 });
  }

  const serviceClient = createServiceClient();
  if (!serviceClient) {
    return NextResponse.json({ error: 'Storage service unavailable' }, { status: 500 });
  }

  const { data, error } = await serviceClient.storage.from('posts').createSignedUrl(filePath, 3600);
  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: error?.message || 'File not found' }, { status: 404 });
  }

  return NextResponse.redirect(data.signedUrl);
}
