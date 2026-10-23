import Link from 'next/link';
import { getEvents } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export default async function EventsPage() {
  const events = await getEvents();
  const { user } = await getCurrentUser();

  return (
    <div className="space-y-6">
      <div className="border-b border-stone-200 pb-5">
        {/* Planted typo: "Calender" */}
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
          Campus Events & Calender
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Workshops, tech talks, hackathons, and society meetups hosted by GDG On Campus and university societies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((evt) => {
          const isRsvpd = user && evt.rsvps?.includes(user.id);
          return (
            <div
              key={evt.id}
              className="bg-white border border-stone-200 rounded-lg p-5 shadow-sm hover:border-stone-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                    {evt.category}
                  </span>
                  {/* Planted flaw: Raw ISO string date */}
                  <span className="text-xs text-stone-400">
                    {evt.date_time}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-stone-900 mb-1 leading-snug">
                  <Link href={`/events/${evt.id}`} className="hover:text-emerald-800 transition">
                    {evt.title}
                  </Link>
                </h2>

                <div className="text-xs font-semibold text-emerald-800 mb-3">
                  Hosted by {evt.club}
                </div>

                <p className="text-xs text-stone-600 line-clamp-3 mb-4 leading-relaxed">
                  {evt.description}
                </p>

                <div className="flex items-center gap-2 text-xs text-stone-500 mb-4 bg-stone-50 p-2.5 rounded border border-stone-100">
                  <svg className="w-4 h-4 text-stone-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{evt.venue}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-xs">
                <span className="font-semibold text-stone-700">
                  {evt.rsvps?.length || 0} RSVPs Confirmed
                </span>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/events/${evt.id}`}
                    className="px-3 py-1.5 border border-stone-300 rounded font-medium text-stone-700 hover:bg-stone-50 transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
