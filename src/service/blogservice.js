import api from "../config/axios";

export const fetchTags = async () => {
  const { data } = await api.get('/Tag');
  return Array.isArray(data) ? data : [];
};

export const fetchAllPosts = async () => {
  const { data } = await api.get('/BlogPost/get-all-blogpost');
  // Chuẩn hóa thành mảng
  const posts = Array.isArray(data)
    ? data
    : data
      ? [data]
      : [];
  return posts;  // <-- Thêm dòng này
};
// Tạo tag mới
export const createTag = async (name) => {
  const { data } = await api.post('/Tag/create-tag', { name });
  return data;  // mong API trả về object { id, name }
};
export const fetchPostsByTag = async (tagId) => {
  const { data } = await api.get(`/BlogPost/get-blogpost-by-tag/${tagId}`);
  if (Array.isArray(data)) return data;
  if (data) return [data];
  return [];
};

// Tạo comment gốc cho blogpost
export const createComment = async (blogPostId, content) => {
  // Gọi đúng endpoint và body shape
  const { data } = await api.post('/Comment/create-blogpost-comment', {
    blogPostId,
    content,
  });
  return data;  // server trả về object comment vừa tạo
};

export const postReply = async (parentCommentId, content) => {
  const { data } = await api.post('/Comment/reply-comment', { parentCommentId, content });
  return data;
};

/**
 * Tạo một BlogPost mới
 * @param {{ title: string; content: string; coverImageUrl: string; tagIds: number[] }} payload
 * @returns {Promise<Object>} blog vừa tạo
 */
export const createBlogPost = async ({ title, content, coverImageUrl, tagIds }) => {
  const { data } = await api.post('/BlogPost/create-blogpost', {
    title,
    content,
    coverImageUrl,
    tagIds
  });
  return data;
};

/**
 * Submit a blog post for approval
 * @param {number} postId
 * @returns {Promise<void>}
 */
export const submitForApproval = async (postId) => {
  await api.post(`/BlogPost/submit-for-approval/${postId}`);
};

/** Approve bài */
export const approveBlogPost = async (postId) => {
  await api.post(`/BlogPost/approve/${postId}`);
};

/** Reject bài với reviewComments */
export const rejectBlogPost = async (postId, reviewComments) => {
  await api.post(
    `/BlogPost/reject/${postId}`,
    null,
    { params: { reviewComments } }
  );
};

/** Publish bài */
export const publishBlogPost = async (postId) => {
  await api.post(`/BlogPost/publish/${postId}`);
};


/**
 * Cập nhật một BlogPost
 * @param {number} blogPostId
 * @param {{ title: string; content: string; coverImageUrl: string; tagIds: number[] }} payload
 * @returns {Promise<Object>} blog đã cập nhật
 */
export const updateBlogPost = async (blogPostId, { title, content, coverImageUrl, tagIds }) => {
  const { data } = await api.put(`/BlogPost/update-blogpost/${blogPostId}`, {
    title,
    content,
    coverImageUrl,
    tagIds
  });
  return data;
};

/**
 * Xóa một BlogPost theo id
 * @param {number} blogPostId
 * @returns {Promise<void>}
 */
export const deleteBlogPost = async (blogPostId) => {
  await api.delete(`/BlogPost/delete-blogpost/${blogPostId}`);
};

/**
 * Xóa một comment (hoặc reply)
 * @param {number} id
 * @returns {Promise<void>}
 */
export const deleteComment = async (id) => {
  await api.delete(`/Comment/delete-comment/${id}`);
};