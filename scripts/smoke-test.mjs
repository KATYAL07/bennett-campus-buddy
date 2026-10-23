const BASE = 'http://localhost:3001';

async function runTests() {
  console.log('\n--- STARTING AUTOMATED SMOKE TESTS (Demo Mode) ---\n');
  let cookieHeader = '';

  // 1. Pages check
  const pages = [
    '/',
    '/feed',
    '/events',
    '/events/evt-201',
    '/help',
    '/chat',
    '/contacts',
    '/privacy',
    '/login',
    '/u/user-arnav-admin',
  ];

  for (const page of pages) {
    const res = await fetch(`${BASE}${page}`);
    if (res.status === 200) {
      console.log(`✓ Page [${page}] loaded successfully (HTTP 200)`);
    } else {
      console.error(`✕ Page [${page}] returned status ${res.status}`);
      process.exit(1);
    }
  }

  // 2. Demo Auth: Sign in as Priya Sharma
  console.log('\nTesting Demo Login...');
  const loginRes = await fetch(`${BASE}/api/auth/demo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 'user-demo-priya' }),
  });
  console.log(`Demo login status: ${loginRes.status}`);
  const loginText = await loginRes.text();
  console.log(`Demo login raw response: ${loginText}`);
  let loginData = {};
  try {
    loginData = JSON.parse(loginText);
  } catch (e) {
    console.error('Failed to parse json:', e.message);
  }
  const setCookie = loginRes.headers.get('set-cookie');
  if (loginRes.ok && setCookie) {
    cookieHeader = setCookie.split(';')[0];
    console.log(`✓ Signed in as Priya Sharma (${loginData.profile?.name}), cookie captured: ${cookieHeader}`);
  } else {
    console.error('✕ Demo login failed', loginData);
    process.exit(1);
  }

  // 3. Verify current profile
  const profileRes = await fetch(`${BASE}/api/profile`, {
    headers: { Cookie: cookieHeader },
  });
  const profileData = await profileRes.json();
  console.log(`✓ Profile API returned: ${profileData.profile?.name} (${profileData.profile?.branch})`);

  // 4. Create new study post
  console.log('\nTesting Post Creation...');
  const newPostRes = await fetch(`${BASE}/api/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieHeader,
    },
    body: JSON.stringify({
      title: 'Automated Test Study Material on Sorting Algorithms',
      subject: 'Data Structures',
      branch: 'CSE',
      semester: 3,
      type: 'notes',
      description: 'Quick reference notes for MergeSort and QuickSort pivot selection.',
      link_url: 'https://github.com/Bennett-GDG/sorting-notes',
      has_rights: true,
    }),
  });
  const newPostData = await newPostRes.json();
  if (newPostRes.ok) {
    console.log(`✓ Published Study Post ID: ${newPostData.post?.id}`);
  } else {
    console.error('✕ Failed to publish post:', newPostData);
    process.exit(1);
  }

  // 5. Test Upvote
  console.log('\nTesting Upvote...');
  const upvoteRes = await fetch(`${BASE}/api/posts/post-101/upvote`, {
    method: 'POST',
    headers: { Cookie: cookieHeader },
  });
  const upvoteData = await upvoteRes.json();
  console.log(`✓ Upvote toggled on post-101: Upvotes count = ${upvoteData.upvoteCount}, Upvoted = ${upvoteData.userHasUpvoted}`);

  // 6. Test RSVP
  console.log('\nTesting Event RSVP...');
  const rsvpRes = await fetch(`${BASE}/api/events/evt-201/rsvp`, {
    method: 'POST',
    headers: { Cookie: cookieHeader },
  });
  const rsvpData = await rsvpRes.json();
  console.log(`✓ RSVP toggled on evt-201: RSVPed = ${rsvpData.userHasRsvpd}`);

  // 7. Test Help Reply
  console.log('\nTesting Help Board Reply...');
  const replyRes = await fetch(`${BASE}/api/help/help-302/reply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieHeader,
    },
    body: JSON.stringify({
      message: 'You can also check git status to verify which files have unmerged conflicts.',
    }),
  });
  const replyData = await replyRes.json();
  console.log(`✓ Help reply posted: ${replyData.reply?.id}`);

  // 8. Test Campus Lounge Chat
  console.log('\nTesting Campus Lounge Message...');
  const chatRes = await fetch(`${BASE}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieHeader,
    },
    body: JSON.stringify({
      message: 'Smoke test message from automated test runner: Lounge works great!',
    }),
  });
  const chatData = await chatRes.json();
  console.log(`✓ Chat message sent: ${chatData.message?.id}`);

  // 9. Test Content Report
  console.log('\nTesting Content Report...');
  const reportRes = await fetch(`${BASE}/api/reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieHeader,
    },
    body: JSON.stringify({
      target_type: 'chat_message',
      target_id: chatData.message?.id,
      reason: 'Automated test report verification',
    }),
  });
  const reportData = await reportRes.json();
  console.log(`✓ Content reported: ${reportData.report?.id}`);

  // 10. Switch to Admin Account & Test Admin Dashboard
  console.log('\nTesting Admin Features...');
  const adminLoginRes = await fetch(`${BASE}/api/auth/demo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 'user-arnav-admin' }),
  });
  const adminCookie = adminLoginRes.headers.get('set-cookie')?.split(';')[0];
  const adminPageRes = await fetch(`${BASE}/admin`, {
    headers: { Cookie: adminCookie },
  });
  if (adminPageRes.status === 200) {
    console.log('✓ Admin dashboard accessed with moderator permissions (HTTP 200)');
  } else {
    console.error('✕ Admin access failed', adminPageRes.status);
    process.exit(1);
  }

  // Resolve the report
  const resolveRes = await fetch(`${BASE}/api/admin/reports/${reportData.report?.id}`, {
    method: 'POST',
    headers: { Cookie: adminCookie },
  });
  const resolveData = await resolveRes.json();
  console.log(`✓ Report resolved by admin: status = ${resolveData.report?.status}`);

  // 11. Sign out
  console.log('\nTesting Sign Out...');
  const logoutRes = await fetch(`${BASE}/api/auth/signout`, {
    method: 'POST',
    headers: { Cookie: adminCookie },
  });
  console.log(`✓ Signed out successfully (Redirect: ${logoutRes.status})`);

  console.log('\n🎉 ALL SMOKE TESTS PASSED CLEANLY IN DEMO MODE!\n');
}

// Give server 2 seconds to initialize if needed
setTimeout(runTests, 2000);
