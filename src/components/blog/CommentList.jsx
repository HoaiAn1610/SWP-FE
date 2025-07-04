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
  const [newComment, setNewComment] = useState('');
  const [openReplies, setOpenReplies] = useState({});     // { commentId: bool }
  const [replyTexts, setReplyTexts] = useState({});       // { commentId: text }
  const [loadedReplies, setLoadedReplies] = useState({}); // { commentId: [replies] }
  const [userNames, setUserNames] = useState({});         // { memberId: name }
  const scrollRef = useRef();

  // 1) Fetch tên cho cả comments gốc và replies đã load
  useEffect(() => {
    // gom tất cả memberId từ comments + loadedReplies
    const ids = new Set();
    comments.forEach(c => c.memberId && ids.add(c.memberId));
    Object.values(loadedReplies).flat().forEach(rp => rp.memberId && ids.add(rp.memberId));

    ids.forEach(id => {
      if (!userNames[id]) {
        api.get(`/Admin/get-user/${id}`)
          .then(({ data }) => {
            setUserNames(u => ({ ...u, [id]: data.name }));
          })
          .catch(() => {
            setUserNames(u => ({ ...u, [id]: `User#${id}` }));
          });
      }
    });
  }, [comments, loadedReplies, userNames]);

  // Auto-resize textarea
  const autoResize = el => {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  };

  // Toggle replies for a comment (and fetch if lần đầu)
  const toggleReplies = async id => {
    setOpenReplies(prev => ({ ...prev, [id]: !prev[id] }));
    if (!loadedReplies[id]) {
      try {
        const { data } = await api.get(`/Comment/${id}/replies`);
        setLoadedReplies(r => ({ ...r, [id]: Array.isArray(data) ? data : [] }));
      } catch {
        setLoadedReplies(r => ({ ...r, [id]: [] }));
      }
    }
  };

  // Post root comment
  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    const created = await createComment(postId, newComment);
    onAddComment(postId, created);
    setNewComment('');
    // scroll xuống cuối
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    // set tên bạn cho bình luận mới
    if (created.memberId) setUserNames(u => ({ ...u, [created.memberId]: 'You' }));
  };

  // Post reply
  const handlePostReply = async parentId => {
    const text = (replyTexts[parentId]||'').trim();
    if (!text) return;
    const created = await postReply(parentId, text);
    onAddReply(postId, parentId, created);
    // append locally
    setLoadedReplies(r => ({
      ...r,
      [parentId]: [...(r[parentId]||[]), created]
    }));
    setReplyTexts(rt => ({ ...rt, [parentId]: '' }));
    // giữ form mở
    if (created.memberId) setUserNames(u => ({ ...u, [created.memberId]: 'You' }));
  };

  // Đệ quy render thread đa cấp
  const renderThread = (list, depth = 0) => (
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
              <button
                className="hover:text-blue-600"
                onClick={() => toggleReplies(c.id)}
              >
                Trả lời
              </button>
              <button className="hover:text-blue-600">Thích</button>
            </div>

            {/* form reply */}
            {openReplies[c.id] && (
              <div className="flex items-start space-x-3 mt-3 ml-12">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0" />
                <textarea
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none overflow-hidden"
                  rows={1}
                  placeholder="Viết phản hồi..."
                  value={replyTexts[c.id]||''}
                  onChange={e => {
                    setReplyTexts(rt => ({ ...rt, [c.id]: e.target.value }));
                    autoResize(e.target);
                  }}
                  onInput={e => autoResize(e.target)}
                />
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition"
                  onClick={() => handlePostReply(c.id)}
                >
                  Gửi
                </button>
              </div>
            )}

            {/* nested replies */}
            {openReplies[c.id] && loadedReplies[c.id] && (
              <div className="ml-12 mt-4 space-y-4">
                {renderThread(loadedReplies[c.id], depth+1)}
              </div>
            )}
          </div>
        </div>
      </div>
    ))
  );

  return (
    <div className="flex flex-col h-full">
      {/* danh sách bình luận scrollable */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto pr-2 space-y-6"
        style={{ maxHeight: '400px' }}
      >
           {comments.length === 0 ? (
     <p className="text-center text-gray-500">
       Không có bình luận nào cho bài viết này.
     </p>
   ) : (
     renderThread(comments)
   )}
      </div>

      {/* form bình luận gốc */}
      <div className="flex items-start space-x-3 mt-4 pt-4 border-t">
        <div className="w-10 h-10 bg-gray-300 rounded-full" />
        <textarea
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none overflow-hidden"
          rows={1}
          placeholder="Viết bình luận..."
          value={newComment}
          onChange={e => {
            setNewComment(e.target.value);
            autoResize(e.target);
          }}
          onInput={e => autoResize(e.target)}
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
