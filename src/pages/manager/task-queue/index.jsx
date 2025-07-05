// src/pages/manager/ManagerReviewPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchAllPosts,
  approveBlogPost,
  rejectBlogPost,
  publishBlogPost
} from '@/service/blogservice';
import { fetchUserById } from '@/service/userService';

export default function ManagerReviewPage() {
  const tabs = [
    { key: 'pending',  label: 'Chờ duyệt' },
    { key: 'reviewed', label: 'Đã duyệt' },
  ];
  const [selected, setSelected]         = useState('pending');
  const [posts, setPosts]               = useState([]);
  const [rejectingId, setRejectingId]   = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    (async () => {
      const all = await fetchAllPosts();
      const enriched = await Promise.all(all.map(async p => {
        let name = 'Unknown';
        try { name = (await fetchUserById(p.createdById)).name } catch {}
        return { ...p, authorName: name };
      }));
      setPosts(enriched);
    })();
  }, []);

  const doApprove = async id => {
    await approveBlogPost(id);
    setPosts(ps => ps.map(p => p.id===id ? { ...p, status: 'Approved' } : p));
  };
  const doReject = async id => {
    if (!rejectReason.trim()) return;
    await rejectBlogPost(id, rejectReason);
    setPosts(ps =>
      ps.map(p =>
        p.id===id
          ? { ...p, status: 'Rejected', reviewComments: rejectReason }
          : p
      )
    );
    setRejectingId(null);
    setRejectReason('');
  };
  const doPublish = async id => {
    await publishBlogPost(id);
    setPosts(ps => ps.map(p => p.id===id ? { ...p, status: 'Published' } : p));
  };

  const pending  = posts.filter(p => p.status === 'Submitted');
  const reviewed = posts.filter(p => ['Approved','Rejected'].includes(p.status));

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Duyệt Blog Posts</h1>

      {/* Tabs */}
      <div className="flex space-x-3 mb-6">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setSelected(t.key)}
            className={`px-4 py-2 rounded-full font-medium transition
              ${selected===t.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {(selected==='pending' ? pending : reviewed).map(p => (
          <div key={p.id} className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold">{p.title}</h2>
                <p className="text-sm text-gray-500">
                  By <span className="font-medium">{p.authorName}</span> ·{' '}
                  {new Date(p.createdDate).toLocaleDateString()}
                </p>
                {p.status==='Rejected' && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                    <p className="text-red-700 whitespace-pre-wrap">
                      {p.reviewComments}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col space-y-2">
                <div className="flex space-x-2">
                  {selected==='pending' && (
                    <>
                      <button
                        onClick={()=>doApprove(p.id)}
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded"
                      >
                        Approve
                      </button>
                      {!rejectingId && (
                        <button
                          onClick={()=>setRejectingId(p.id)}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
                        >
                          Reject
                        </button>
                      )}
                    </>
                  )}

                  {selected==='reviewed' && p.status==='Approved' && (
                    <button
                      onClick={()=>doPublish(p.id)}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
                    >
                      Publish
                    </button>
                  )}

                  {/* <-- Nút View Details mới bên cạnh */}
                  <Link
                    to={`/blogs/${p.id}`}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded"
                  >
                    View Details
                  </Link>
                </div>

                {/* Reject input */}
                {rejectingId===p.id && (
                  <div className="flex space-x-2 mt-2">
                    <textarea
                      rows={2}
                      value={rejectReason}
                      onChange={e=>setRejectReason(e.target.value)}
                      placeholder="Lý do từ chối..."
                      className="flex-1 border border-gray-300 rounded px-3 py-2"
                    />
                    <button
                      onClick={()=>doReject(p.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                    >
                      Gửi Reject
                    </button>
                    <button
                      onClick={()=>{ setRejectingId(null); setRejectReason(''); }}
                      className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                    >
                      Hủy
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Empty */}
        {((selected==='pending'?pending:reviewed).length===0) && (
          <p className="text-center text-gray-500 py-10">
            Không có bài nào ở mục này.
          </p>
        )}
      </div>
    </div>
  );
}
