// src/components/blog/BlogCard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CommentList from './CommentList';
import { fetchUserById } from '@/service/userService';

export default function BlogCard({ post, onAddComment, onAddReply }) {
  const [open, setOpen] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [publishedDate, setPublishedDate] = useState('');

  const preview = post.content.length > 200
    ? post.content.slice(0, 200) + '…'
    : post.content;

  useEffect(() => {
    // Fetch author name
    if (post.createdById) {
      fetchUserById(post.createdById)
        .then(user => setAuthorName(user.name))
        .catch(() => setAuthorName('Unknown'));
    }
    // Format date
    if (post.createdDate) {
      const dt = new Date(post.createdDate);
      const day = dt.getDate();
      const month = dt.getMonth() + 1;
      const year = dt.getFullYear();
      setPublishedDate(`${day}/${month}/${year}`);
    }
  }, [post.createdById, post.createdDate]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <Link to={`/blogs/${post.id}`} className="group block mb-4">
        <h2 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600">
          {post.title}
        </h2>
        {post.coverImageUrl && (
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="w-full h-40 object-cover rounded-md mt-2 group-hover:opacity-90"
          />
        )}
        <p className="text-gray-700 mt-3">{preview}</p>
        {post.content.length > 200 && (
          <span className="text-blue-600 hover:underline text-sm">Read more</span>
        )}
      </Link>

      {/* Meta: author and date, above comment toggle */}
      <div className="text-sm text-gray-500 mb-2">
        Đăng bởi <span className="font-medium text-gray-700">{authorName}</span> · {publishedDate}
      </div>

      <button
        className="text-sm text-gray-600 hover:text-blue-600 mb-2"
        onClick={() => setOpen(v => !v)}
      >
        {open ? 'Hide comments' : `Comments (${post.comments?.length || 0})`}
      </button>

      {open && (
        <div className="mt-4 border-t pt-4">
          <CommentList
            comments={post.comments}
            postId={post.id}
            onAddComment={onAddComment}
            onAddReply={onAddReply}
          />
        </div>
      )}
    </div>
  );
}