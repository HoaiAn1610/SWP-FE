import React, { useState, useEffect, useRef } from 'react';
import { createComment, postReply } from '@/service/blogservice';
import api from '@/config/axios';

export default function CommentList({
  comments = [],
  postId,
  currentUser,
  onAddComment,
  onAddReply,
  onDeleteComment,
  onDeleteReply  // new prop for handling reply deletions
}) {
  // ─── Helper to format time ───────────────────────────────────────────────
  const formatTime = (timestamp, isNew) => {
    const date = new Date(timestamp);
    if (!isNew) {
      // only add 7 hours for “old” comments
      date.setHours(date.getHours() + 7);
    }
    return date.toLocaleTimeString();
  };

  // ─── Local state for comments ─────────────────────────────────────────────
  const [commentList, setCommentList] = useState(
    comments.map(c => ({ ...c, isNew: false }))
  );

  // Sync when parent passes new props: mark these as “old”
  useEffect(() => {
    setCommentList(prev =>
      comments.map(c => {
        const existing = prev.find(x => x.id === c.id);
        return {
          ...c,
          isNew: existing ? existing.isNew : false
        };
      })
    );
  }, [comments]);

  // comment/reply state
  const [newComment, setNewComment]       = useState('');
  const [replyTexts, setReplyTexts]       = useState({});
  const [openReplies, setOpenReplies]     = useState({});
  const [loadedReplies, setLoadedReplies] = useState({});
  const [userNames, setUserNames]         = useState({});
  const scrollRef = useRef();

  // Alert / Confirm state
  const [alertVisible, setAlertVisible]     = useState(false);
  const [alertMessage, setAlertMessage]     = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction]   = useState(() => {});
  const showConfirm = (message, action) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setConfirmVisible(true);
  };
  const hideConfirm = () => setConfirmVisible(false);

  // 1) Load user names
  useEffect(() => {
    const ids = new Set();
    commentList.forEach(c => c.memberId && ids.add(c.memberId));
    Object.entries(loadedReplies).forEach(([parentId, replies]) =>
      replies.forEach(r => r.memberId && ids.add(r.memberId))
    );
    ids.forEach(id => {
      if (!userNames[id]) {
        api.get(`/Admin/get-user/${id}`)
          .then(res => setUserNames(u => ({ ...u, [id]: res.data.name })))
          .catch(() => setUserNames(u => ({ ...u, [id]: `User#${id}` })));
      }
    });
  }, [commentList, loadedReplies, userNames]);

  // auto-resize textarea
  const autoResize = el => {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  };

  // Toggle reply input & load replies if needed
  const toggleReplies = async parentId => {
    const isOpen = !!openReplies[parentId];
    if (isOpen) {
      setOpenReplies(prev => {
        const next = { ...prev };
        delete next[parentId];
        return next;
      });
      return;
    }
    setOpenReplies(prev => ({ ...prev, [parentId]: true }));
    if (!loadedReplies[parentId]) {
      try {
        const { data } = await api.get(`/Comment/${parentId}/replies`);
        setLoadedReplies(prev => ({
          ...prev,
          [parentId]: Array.isArray(data)
            ? data.map(r => ({ ...r, isNew: false }))
            : []
        }));
      } catch {
        setLoadedReplies(prev => ({ ...prev, [parentId]: [] }));
      }
    }
    setTimeout(() => {
      const el = document.getElementById(`comment-${parentId}`);
      if (el && scrollRef.current) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 0);
  };

  // post new top-level comment
  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    const created = await createComment(postId, newComment);
    const flagged = { ...created, isNew: true };
    onAddComment(postId, flagged);
    setCommentList(prev => [...prev, flagged]);
    setNewComment('');
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    if (flagged.memberId === currentUser.id) {
      setUserNames(u => ({ ...u, [flagged.memberId]: currentUser.name }));
    }
  };

  // post reply to a specific comment
  const handlePostReply = async parentId => {
    const text = (replyTexts[parentId] || '').trim();
    if (!text) return;
    const created = await postReply(parentId, text);
    const flagged = { ...created, isNew: true };
    onAddReply(postId, parentId, flagged);
    setLoadedReplies(r => ({
      ...r,
      [parentId]: [...(r[parentId] || []), flagged]
    }));
    setReplyTexts(r => ({ ...r, [parentId]: '' }));
    if (flagged.memberId === currentUser.id) {
      setUserNames(u => ({ ...u, [flagged.memberId]: currentUser.name }));
    }
  };

  // Recursive render: now tracks parent for proper deletion
  const renderThread = (list, depth = 0, parentId = null) =>
    list.map(c => {
      const canDelete =
        currentUser?.id === c.memberId ||
        ['Staff', 'Manager'].includes(currentUser?.role);
      return (
        <div key={c.id} id={`comment-${c.id}`} className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0" />
            <div className="flex-1">
              <div
                className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 cursor-pointer transition"
                onClick={() => toggleReplies(c.id)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-800">
                    {userNames[c.memberId] || `User#${c.memberId}`}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTime(c.createdDate, c.isNew)}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{c.content}</p>
              </div>
              <div className="flex space-x-4 text-sm text-gray-500 mt-1 ml-2">
                <button
                  className="hover:text-blue-600"
                  onClick={() => toggleReplies(c.id)}
                >
                  Trả lời
                </button>
                {canDelete && (
                  <button
                    onClick={() =>
                      showConfirm(
                        'Bạn có chắc muốn xóa bình luận này không?',
                        () => {
                          if (parentId === null) {
                            // top-level comment deletion
                            onDeleteComment(postId, c.id);
                            setCommentList(prev =>
                              prev.filter(item => item.id !== c.id)
                            );
                          } else {
                            // nested reply deletion
                            onDeleteReply(postId, parentId, c.id);
                            setLoadedReplies(prev => ({
                              ...prev,
                              [parentId]: prev[parentId].filter(
                                item => item.id !== c.id
                              )
                            }));
                          }
                        }
                      )
                    }
                    className="hover:text-red-600"
                  >
                    Xóa
                  </button>
                )}
              </div>
              {openReplies[c.id] && (
                <div className="flex items-start space-x-3 mt-3 ml-12">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0" />
                  <textarea
                    rows={1}
                    placeholder="Viết phản hồi..."
                    value={replyTexts[c.id] || ''}
                    onChange={e => {
                      setReplyTexts(r => ({ ...r, [c.id]: e.target.value }));
                      autoResize(e.target);
                    }}
                    onInput={e => autoResize(e.target)}
                    className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none overflow-hidden"
                  />
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition"
                    onClick={() => handlePostReply(c.id)}
                  >
                    Gửi
                  </button>
                </div>
              )}
              {openReplies[c.id] && loadedReplies[c.id]?.length > 0 && (
                <div className="ml-12 mt-4 space-y-4">
                  {renderThread(loadedReplies[c.id], depth + 1, c.id)}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    });

  return (
    <>
      {/* Alert */}
      {alertVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-60">
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
        <div className="fixed inset-0 flex items-center justify-center z-60">
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
                onClick={() => { confirmAction(); hideConfirm(); }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Main comments list */}
      <div className="flex flex-col h-full">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto pr-2 space-y-6"
          style={{ maxHeight: 400 }}
        >
          {commentList.length === 0 ? (
            <p className="text-center text-gray-500">
              Không có bình luận nào cho bài viết này.
            </p>
          ) : (
            renderThread(commentList)
          )}
        </div>
        <div className="flex items-start space-x-3 mt-4 pt-4 border-t">
          <div className="w-10 h-10 bg-gray-300 rounded-full" />
          <textarea
            rows={1}
            placeholder="Viết bình luận..."
            value={newComment}
            onChange={e => { setNewComment(e.target.value); autoResize(e.target); }}
            onInput={e => autoResize(e.target)}
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none overflow-hidden"
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition"
            onClick={handlePostComment}
          >
            Gửi
          </button>
        </div>
      </div>
    </>
  );
}
