// src/components/blog/BlogList.jsx
import React from 'react';
import BlogCard from './BlogCard';

export default function BlogList({
  posts,
  currentUser,
  onAddComment,
  onAddReply,
  onDeleteComment
}) {
  if (!posts || posts.length === 0) {
    return (
      <p className="text-center text-gray-500">
        Chưa có bài viết nào.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map(post => (
        <BlogCard
          key={post.id}
          post={post}
          currentUser={currentUser}
          onAddComment={onAddComment}
          onAddReply={onAddReply}
          onDeleteComment={onDeleteComment}
        />
      ))}
    </div>
  );
}
