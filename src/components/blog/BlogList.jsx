import React from 'react';
import BlogCard from './BlogCard';

export default function BlogList({ posts, onAddComment, onAddReply }) {
  if (!posts.length) {
    return <p className="text-center text-gray-500">Chưa có bài viết nào.</p>;
  }
  return (
    <div className="space-y-6">
      {posts.map(post => (
        <BlogCard
          key={post.id}
          post={post}
          onAddComment={onAddComment}
          onAddReply={onAddReply}
        />
      ))}
    </div>
  );
}
