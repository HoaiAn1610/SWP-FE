// src/components/blog/FeaturedBlogs.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchAllPosts } from '@/service/blogservice';
import { fetchUserById } from '@/service/userService';

export default function FeaturedBlogs() {
  const [posts, setPosts] = useState([]);
  const [authors, setAuthors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy toàn bộ, sort theo ngày tạo mới nhất, rồi slice 3
    fetchAllPosts()
      .then(all => {
        const latest = all
          .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
          .slice(0, 3);
        setPosts(latest);

        // Fetch tên tác giả cho từng post
        latest.forEach(post => {
          if (post.createdById) {
            fetchUserById(post.createdById)
              .then(u =>
                setAuthors(prev => ({ ...prev, [post.id]: u.name }))
              )
              .catch(() =>
                setAuthors(prev => ({ ...prev, [post.id]: 'Unknown' }))
              );
          }
        });
      })
      .catch(err => console.error('Lỗi fetch posts:', err));
  }, []);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-[90rem] mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-6">
          Bài viết nổi bật
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map(post => {
            const authorName = authors[post.id] || '';
            const dt = post.createdDate ? new Date(post.createdDate) : null;
            const dateStr = dt
              ? `${dt.getDate()}/${dt.getMonth() + 1}/${dt.getFullYear()}`
              : '';

            // Lấy preview 100 ký tự
            const preview =
              post.content.length > 100
                ? post.content.slice(0, 100) + '…'
                : post.content;

            return (
              <div
                key={post.id}
                className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition"
                onClick={() => navigate(`/blogs/${post.id}`)}
              >
                <h3 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600">
                  {post.title}
                </h3>
                {post.coverImageUrl && (
                  <img
                    src={post.coverImageUrl}
                    alt={post.title}
                    className="w-full h-40 object-cover rounded-md mt-2"
                  />
                )}
                <p className="text-gray-700 mt-3">{preview}</p>
                <div className="text-sm text-gray-500 mt-4">
                  Đăng bởi{' '}
                  <span className="font-medium text-gray-700">
                    {authorName}
                  </span>{' '}
                  · {dateStr}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center mt-8">
          <Link
            to="/blogs"
            className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-full hover:bg-indigo-700 transition"
          >
            Xem tất cả bài viết
          </Link>
        </div>
      </div>
    </section>
  );
}
