// src/components/common/CommentSection.jsx
import React, { useState, useEffect } from "react";
import api from "@/config/axios";

export default function CommentSection({ entity, entityId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newContent, setNewContent] = useState("");
  const [userInfos, setUserInfos] = useState({}); // { [memberId]: { name, role } }

  const currentUserId = Number(localStorage.getItem("id") || "0");
  const [currentUserRole, setCurrentUserRole] = useState(null);

  // Popup state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(() => {});

  const showAlert = (msg) => {
    setAlertMessage(msg);
    setAlertVisible(true);
  };
  const hideAlert = () => setAlertVisible(false);

  const showConfirm = (msg, action) => {
    setConfirmMessage(msg);
    setConfirmAction(() => action);
    setConfirmVisible(true);
  };
  const hideConfirm = () => setConfirmVisible(false);

  // 0) Load info current user
  useEffect(() => {
    api
      .get(`/Admin/get-user/${currentUserId}`)
      .then((res) => {
        setCurrentUserRole(res.data.role);
        setUserInfos((u) => ({
          ...u,
          [currentUserId]: {
            name: res.data.name,
            role: res.data.role,
          },
        }));
      })
      .catch(() => {});
  }, [currentUserId]);

  // Hàm đệ quy lấy replies cho 1 parent comment, và cộng +7h nếu là activity
  const loadNestedReplies = async (parentId) => {
    try {
      const res = await api.get(`/Comment/${parentId}/replies`);
      let list = res.data;

      // Cộng +7h cho createdDate của replies khi entity === "activity"
      if (entity === "activity") {
        list = list.map((c) => {
          const d = new Date(c.createdDate);
          d.setHours(d.getHours() + 7);
          return { ...c, createdDate: d.toISOString() };
        });
      }

      // Với mỗi reply tiếp tục đệ quy lấy con của nó
      const withChildren = await Promise.all(
        list.map(async (r) => ({
          ...r,
          replies: await loadNestedReplies(r.id),
        }))
      );
      return withChildren;
    } catch {
      return []; // lỗi thì coi như không có replies
    }
  };

  // 1) Load comments + toàn bộ nested replies
  useEffect(() => {
    setLoading(true);
    const fetchAll = async () => {
      try {
        const url =
          entity === "activity"
            ? `/Comment/get-by-activity/${entityId}`
            : `/Comment/get-post-comment/${entityId}`;
        const res = await api.get(url);
        let data = res.data;

        // chỉ +7h khi activity cho top-level
        if (entity === "activity") {
          data = data.map((c) => {
            const d = new Date(c.createdDate);
            d.setHours(d.getHours() + 7);
            return { ...c, createdDate: d.toISOString() };
          });
        }

        // với mỗi comment cấp 1, gọi đệ quy để lấy replies
        const commentsWithReplies = await Promise.all(
          data.map(async (c) => ({
            ...c,
            replies: await loadNestedReplies(c.id),
          }))
        );
        setComments(commentsWithReplies);
      } catch {
        setError("Lỗi tải bình luận");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [entity, entityId]);

  // 2) Load name+role của các tác giả (cả top-level và replies)
  useEffect(() => {
    const ids = Array.from(
      new Set(
        comments.flatMap((c) => {
          const all = [];
          const dfs = (node) => {
            all.push(node.memberId);
            (node.replies || []).forEach(dfs);
          };
          dfs(c);
          return all;
        })
      )
    );
    const toFetch = ids.filter((id) => !userInfos[id]);
    if (toFetch.length === 0) return;

    Promise.all(
      toFetch.map((id) =>
        api
          .get(`/Admin/get-user/${id}`)
          .then((res) => ({
            id,
            name: res.data.name,
            role: res.data.role,
          }))
          .catch(() => ({ id, name: null, role: null }))
      )
    ).then((results) => {
      const newMap = { ...userInfos };
      results.forEach(({ id, name, role }) => {
        newMap[id] = { name, role };
      });
      setUserInfos(newMap);
    });
  }, [comments, userInfos]);

  // Format time hiển thị theo múi giờ Asia/Ho_Chi_Minh
  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Ho_Chi_Minh",
    });
  };

  // Thêm comment (không +7h khi POST)
  const addComment = async () => {
    if (!newContent.trim()) return;
    try {
      const dto =
        entity === "activity"
          ? { activityId: entityId, content: newContent }
          : { postId: entityId, content: newContent };
      const url =
        entity === "activity"
          ? "/Comment/create-activity-comment"
          : "/Comment/create-blogpost-comment";
      const res = await api.post(url, dto);
      setComments([...comments, { ...res.data, replies: [] }]);
      setNewContent("");
    } catch {
      showAlert("Lỗi khi thêm bình luận");
    }
  };

  // Thêm reply (giữ nguyên createdDate trả về, không +7h)
  const addReply = async (parentId, text) => {
    if (!text.trim()) return;
    try {
      const res = await api.post("/Comment/reply-comment", {
        parentCommentId: parentId,
        content: text,
      });
      const insert = (list) =>
        list.map((c) => {
          if (c.id === parentId) {
            return {
              ...c,
              replies: [...(c.replies || []), { ...res.data, replies: [] }],
            };
          }
          if (c.replies) {
            return { ...c, replies: insert(c.replies) };
          }
          return c;
        });
      setComments(insert(comments));
    } catch {
      showAlert("Lỗi khi trả lời bình luận");
    }
  };

  // Xóa comment
  const deleteComment = (id, authorId) => {
    const canDelete =
      currentUserRole !== "Member" || authorId === currentUserId;
    if (!canDelete) return;

    showConfirm("Bạn có chắc chắn muốn xóa bình luận này?", async () => {
      try {
        await api.delete(`/Comment/delete-comment/${id}`);
        const remove = (list) =>
          list
            .filter((c) => c.id !== id)
            .map((c) => ({
              ...c,
              replies: remove(c.replies || []),
            }));
        setComments(remove(comments));
        showAlert("Xóa thành công");
      } catch {
        showAlert("Xóa thất bại");
      } finally {
        hideConfirm();
      }
    });
  };

  if (loading) return <p>Đang tải bình luận…</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-4">
      <h3 className="text-2xl font-bold mb-4">Bình luận</h3>

      {/* Form thêm comment */}
      <div className="flex items-start space-x-3 mb-6">
        <div className="w-10 h-10 bg-gray-300 rounded-full" />
        <textarea
          rows={1}
          placeholder="Viết bình luận…"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-400 resize-none overflow-hidden"
        />
        <button
          onClick={addComment}
          className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition"
        >
          Gửi
        </button>
      </div>

      {/* Danh sách comment */}
      {comments.map((c) => (
        <CommentItem
          key={c.id}
          comment={c}
          userInfos={userInfos}
          formatTime={formatTime}
          onReply={addReply}
          onDelete={deleteComment}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
        />
      ))}

      {/* Alert */}
      {alertVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white p-4 rounded-lg shadow-lg text-center">
            <p className="mb-4 font-semibold text-indigo-800">
              {alertMessage}
            </p>
            <button
              onClick={hideAlert}
              className="px-4 py-2 bg-indigo-600 text-white rounded"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Confirm */}
      {confirmVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white p-4 rounded-lg shadow-lg text-center">
            <p className="mb-4 font-semibold text-indigo-800">
              {confirmMessage}
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={hideConfirm}
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                onClick={() => confirmAction()}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
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

// Component con
function CommentItem({
  comment,
  userInfos,
  formatTime,
  onReply,
  onDelete,
  currentUserId,
  currentUserRole,
}) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");

  const author = userInfos[comment.memberId] || {};
  const authorName = author.name || `User#${comment.memberId}`;

  // Quyền xóa
  const canDelete =
    currentUserRole !== "Member" || comment.memberId === currentUserId;

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      {/* header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-300 rounded-full mr-3" />
          <span className="font-semibold text-gray-800">{authorName}</span>
        </div>
        <span className="text-sm text-gray-500">
          {formatTime(comment.createdDate)}
        </span>
      </div>
      {/* nội dung */}
      <p className="text-gray-700 mb-3 whitespace-pre-wrap">
        {comment.content}
      </p>
      {/* action */}
      <div className="flex space-x-4 text-sm text-gray-500 mb-3">
        <button
          onClick={() => setShowReply((v) => !v)}
          className="hover:text-blue-600"
        >
          Trả lời
        </button>
        {canDelete && (
          <button
            onClick={() => onDelete(comment.id, comment.memberId)}
            className="hover:text-red-600"
          >
            Xóa
          </button>
        )}
      </div>
      {/* reply form */}
      {showReply && (
        <div className="flex items-start space-x-3 mt-2">
          <div className="w-10 h-10 bg-gray-300 rounded-full" />
          <textarea
            rows={1}
            placeholder="Viết phản hồi…"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-400 resize-none overflow-hidden"
          />
          <button
            onClick={() => {
              onReply(comment.id, replyText);
              setReplyText("");
              setShowReply(false);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition"
          >
            Gửi
          </button>
        </div>
      )}
      {/* replies con */}
      {comment.replies &&
        comment.replies.map((r) => (
          <div key={r.id} className="ml-12 mt-4">
            <CommentItem
              comment={r}
              userInfos={userInfos}
              formatTime={formatTime}
              onReply={onReply}
              onDelete={onDelete}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
            />
          </div>
        ))}
    </div>
  );
}
