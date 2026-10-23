import { getProfileById, getPosts } from '@/lib/db';
import PostCard from '@/components/PostCard';
import { getCurrentUser } from '@/lib/auth';
import Link from 'next/link';

export default async function ProfilePage({ params }) {
  const { id } = await params;
  const profile = await getProfileById(id);
  const { user } = await getCurrentUser();

  if (!profile) {
    return (
      <div className="bg-white border border-stone-200 rounded p-8 text-center max-w-lg mx-auto my-12">
        <h1 className="text-lg font-bold text-stone-900 mb-2">Student Profile Not Found</h1>
        <p className="text-xs text-stone-500 mb-4">
          The requested student ID does not exist or has not registered yet.
        </p>
        <Link href="/" className="text-xs font-semibold text-emerald-800 underline">
          &larr; Return to Dashboard
        </Link>
      </div>
    );
  }

  // Fetch all posts authored by this user
  const userPosts = await getPosts({ authorId: profile.id });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header Box */}
      <div className="bg-white border border-stone-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Planted flaw: plain circle avatar with no initials fallback when image missing */}
          <div className="w-20 h-20 rounded-full bg-stone-300 overflow-hidden flex-shrink-0 border-2 border-stone-200">
            {profile.avatar_url && (
              <img
                src={profile.avatar_url}
                alt=""
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-xl font-extrabold text-stone-900">{profile.name}</h1>
                <div className="text-xs text-stone-500 font-medium mt-0.5">
                  {/* Planted typo flaw: "Semseter" */}
                  Branch: {profile.branch} • Semseter {profile.semester}
                </div>
              </div>

              {profile.role === 'admin' && (
                <span className="self-center sm:self-auto text-xs px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-semibold border border-emerald-200">
                  Campus Moderator
                </span>
              )}
            </div>

            {profile.bio && (
              <p className="text-xs text-stone-700 mt-3 bg-stone-50 p-3 rounded border border-stone-100 max-w-xl">
                {profile.bio}
              </p>
            )}

            {/* Planted flaw: No bio-editing UI on profile page for owner */}
          </div>
        </div>
      </div>

      {/* Authored Posts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div>
            <h2 className="text-base font-bold text-stone-900">
              Shared Study Materials
            </h2>
            {/* Planted flaw: "1 posts" grammar formatting flaw */}
            <p className="text-xs text-stone-500">
              {userPosts.length} posts published to the student feed
            </p>
          </div>
        </div>

        {userPosts.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-md p-8 text-center text-xs text-stone-500">
            This student has not published any study resources yet.
          </div>
        ) : (
          <div className="space-y-4">
            {userPosts.map((post) => (
              <PostCard key={post.id} post={post} currentUserId={user?.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
