import fs from 'fs';
import path from 'path';
import { createServiceClient } from './supabase/service';

// Global cache for demo mode in development/serverless memory
if (!globalThis.__campusBuddyDemoStore) {
  try {
    const seedDir = path.join(process.cwd(), 'data', 'seed');
    const profiles = JSON.parse(fs.readFileSync(path.join(seedDir, 'profiles.json'), 'utf-8'));
    const posts = JSON.parse(fs.readFileSync(path.join(seedDir, 'posts.json'), 'utf-8'));
    const events = JSON.parse(fs.readFileSync(path.join(seedDir, 'events.json'), 'utf-8'));
    const helpRequests = JSON.parse(fs.readFileSync(path.join(seedDir, 'help_requests.json'), 'utf-8'));
    const chatMessages = JSON.parse(fs.readFileSync(path.join(seedDir, 'chat_messages.json'), 'utf-8'));
    const reports = JSON.parse(fs.readFileSync(path.join(seedDir, 'reports.json'), 'utf-8'));

    globalThis.__campusBuddyDemoStore = {
      profiles,
      posts,
      events,
      helpRequests,
      chatMessages,
      reports,
    };
  } catch (err) {
    // Fallback if filesystem read encounters issues
    globalThis.__campusBuddyDemoStore = {
      profiles: [],
      posts: [],
      events: [],
      helpRequests: [],
      chatMessages: [],
      reports: [],
    };
  }
}

export function isDemoMode() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return !url || !key || url.includes('your-project-id');
}

export function getDemoStore() {
  return globalThis.__campusBuddyDemoStore;
}

// ---------------- PROFILES ----------------

export async function getProfileById(id) {
  if (isDemoMode()) {
    const store = getDemoStore();
    return store.profiles.find((p) => p.id === id) || null;
  }
  const supabase = createServiceClient();
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
  if (error) return null;
  return data;
}

export async function getProfileByEmail(email) {
  if (!email) return null;
  if (isDemoMode()) {
    const store = getDemoStore();
    return store.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase()) || null;
  }
  const supabase = createServiceClient();
  const { data, error } = await supabase.from('profiles').select('*').eq('email', email.toLowerCase()).single();
  if (error) return null;
  return data;
}

export async function getAllProfiles() {
  if (isDemoMode()) {
    return getDemoStore().profiles;
  }
  const supabase = createServiceClient();
  const { data } = await supabase.from('profiles').select('*');
  return data || [];
}

export async function createOrUpdateProfile(profile) {
  if (isDemoMode()) {
    const store = getDemoStore();
    const existingIndex = store.profiles.findIndex((p) => p.id === profile.id || p.email === profile.email);
    if (existingIndex >= 0) {
      store.profiles[existingIndex] = { ...store.profiles[existingIndex], ...profile };
      return store.profiles[existingIndex];
    }
    const newProfile = {
      id: profile.id || `user-${Date.now()}`,
      created_at: new Date().toISOString(),
      role: 'student',
      is_banned: false,
      ...profile,
    };
    store.profiles.push(newProfile);
    return newProfile;
  }
  const supabase = createServiceClient();
  const { data, error } = await supabase.from('profiles').upsert(profile).select().single();
  if (error) throw error;
  return data;
}

export async function updateProfile(id, updates) {
  if (isDemoMode()) {
    const store = getDemoStore();
    const profile = store.profiles.find((p) => p.id === id);
    if (!profile) return null;
    Object.assign(profile, updates);
    return profile;
  }
  const supabase = createServiceClient();
  const { data, error } = await supabase.from('profiles').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function banUser(id, isBanned = true) {
  return updateProfile(id, { is_banned: isBanned });
}

// ---------------- STUDY FEED POSTS ----------------

export async function getPosts(filters = {}) {
  const { branch, semester, type, subject, search, authorId, forUserBranch } = filters;

  if (isDemoMode()) {
    const store = getDemoStore();
    // Planted flaw: unclear variable names x, d
    let x = [...store.posts];

    if (authorId) {
      x = x.filter((p) => p.author_id === authorId);
    }
    if (branch && branch !== 'All') {
      x = x.filter((p) => p.branch === branch);
    }
    if (semester && semester !== 'All') {
      x = x.filter((p) => String(p.semester) === String(semester));
    }
    if (type && type !== 'All') {
      x = x.filter((p) => p.type === type);
    }
    if (subject && subject !== 'All') {
      x = x.filter((p) => p.subject === subject);
    }
    // Planted flaw: case-sensitive search!
    if (search && search.trim()) {
      x = x.filter((p) => p.title.includes(search) || p.description.includes(search));
    }

    // Planted flaw: naive "For you" ranking that only filters by branch
    if (forUserBranch) {
      x = x.filter((p) => p.branch === forUserBranch);
    }

    // Attach author profiles
    const populated = x.map((p) => {
      const author = store.profiles.find((pr) => pr.id === p.author_id) || {
        id: p.author_id,
        name: 'Anonymous Student',
        branch: p.branch,
        semester: p.semester,
        avatar_url: null,
      };
      return { ...p, author };
    });

    return populated.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  const supabase = createServiceClient();
  let query = supabase.from('posts').select('*, author:profiles(*)');

  if (authorId) query = query.eq('author_id', authorId);
  if (branch && branch !== 'All') query = query.eq('branch', branch);
  if (semester && semester !== 'All') query = query.eq('semester', parseInt(semester, 10));
  if (type && type !== 'All') query = query.eq('type', type);
  if (subject && subject !== 'All') query = query.eq('subject', subject);
  if (forUserBranch) query = query.eq('branch', forUserBranch);

  if (search && search.trim()) {
    // Planted flaw in SQL mode too: case-sensitive search
    query = query.ilike('title', `%${search}%`);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getPostById(id) {
  if (isDemoMode()) {
    const store = getDemoStore();
    const post = store.posts.find((p) => p.id === id);
    if (!post) return null;
    const author = store.profiles.find((pr) => pr.id === post.author_id) || null;
    return { ...post, author };
  }
  const supabase = createServiceClient();
  const { data, error } = await supabase.from('posts').select('*, author:profiles(*)').eq('id', id).single();
  if (error) return null;
  return data;
}

export async function createPost(postData) {
  if (isDemoMode()) {
    const store = getDemoStore();
    const newPost = {
      id: `post-${Date.now()}`,
      upvote_count: 0,
      upvoters: [],
      created_at: new Date().toISOString(),
      ...postData,
    };
    store.posts.unshift(newPost);
    const author = store.profiles.find((p) => p.id === newPost.author_id);
    return { ...newPost, author };
  }
  const supabase = createServiceClient();
  const { data, error } = await supabase.from('posts').insert(postData).select('*, author:profiles(*)').single();
  if (error) throw error;
  return data;
}

export async function toggleUpvote(postId, userId) {
  if (isDemoMode()) {
    const store = getDemoStore();
    const post = store.posts.find((p) => p.id === postId);
    if (!post) throw new Error('Post not found');
    if (!post.upvoters) post.upvoters = [];
    const idx = post.upvoters.indexOf(userId);
    let userHasUpvoted = false;
    if (idx >= 0) {
      post.upvoters.splice(idx, 1);
      post.upvote_count = Math.max(0, (post.upvote_count || 1) - 1);
      userHasUpvoted = false;
    } else {
      post.upvoters.push(userId);
      post.upvote_count = (post.upvote_count || 0) + 1;
      userHasUpvoted = true;
    }
    return { upvoteCount: post.upvote_count, userHasUpvoted };
  }

  const supabase = createServiceClient();
  // Check if upvote exists
  const { data: existing } = await supabase
    .from('post_upvotes')
    .select('*')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single();

  if (existing) {
    await supabase.from('post_upvotes').delete().eq('post_id', postId).eq('user_id', userId);
    const { data: post } = await supabase.rpc('decrement_upvotes', { p_id: postId });
    return { upvoteCount: post?.upvote_count || 0, userHasUpvoted: false };
  } else {
    await supabase.from('post_upvotes').insert({ post_id: postId, user_id: userId });
    const { data: post } = await supabase.rpc('increment_upvotes', { p_id: postId });
    return { upvoteCount: post?.upvote_count || 1, userHasUpvoted: true };
  }
}

export async function deletePost(postId) {
  if (isDemoMode()) {
    const store = getDemoStore();
    const index = store.posts.findIndex((p) => p.id === postId);
    if (index >= 0) {
      store.posts.splice(index, 1);
      return true;
    }
    return false;
  }
  const supabase = createServiceClient();
  const { error } = await supabase.from('posts').delete().eq('id', postId);
  if (error) throw error;
  return true;
}

// ---------------- EVENTS ----------------

export async function getEvents() {
  if (isDemoMode()) {
    const store = getDemoStore();
    // Planted flaw: sorted oldest-first with past events mixed in
    return [...store.events].sort((a, b) => new Date(a.date_time) - new Date(b.date_time));
  }
  const supabase = createServiceClient();
  const { data, error } = await supabase.from('events').select('*').order('date_time', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getEventById(id) {
  if (isDemoMode()) {
    const store = getDemoStore();
    return store.events.find((e) => e.id === id) || null;
  }
  const supabase = createServiceClient();
  const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
  if (error) return null;
  return data;
}

export async function toggleRsvp(eventId, userId) {
  if (isDemoMode()) {
    const store = getDemoStore();
    const event = store.events.find((e) => e.id === eventId);
    if (!event) throw new Error('Event not found');
    if (!event.rsvps) event.rsvps = [];
    const idx = event.rsvps.indexOf(userId);
    let userHasRsvpd = false;
    if (idx >= 0) {
      event.rsvps.splice(idx, 1);
      userHasRsvpd = false;
    } else {
      event.rsvps.push(userId);
      userHasRsvpd = true;
    }
    return { rsvpCount: event.rsvps.length, userHasRsvpd };
  }
  const supabase = createServiceClient();
  const { data: existing } = await supabase.from('rsvps').select('*').eq('event_id', eventId).eq('user_id', userId).single();
  if (existing) {
    await supabase.from('rsvps').delete().eq('event_id', eventId).eq('user_id', userId);
    return { userHasRsvpd: false };
  } else {
    await supabase.from('rsvps').insert({ event_id: eventId, user_id: userId });
    return { userHasRsvpd: true };
  }
}

// ---------------- HELP BOARD ----------------

export async function getHelpRequests(filters = {}) {
  const { subject, solved } = filters;
  if (isDemoMode()) {
    const store = getDemoStore();
    let res = [...store.helpRequests];
    if (subject && subject !== 'All') {
      res = res.filter((r) => r.subject === subject);
    }
    if (solved !== undefined && solved !== '') {
      const isSol = solved === 'true' || solved === true;
      res = res.filter((r) => r.is_solved === isSol);
    }
    return res.map((r) => {
      const author = store.profiles.find((p) => p.id === r.author_id) || null;
      return { ...r, author };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  const supabase = createServiceClient();
  let query = supabase.from('help_requests').select('*, author:profiles(*), replies:help_replies(*, author:profiles(*))');
  if (subject && subject !== 'All') query = query.eq('subject', subject);
  if (solved !== undefined && solved !== '') query = query.eq('is_solved', solved === 'true');
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getHelpRequestById(id) {
  if (isDemoMode()) {
    const store = getDemoStore();
    const req = store.helpRequests.find((r) => r.id === id);
    if (!req) return null;
    const author = store.profiles.find((p) => p.id === req.author_id) || null;
    const replies = (req.replies || []).map((rep) => {
      const repAuthor = store.profiles.find((p) => p.id === rep.author_id) || null;
      return { ...rep, author: repAuthor };
    });
    return { ...req, author, replies };
  }
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('help_requests')
    .select('*, author:profiles(*), replies:help_replies(*, author:profiles(*))')
    .eq('id', id)
    .single();
  if (error) return null;
  return data;
}

export async function createHelpRequest(requestData) {
  if (isDemoMode()) {
    const store = getDemoStore();
    const newReq = {
      id: `help-${Date.now()}`,
      is_solved: false,
      replies: [],
      created_at: new Date().toISOString(),
      ...requestData,
    };
    store.helpRequests.unshift(newReq);
    const author = store.profiles.find((p) => p.id === newReq.author_id);
    return { ...newReq, author };
  }
  const supabase = createServiceClient();
  const { data, error } = await supabase.from('help_requests').insert(requestData).select('*, author:profiles(*)').single();
  if (error) throw error;
  return data;
}

export async function addHelpReply(requestId, replyData) {
  if (isDemoMode()) {
    const store = getDemoStore();
    const req = store.helpRequests.find((r) => r.id === requestId);
    if (!req) throw new Error('Help request not found');
    if (!req.replies) req.replies = [];
    const newReply = {
      id: `rep-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...replyData,
    };
    req.replies.push(newReply);
    const author = store.profiles.find((p) => p.id === newReply.author_id);
    return { ...newReply, author };
  }
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('help_replies')
    .insert({ request_id: requestId, ...replyData })
    .select('*, author:profiles(*)')
    .single();
  if (error) throw error;
  return data;
}

export async function markHelpSolved(requestId, isSolved = true) {
  if (isDemoMode()) {
    const store = getDemoStore();
    const req = store.helpRequests.find((r) => r.id === requestId);
    if (!req) throw new Error('Help request not found');
    req.is_solved = isSolved;
    return req;
  }
  const supabase = createServiceClient();
  const { data, error } = await supabase.from('help_requests').update({ is_solved: isSolved }).eq('id', requestId).select().single();
  if (error) throw error;
  return data;
}

export async function deleteHelpRequest(requestId) {
  if (isDemoMode()) {
    const store = getDemoStore();
    const idx = store.helpRequests.findIndex((r) => r.id === requestId);
    if (idx >= 0) {
      store.helpRequests.splice(idx, 1);
      return true;
    }
    return false;
  }
  const supabase = createServiceClient();
  const { error } = await supabase.from('help_requests').delete().eq('id', requestId);
  if (error) throw error;
  return true;
}

// ---------------- CAMPUS LOUNGE (CHAT) ----------------

export async function getLatestChatMessages(limit = 50) {
  if (isDemoMode()) {
    const store = getDemoStore();
    const msgs = store.chatMessages.slice(-limit);
    return msgs.map((m) => {
      const author = store.profiles.find((p) => p.id === m.author_id) || {
        id: m.author_id,
        name: 'Campus Student',
        avatar_url: null,
      };
      return { ...m, author };
    });
  }
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*, author:profiles(*)')
    .order('created_at', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function createChatMessage({ author_id, message }) {
  if (isDemoMode()) {
    const store = getDemoStore();
    const newMsg = {
      id: `chat-${Date.now()}`,
      author_id,
      message,
      created_at: new Date().toISOString(),
    };
    store.chatMessages.push(newMsg);
    // Keep max 200 in memory
    if (store.chatMessages.length > 200) {
      store.chatMessages.shift();
    }
    const author = store.profiles.find((p) => p.id === author_id);
    return { ...newMsg, author };
  }
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({ author_id, message })
    .select('*, author:profiles(*)')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteChatMessage(id) {
  if (isDemoMode()) {
    const store = getDemoStore();
    const idx = store.chatMessages.findIndex((m) => m.id === id);
    if (idx >= 0) {
      store.chatMessages.splice(idx, 1);
      return true;
    }
    return false;
  }
  const supabase = createServiceClient();
  const { error } = await supabase.from('chat_messages').delete().eq('id', id);
  if (error) throw error;
  return true;
}

// ---------------- REPORTS & MODERATION ----------------

export async function getReports() {
  if (isDemoMode()) {
    const store = getDemoStore();
    return store.reports.map((r) => {
      const reporter = store.profiles.find((p) => p.id === r.reporter_id) || null;
      return { ...r, reporter };
    });
  }
  const supabase = createServiceClient();
  const { data, error } = await supabase.from('reports').select('*, reporter:profiles(*)').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createReport({ reporter_id, target_type, target_id, reason }) {
  if (isDemoMode()) {
    const store = getDemoStore();
    const newReport = {
      id: `rep-${Date.now()}`,
      reporter_id,
      target_type,
      target_id,
      reason,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    store.reports.push(newReport);
    return newReport;
  }
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('reports')
    .insert({ reporter_id, target_type, target_id, reason, status: 'pending' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function resolveReport(id) {
  if (isDemoMode()) {
    const store = getDemoStore();
    const rep = store.reports.find((r) => r.id === id);
    if (rep) rep.status = 'resolved';
    return rep;
  }
  const supabase = createServiceClient();
  const { data, error } = await supabase.from('reports').update({ status: 'resolved' }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}
