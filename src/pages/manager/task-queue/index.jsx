// src/pages/manager/ManagerReviewPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchAllPosts,
  approveBlogPost,
  rejectBlogPost,
  publishBlogPost,
  deleteBlogPost        // thêm import
} from '@/service/blogservice';
import { fetchUserById } from '@/service/userService';

export default function ManagerReviewPage() {
  const tabs = [
    { key: 'pending',   label: 'Chờ duyệt'   },
    { key: 'reviewed',  label: 'Đã duyệt'    },
    { key: 'published', label: 'Đã xuất bản' },
  ];
  const [selected, setSelected]         = useState('pending');
  const [posts, setPosts]               = useState([]);
  const [rejectingId, setRejectingId]   = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const [alertVisible, setAlertVisible]     = useState(false);
  const [alertMessage, setAlertMessage]     = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction]   = useState(() => {});

  useEffect(() => {
    (async () => {
      const all = await fetchAllPosts();
      const enriched = await Promise.all(all.map(async p => {
        let name = 'Không rõ';
        try { name = (await fetchUserById(p.createdById)).name } catch {}
        return { ...p, authorName: name };
      }));
      setPosts(enriched);
    })();
  }, []);

  const showAlert = message => {
    setAlertMessage(message);
    setAlertVisible(true);
  };
  const hideAlert = () => setAlertVisible(false);

  const showConfirm = (message, action) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setConfirmVisible(true);
  };
  const hideConfirm = () => setConfirmVisible(false);

  const doApprove = async id => {
    await approveBlogPost(id);
    setPosts(ps => ps.map(p => p.id === id ? { ...p, status: 'Approved' } : p));
    showAlert('Duyệt thành công.');
  };
  const onApproveClick = id => {
    showConfirm('Bạn có chắc chắn muốn duyệt bài này không?', () => doApprove(id));
  };

  const doReject = async id => {
    await rejectBlogPost(id, rejectReason);
    setPosts(ps =>
      ps.map(p =>
        p.id === id
          ? { ...p, status: 'Rejected', reviewComments: rejectReason }
          : p
      )
    );
    setRejectingId(null);
    setRejectReason('');
    showAlert('Từ chối thành công.');
  };
  const onRejectClick = id => setRejectingId(id);
  const onRejectSubmit = id => {
    if (!rejectReason.trim()) {
      showAlert('Vui lòng nhập lý do từ chối.');
      return;
    }
    showConfirm('Bạn có chắc chắn muốn từ chối bài này không?', () => doReject(id));
  };

  const doPublish = async id => {
    await publishBlogPost(id);
    setPosts(ps => ps.map(p => p.id === id ? { ...p, status: 'Published' } : p));
    showAlert('Xuất bản thành công.');
  };
  const onPublishClick = id => {
    showConfirm('Bạn có chắc chắn muốn xuất bản bài này không?', () => doPublish(id));
  };

  // Hàm Xóa mới
  const doDelete = async id => {
    await deleteBlogPost(id);
    setPosts(ps => ps.filter(p => p.id !== id));
    showAlert('Xóa thành công.');
  };

  const pending   = posts.filter(p => p.status.toLowerCase().trim() === 'submitted');
  const reviewed  = posts.filter(p =>
    ['approved','rejected'].includes(p.status.toLowerCase().trim())
  );
  const published = posts.filter(p => p.status === 'Published');

  let listToShow = [];
  if (selected === 'pending')   listToShow = pending;
  else if (selected === 'reviewed') listToShow = reviewed;
  else if (selected === 'published') listToShow = published;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Duyệt bài viết Blog</h1>

      {/* Tabs */}
      <div className="flex space-x-3 mb-6">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setSelected(t.key)}
            className={`px-4 py-2 rounded-full font-medium transition
              ${selected === t.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {listToShow.map(p => (
          <div key={p.id} className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-semibold">{p.title}</h2>
                  {selected === 'reviewed' && (
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        p.status === 'Approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {p.status === 'Approved' ? 'Đã duyệt' : 'Đã từ chối'}
                    </span>
                  )}
                  {selected === 'published' && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                      Đã xuất bản
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Bởi <span className="font-medium">{p.authorName}</span> ·{' '}
                  {new Date(p.createdDate).toLocaleDateString('vi-VN')}
                </p>
                {p.status === 'Rejected' && selected === 'reviewed' && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                    <p className="text-red-700 whitespace-pre-wrap">
                      {p.reviewComments}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                {selected === 'pending' && (
                  rejectingId === p.id ? (
                    <>
                      <input
                        type="text"
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                        placeholder="Lý do từ chối"
                        className="border border-gray-300 rounded px-3 py-1 w-48"
                      />
                      <button
                        onClick={() => onRejectSubmit(p.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                      >
                        Gửi
                      </button>
                      <button
                        onClick={() => { setRejectingId(null); setRejectReason(''); }}
                        className="px-3 py-1 bg-gray-300 hover:bg-gray-400 rounded"
                      >
                        Hủy
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => onApproveClick(p.id)}
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded"
                      >
                        Duyệt
                      </button>
                      <button
                        onClick={() => onRejectClick(p.id)}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
                      >
                        Từ chối
                      </button>
                    </>
                  )
                )}

                {selected === 'reviewed' && (
                  <>
                    {p.status === 'Approved' && (
                      <button
                        onClick={() => onPublishClick(p.id)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
                      >
                        Xuất bản
                      </button>
                    )}
                 
                  </>
                )}

                {selected === 'published' && (
                  <>
                    <button
                      onClick={() => showConfirm(
                        'Bạn có chắc chắn muốn xóa bài này không?',
                        () => doDelete(p.id)
                      )}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
                    >
                      Xóa
                    </button>
                    <Link
                      to={`/blogs/${p.id}`}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded"
                    >
                      Xem chi tiết
                    </Link>
                  </>
                )}

                {/* Luôn có “Xem chi tiết” ở pending & reviewed */}
                {(selected === 'pending' || selected === 'reviewed') && (
                  <Link
                    to={`/blogs/${p.id}`}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded"
                  >
                    Xem chi tiết
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}

        {listToShow.length === 0 && (
          <p className="text-center text-gray-500 py-10">
            Không có bài nào trong mục này.
          </p>
        )}
      </div>

      {/* Alert */}
      {alertVisible && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl text-center">
            <p className="mb-4 text-indigo-800 font-semibold">{alertMessage}</p>
            <button
              onClick={hideAlert}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Confirm */}
      {confirmVisible && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl text-center">
            <p className="mb-4 font-semibold text-indigo-800">{confirmMessage}</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={hideConfirm}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
              >
                Hủy
              </button>
              <button
                onClick={() => { confirmAction(); hideConfirm(); }}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
