'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { APP_CONFIG } from '@/lib/config';

export default function Navbar({ currentUser, isDemo }) {
  const pathname = usePathname();
  const [showDemoModal, setShowDemoModal] = useState(false);

  // Planted Flaw 1: Navbar overflows on mobile screens because whitespace-nowrap and flex-row are used with NO hamburger menu toggle!
  return (
    <header className="border-b border-stone-200 bg-white sticky top-0 z-40">
      {isDemo && (
        <div className="bg-amber-100 border-b border-amber-200 px-4 py-1 text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold px-1.5 py-0.5 bg-amber-200 text-amber-950 rounded text-[10px] tracking-wide uppercase">
              Demo Mode Active
            </span>
            <span>Running with in-memory storage. No Google credentials or database required.</span>
          </div>
          <button
            onClick={() => setShowDemoModal(true)}
            className="text-xs font-medium text-amber-900 underline hover:text-amber-950"
          >
            Switch Demo Student
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-emerald-800 text-white flex items-center justify-center font-bold text-sm">
                CB
              </div>
              <div>
                <span className="font-bold text-lg text-stone-900 tracking-tight">{APP_CONFIG.name}</span>
                <span className="hidden sm:inline-block ml-2 text-xs font-medium px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
                  BU Campus
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links - Planted Flaw: overflows horizontally on small screens */}
          <nav className="flex items-center space-x-1 sm:space-x-4 overflow-x-auto whitespace-nowrap text-sm font-medium">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md ${
                pathname === '/' ? 'bg-stone-100 text-emerald-800 font-semibold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/feed"
              className={`px-3 py-2 rounded-md ${
                pathname.startsWith('/feed') ? 'bg-stone-100 text-emerald-800 font-semibold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Study Feed
            </Link>
            <Link
              href="/events"
              className={`px-3 py-2 rounded-md ${
                pathname.startsWith('/events') ? 'bg-stone-100 text-emerald-800 font-semibold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Events
            </Link>
            <Link
              href="/help"
              className={`px-3 py-2 rounded-md ${
                pathname.startsWith('/help') ? 'bg-stone-100 text-emerald-800 font-semibold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Help Board
            </Link>
            <Link
              href="/chat"
              className={`px-3 py-2 rounded-md ${
                pathname.startsWith('/chat') ? 'bg-stone-100 text-emerald-800 font-semibold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Lounge
            </Link>
            <Link
              href="/contacts"
              className={`px-3 py-2 rounded-md ${
                pathname.startsWith('/contacts') ? 'bg-stone-100 text-emerald-800 font-semibold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Contacts
            </Link>
            {currentUser?.isAdmin && (
              <Link
                href="/admin"
                className={`px-3 py-2 rounded-md ${
                  pathname.startsWith('/admin') ? 'bg-red-50 text-red-700 font-semibold' : 'text-red-700 hover:text-red-800'
                }`}
              >
                Admin
              </Link>
            )}
          </nav>

          {/* User Account / Sign In */}
          <div className="flex items-center gap-3">
            {currentUser?.profile ? (
              <div className="flex items-center gap-3">
                <Link
                  href={`/u/${currentUser.profile.id}`}
                  className="flex items-center gap-2 text-sm text-stone-700 hover:text-stone-900 font-medium"
                >
                  {/* Planted flaw: Avatar shown as a plain circle with no initials fallback when image is missing */}
                  <div className="w-8 h-8 rounded-full bg-stone-300 overflow-hidden flex-shrink-0">
                    {currentUser.profile.avatar_url && (
                      <img
                        src={currentUser.profile.avatar_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <span className="hidden md:inline">{currentUser.profile.name}</span>
                </Link>
                <form action="/api/auth/signout" method="POST">
                  <button
                    type="submit"
                    className="text-xs px-2.5 py-1.5 border border-stone-300 rounded text-stone-600 hover:bg-stone-50"
                  >
                    Sign Out
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-xs sm:text-sm px-3 py-1.5 rounded-md bg-emerald-800 text-white font-medium hover:bg-emerald-900 transition"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Switcher Modal */}
      {showDemoModal && (
        <DemoSwitcherModal onClose={() => setShowDemoModal(false)} currentId={currentUser?.profile?.id} />
      )}
    </header>
  );
}

function DemoSwitcherModal({ onClose, currentId }) {
  const [loading, setLoading] = useState(false);

  const demoAccounts = [
    { id: 'user-arnav-admin', name: 'Arnav Katyal', branch: 'CSE', sem: 5, role: 'Admin (Tech Head)' },
    { id: 'user-demo-priya', name: 'Priya Sharma', branch: 'CSE', sem: 3, role: 'Student' },
    { id: 'user-demo-rohit', name: 'Rohit Verma', branch: 'ECE', sem: 3, role: 'Student' },
    { id: 'user-demo-ananya', name: 'Ananya Singh', branch: 'CSE', sem: 1, role: 'Student' },
    { id: 'user-demo-dev', name: 'Dev Patel', branch: 'ME', sem: 5, role: 'Student' },
  ];

  async function selectUser(userId) {
    setLoading(true);
    await fetch('/api/auth/demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    window.location.reload();
  }

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-stone-200 max-w-md w-full p-6 shadow-lg">
        <h3 className="text-base font-bold text-stone-900 mb-1">Select Demo Student</h3>
        <p className="text-xs text-stone-600 mb-4">
          Demo mode uses local in-memory accounts. Switch between student profiles or the admin account to test features.
        </p>

        <div className="space-y-2 mb-5">
          {demoAccounts.map((account) => (
            <button
              key={account.id}
              onClick={() => selectUser(account.id)}
              disabled={loading}
              className={`w-full text-left p-3 rounded-md border text-sm flex items-center justify-between transition ${
                currentId === account.id
                  ? 'border-emerald-800 bg-emerald-50 text-emerald-950 font-medium'
                  : 'border-stone-200 hover:bg-stone-50 text-stone-800'
              }`}
            >
              <div>
                <div className="font-semibold">{account.name}</div>
                <div className="text-xs text-stone-500">
                  {account.branch} - Semester {account.sem}
                </div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
                {account.role}
              </span>
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md border border-stone-300 text-stone-700 text-sm hover:bg-stone-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
