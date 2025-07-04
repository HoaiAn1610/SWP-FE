// src/pages/blog/BlogDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchAllPosts } from '@/service/blogservice';
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
        if (p) {
          setPost(p);
          // Format date
          if (p.createdDate) {
            const dt = new Date(p.createdDate);
            setPublishedDate(`${dt.getDate()}/${dt.getMonth()+1}/${dt.getFullYear()}`);
          }
          // Fetch author name
          if (p.createdById) {
            fetchUserById(p.createdById)
              .then(user => setAuthorName(user.name))
              .catch(() => setAuthorName(`User#${p.createdById}`));
          }
        }
      })
      .catch(console.error);
  }, [postId]);

  if (!post) return <div className="p-6 text-center text-gray-600">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {/* Title */}
      <h1 className="text-4xl font-bold text-gray-800 mb-4">{post.title}</h1>

      {/* Meta: author and date */}
      <div className="flex items-center text-sm text-gray-500 mb-6 space-x-2">
        <span>
          Đăng bởi <span className="font-medium text-gray-700">{authorName}</span>
        </span>
        <span>·</span>
        <span>{publishedDate}</span>
      </div>

      {/* Cover Image */}
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

      {/* Comments Section */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Bình luận</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <CommentList
            comments={post.comments}
            postId={post.id}
            onAddComment={() => {}}
            onAddReply={() => {}}
          />
        </div>
      </section>
    </div>
  );
}