-- ==============================================================================
-- Campus Buddy - Production Database Schema for Supabase
-- Target: PostgreSQL 15+ / Supabase
-- Safe to re-run: Uses IF NOT EXISTS and DROP/CREATE guards where needed.
-- Security: Row Level Security (RLS) is ENABLED on ALL tables with NO public policies.
--           All data access is mediated through server-side Route Handlers with the
--           SUPABASE_SERVICE_ROLE_KEY. The public anon key cannot read/write directly.
-- ==============================================================================

-- 1. Profiles Table (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  branch TEXT NOT NULL DEFAULT 'CSE',
  semester INTEGER NOT NULL DEFAULT 1 CHECK (semester >= 1 AND semester <= 8),
  bio TEXT DEFAULT '',
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  is_banned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Study Feed Posts
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  branch TEXT NOT NULL,
  semester INTEGER NOT NULL CHECK (semester >= 1 AND semester <= 8),
  type TEXT NOT NULL CHECK (type IN ('notes', 'PYQ', 'video', 'link', 'other')),
  description TEXT,
  link_url TEXT,
  file_path TEXT,
  upvote_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Post Upvotes (Junction table for deduplicating upvotes)
CREATE TABLE IF NOT EXISTS public.post_upvotes (
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);

-- 4. Campus Events
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  club TEXT NOT NULL,
  date_time TIMESTAMPTZ NOT NULL,
  venue TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Event RSVPs
CREATE TABLE IF NOT EXISTS public.rsvps (
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (event_id, user_id)
);

-- 6. Peer Help Board Requests
CREATE TABLE IF NOT EXISTS public.help_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_solved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Peer Help Replies
CREATE TABLE IF NOT EXISTS public.help_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.help_requests(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Global Text-Only Campus Lounge Chat
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message VARCHAR(500) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Content Moderation Reports
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'chat_message', 'help_request')),
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- Atomic Counter Functions
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.increment_upvotes(p_id UUID)
RETURNS public.posts AS $$
DECLARE
  updated_post public.posts;
BEGIN
  UPDATE public.posts
  SET upvote_count = upvote_count + 1
  WHERE id = p_id
  RETURNING * INTO updated_post;
  RETURN updated_post;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrement_upvotes(p_id UUID)
RETURNS public.posts AS $$
DECLARE
  updated_post public.posts;
BEGIN
  UPDATE public.posts
  SET upvote_count = GREATEST(0, upvote_count - 1)
  WHERE id = p_id
  RETURNING * INTO updated_post;
  RETURN updated_post;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- Row Level Security (RLS) Configuration
-- We enable RLS on every table and intentionally provide NO public policies.
-- Direct client queries using the public ANON key will fail with 401/403.
-- All legitimate app queries execute through server Route Handlers using SERVICE ROLE.
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- Supabase Storage Bucket Configuration
-- Creates the private 'posts' bucket for course document uploads.
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('posts', 'posts', false)
ON CONFLICT (id) DO NOTHING;
