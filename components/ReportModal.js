'use client';

import { useState } from 'react';

export default function ReportModal({ targetType, targetId, onClose }) {
  const [reason, setReason] = useState('Inappropriate or inaccurate content');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_type: targetType,
          target_id: targetId,
          reason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit report');

      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-md border border-stone-200 max-w-sm w-full p-5 shadow-md">
        <h3 className="text-sm font-bold text-stone-900 mb-1">Report Content</h3>
        <p className="text-xs text-stone-600 mb-4">
          Flag this item for student moderators. All reports are audited on the admin dashboard.
        </p>

        {submitted ? (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded mb-3">
            Thank you. Your report has been submitted for review.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded mb-3">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Reason for report
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-xs border border-stone-300 rounded p-2 bg-white text-stone-800 focus:outline-none"
              >
                <option value="Inappropriate or abusive language">Inappropriate or abusive language</option>
                <option value="Incorrect or misleading academic material">Incorrect or misleading academic material</option>
                <option value="Spam or commercial promotion">Spam or commercial promotion</option>
                <option value="Copyright or intellectual property issue">Copyright or intellectual property issue</option>
                <option value="Other concern">Other concern</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 border border-stone-300 rounded text-stone-700 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-3 py-1.5 bg-red-700 text-white font-medium rounded hover:bg-red-800 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
