import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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

  // 1) Load tags
  useEffect(() => {
    fetchTags()
      .then(data => setTabs([{ id: 0, name: 'All' }, ...data]))
      .catch(console.error);
  }, []);

  // 2) Load posts theo tag
  useEffect(() => {
    if (!tabs.length) return;
    setLoading(true);
    const loader =
      selectedIndex === 0
        ? fetchAllPosts()
        : fetchPostsByTag(tabs[selectedIndex].id);

    loader
      .then(raw => setPosts(raw.filter(p => p.status === 'Published')))
      .catch(error => {
        console.error(error);
      })
      .finally(() => setLoading(false));
  }, [tabs, selectedIndex]);

  // 3) Fetch current user (id + role) for comment permissions
  useEffect(() => {
    if (!userId) {
      // No user logged in
      return;
    }
    fetchUserById(userId)
      .then(data => setCurrentUser(data))
      .catch(console.error);
  }, [userId]);

  // 4) Xóa comment hoặc reply
  const handleDeleteComment = (postId, commentId) => {
    deleteComment(commentId)
      .then(() => {
        setPosts(ps =>
          ps.map(p => {
            if (p.id !== postId) return p;
            // đệ quy lọc bỏ bất kỳ comment/reply nào có id = commentId
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
            />
          )}
        </main>
      </div>
    </div>
  );
}
