import { APP_CONFIG } from '@/lib/config';

export const metadata = {
  title: `Privacy Policy | ${APP_CONFIG.name}`,
  description: 'Data privacy principles and policies for the Bennett University student portal.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 bg-white border border-stone-200 rounded-lg p-8 shadow-sm">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">Privacy Policy</h1>
        <p className="text-xs text-stone-500 mt-1">
          Effective date: October 2026 • Maintained by {APP_CONFIG.maintainer} ({APP_CONFIG.maintainerRole})
        </p>
      </div>

      <div className="space-y-5 text-xs text-stone-700 leading-relaxed">
        <section>
          <h2 className="text-sm font-bold text-stone-900 mb-2">1. Overview & Campus Commitment</h2>
          <p>
            Campus Buddy is an open-source student collaboration platform built for Bennett University students participating in Hacktoberfest and academic peer study. We believe in minimal data collection, zero third-party commercial advertising, and complete transparency.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-stone-900 mb-2">2. Information We Collect</h2>
          <p className="mb-2">We collect only the bare minimum data required to facilitate student collaboration:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Full Name & Avatar:</strong> Provided by your Google sign-in to attribute your posts and peer answers.</li>
            <li><strong>Email Address:</strong> Used solely for authentication and domain verification. <em>Your email address is strictly private and is never displayed publicly to other students.</em></li>
            <li><strong>Academic Branch & Semester:</strong> Selected by you during profile setup to filter relevant question papers, syllabi, and notes.</li>
            <li><strong>Short Bio:</strong> Optional text description entered by you on your profile.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-bold text-stone-900 mb-2">3. What We Do NOT Collect</h2>
          <p>
            We do not collect student roll numbers, phone numbers, location tracking, grades, attendance, or financial information. No tracking cookies or commercial behavioral analytics are embedded in this application.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-stone-900 mb-2">4. Public Interactions</h2>
          <p>
            Content that you deliberately choose to share—including Study Feed uploads, links, peer questions on the Help Board, and messages in the Campus Lounge—is visible to other authenticated Bennett University students. Please do not share private credentials or confidential personal records.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-stone-900 mb-2">5. Data Retention & Deletion</h2>
          <p>
            If you wish to remove your profile, study uploads, or account data, reach out directly to the maintainer at <a href="mailto:arnav@bennett.edu.in" className="text-emerald-800 underline font-semibold">arnav@bennett.edu.in</a>. All requests are honored promptly.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-stone-900 mb-2">6. Open Source Codebase</h2>
          <p>
            The source code for Campus Buddy is publicly auditable on GitHub. You can review all data structures, Supabase SQL schemas, and server-side route handlers to verify our security and privacy implementation.
          </p>
        </section>
      </div>
    </div>
  );
}
