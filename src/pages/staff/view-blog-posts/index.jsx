// src/pages/staff/ViewBlogPostsPage.jsx
import React, { useEffect, useState, useRef, Fragment } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchAllPosts,
  createBlogPost,
  submitForApproval,
  fetchTags,
  createTag
} from '@/service/blogservice';
import { fetchUserById } from '@/service/userService';
import CommentList from '@/components/blog/CommentList';
import { uploadFile } from '@/utils/upload';
import { Transition } from '@headlessui/react';

export default function ViewBlogPostsPage() {
  const statusTabs = [
    { key: 'pending',   label: 'Pending'   },
    { key: 'reviewed',  label: 'Reviewed'  },
    { key: 'published', label: 'Published' },
  ];
  const [selectedTab, setSelectedTab]       = useState('pending');
  const [posts, setPosts]                   = useState([]);
  const [expandedPostId, setExpandedPostId] = useState(null);

  // Tag states
  const [availableTags, setAvailableTags]   = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [newTagName, setNewTagName]         = useState('');
  const [tagPanelOpen, setTagPanelOpen]     = useState(false);

  // New-blog modal state
  const [showNewModal, setShowNewModal]     = useState(false);
  const [newTitle, setNewTitle]             = useState('');
  const [newCover, setNewCover]             = useState('');
  const [newContent, setNewContent]         = useState('');
  const [uploading, setUploading]           = useState(false);

  const scrollRef = useRef();

  // Load posts + author names
  useEffect(() => {
    (async () => {
      const data = await fetchAllPosts();
      const enriched = await Promise.all(
        data.map(async p => {
          let author = 'Unknown';
          try {
            const u = await fetchUserById(p.createdById);
            author = u.name;
          } catch {}
          return { ...p, authorName: author };
        })
      );
      setPosts(enriched);
    })();
  }, []);

  // Load tags
  useEffect(() => {
    fetchTags().then(list => setAvailableTags(list));
  }, []);

  // Add a new tag via API and select it
  const handleAddNewTag = async () => {
    const name = newTagName.trim();
    if (!name) return;
    try {
      const created = await createTag(name);
      setAvailableTags(ts => [...ts, created]);
      setSelectedTagIds(ids => [...ids, created.id]);
      setNewTagName('');
    } catch (err) {
      console.error('Failed to create tag', err);
    }
  };

  // Create new blog post
  const handleCreate = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    const payload = {
      title: newTitle,
      content: newContent,
      coverImageUrl: newCover,
      tagIds: selectedTagIds,
    };
    const created = await createBlogPost(payload);
    const author = (await fetchUserById(created.createdById)
      .catch(() => ({ name: 'Unknown' })))
      .name;
    setPosts([{ ...created, authorName: author }, ...posts]);
    setShowNewModal(false);
    setNewTitle(''); setNewCover(''); setNewContent('');
    setSelectedTagIds([]); setNewTagName('');
    scrollRef.current?.scrollTo(0, 0);
  };

  // Send to approval
  const handleSendForApproval = async postId => {
    await submitForApproval(postId);
    setPosts(ps => ps.map(p =>
      p.id === postId ? { ...p, status: 'Submitted' } : p
    ));
  };

  // Filter posts by status
  const filtered = posts.filter(p => {
    if (selectedTab === 'pending')   return p.status === 'Pending';
    if (selectedTab === 'reviewed')  return ['Approved','Rejected'].includes(p.status);
    if (selectedTab === 'published') return p.status === 'Published';
    return false;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blog Posts & Comments</h1>
        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
        >
          New Blog
        </button>
      </div>

      {/* Status Tabs */}
      <div className="mb-6">
        <div className="flex space-x-3">
          {statusTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => { setSelectedTab(tab.key); setExpandedPostId(null); }}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedTab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* New Blog Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg w-full max-w-lg p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              onClick={() => setShowNewModal(false)}
            >✕</button>

            <h2 className="text-xl font-semibold mb-4">Create New Blog</h2>
            <div className="space-y-4">
              {/* Title */}
              <input
                type="text"
                placeholder="Title"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />

              {/* Cover URL */}
              <input
                type="text"
                placeholder="Cover Image URL"
                value={newCover}
                onChange={e => setNewCover(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />

              {/* Or upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Or choose an image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async e => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setUploading(true);
                    const url = await uploadFile(f, 'blog-covers');
                    setUploading(false);
                    if (url) setNewCover(url);
                  }}
                  className="w-full text-sm text-gray-500"
                />
                {uploading && (
                  <p className="text-xs text-gray-500 mt-1">Uploading...</p>
                )}
              </div>

              {/* Content */}
              <textarea
                rows={4}
                placeholder="Content"
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 resize-none"
              />

              {/* Tag selector */}
              <div className="relative">
                <button
                  onClick={() => setTagPanelOpen(open => !open)}
                  className="w-full text-left px-3 py-2 border border-gray-300 rounded hover:bg-gray-100"
                >
                  {selectedTagIds.length
                    ? `Selected ${selectedTagIds.length} tag(s)`
                    : 'Choose tags...'}
                </button>

                <Transition
                  as={Fragment}
                  show={tagPanelOpen}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-1"
                >
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg p-4 max-h-64 overflow-y-auto">
                    <div className="space-y-2">
                      {availableTags.map(tag => {
                        const sel = selectedTagIds.includes(tag.id);
                        return (
                          <label key={tag.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={sel}
                              onChange={() => {
                                setSelectedTagIds(ids =>
                                  sel
                                    ? ids.filter(x => x !== tag.id)
                                    : [...ids, tag.id]
                                );
                              }}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                            <span className="text-gray-800">{tag.name}</span>
                          </label>
                        );
                      })}

                      <div className="mt-4 border-t pt-3">
                        <input
                          type="text"
                          placeholder="Add new tag"
                          value={newTagName}
                          onChange={e => setNewTagName(e.target.value)}
                          className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
                        />
                        <button
                          onClick={handleAddNewTag}
                          className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                        >
                          Add Tag
                        </button>
                      </div>
                    </div>
                  </div>
                </Transition>
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Posts List */}
      <div
        ref={scrollRef}
        className="space-y-4 overflow-y-auto pr-2"
        style={{ maxHeight: '75vh' }}
      >
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-10">
            Không có bài nào trong mục này.
          </p>
        )}

        {filtered.map(post => (
          <div key={post.id} className="bg-white rounded-lg shadow p-6">
            {/* Header Info */}
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1">
                <div className="flex flex-wrap items-center space-x-2 mb-2">
                  <span className="inline-block bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                    Blog Post
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(post.createdDate).toLocaleDateString()}
                  </span>
                  <span className="inline-block text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                    {post.status}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {post.title}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  By <span className="font-medium">{post.authorName}</span>
                </p>
              </div>

              {/* Actions */}
              <div className="mt-4 md:mt-0 flex space-x-4">
                {selectedTab === 'pending' && (
                  <button
                    onClick={() => handleSendForApproval(post.id)}
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
                  >
                    Send to Approval
                  </button>
                )}
                {selectedTab === 'published' && (
                  <button
                    onClick={() =>
                      setExpandedPostId(expandedPostId === post.id ? null : post.id)
                    }
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
                  >
                    {expandedPostId === post.id
                      ? 'Hide Comments'
                      : `Manage Comments (${post.comments?.length || 0})`}
                  </button>
                )}
                <Link
                  to={`/blogs/${post.id}`}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded"
                >
                  View Details
                </Link>
              </div>
            </div>

            {/* Review Comments if Rejected */}
            {selectedTab === 'reviewed' && post.status === 'Rejected' && (
              <div className="bg-red-50 border border-red-200 p-4 rounded mb-4">
                <h3 className="font-semibold text-red-800 mb-2">Review Comments</h3>
                <p className="text-red-700 whitespace-pre-wrap">
                  {post.reviewComments}
                </p>
              </div>
            )}

            {/* Inline Comments for Published */}
            {selectedTab === 'published' && expandedPostId === post.id && (
              <div className="mt-4 border-t pt-4">
                <CommentList
                  comments={post.comments || []}
                  postId={post.id}
                  onAddComment={() => {}}
                  onAddReply={() => {}}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
