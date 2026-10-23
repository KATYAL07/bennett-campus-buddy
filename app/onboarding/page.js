'use client';

import { useState, useEffect } from 'react';
import { APP_CONFIG } from '@/lib/config';

export default function OnboardingPage() {
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('CSE');
  const [semester, setSemester] = useState(1);
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.profile) {
          setName(data.profile.name || '');
          setBranch(data.profile.branch || 'CSE');
          setSemester(data.profile.semester || 1);
          setBio(data.profile.bio || '');
        }
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          branch,
          semester: parseInt(semester, 10),
          bio,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      window.location.href = '/';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto my-12 bg-white border border-stone-200 rounded-lg p-8 shadow-sm">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-stone-900">Complete Your Student Profile</h1>
        <p className="text-xs text-stone-500 mt-1">
          Tell us your branch and semester so we can personalize study materials for you.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-medium text-stone-700 mb-1">Display Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-stone-300 rounded p-2 text-stone-900 focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-medium text-stone-700 mb-1">Academic Branch *</label>
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="w-full border border-stone-300 rounded p-2 bg-white text-stone-900"
          >
            {APP_CONFIG.branches.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium text-stone-700 mb-1">Current Semester (1-8) *</label>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="w-full border border-stone-300 rounded p-2 bg-white text-stone-900"
          >
            {APP_CONFIG.semesters.map((s) => (
              <option key={s} value={s}>Semester {s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium text-stone-700 mb-1">Short Bio (Optional)</label>
          <textarea
            rows="3"
            maxLength={240}
            placeholder="Tell your classmates about your academic interests, club memberships, or study goals..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full border border-stone-300 rounded p-2 text-stone-900 focus:outline-none"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-emerald-800 text-white rounded font-bold hover:bg-emerald-900 disabled:opacity-50 transition"
        >
          {loading ? 'Saving Profile...' : 'Save & Continue to Campus Buddy'}
        </button>
      </form>
    </div>
  );
}
