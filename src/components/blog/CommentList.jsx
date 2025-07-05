// src/components/blog/CommentList.jsx
import React, { useState, useEffect, useRef } from 'react';
import { createComment, postReply } from '@/service/blogservice';
import api from '@/config/axios';

export default function CommentList({
  comments = [],
  postId,
  onAddComment,
  onAddReply,
}) {
  const [newComment, setNewComment]       = useState('');
  const [replyTexts, setReplyTexts]       = useState({});    // { parentId: text }
  const [openReplies, setOpenReplies]     = useState({});    // { parentId: bool }
  const [loadedReplies, setLoadedReplies] = useState({});    // { parentId: [replyObj] }
  const [userNames, setUserNames]         = useState({});    // { memberId: name }
  const scrollRef = useRef();

  // 1) Lấy tên user
  useEffect(() => {
    const ids = new Set();
    comments.forEach(c => c.memberId && ids.add(c.memberId));
    Object.values(loadedReplies)
      .flat()
      .forEach(r => r.memberId && ids.add(r.memberId));

    ids.forEach(id => {
      if (!userNames[id]) {
        api.get(`/Admin/get-user/${id}`)
          .then(res => setUserNames(u => ({ ...u, [id]: res.data.name })))
          .catch(() => setUserNames(u => ({ ...u, [id]: `User#${id}` })));
      }
    });
  }, [comments, loadedReplies, userNames]);

  // auto-resize textarea
  const autoResize = el => {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  };

  // toggle + load replies
  const toggleReplies = async parentId => {
    setOpenReplies(o => ({ ...o, [parentId]: !o[parentId] }));
    if (!loadedReplies[parentId]) {
      try {
        const { data } = await api.get(`/Comment/${parentId}/replies`);
        setLoadedReplies(r => ({ ...r, [parentId]: Array.isArray(data) ? data : [] }));
      } catch {
        setLoadedReplies(r => ({ ...r, [parentId]: [] }));
      }
    }
  };

  // gửi comment gốc
  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    const created = await createComment(postId, newComment);
    onAddComment(postId, created);
    setNewComment('');
    // scroll xuống cuối
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    // gán tên You
    if (created.memberId) {
      setUserNames(u => ({ ...u, [created.memberId]: 'You' }));
    }
  };

  // gửi reply
  const handlePostReply = async parentId => {
    const text = (replyTexts[parentId] || '').trim();
    if (!text) return;
    const created = await postReply(parentId, text);
    onAddReply(postId, parentId, created);

    // Luôn mở thread của parentId
    setOpenReplies(o => ({ ...o, [parentId]: true }));

    // cập nhật ngay loadedReplies
    setLoadedReplies(r => ({
      ...r,
      [parentId]: [...(r[parentId] || []), created],
    }));

    // reset textarea của parentId
    setReplyTexts(r => ({ ...r, [parentId]: '' }));

    // gán tên You
    if (created.memberId) {
      setUserNames(u => ({ ...u, [created.memberId]: 'You' }));
    }
  };

  // đệ quy render comment + replies
  const renderThread = (list, depth = 0) =>
    list.map(c => (
      <div key={c.id} className="space-y-3">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0" />
          <div className="flex-1">
            {/* comment chính */}
            <div
              className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 cursor-pointer transition"
              onClick={() => toggleReplies(c.id)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-gray-800">
                  {userNames[c.memberId] || `User#${c.memberId}`}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(c.createdDate).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{c.content}</p>
            </div>

            {/* action bar */}
            <div className="flex space-x-4 text-sm text-gray-500 mt-1 ml-2">
              <button className="hover:text-blue-600" onClick={() => toggleReplies(c.id)}>
                Trả lời
              </button>
              <button className="hover:text-blue-600">Thích</button>
            </div>

            {/* form reply nếu mở */}
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

            {/* render replies con */}
            {openReplies[c.id] && loadedReplies[c.id] && (
              <div className="ml-12 mt-4 space-y-4">
                {renderThread(loadedReplies[c.id], depth + 1)}
              </div>
            )}
          </div>
        </div>
      </div>
    ));

  return (
    <div className="flex flex-col h-full">
      {/* khung scrollable */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto pr-2 space-y-6"
        style={{ maxHeight: 400 }}
      >
        {comments.length === 0 ? (
          <p className="text-center text-gray-500">
            Không có bình luận nào cho bài viết này.
          </p>
        ) : (
          renderThread(comments)
        )}
      </div>

      {/* form comment gốc */}
      <div className="flex items-start space-x-3 mt-4 pt-4 border-t">
        <div className="w-10 h-10 bg-gray-300 rounded-full" />
        <textarea
          rows={1}
          placeholder="Viết bình luận..."
          value={newComment}
          onChange={e => {
            setNewComment(e.target.value);
            autoResize(e.target);
          }}
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
  );
}
