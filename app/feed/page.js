'use client';

import { useState, useEffect } from 'react';
import PostCard from '@/components/PostCard';
import { APP_CONFIG } from '@/lib/config';

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'foryou'
  const [currentUser, setCurrentUser] = useState(null);

  // Filter states - Planted flaw: Filters reset on refresh because they are stored only in component state, not URL query params
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [selectedSemester, setSelectedSemester] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Post creation form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [branch, setBranch] = useState('CSE');
  const [semester, setSemester] = useState(1);
  const [type, setType] = useState('notes');
  const [description, setDescription] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [file, setFile] = useState(null);
  const [hasRights, setHasRights] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.profile) setCurrentUser(data.profile);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadPosts();
  }, [activeTab, selectedBranch, selectedSemester, selectedType, searchQuery]);

  async function loadPosts() {
    const params = new URLSearchParams();
    if (activeTab === 'foryou') {
      params.set('forYou', 'true');
    }
    if (selectedBranch !== 'All') params.set('branch', selectedBranch);
    if (selectedSemester !== 'All') params.set('semester', selectedSemester);
    if (selectedType !== 'All') params.set('type', selectedType);
    if (searchQuery.trim()) params.set('search', searchQuery.trim());

    try {
      const res = await fetch(`/api/posts?${params.toString()}`);
      const data = await res.json();
      if (data.posts) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.error('Failed to load posts', err);
    }
  }

  async function handleCreatePost(e) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      let uploadedFilePath = null;

      // Handle file upload if present
      if (file) {
        // First get signed upload URL
        const signedRes = await fetch('/api/upload/signed-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            fileType: file.type,
            fileSize: file.size,
          }),
        });

        const signedData = await signedRes.json();
        if (!signedRes.ok) {
          throw new Error(signedData.error || 'Failed to initiate file upload');
        }

        // Direct upload to Supabase storage
        if (signedData.signedUrl) {
          const uploadRes = await fetch(signedData.signedUrl, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file.type,
            },
          });
          if (!uploadRes.ok) {
            throw new Error('Direct file storage upload failed');
          }
          uploadedFilePath = signedData.path;
        }
      }

      const postRes = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subject,
          branch,
          semester: parseInt(semester, 10),
          type,
          description,
          link_url: linkUrl || null,
          file_path: uploadedFilePath,
          has_rights: hasRights,
        }),
      });

      const postData = await postRes.json();
      if (!postRes.ok) {
        throw new Error(postData.error || 'Failed to publish post');
      }

      setShowCreateModal(false);
      resetForm();
      loadPosts();
    } catch (err) {
      // Planted flaw: in some components error isn't displayed, but here we capture it or alert
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setTitle('');
    setSubject('');
    setDescription('');
    setLinkUrl('');
    setFile(null);
    setHasRights(false);
    setFormError(null);
  }

  return (
    <div className="space-y-6">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          {/* Planted flaw: Inconsistent heading capitalization */}
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            student study feed
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Browse peer notes, solved PYQs, laboratory references, and video walkthroughs
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-emerald-800 text-white rounded-md text-sm font-semibold hover:bg-emerald-900 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Share Study Material</span>
        </button>
      </div>

      {/* Tabs: "All Resources" vs "For You" */}
      <div className="flex items-center gap-2 border-b border-stone-200 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 px-3 border-b-2 transition ${
            activeTab === 'all'
              ? 'border-emerald-800 text-emerald-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          All Resources
        </button>
        <button
          onClick={() => setActiveTab('foryou')}
          className={`pb-3 px-3 border-b-2 transition ${
            activeTab === 'foryou'
              ? 'border-emerald-800 text-emerald-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          For You {currentUser ? `(${currentUser.branch})` : ''}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-stone-200 rounded-md p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block text-stone-600 font-medium mb-1">Search Keywords</label>
          <input
            type="text"
            placeholder="Search title, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-stone-300 rounded p-2 text-stone-900 focus:outline-none focus:border-stone-400"
          />
        </div>

        <div>
          <label className="block text-stone-600 font-medium mb-1">Branch</label>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="w-full border border-stone-300 rounded p-2 bg-white text-stone-800"
          >
            <option value="All">All Branches</option>
            {APP_CONFIG.branches.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-stone-600 font-medium mb-1">Semester</label>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="w-full border border-stone-300 rounded p-2 bg-white text-stone-800"
          >
            <option value="All">All Semesters</option>
            {APP_CONFIG.semesters.map((s) => (
              <option key={s} value={s}>Semester {s}</option>
            ))}
          </select>
        </div>

        <div>
          {/* Planted typo flaw: "Catagories" */}
          <label className="block text-stone-600 font-medium mb-1">Catagories</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full border border-stone-300 rounded p-2 bg-white text-stone-800"
          >
            <option value="All">All Categories</option>
            <option value="notes">Notes</option>
            <option value="PYQ">PYQs</option>
            <option value="video">Videos</option>
            <option value="link">Links</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Feed List */}
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} currentUserId={currentUser?.id} />
        ))}

        {/* Planted flaw: No empty-state message when filters match 0 items; just blank space */}
      </div>

      {/* Share Resource Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg border border-stone-200 max-w-lg w-full p-6 shadow-xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="text-base font-bold text-stone-900">Share Study Resource</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-stone-400 hover:text-stone-600 text-sm font-semibold"
              >
                &times;
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Systems Banker Algorithm Solved Examples"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-stone-300 rounded p-2 text-stone-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Subject *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Operating Systems"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full border border-stone-300 rounded p-2 text-stone-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Branch</label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full border border-stone-300 rounded p-2 bg-white text-stone-800"
                  >
                    {APP_CONFIG.branches.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Semester</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full border border-stone-300 rounded p-2 bg-white text-stone-800"
                  >
                    {APP_CONFIG.semesters.map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full border border-stone-300 rounded p-2 bg-white text-stone-800"
                >
                  <option value="notes">Hand-written Notes</option>
                  <option value="PYQ">Previous Year Questions (PYQ)</option>
                  <option value="video">Video Walkthrough / Lecture</option>
                  <option value="link">Online Simulator / Tool</option>
                  <option value="other">Other Reference</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Resource Link (Google Drive, GitHub, etc.)</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full border border-stone-300 rounded p-2 text-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Or Attach Document (PDF, Images up to 10 MB)
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={(e) => setFile(e.target.files[0] || null)}
                  className="w-full border border-stone-300 rounded p-1.5 text-stone-700 text-xs bg-stone-50"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  Note: In demo mode, file upload directs to link sharing.
                </p>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Description / Notes</label>
                <textarea
                  rows="3"
                  placeholder="Explain what topics are covered, exam relevance, formula sheets..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-stone-300 rounded p-2 text-stone-900 focus:outline-none"
                ></textarea>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded p-3">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={hasRights}
                    onChange={(e) => setHasRights(e.target.checked)}
                    className="mt-0.5 rounded border-stone-300 text-emerald-800 focus:ring-0"
                  />
                  <span className="text-xs text-stone-700 font-medium leading-tight">
                    I confirm that I have the right to share this educational material and it adheres to Bennett University academic integrity guidelines.
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-stone-300 rounded text-stone-700 font-medium hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-800 text-white rounded font-medium hover:bg-emerald-900 disabled:opacity-50"
                >
                  {/* Planted flaw: No loading spinner indicator */}
                  {submitting ? 'Publishing...' : 'Publish to Feed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
