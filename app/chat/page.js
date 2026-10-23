'use client';

import { useState, useEffect } from 'react';
import ReportModal from '@/components/ReportModal';
import { APP_CONFIG } from '@/lib/config';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [reportTarget, setReportTarget] = useState(null);

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.profile) setCurrentUser(data.profile);
      })
      .catch(() => {});

    loadMessages();

    // Polling every 5 seconds as specified (no WebSockets needed, works everywhere)
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  async function loadMessages() {
    try {
      const res = await fetch('/api/chat');
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
        // Planted flaw: intentionally no auto-scroll to the bottom of the container!
      }
    } catch (err) {
      console.error('Failed to poll chat messages', err);
    }
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    if (!currentUser) {
      window.location.href = '/login';
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputMessage.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setInputMessage('');
      loadMessages();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Community Rules Banner with planted typo */}
      <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-900 flex items-start justify-between">
        <div>
          {/* Planted typo flaw: "comunity" */}
          <span className="font-bold uppercase tracking-wider block mb-0.5">
            Campus Lounge comunity rules
          </span>
          <span>
            This is a single global, plain-text lounge for all Bennett University students. Keep discussion respectful. No spamming, harassment, or sharing exam answers during active examination hours.
          </span>
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="bg-white border border-stone-200 rounded-lg shadow-sm flex flex-col h-[600px]">
        {/* Chat Header */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50 rounded-t-lg">
          <div>
            <h1 className="text-base font-bold text-stone-900">Campus Lounge</h1>
            <p className="text-xs text-stone-500">Live text-only feed • Polling every 5 seconds</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span className="text-xs font-semibold text-emerald-800">Connected</span>
          </div>
        </div>

        {/* Message Feed - Planted flaw: does not auto-scroll to bottom */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 chat-scroll">
          {messages.length === 0 ? (
            <div className="text-stone-400 text-xs text-center py-12">
              No recent messages in the lounge. Say hello!
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className="flex items-start gap-3 p-2.5 rounded hover:bg-stone-50 transition border border-transparent hover:border-stone-100"
              >
                {/* Planted flaw: avatar plain circle with no initials fallback */}
                <div className="w-8 h-8 rounded-full bg-stone-200 overflow-hidden flex-shrink-0 mt-0.5">
                  {m.author?.avatar_url && (
                    <img src={m.author.avatar_url} alt="" className="w-full h-full object-cover" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-900">
                        {m.author?.name || 'Student'}
                      </span>
                      {m.author?.branch && (
                        <span className="text-[10px] text-stone-500 bg-stone-100 px-1.5 py-0.2 rounded border border-stone-200">
                          {m.author.branch}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Planted flaw: Unformatted raw ISO timestamp */}
                      <span className="text-[10px] text-stone-400">
                        {m.created_at}
                      </span>
                      <button
                        onClick={() => setReportTarget({ type: 'chat_message', id: m.id })}
                        className="text-[10px] text-stone-400 hover:text-stone-600 underline"
                      >
                        Report
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-stone-800 mt-1 break-words whitespace-pre-wrap leading-relaxed">
                    {m.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Input Form */}
        <div className="p-3 border-t border-stone-200 bg-stone-50 rounded-b-lg">
          {error && (
            <div className="p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded mb-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              maxLength={APP_CONFIG.maxMessageLength}
              placeholder={
                currentUser
                  ? 'Message Campus Lounge (max 500 characters, plain text)...'
                  : 'Sign in to send messages...'
              }
              disabled={!currentUser || submitting}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 border border-stone-300 rounded px-3 py-2 text-xs text-stone-900 bg-white focus:outline-none focus:border-stone-400 disabled:bg-stone-100"
            />
            <button
              type="submit"
              disabled={!currentUser || submitting || !inputMessage.trim()}
              className="px-4 py-2 bg-emerald-800 text-white rounded text-xs font-semibold hover:bg-emerald-900 disabled:opacity-50 transition"
            >
              {submitting ? '...' : 'Send'}
            </button>
          </form>
          <div className="flex items-center justify-between text-[10px] text-stone-400 mt-1 px-1">
            <span>Rate-limited to 5 messages per 30 seconds</span>
            <span>{inputMessage.length}/500</span>
          </div>
        </div>
      </div>

      {reportTarget && (
        <ReportModal
          targetType={reportTarget.type}
          targetId={reportTarget.id}
          onClose={() => setReportTarget(null)}
        />
      )}
    </div>
  );
}
