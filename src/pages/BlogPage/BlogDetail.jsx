import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  fetchAllPosts,
  createComment,
  postReply,
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

  // Lấy currentUser từ localStorage + fetch role
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

        // Format ngày
        if (p.createdDate) {
          const dt = new Date(p.createdDate);
          setPublishedDate(`${dt.getDate()}/${dt.getMonth() + 1}/${dt.getFullYear()}`);
        }
        // Fetch tên tác giả
        if (p.createdById) {
          fetchUserById(p.createdById)
            .then(u => setAuthorName(u.name))
            .catch(() => setAuthorName(`User#${p.createdById}`));
        }
      })
      .catch(console.error);
  }, [postId]);

  // Thêm comment cấp 0 (mới lên đầu)
  const handleAddComment = async (postId, content) => {
    const created = await createComment(postId, content);
    setPost(prev => ({
      ...prev,
      comments: [created, ...(prev.comments || [])]
    }));
  };

  // Thêm reply (đa cấp)
  const handleAddReply = async (postId, parentId, content) => {
    const created = await postReply(parentId, content);
    const addRec = list =>
      list.map(c => {
        if (c.id === parentId) {
          return { ...c, replies: [...(c.replies || []), created] };
        }
        if (c.replies) {
          return { ...c, replies: addRec(c.replies) };
        }
        return c;
      });
    setPost(prev => ({
      ...prev,
      comments: addRec(prev.comments || [])
    }));
  };

  // Xóa comment hoặc reply
  const handleDeleteComment = (postId, commentId) => {
    deleteComment(commentId)
      .then(() => {
        const filterRecursively = list =>
          (list || []).reduce((acc, c) => {
            if (c.id === commentId) return acc;
            return [
              ...acc,
              {
                ...c,
                replies: filterRecursively(c.replies)
              }
            ];
          }, []);
        setPost(prev => ({
          ...prev,
          comments: filterRecursively(prev.comments)
        }));
      })
      .catch(console.error);
  };

  if (!post) {
    return <div className="p-6 text-center text-gray-600">Đang tải...</div>;
  }

  return (
   <div
      className={`mx-auto p-6 bg-white rounded-lg shadow-md ${
        showComments
          ? 'grid grid-cols-3 gap-6 max-w-screen-xl'
          : 'max-w-3xl'
      }`}
    >
      {/* Back & Toggle */}
      <div className="flex items-center justify-between mb-6 col-span-3">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          ← Quay lại
        </button>
        {!showComments && (
          <button
            onClick={() => setShowComments(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Xem bình luận
          </button>
        )}
      </div>

      {/* Post Content */}
      <div className={showComments ? 'col-span-2' : ''}>
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <div className="text-sm text-gray-500 mb-6 flex space-x-2">
          <span>
            Đăng bởi <span className="font-medium text-gray-700">{authorName}</span>
          </span>
          <span>·</span>
          <span>{publishedDate}</span>
        </div>

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

      {/* Wrapper for hide-button + comment panel */}
      {showComments && (
        <div className="col-start-3 col-span-1 flex flex-col space-y-4">
          {/* Sticky hide button */}
          <button
            onClick={() => setShowComments(false)}
            className="sticky top-32 z-10 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 "
          >
            Ẩn bình luận
          </button>

          {/* Comment Panel */}
          <section className="bg-gray-50 sticky top-52 p-4 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Bình luận</h2>
            <CommentList
              comments={post.comments || []}
              postId={post.id}
              currentUser={currentUser}
              onAddComment={handleAddComment}
              onAddReply={handleAddReply}
              onDeleteComment={handleDeleteComment}
            />
          </section>
        </div>
      )}
    </div>
  );
}
