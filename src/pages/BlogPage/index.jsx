// src/pages/blog/BlogExplorer.jsx
import React, { useEffect, useState } from 'react';
import TagTabs from '@/components/blog/TagTabs';
import BlogList from '@/components/blog/BlogList';
import Header from '@/components/header';
import { fetchTags, fetchAllPosts, fetchPostsByTag } from '@/service/blogservice';

export default function BlogExplorer() {
  const [tabs, setTabs]                   = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [posts, setPosts]                 = useState([]);
  const [loading, setLoading]             = useState(false);

  useEffect(() => {
    fetchTags()
      .then(data => setTabs([{ id: 0, name: 'All' }, ...data]))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!tabs.length) return;
    setLoading(true);
    const loader =
      selectedIndex === 0
        ? fetchAllPosts()
        : fetchPostsByTag(tabs[selectedIndex].id);

    loader
      .then(raw => {
        setPosts(raw.filter(p => p.status === 'Published'));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tabs, selectedIndex]);

  // giờ nhận "commentObj" chứ không phải "content"
  const handleAddComment = (postId, newCommentObj) => {
    setPosts(ps =>
      ps.map(p =>
        p.id === postId
          ? { ...p, comments: [...(p.comments||[]), newCommentObj] }
          : p
      )
    );
  };

  // tương tự cho reply: nhận object reply
  const handleAddReply = (postId, parentId, newReplyObj) => {
    setPosts(ps =>
      ps.map(p => {
        if (p.id !== postId) return p;
        return {
          ...p,
          comments: (p.comments||[]).map(c =>
            c.id !== parentId
              ? c
              : { ...c, replies: [...(c.replies||[]), newReplyObj] }
          )
        };
      })
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex">
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
            <div className="flex justify-center py-20">Loading...</div>
          ) : (
            <BlogList
              posts={posts}
              onAddComment={handleAddComment}
              onAddReply={handleAddReply}
            />
          )}
        </main>
      </div>
    </div>
  );
}
