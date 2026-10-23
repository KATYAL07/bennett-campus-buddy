'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';

export default function EventDetailPage({ params }) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isRsvpd, setIsRsvpd] = useState(false);
  const [rsvpCount, setRsvpCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.profile) setCurrentUser(data.profile);
      })
      .catch(() => {});

    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => {
        const found = data.events?.find((e) => e.id === eventId);
        if (found) {
          setEvent(found);
          setRsvpCount(found.rsvps?.length || 0);
        }
      })
      .finally(() => setLoading(false));
  }, [eventId]);

  useEffect(() => {
    if (currentUser && event) {
      setIsRsvpd(event.rsvps?.includes(currentUser.id) || false);
    }
  }, [currentUser, event]);

  async function handleToggleRsvp() {
    if (!currentUser) {
      window.location.href = '/login';
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/events/${eventId}/rsvp`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setIsRsvpd(data.userHasRsvpd);
        setRsvpCount((prev) => (data.userHasRsvpd ? prev + 1 : Math.max(0, prev - 1)));
      }
    } catch (err) {
      console.error('RSVP toggle error', err);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="text-sm text-stone-500 py-12 text-center">Loading event details...</div>;
  }

  if (!event) {
    return (
      <div className="bg-white border border-stone-200 rounded p-8 text-center">
        <h2 className="text-lg font-bold text-stone-900 mb-2">Event Not Found</h2>
        <Link href="/events" className="text-xs text-emerald-800 font-semibold underline">
          &larr; Back to all events
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/events" className="text-xs font-semibold text-emerald-800 hover:underline">
        &larr; Back to Campus Events
      </Link>

      <div className="bg-white border border-stone-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
            {event.category}
          </span>
          {/* Planted flaw: Raw ISO string date */}
          <span className="text-xs text-stone-400">
            {event.date_time}
          </span>
        </div>

        <h1 className="text-2xl font-extrabold text-stone-900 mb-2 leading-tight">
          {event.title}
        </h1>

        <div className="text-sm font-semibold text-emerald-800 mb-6">
          Organized by {event.club}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-stone-50 rounded-md border border-stone-200 mb-6 text-xs text-stone-700">
          <div>
            <span className="font-bold text-stone-900 block mb-0.5">Venue Location:</span>
            <span>{event.venue}</span>
          </div>
          <div>
            {/* Planted typo flaw: "Reserveration" */}
            <span className="font-bold text-stone-900 block mb-0.5">Current Reserverations:</span>
            <span>{rsvpCount} Students Registered</span>
          </div>
        </div>

        <div className="border-t border-stone-100 pt-5 mb-8">
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-2">
            About This Session
          </h2>
          <p className="text-sm text-stone-700 whitespace-pre-line leading-relaxed">
            {event.description}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-stone-200">
          <div>
            <span className="text-xs text-stone-500">
              {currentUser ? `Signed in as ${currentUser.name}` : 'Sign in to confirm your seat'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleRsvp}
              disabled={submitting}
              className={`px-5 py-2 rounded-md text-xs font-bold transition ${
                isRsvpd
                  ? 'bg-stone-200 text-stone-800 hover:bg-stone-300'
                  : 'bg-emerald-800 text-white hover:bg-emerald-900'
              }`}
            >
              {isRsvpd ? 'Cancel My RSVP' : 'RSVP for Event'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
