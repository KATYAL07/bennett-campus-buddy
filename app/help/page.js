'use client';

import { useState, useEffect } from 'react';
import ReportModal from '@/components/ReportModal';

export default function HelpBoardPage() {
  const [requests, setRequests] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [filterSolved, setFilterSolved] = useState('All');
  const [currentUser, setCurrentUser] = useState(null);

  // New question form
  const [showAskModal, setShowAskModal] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Selected question drawer / reply form
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.profile) setCurrentUser(data.profile);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadRequests();
  }, [selectedSubject, filterSolved]);

  async function loadRequests() {
    const params = new URLSearchParams();
    if (selectedSubject !== 'All') params.set('subject', selectedSubject);
    if (filterSolved === 'solved') params.set('solved', 'true');
    if (filterSolved === 'unsolved') params.set('solved', 'false');

    try {
      const res = await fetch(`/api/help?${params.toString()}`);
      const data = await res.json();
      if (data.requests) setRequests(data.requests);
    } catch (err) {
      console.error('Failed to load help board', err);
    }
  }

  async function handleAskQuestion(e) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch('/api/help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subject,
          description,
          tags: tagsInput,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post question');

      setShowAskModal(false);
      setTitle('');
      setSubject('');
      setDescription('');
      setTagsInput('');
      loadRequests();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddReply(e) {
    e.preventDefault();
    if (!activeQuestion || !replyMessage.trim()) return;

    setReplySubmitting(true);
    try {
      const res = await fetch(`/api/help/${activeQuestion.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyMessage.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit reply');

      setReplyMessage('');
      // Refresh current question
      const updatedReqs = await fetch('/api/help').then((r) => r.json());
      if (updatedReqs.requests) {
        setRequests(updatedReqs.requests);
        const refetched = updatedReqs.requests.find((r) => r.id === activeQuestion.id);
        if (refetched) setActiveQuestion(refetched);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setReplySubmitting(false);
    }
  }

  async function handleToggleSolved(reqId, currentSolved) {
    try {
      const res = await fetch(`/api/help/${reqId}/solve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_solved: !currentSolved }),
      });
      if (res.ok) {
        loadRequests();
        if (activeQuestion && activeQuestion.id === reqId) {
          setActiveQuestion({ ...activeQuestion, is_solved: !currentSolved });
        }
      }
    } catch (err) {
      console.error('Failed to toggle solved status', err);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Peer Help Board
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Ask homework doubts, coding debug queries, or lab circuit questions and get answers from campus peers.
          </p>
        </div>

        <button
          onClick={() => setShowAskModal(true)}
          className="px-4 py-2 bg-amber-700 text-white rounded-md text-sm font-semibold hover:bg-amber-800 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>Ask a Question</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3 bg-white border border-stone-200 rounded p-3 text-xs">
        <span className="font-semibold text-stone-700">Filter By Status:</span>
        <button
          onClick={() => setFilterSolved('All')}
          className={`px-3 py-1 rounded border transition ${
            filterSolved === 'All'
              ? 'bg-stone-800 text-white border-stone-800'
              : 'border-stone-200 text-stone-700 hover:bg-stone-50'
          }`}
        >
          All Questions
        </button>
        <button
          onClick={() => setFilterSolved('unsolved')}
          className={`px-3 py-1 rounded border transition ${
            filterSolved === 'unsolved'
              ? 'bg-amber-700 text-white border-amber-800'
              : 'border-stone-200 text-stone-700 hover:bg-stone-50'
          }`}
        >
          Open / Unsolved
        </button>
        <button
          onClick={() => setFilterSolved('solved')}
          className={`px-3 py-1 rounded border transition ${
            filterSolved === 'solved'
              ? 'bg-emerald-800 text-white border-emerald-900'
              : 'border-stone-200 text-stone-700 hover:bg-stone-50'
          }`}
        >
          Solved
        </button>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {requests.map((req) => (
          <div
            key={req.id}
            className="bg-white border border-stone-200 rounded-md p-5 shadow-sm hover:border-stone-300 transition"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                    req.is_solved
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {req.is_solved ? 'Solved' : 'Open Question'}
                </span>
                <span className="text-xs font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                  {req.subject}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs">
                {currentUser?.id === req.author_id && (
                  <button
                    onClick={() => handleToggleSolved(req.id, req.is_solved)}
                    className="text-emerald-800 font-semibold underline hover:text-emerald-950"
                  >
                    {req.is_solved ? 'Mark as Unsolved' : 'Mark Solved'}
                  </button>
                )}
                <button
                  onClick={() => setReportTarget({ type: 'help_request', id: req.id })}
                  className="text-stone-400 hover:text-stone-600"
                >
                  Report
                </button>
              </div>
            </div>

            <h2 className="text-base font-bold text-stone-900 mb-1 leading-snug">
              {req.title}
            </h2>

            <p className="text-xs text-stone-700 leading-relaxed mb-3 whitespace-pre-line">
              {req.description}
            </p>

            {/* Planted flaw: Tags rendered, but clicking them does nothing (no tag filtering functionality) */}
            {req.tags && req.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mb-3">
                {req.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded border border-stone-200 cursor-pointer hover:bg-stone-200"
                    title="Filter by tag (starter issue)"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-xs text-stone-500">
              <div className="flex items-center gap-2">
                <span>Asked by {req.author?.name || 'Student'}</span>
                <span>•</span>
                {/* Planted flaw: Raw ISO string date */}
                <span>{req.created_at}</span>
              </div>

              <button
                onClick={() => setActiveQuestion(req)}
                className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium rounded border border-stone-300 transition"
              >
                {req.replies?.length || 0} Answers / View Discussion &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Answers / Discussion Modal Drawer */}
      {activeQuestion && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg border border-stone-200 max-w-2xl w-full p-6 shadow-xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                    activeQuestion.is_solved
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {activeQuestion.is_solved ? 'Solved' : 'Open'}
                </span>
                <span className="text-xs text-stone-500 font-medium">{activeQuestion.subject}</span>
              </div>
              <button
                onClick={() => setActiveQuestion(null)}
                className="text-stone-400 hover:text-stone-600 font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <h2 className="text-lg font-bold text-stone-900 mb-2 leading-snug">
              {activeQuestion.title}
            </h2>
            <p className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-3 rounded border border-stone-200 mb-5 whitespace-pre-line">
              {activeQuestion.description}
            </p>

            {/* Replies List */}
            <div className="space-y-3 mb-6 max-h-72 overflow-y-auto pr-1">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                Replies ({activeQuestion.replies?.length || 0})
              </h3>
              {(!activeQuestion.replies || activeQuestion.replies.length === 0) && (
                <div className="text-xs text-stone-400 py-3 text-center">
                  No replies yet. Be the first peer to provide an explanation!
                </div>
              )}
              {activeQuestion.replies?.map((reply) => (
                <div key={reply.id} className="p-3 rounded border border-stone-200 bg-white text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-stone-900">
                      {reply.author?.name || 'Peer Helper'}
                    </span>
                    <span className="text-stone-400 text-[10px]">{reply.created_at}</span>
                  </div>
                  <p className="text-stone-700 whitespace-pre-line">{reply.message}</p>
                </div>
              ))}
            </div>

            {/* Reply Input Form */}
            <form onSubmit={handleAddReply} className="space-y-2 border-t border-stone-100 pt-3">
              <label className="block text-xs font-medium text-stone-700">Write an answer or solution</label>
              <textarea
                rows="3"
                required
                placeholder="Explain the step-by-step logic or provide reference links..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                className="w-full border border-stone-300 rounded p-2 text-xs text-stone-900 focus:outline-none"
              ></textarea>
              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  disabled={replySubmitting}
                  className="px-4 py-1.5 bg-emerald-800 text-white rounded text-xs font-semibold hover:bg-emerald-900 disabled:opacity-50"
                >
                  {replySubmitting ? 'Submitting...' : 'Post Reply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ask Question Modal */}
      {showAskModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-stone-200 max-w-lg w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="text-base font-bold text-stone-900">Ask a Question</h3>
              <button
                onClick={() => setShowAskModal(false)}
                className="text-stone-400 hover:text-stone-600 font-semibold text-lg"
              >
                &times;
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded mb-3">
                {formError}
              </div>
            )}

            <form onSubmit={handleAskQuestion} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cannot resolve segmentation fault in C linked list"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-stone-300 rounded p-2 text-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Programming in C / Digital Logic"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full border border-stone-300 rounded p-2 text-stone-900 focus:outline-none"
                />
              </div>

              <div>
                {/* Planted typo: "desciption" */}
                <label className="block font-medium text-stone-700 mb-1">Problem desciption *</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Paste relevant error messages, code snippets, or lab worksheet numbers..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-stone-300 rounded p-2 text-stone-900 focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="c, pointers, mid-term"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full border border-stone-300 rounded p-2 text-stone-900 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAskModal(false)}
                  className="px-4 py-2 border border-stone-300 rounded text-stone-700 font-medium hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-amber-700 text-white rounded font-medium hover:bg-amber-800 disabled:opacity-50"
                >
                  {submitting ? 'Posting...' : 'Submit Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
