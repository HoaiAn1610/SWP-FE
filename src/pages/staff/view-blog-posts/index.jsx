// src/pages/staff/ViewBlogPostsPage.jsx
import React, { useEffect, useState, useRef, Fragment } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchAllPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  submitForApproval,
  fetchTags,
  createTag,
  deleteComment
} from '@/service/blogservice';
import { fetchUserById } from '@/service/userService';
import CommentList from '@/components/blog/CommentList';
import { uploadFile } from '@/utils/upload';
import { Transition } from '@headlessui/react';

export default function ViewBlogPostsPage() {
  // Bảng chuyển đổi status từ tiếng Anh --> tiếng Việt
  const statusLabels = {
    Pending:   'Chờ duyệt',
    Submitted: 'Đã gửi duyệt',
    Approved:  'Đã phê duyệt',
    Rejected:  'Đã từ chối',
    Published: 'Đã xuất bản'
  };

  // Ba tab: Chờ duyệt, Đã xử lý, Đã xuất bản
  const statusTabs = [
    { key: 'pending',   label: 'Chờ duyệt'     },
    { key: 'reviewed',  label: 'Đã xử lý'      },
    { key: 'published', label: 'Đã xuất bản'   },
  ];

  const [selectedTab, setSelectedTab]       = useState('pending');
  const [posts, setPosts]                   = useState([]);
  const [expandedPostId, setExpandedPostId] = useState(null);

  // Tag states
  const [availableTags, setAvailableTags]   = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [newTagName, setNewTagName]         = useState('');
  const [tagPanelOpen, setTagPanelOpen]     = useState(false);

  // Modal state
  const [showModal, setShowModal]           = useState(false);
  const [isEditing, setIsEditing]           = useState(false);
  const [editingPostId, setEditingPostId]   = useState(null);
  const [newTitle, setNewTitle]             = useState('');
  const [newCover, setNewCover]             = useState('');
  const [newContent, setNewContent]         = useState('');
  const [uploading, setUploading]           = useState(false);

  // Alert popup state
  const [alertVisible, setAlertVisible]     = useState(false);
  const [alertMessage, setAlertMessage]     = useState('');

  // Confirm dialog state
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction]   = useState(() => {});

  const scrollRef = useRef();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const storedId = localStorage.getItem('id');
    if (!storedId) return;
    fetchUserById(+storedId)
      .then(u => setCurrentUser(u))
      .catch(console.error);
  }, []);

  useEffect(() => {
    (async () => {
      const data = await fetchAllPosts();
      const enriched = await Promise.all(
        data.map(async p => {
          let author = 'Ẳn danh';
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

  useEffect(() => {
    fetchTags().then(list => setAvailableTags(list));
  }, []);

  const showConfirm = (message, action) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setConfirmVisible(true);
  };
  const hideConfirm = () => setConfirmVisible(false);

  const handleAddNewTag = async () => {
    const name = newTagName.trim();
    if (!name) return;
    try {
      const created = await createTag(name);
      setAvailableTags(ts => [...ts, created]);
      setSelectedTagIds(ids => [...ids, created.id]);
      setNewTagName('');
      setAlertMessage('Thêm thẻ thành công');
      setAlertVisible(true);
    } catch (err) {
      console.error(err);
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setEditingPostId(null);
    setNewTitle('');
    setNewCover('');
    setNewContent('');
    setSelectedTagIds([]);
    setShowModal(true);
  };

  const openEditModal = post => {
    setIsEditing(true);
    setEditingPostId(post.id);
    setNewTitle(post.title);
    setNewCover(post.coverImageUrl || '');
    setNewContent(post.content);
    setSelectedTagIds(post.tags?.map(t => t.id) || []);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    const payload = {
      title: newTitle,
      content: newContent,
      coverImageUrl: newCover,
      tagIds: selectedTagIds,
    };
    if (isEditing) {
      await updateBlogPost(editingPostId, payload);
      setPosts(ps =>
        ps.map(p =>
          p.id === editingPostId ? { ...p, ...payload } : p
        )
      );
      setAlertMessage('Cập nhật bài viết thành công');
    } else {
      const created = await createBlogPost(payload);
      const author = (
        await fetchUserById(created.createdById).catch(() => ({ name: 'Unknown' }))
      ).name;
      setPosts(ps => [{ ...created, authorName: author }, ...ps]);
      setAlertMessage('Tạo bài viết thành công');
    }
    setAlertVisible(true);
    setShowModal(false);
  };

  const handleDelete = postId => {
    showConfirm('Bạn có chắc chắn muốn xóa bài viết này không?', async () => {
      await deleteBlogPost(postId);
      setPosts(ps => ps.filter(p => p.id !== postId));
      setAlertMessage('Xóa bài viết thành công');
      setAlertVisible(true);
    });
  };

  const handleSendForApproval = async postId => {
    await submitForApproval(postId);
    setPosts(ps =>
      ps.map(p =>
        p.id === postId ? { ...p, status: 'Submitted' } : p
      )
    );
    setAlertMessage('Gửi duyệt thành công');
    setAlertVisible(true);
  };

  const handleDeleteComment = (postId, commentId) => {
    deleteComment(commentId)
      .then(() => {
        const filterRecursively = list =>
          (list || []).reduce((acc, c) => {
            if (c.id === commentId) return acc;
            return [
              ...acc,
              { ...c, replies: filterRecursively(c.replies) }
            ];
          }, []);
        setPosts(ps =>
          ps.map(p =>
            p.id !== postId
              ? p
              : { ...p, comments: filterRecursively(p.comments) }
          )
        );
      })
      .catch(console.error);
  };

  // Lọc bài theo tab
  const filtered = posts.filter(p => {
    if (selectedTab === 'pending')    return ['Pending','Submitted'].includes(p.status);
    if (selectedTab === 'reviewed')   return ['Approved','Rejected'].includes(p.status);
    if (selectedTab === 'published')  return p.status === 'Published';
    return false;
  });

  return (
    <>
      {/* Alert Popup */}
      {alertVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-60 backdrop-blur-sm">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-xs text-center border border-indigo-200">
            <p className="mb-4 text-indigo-800 font-semibold">{alertMessage}</p>
            <button
              onClick={() => setAlertVisible(false)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Confirm */}
      {confirmVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-60 backdrop-blur-sm">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-xs text-center border border-indigo-200">
            <p className="mb-4 text-indigo-800 font-semibold">{confirmMessage}</p>
            <div className="flex justify-center space-x-2">
              <button
                onClick={hideConfirm}
                className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  confirmAction();
                  hideConfirm();
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
              >
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Bài viết & Bình luận</h1>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow"
          >
            Tạo bài viết mới
          </button>
        </div>

        {/* Status Tabs */}
        <div className="mb-6">
          <div className="flex space-x-3">
            {statusTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => { setSelectedTab(tab.key); setExpandedPostId(null); }}
                className={`px-4 py-2 rounded-lg font-medium transition-shadow focus:outline-none ${
                  selectedTab === tab.key
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Create/Edit Modal */}
        <Transition show={showModal} as={Fragment}>
          <div className="fixed inset-0 bg-opacity-40 backdrop-blur-sm z-50 flex items-center justify-center">
            <Transition.Child
              enter="transition transform duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="transition transform duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="bg-white rounded-2xl w-full max-w-xl p-6 relative shadow-2xl">
                <button
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                  onClick={() => setShowModal(false)}
                >
                  ✕
                </button>
                <h2 className="text-xl font-semibold mb-4">
                  {isEditing ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
                </h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Tiêu đề"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
                  />
                  <input
                    type="text"
                    placeholder="URL ảnh bìa"
                    value={newCover}
                    onChange={e => setNewCover(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hoặc chọn ảnh
                    </label>
                    <label
                      className="w-full inline-flex items-center justify-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer
                                 hover:bg-gray-200 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <span className="text-gray-700">Chọn tệp</span>
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
                        className="hidden"
                      />
                    </label>
                    {uploading && (
                      <p className="text-xs text-gray-500 mt-1">Đang tải lên...</p>
                    )}
                  </div>
                  <textarea
                    rows={4}
                    placeholder="Nội dung"
                    value={newContent}
                    onChange={e => setNewContent(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 resize-none focus:ring-2 focus:ring-blue-400"
                  />

                  {/* Tag selector */}
                  <div className="relative pr-10">
                    <button
                      onClick={() => setTagPanelOpen(o => !o)}
                      className="w-full text-left px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-2 focus:ring-blue-400"
                    >
                      {selectedTagIds.length ? (
                        <div className="flex flex-wrap gap-2">
                          {availableTags
                            .filter(t => selectedTagIds.includes(t.id))
                            .map(tag => (
                              <span
                                key={tag.id}
                                className="inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full"
                              >
                                {tag.name}
                              </span>
                            ))}
                        </div>
                      ) : 'Chọn thẻ...'}
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
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-h-60 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-2">
                          {availableTags.map(tag => {
                            const sel = selectedTagIds.includes(tag.id);
                            return (
                              <button
                                key={tag.id}
                                onClick={() => {
                                  setSelectedTagIds(ids =>
                                    sel ? ids.filter(x => x !== tag.id) : [...ids, tag.id]
                                  );
                                }}
                                className={`text-sm px-2 py-1 rounded-full border focus:outline-none ${
                                  sel
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-gray-100 text-gray-800 border-gray-300'
                                }`}
                              >
                                {tag.name}
                              </button>
                            );
                          })}
                        </div>
                        <div className="mt-4 text-right">
                          <button
                            onClick={() => setTagPanelOpen(false)}
                            className="px-5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                          >
                            Đồng ý
                          </button>
                        </div>
                        <div className="mt-4 border-t pt-3">
                          <input
                            type="text"
                            placeholder="Thêm thẻ mới"
                            value={newTagName}
                            onChange={e => setNewTagName(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2 focus:ring-2 focus:ring-green-400"
                          />
                          <button
                            onClick={handleAddNewTag}
                            className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                          >
                            Thêm thẻ
                          </button>
                        </div>
                      </div>
                    </Transition>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                      {isEditing ? 'Lưu' : 'Tạo'}
                    </button>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Transition>

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
              <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center space-x-2 mb-2">
                    <span className="inline-block bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                      Bài viết
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(post.createdDate).toLocaleDateString('vi-VN')}
                    </span>
                    <span className="inline-block text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                      {statusLabels[post.status] || post.status}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {post.title}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Đăng bởi: <span className="font-medium">{post.authorName}</span>
                  </p>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-2">
                  {/* Tab Pending */}
                  {selectedTab === 'pending' && post.status.toLowerCase().trim() !== 'submitted' && (
                    <button
                      onClick={() => handleSendForApproval(post.id)}
                      className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg"
                    >
                      Gửi duyệt
                    </button>
                  )}
                  {/* Tab Reviewed */}
                  {selectedTab === 'reviewed' && (
                    <>
                      {post.status === 'Rejected' && (
                        <button
                          onClick={() => handleSendForApproval(post.id)}
                          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg"
                        >
                          Gửi duyệt lại
                        </button>
                      )}
                      <button
                        onClick={() => openEditModal(post)}
                        className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg"
                      >
                        Chỉnh sửa
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                      >
                        Xóa
                      </button>
                    </>
                  )}
                  {/* Tab Published */}
                  {selectedTab === 'published' && (
                    <>
                      <button
                        onClick={() => openEditModal(post)}
                        className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg"
                      >
                        Chỉnh sửa
                      </button>
                      <button
                        onClick={() =>
                          setExpandedPostId(expandedPostId === post.id ? null : post.id)
                        }
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                      >
                        {expandedPostId === post.id
                          ? 'Ẩn bình luận'
                          : `Quản lý bình luận (${post.comments?.length || 0})`}
                      </button>
                    </>
                  )}
                  <Link
                    to={`/blogs/${post.id}`}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>

              {/* Lý do từ chối */}
              {selectedTab === 'reviewed' && post.status === 'Rejected' && (
                <div className="bg-red-50 border border-red-200 p-4 rounded mb-4">
                  <h3 className="font-semibold text-red-800 mb-2">Lý do từ chối</h3>
                  <p className="text-red-700 whitespace-pre-wrap">
                    {post.reviewComments}
                  </p>
                </div>
              )}

              {/* Bình luận ở tab Published */}
              {selectedTab === 'published' && expandedPostId === post.id && (
                <div className="mt-4 border-t pt-4">
                  <CommentList
                    comments={post.comments || []}
                    postId={post.id}
                    currentUser={currentUser}
                    onAddComment={() => {}}
                    onAddReply={() => {}}
                    onDeleteComment={handleDeleteComment}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
