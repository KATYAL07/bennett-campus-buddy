'use client';

import { useState } from 'react';

export default function AdminDashboardClient({ initialReports, initialProfiles }) {
  const [reports, setReports] = useState(initialReports || []);
  const [profiles, setProfiles] = useState(initialProfiles || []);
  const [activeTab, setActiveTab] = useState('reports');
  const [statusMsg, setStatusMsg] = useState(null);

  async function handleResolveReport(id) {
    try {
      const res = await fetch(`/api/admin/reports/${id}`, { method: 'POST' });
      if (res.ok) {
        setReports(reports.map((r) => (r.id === id ? { ...r, status: 'resolved' } : r)));
        setStatusMsg('Report marked as resolved');
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteContent(targetType, targetId) {
    if (!confirm(`Are you sure you want to delete this ${targetType}?`)) return;

    try {
      let endpoint = '';
      if (targetType === 'post') endpoint = `/api/posts/${targetId}`;
      else if (targetType === 'chat_message') endpoint = `/api/chat/${targetId}`;
      else if (targetType === 'help_request') endpoint = `/api/help/${targetId}`;

      if (endpoint) {
        const res = await fetch(endpoint, { method: 'DELETE' });
        if (res.ok) {
          setStatusMsg(`Offending ${targetType} deleted successfully`);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleToggleBan(userId, currentBanned) {
    const action = currentBanned ? 'unban' : 'ban';
    if (!confirm(`Are you sure you want to ${action} this student account?`)) return;

    try {
      const res = await fetch('/api/admin/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isBanned: !currentBanned }),
      });
      if (res.ok) {
        setProfiles(
          profiles.map((p) => (p.id === userId ? { ...p, is_banned: !currentBanned } : p))
        );
        setStatusMsg(`User status updated to ${!currentBanned ? 'BANNED' : 'ACTIVE'}`);
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6">
      {statusMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded flex justify-between items-center">
          <span>{statusMsg}</span>
          <button onClick={() => setStatusMsg(null)} className="font-bold">&times;</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-stone-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-2.5 px-3 border-b-2 transition ${
            activeTab === 'reports'
              ? 'border-red-700 text-red-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Flagged Reports ({reports.filter((r) => r.status === 'pending').length} Pending)
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-2.5 px-3 border-b-2 transition ${
            activeTab === 'users'
              ? 'border-red-700 text-red-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Student User Directory & Suspension ({profiles.length})
        </button>
      </div>

      {/* Reports View */}
      {activeTab === 'reports' && (
        <div className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-sm">
          <div className="p-4 bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-700">
            Incoming Peer Reports
          </div>
          {reports.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-500">
              Zero pending reports. The campus feed and lounge are clean!
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {reports.map((r) => (
                <div key={r.id} className="p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 uppercase">
                        [{r.target_type}]
                      </span>
                      <span className="font-mono text-stone-500">ID: {r.target_id}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          r.status === 'resolved'
                            ? 'bg-stone-100 text-stone-600'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {r.status !== 'resolved' && (
                        <button
                          onClick={() => handleResolveReport(r.id)}
                          className="px-2.5 py-1 bg-stone-200 hover:bg-stone-300 rounded font-medium text-stone-800"
                        >
                          Mark Resolved
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteContent(r.target_type, r.target_id)}
                        className="px-2.5 py-1 bg-red-700 hover:bg-red-800 text-white rounded font-medium"
                      >
                        Delete Content
                      </button>
                    </div>
                  </div>

                  <div className="text-stone-700">
                    <span className="font-semibold text-stone-900">Reason reported: </span>
                    {r.reason}
                  </div>

                  <div className="text-[11px] text-stone-400">
                    Submitted at {r.created_at} by {r.reporter?.name || r.reporter_id}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Users View */}
      {activeTab === 'users' && (
        <div className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-sm">
          <div className="p-4 bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-700">
            Registered Student Accounts
          </div>
          <div className="divide-y divide-stone-100">
            {profiles.map((p) => (
              <div key={p.id} className="p-4 text-xs flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 text-sm">{p.name}</span>
                    <span className="text-stone-500 font-mono text-[11px]">{p.email}</span>
                    {p.is_banned && (
                      <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[10px]">
                        BANNED
                      </span>
                    )}
                  </div>
                  <div className="text-stone-500 text-[11px] mt-0.5">
                    {p.branch} • Semester {p.semester} • Role: {p.role}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleBan(p.id, p.is_banned)}
                    className={`px-3 py-1.5 rounded font-bold text-xs transition ${
                      p.is_banned
                        ? 'bg-emerald-800 text-white hover:bg-emerald-900'
                        : 'bg-red-700 text-white hover:bg-red-800'
                    }`}
                  >
                    {p.is_banned ? 'Unban Account' : 'Ban Account'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
