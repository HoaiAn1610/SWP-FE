// src/pages/BlogExplorer.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TagTabs from '@/components/blog/TagTabs';
import BlogList from '@/components/blog/BlogList';
import Header from '@/components/header';
import {
  fetchTags,
  fetchAllPosts,
  fetchPostsByTag,
  deleteComment,
} from '@/service/blogservice';
import { fetchUserById } from '@/service/userService';

export default function BlogExplorer() {
  // Get user ID for comment permissions, but not required for loading posts
  const userId = localStorage.getItem('id');
  const [tabs, setTabs]                   = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [posts, setPosts]                 = useState([]);
  const [loading, setLoading]             = useState(true);
  const [currentUser, setCurrentUser]     = useState(null);
  const navigate = useNavigate();

  // 1) Load tags
  useEffect(() => {
    fetchTags()
      .then(data => setTabs([{ id: 0, name: 'All' }, ...data]))
      .catch(console.error);
  }, []);

  // 2) Load posts by tag
  useEffect(() => {
    if (!tabs.length) return;
    setLoading(true);
    const loader =
      selectedIndex === 0
        ? fetchAllPosts()
        : fetchPostsByTag(tabs[selectedIndex].id);

    loader
      .then(raw => setPosts(raw.filter(p => p.status === 'Published')))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tabs, selectedIndex]);

  // 3) Fetch current user (id + role) for comment permissions
  useEffect(() => {
    if (!userId) return;
    fetchUserById(userId)
      .then(data => setCurrentUser(data))
      .catch(console.error);
  }, [userId]);

  // 4a) Delete any comment or reply by ID
  const handleDeleteComment = (postId, commentId) => {
    deleteComment(commentId)
      .then(() => {
        setPosts(ps =>
          ps.map(p => {
            if (p.id !== postId) return p;
            // recursively remove any comment/reply matching commentId
            const filterRecursively = comments =>
              (comments || []).reduce((acc, c) => {
                if (c.id === commentId) return acc;
                const copy = { ...c };
                if (c.replies) {
                  copy.replies = filterRecursively(c.replies);
                }
                return [...acc, copy];
              }, []);
            return { ...p, comments: filterRecursively(p.comments) };
          })
        );
      })
      .catch(console.error);
  };

  // 4b) Delete specifically a reply (just re-use the same logic)
  const handleDeleteReply = (postId, parentId, replyId) => {
    // backend call and state update identical to deleting by replyId
    handleDeleteComment(postId, replyId);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex w-full max-w-[84rem] mx-auto">
        <aside className="w-1/4 bg-white p-4 border-r">
          <TagTabs
            tabs={tabs}
            selectedIndex={selectedIndex}
            onChange={setSelectedIndex}
            vertical
          />
        </aside>
        <main className="w-3/4 p-6">
          {loading ? (
            <div className="flex justify-center py-20">Đang tải...</div>
          ) : (
            <BlogList
              posts={posts}
              currentUser={currentUser}
              onAddComment={(pid, c) =>
                setPosts(ps =>
                  ps.map(p =>
                    p.id === pid
                      ? { ...p, comments: [...(p.comments||[]), c] }
                      : p
                  )
                )
              }
              onAddReply={(pid, parentId, r) =>
                setPosts(ps =>
                  ps.map(p => {
                    if (p.id !== pid) return p;
                    return {
                      ...p,
                      comments: p.comments.map(c =>
                        c.id !== parentId
                          ? c
                          : { ...c, replies: [...(c.replies||[]), r] }
                      )
                    };
                  })
                )
              }
              onDeleteComment={handleDeleteComment}
              onDeleteReply={handleDeleteReply}  // ← đây!
            />
          )}
        </main>
      </div>
    </div>
  );
}
