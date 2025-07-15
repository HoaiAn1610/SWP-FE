// src/components/blog/BlogCard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CommentList from './CommentList';
import { fetchUserById } from '@/service/userService';

export default function BlogCard({
  post,
  currentUser,
  onAddComment,
  onAddReply,
  onDeleteComment,
  onDeleteReply   // <-- nhận thêm prop này
}) {
  const [open, setOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const navigate = useNavigate();

  const [authorName, setAuthorName] = useState('');
  const [publishedDate, setPublishedDate] = useState('');

  // Fetch author name và format date
  useEffect(() => {
    if (post.createdById) {
      fetchUserById(post.createdById)
        .then(user => setAuthorName(user.name))
        .catch(() => setAuthorName('Unknown'));
    }
    if (post.createdDate) {
      const dt = new Date(post.createdDate);
      const day = dt.getDate();
      const month = dt.getMonth() + 1;
      const year = dt.getFullYear();
      setPublishedDate(`${day}/${month}/${year}`);
    }
  }, [post.createdById, post.createdDate]);

  // Toggle comments: show login prompt nếu chưa login
  const handleToggleComments = () => {
    if (!currentUser?.id) {
      setShowLoginPrompt(true);
      return;
    }
    setOpen(v => !v);
  };

  // Confirm login và redirect
  const confirmLogin = () => {
    navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
  };

  const preview = post.content.length > 200
    ? post.content.slice(0, 200) + '…'
    : post.content;

  return (
    <>
      {/* Login confirmation popup */}
      {showLoginPrompt && (
        <div className="fixed inset-0 flex items-center justify-center z-60 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center border border-indigo-200">
            <p className="mb-6 text-indigo-800 font-semibold">
              Bạn cần đăng nhập để xem và bình luận. Chuyển đến trang đăng nhập?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={confirmLogin}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
              >
                Đăng nhập
              </button>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <Link to={`/blogs/${post.id}`} className="group block mb-4">
          <h2 className="text-4xl font-semibold text-gray-800 group-hover:text-blue-600">
            {post.title}
          </h2>
          {post.coverImageUrl && (
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="w-full h-120 object-cover rounded-md mt-2 group-hover:opacity-90"
            />
          )}
          <p className="text-gray-700 mt-3">{preview}</p>
          {post.content.length > 200 && (
            <span className="text-blue-600 hover:underline text-sm">Xem thêm</span>
          )}
        </Link>

        {currentUser?.id && (
          <div className="text-sm text-gray-500 mb-6 flex space-x-2">
            <span>
              Đăng bởi <span className="font-medium text-gray-700">{authorName}</span>
            </span>
            <span>·</span>
            <span>{publishedDate}</span>
          </div>
        )}

        <button
          className="text-sm text-gray-600 hover:text-blue-600 mb-2"
          onClick={handleToggleComments}
        >
          {open ? 'Ẩn bình luận' : `Bình luận (${post.comments?.length || 0})`}
        </button>

        {open && (
          <div className="mt-4 border-t pt-4">
            <CommentList
              comments={post.comments || []}
              postId={post.id}
              currentUser={currentUser}
              onAddComment={onAddComment}
              onAddReply={onAddReply}
              onDeleteComment={onDeleteComment}
              onDeleteReply={onDeleteReply}  
            />
          </div>
        )}
      </div>
    </>
  );
}
