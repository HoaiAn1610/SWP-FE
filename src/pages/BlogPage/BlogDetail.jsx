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
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {/* Back button */}
<div className="mb-6">
  <button
    onClick={() => navigate(-1)}
    className="
      inline-block
      px-4 py-2
      bg-blue-500 text-white
      text-sm font-medium
      rounded-md shadow
      hover:bg-blue-600
      focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75
      transition-colors duration-200
    "
  >
    ← Quay về trang trước
  </button>
</div>


      {/* Title */}
      <h1 className="text-4xl font-bold text-gray-800 mb-4">{post.title}</h1>

      {/* Meta: author & date */}
      <div className="flex items-center text-sm text-gray-500 mb-6 space-x-2">
        <span>
          Đăng bởi <span className="font-medium text-gray-700">{authorName}</span>
        </span>
        <span>·</span>
        <span>{publishedDate}</span>
      </div>

      {/* Cover image */}
      {post.coverImageUrl && (
        <img
          src={post.coverImageUrl}
          alt={post.title}
          className="w-full h-80 object-cover rounded-md mb-6"
        />
      )}


       {/* Content */}
 <div
   className="prose prose-lg text-gray-800 mb-8 whitespace-pre-wrap"
   /* đảm bảo các newline (\n) được hiển thị thành xuống dòng */
 >
   {post.content}
 </div>

      {/* Comments */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Bình luận</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <CommentList
            comments={post.comments || []}
            postId={post.id}
            currentUser={currentUser}
            onAddComment={handleAddComment}
            onAddReply={handleAddReply}
            onDeleteComment={handleDeleteComment}
          />
        </div>
      </section>
    </div>
  );
}
