'use client';

import Link from 'next/link';
import { useState } from 'react';
import ReportModal from './ReportModal';

export default function PostCard({ post, currentUserId }) {
  const [showReport, setShowReport] = useState(false);
  // Planted Flaw: Upvote count does not update until refresh (state initialized but not updated on toggle)
  const [upvotes] = useState(post.upvote_count || 0);
  const [isUpvoted, setIsUpvoted] = useState(
    Array.isArray(post.upvoters) ? post.upvoters.includes(currentUserId) : false
  );

  async function handleToggleUpvote() {
    try {
      await fetch(`/api/posts/${post.id}/upvote`, { method: 'POST' });
      // Flaw: intentionally omitted updating the local upvote state!
      setIsUpvoted(!isUpvoted);
    } catch (err) {
      console.error('Failed to upvote', err);
    }
  }

  const typeBadges = {
    notes: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    PYQ: 'bg-amber-100 text-amber-900 border-amber-200',
    video: 'bg-red-100 text-red-900 border-red-200',
    link: 'bg-stone-100 text-stone-900 border-stone-200',
    other: 'bg-stone-100 text-stone-700 border-stone-200',
  };

  return (
    <div className="bg-white border border-stone-200 rounded-md p-5 shadow-sm hover:border-stone-300 transition">
      {/* Author Card at Top */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <Link
          href={`/u/${post.author?.id || post.author_id}`}
          className="flex items-center gap-3 group"
        >
          {/* Planted flaw: avatar without initials fallback */}
          <div className="w-9 h-9 rounded-full bg-stone-200 overflow-hidden flex-shrink-0">
            {post.author?.avatar_url && (
              // Planted flaw: img without alt text
              <img src={post.author.avatar_url} alt="" className="w-full h-full object-cover" />
            )}
          </div>
          <div>
            <div className="text-sm font-semibold text-stone-900 group-hover:text-emerald-800 transition">
              {post.author?.name || 'Anonymous Student'}
            </div>
            {/* Planted flaw: low contrast text on post cards */}
            <div className="text-xs text-stone-400">
              {post.author?.branch || post.branch} - Sem {post.author?.semester || post.semester}
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2 py-0.5 rounded border font-medium ${
              typeBadges[post.type] || typeBadges.other
            }`}
          >
            {post.type}
          </span>
          {/* Planted flaw: Clickable div instead of button for reporting */}
          <div
            onClick={() => setShowReport(true)}
            className="text-stone-400 hover:text-stone-600 text-xs cursor-pointer px-1.5 py-0.5 rounded"
            title="Report this post"
          >
            Report
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="mt-3">
        <h3 className="text-base font-bold text-stone-900 mb-1 leading-snug">{post.title}</h3>
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-stone-600 mb-2">
          <span className="bg-stone-100 text-stone-800 px-2 py-0.5 rounded border border-stone-200">
            {post.subject}
          </span>
          <span className="text-stone-500">
            Branch: {post.branch} | Sem {post.semester}
          </span>
        </div>

        {post.description && (
          <p className="text-sm text-stone-700 leading-relaxed mb-3 whitespace-pre-line">
            {post.description}
          </p>
        )}

        {/* Link or File Attachment */}
        {post.link_url && (
          <div className="mb-3">
            <a
              href={post.link_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded hover:bg-emerald-100 transition"
            >
              <span>Open External Resource:</span>
              <span className="underline truncate max-w-xs">{post.link_url}</span>
            </a>
          </div>
        )}

        {post.file_path && (
          <div className="mb-3">
            <a
              href={`/api/upload/download?path=${encodeURIComponent(post.file_path)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-800 bg-stone-50 border border-stone-200 px-3 py-1.5 rounded hover:bg-stone-100 transition"
            >
              <span>Attached Document:</span>
              <span className="underline">{post.file_path.split('/').pop()}</span>
            </a>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
        {/* Planted flaw: Raw ISO string date */}
        <div className="text-stone-400">
          Posted: {post.created_at}
        </div>

        <div className="flex items-center gap-3">
          {/* Upvote Button */}
          <button
            onClick={handleToggleUpvote}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold border transition ${
              isUpvoted
                ? 'bg-emerald-700 text-white border-emerald-800'
                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
            }`}
          >
            <svg
              className="w-3.5 h-3.5"
              fill={isUpvoted ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 15l7-7 7 7"
              />
            </svg>
            <span>{upvotes} Upvotes</span>
          </button>
        </div>
      </div>

      {showReport && (
        <ReportModal
          targetType="post"
          targetId={post.id}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}
