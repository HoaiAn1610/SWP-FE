// src/pages/blog/BlogDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchAllPosts, createComment, postReply } from '@/service/blogservice';
import { fetchUserById } from '@/service/userService';
import CommentList from '@/components/blog/CommentList';

export default function BlogDetail() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [authorName, setAuthorName] = useState('');
  const [publishedDate, setPublishedDate] = useState('');

  useEffect(() => {
    fetchAllPosts()
      .then(posts => {
        const p = posts.find(p => String(p.id) === postId);
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

  // Thêm comment cấp 0
  const handleAddComment = async (postId, content) => {
    const created = await createComment(postId, content);
    setPost(prev => ({
      ...prev,
      comments: [...(prev.comments || []), created],
    }));
  };

  // Thêm reply cho comment bất kỳ (đa cấp)
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
      comments: addRec(prev.comments || []),
    }));
  };

  if (!post) {
    return <div className="p-6 text-center text-gray-600">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/blogs"
          className="inline-block text-blue-600 hover:underline text-sm"
        >
          ← Quay về danh sách blog
        </Link>
      </div>

      {/* Title */}
      <h1 className="text-4xl font-bold text-gray-800 mb-4">{post.title}</h1>

      {/* Meta: author & date */}
      <div className="flex items-center text-sm text-gray-500 mb-6 space-x-2">
        <span>
          Đăng bởi{' '}
          <span className="font-medium text-gray-700">{authorName}</span>
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
      <div className="prose prose-lg text-gray-800 mb-8">
        {post.content}
      </div>

      {/* Comments */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Bình luận
        </h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <CommentList
            comments={post.comments || []}
            postId={post.id}
            onAddComment={handleAddComment}
            onAddReply={handleAddReply}
          />
        </div>
      </section>
    </div>
  );
}
