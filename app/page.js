import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { getPosts, getEvents, getHelpRequests, getLatestChatMessages } from '@/lib/db';
import PostCard from '@/components/PostCard';
import { APP_CONFIG } from '@/lib/config';

export default async function HomePage() {
  const { user, profile, isDemo } = await getCurrentUser();

  // Fetch data for personalized dashboard
  const userBranch = profile?.branch || 'CSE';
  const userSem = profile?.semester || 3;

  const [topPosts, allEvents, helpRequests, chatMessages] = await Promise.all([
    getPosts({ branch: userBranch }),
    getEvents(),
    getHelpRequests({ solved: false }),
    getLatestChatMessages(3),
  ]);

  const recommendedPosts = topPosts.slice(0, 3);
  const upcomingEvents = allEvents.slice(0, 2);
  const openQuestions = helpRequests.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Top Banner / Greeting */}
      <section className="bg-white border border-stone-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-block text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 mb-2">
              Bennett University Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              {profile ? `Welcome back, ${profile.name}` : `Welcome to ${APP_CONFIG.name}`}
            </h1>
            <p className="text-sm text-stone-600 mt-1 max-w-2xl">
              {profile ? (
                <span>
                  Showing verified materials and active discussions tailored for {profile.branch} (Semester {profile.semester}).
                </span>
              ) : (
                <span>
                  The student-curated repository for course notes, previous year exam papers, technical society events, and campus peer assistance.
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/feed"
              className="px-4 py-2 bg-emerald-800 text-white rounded-md text-sm font-semibold hover:bg-emerald-900 transition"
            >
              Browse Notes & PYQs
            </Link>
            <Link
              href="/chat"
              className="px-4 py-2 bg-stone-100 text-stone-800 border border-stone-300 rounded-md text-sm font-semibold hover:bg-stone-200 transition"
            >
              Open Campus Lounge
            </Link>
          </div>
        </div>
      </section>

      {/* Main Grid: Recommended Resources + Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Recommended Posts for Student */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                Top Resources for {userBranch}
              </h2>
              <p className="text-xs text-stone-500">
                Frequently upvoted papers and study notes shared by senior students
              </p>
            </div>
            <Link
              href="/feed"
              className="text-xs font-semibold text-emerald-800 hover:underline"
            >
              View All Feed &rarr;
            </Link>
          </div>

          {recommendedPosts.length > 0 ? (
            <div className="space-y-4">
              {recommendedPosts.map((post) => (
                <PostCard key={post.id} post={post} currentUserId={user?.id} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-stone-200 rounded-md p-8 text-center text-sm text-stone-500">
              No specific resources found for {userBranch} yet.
            </div>
          )}
        </div>

        {/* Right Column: Events + Open Help + Chat Snapshot */}
        <div className="space-y-6">
          {/* Upcoming Events Box */}
          <div className="bg-white border border-stone-200 rounded-md p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3 border-b border-stone-100 pb-2">
              <h3 className="text-sm font-bold text-stone-900">Next Campus Events</h3>
              <Link href="/events" className="text-xs text-emerald-800 font-semibold hover:underline">
                All Events
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingEvents.map((evt) => (
                <div key={evt.id} className="p-3 bg-stone-50 rounded border border-stone-200 text-xs">
                  <div className="font-bold text-stone-900 text-sm mb-1">{evt.title}</div>
                  <div className="text-stone-600 mb-1">{evt.club}</div>
                  <div className="text-stone-500 flex items-center justify-between">
                    <span>{evt.venue}</span>
                    <span className="font-medium text-emerald-800">
                      {evt.rsvps?.length || 0} RSVPs
                    </span>
                  </div>
                  {/* Planted flaw: Raw ISO string */}
                  <div className="text-[11px] text-stone-400 mt-1">
                    Scheduled: {evt.date_time}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Open Peer Help Requests */}
          <div className="bg-white border border-stone-200 rounded-md p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3 border-b border-stone-100 pb-2">
              <h3 className="text-sm font-bold text-stone-900">Unsolved Peer Questions</h3>
              <Link href="/help" className="text-xs text-amber-800 font-semibold hover:underline">
                Help Board
              </Link>
            </div>

            <div className="space-y-3">
              {openQuestions.map((req) => (
                <div key={req.id} className="p-3 bg-amber-50/50 rounded border border-amber-200/80 text-xs">
                  <div className="font-bold text-stone-900 mb-1">{req.title}</div>
                  <div className="text-stone-600 line-clamp-2 mb-2">{req.description}</div>
                  <div className="flex items-center justify-between text-stone-500">
                    <span className="bg-white px-2 py-0.5 rounded border border-stone-200 text-[11px] font-medium">
                      {req.subject}
                    </span>
                    <Link
                      href="/help"
                      className="text-emerald-800 font-semibold text-xs hover:underline"
                    >
                      {req.replies?.length || 0} replies &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Quick Access */}
          <div className="bg-white border border-stone-200 rounded-md p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-stone-900">Campus Lounge Activity</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block animate-pulse"></span>
            </div>
            <p className="text-xs text-stone-500 mb-3">
              Live text discussions across all branches.
            </p>

            <div className="space-y-2 mb-4">
              {chatMessages.map((m) => (
                <div key={m.id} className="text-xs p-2 rounded bg-stone-50 border border-stone-100">
                  <span className="font-semibold text-stone-900 mr-1">
                    {m.author?.name || 'Student'}:
                  </span>
                  <span className="text-stone-700">{m.message}</span>
                </div>
              ))}
            </div>

            <Link
              href="/chat"
              className="w-full block text-center py-2 px-3 bg-stone-800 hover:bg-stone-900 text-white rounded text-xs font-semibold transition"
            >
              Join Single Global Room
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
