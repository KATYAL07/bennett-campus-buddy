import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { isDemoMode } from '@/lib/db';
import { createServiceClient } from '@/lib/supabase/service';
import { checkRateLimit } from '@/lib/rate-limit';
import { APP_CONFIG } from '@/lib/config';

export async function POST(request) {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) {
      return NextResponse.json({ error: 'Please sign in to upload course materials' }, { status: 401 });
    }

    if (profile.is_banned) {
      return NextResponse.json({ error: 'Your account is restricted from uploading' }, { status: 403 });
    }

    // Friendly demo mode notice
    if (isDemoMode()) {
      return NextResponse.json(
        {
          error: 'File uploads are disabled in Demo Mode. You can still post resource links (Google Drive, GitHub, YouTube, etc.) which work identically.',
          isDemo: true,
        },
        { status: 400 }
      );
    }

    // Rate limit uploads: 3 per minute
    const rateCheck = checkRateLimit(user.id, 'upload', 3, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Upload rate limit reached. Please wait before uploading another file.' },
        { status: 429 }
      );
    }

    const { filename, fileType, fileSize } = await request.json();

    if (!filename || !fileType) {
      return NextResponse.json({ error: 'Filename and fileType are required' }, { status: 400 });
    }

    // Validate size (max 10MB)
    if (fileSize && fileSize > APP_CONFIG.maxUploadSizeBytes) {
      return NextResponse.json({ error: 'File size exceeds maximum limit of 10 MB' }, { status: 400 });
    }

    // Validate MIME type
    if (!APP_CONFIG.allowedMimeTypes.includes(fileType.toLowerCase())) {
      return NextResponse.json(
        { error: 'Only PDF documents and images (JPG, PNG, WebP) are allowed.' },
        { status: 400 }
      );
    }

    // Validate Extension
    const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();
    if (!APP_CONFIG.allowedExtensions.includes(ext)) {
      return NextResponse.json(
        { error: `File extension '${ext}' is not permitted. Only PDF and image files are accepted.` },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();
    if (!serviceClient) {
      return NextResponse.json({ error: 'Storage service unavailable' }, { status: 500 });
    }

    // Generate unique storage path: user_id/timestamp_sanitizedname
    const cleanName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${user.id}/${Date.now()}_${cleanName}`;

    // Create signed upload URL directly for Supabase Storage bucket 'posts'
    const { data, error } = await serviceClient.storage
      .from('posts')
      .createSignedUploadUrl(storagePath);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      signedUrl: data.signedUrl,
      token: data.token,
      path: data.path,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
