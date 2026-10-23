import { getCurrentUser } from '@/lib/auth';
import { getReports, getAllProfiles } from '@/lib/db';
import Link from 'next/link';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminPage() {
  const { user, profile, isAdmin } = await getCurrentUser();

  if (!isAdmin) {
    return (
      <div className="bg-white border border-stone-200 rounded-lg p-8 max-w-lg mx-auto my-12 text-center">
        <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto mb-3 font-bold">
          !
        </div>
        <h1 className="text-lg font-bold text-stone-900 mb-1">Access Restricted</h1>
        <p className="text-xs text-stone-500 mb-4">
          This dashboard is reserved for verified student moderators and GDG tech heads (ADMIN_EMAILS).
        </p>
        <Link href="/" className="text-xs font-semibold text-emerald-800 underline">
          &larr; Return to Student Portal
        </Link>
      </div>
    );
  }

  const reports = await getReports();
  const profiles = await getAllProfiles();

  return (
    <div className="space-y-6">
      <div className="border-b border-stone-200 pb-5 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200 inline-block mb-1">
            Moderator Control Center
          </div>
          <h1 className="text-2xl font-bold text-stone-900">
            Safety & Content Moderation
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Logged in as {user.email} (Administrator)
          </p>
        </div>
      </div>

      <AdminDashboardClient initialReports={reports} initialProfiles={profiles} />
    </div>
  );
}
