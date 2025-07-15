// src/components/blog/BlogDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  fetchAllPosts,
  deleteComment
} from '@/service/blogservice';
import { fetchUserById } from '@/service/userService';
import CommentList from '@/components/blog/CommentList';

export default function BlogDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [authorName, setAuthorName] = useState('');
  const [publishedDate, setPublishedDate] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Load current user
  useEffect(() => {
    const storedId = localStorage.getItem('id');
    if (!storedId) return;
    fetchUserById(+storedId)
      .then(u => setCurrentUser(u))
      .catch(console.error);
  }, []);

  // Load post detail
  useEffect(() => {
    fetchAllPosts()
      .then(posts => {
        const p = posts.find(x => String(x.id) === postId);
        if (!p) return;
        setPost(p);
        if (p.createdDate) {
          const dt = new Date(p.createdDate);
          setPublishedDate(
            `${dt.getDate()}/${dt.getMonth() + 1}/${dt.getFullYear()}`
          );
        }
        if (p.createdById) {
          fetchUserById(p.createdById)
            .then(u => setAuthorName(u.name))
            .catch(() => setAuthorName(`User#${p.createdById}`));
        }
      })
      .catch(console.error);
  }, [postId]);

  // Add top‐level comment: **append** newComment to end
  const handleAddComment = (_postId, newComment) => {
    setPost(prev => ({
      ...prev,
      comments: [...(prev.comments || []), newComment],  // <-- append here
    }));
  };

  // Add reply: already appends
  const handleAddReply = (_postId, parentId, newReply) => {
    const addRecursively = list =>
      (list || []).map(c => {
        if (c.id === parentId) {
          return { ...c, replies: [...(c.replies || []), newReply] };
        }
        if (c.replies) {
          return { ...c, replies: addRecursively(c.replies) };
        }
        return c;
      });
    setPost(prev => ({
      ...prev,
      comments: addRecursively(prev.comments),
    }));
  };

  // Delete comment or reply
  const handleDeleteComment = (_postId, commentId) => {
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
        setPost(prev => ({
          ...prev,
          comments: filterRecursively(prev.comments),
        }));
      })
      .catch(console.error);
  };

  const handleDeleteReply = (_postId, parentId, replyId) => {
    handleDeleteComment(_postId, replyId);
  };

  // Toggle comments panel
  const toggleComments = () => {
    if (!currentUser?.id) {
      setShowLoginPrompt(true);
      return;
    }
    setShowComments(v => !v);
  };

  const confirmLogin = () =>
    navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);

  if (!post) {
    return <div className="p-6 text-center text-gray-600">Đang tải...</div>;
  }

  return (
    <>
      {showLoginPrompt && (
        <div className="fixed inset-0 flex items-center justify-center z-60 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center border border-indigo-200">
            <p className="mb-6 text-indigo-800 font-semibold">
              Bạn cần đăng nhập để xem bình luận. Chuyển đến trang đăng nhập?
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

      <div
        className={`mx-auto p-6 bg-white rounded-lg shadow-md ${
          showComments ? 'grid grid-cols-3 gap-6 max-w-screen-xl' : 'max-w-3xl'
        }`}
      >
        <div className="flex items-center justify-between mb-6 col-span-3">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            ← Quay lại
          </button>
          {!showComments && post.status === 'Published' && (
            <button
              onClick={toggleComments}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Xem bình luận
            </button>
          )}
        </div>

        <div className={showComments ? 'col-span-2' : ''}>
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          {currentUser?.id && (
            <div className="text-sm text-gray-500 mb-6 flex space-x-2">
              <span>
                Đăng bởi <span className="font-medium text-gray-700">{authorName}</span>
              </span>
              <span>·</span>
              <span>{publishedDate}</span>
            </div>
          )}
          {post.coverImageUrl && (
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="w-full h-80 object-cover rounded-md mb-6"
            />
          )}
          <div className="prose prose-lg mb-8 whitespace-pre-wrap">
            {post.content}
          </div>
        </div>

        {showComments && (
          <div className="col-start-3 col-span-1 flex flex-col space-y-4">
            <button
              onClick={() => setShowComments(false)}
              className="sticky top-32 z-10 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Ẩn bình luận
            </button>
            <section className="bg-gray-50 sticky top-52 p-4 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">Bình luận</h2>
              <CommentList
                comments={post.comments || []}
                postId={post.id}
                currentUser={currentUser}
                onAddComment={handleAddComment}
                onAddReply={handleAddReply}
                onDeleteComment={handleDeleteComment}
                onDeleteReply={handleDeleteReply}
              />
            </section>
          </div>
        )}
      </div>
    </>
  );
}
