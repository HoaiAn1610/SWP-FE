import React, { useEffect, useState } from 'react';
import TagTabs from '@/components/blog/TagTabs';
import BlogList from '@/components/blog/BlogList';
import Header from "@/components/header";
import {
  fetchTags,
  fetchAllPosts,
  fetchPostsByTag,
  createComment,
  postReply,
} from '@/service/blogservice';

export default function BlogExplorer() {
  const [tabs, setTabs] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load tags
  useEffect(() => {
    fetchTags().then(data => setTabs([{ id: 0, name: 'All' }, ...data]));
  }, []);

  // Load posts khi đổi tab
  useEffect(() => {
    if (!tabs.length) return;
    setLoading(true);
    const loader = selectedIndex === 0
      ? fetchAllPosts()
      : fetchPostsByTag(tabs[selectedIndex].id);

    loader
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tabs, selectedIndex]);

  // Comment / Reply handlers (giữ nguyên)
  const handleAddComment = (postId, content) => {
    createComment(postId, content);
    setPosts(ps =>
      ps.map(p =>
        p.id === postId
          ? {
              ...p,
              comments: [
                ...(p.comments || []),
                { id: Date.now(), memberId: null, content, createdDate: new Date().toISOString(), replies: [] }
              ],
            }
          : p
      )
    );
  };
  const handleAddReply = (postId, parentId, content) => {
    postReply(parentId, content);
    setPosts(ps =>
      ps.map(p =>
        p.id === postId
          ? {
              ...p,
              comments: p.comments.map(c =>
                c.id !== parentId
                  ? c
                  : {
                      ...c,
                      replies: [
                        ...(c.replies || []),
                        { id: Date.now(), memberId: null, content, createdDate: new Date().toISOString(), replies: [] }
                      ],
                    }
              ),
            }
          : p
      )
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
