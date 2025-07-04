import api from "../config/axios";

export const fetchTags = async () => {
  const { data } = await api.get('/Tag');
  return Array.isArray(data) ? data : [];
};

export const fetchAllPosts = async () => {
  const { data } = await api.get('/BlogPost/get-all-blogpost');
  if (Array.isArray(data)) return data;
  if (data) return [data];
  return [];
};

export const fetchPostsByTag = async (tagId) => {
  const { data } = await api.get(`/BlogPost/get-blogpost-by-tag/${tagId}`);
  if (Array.isArray(data)) return data;
  if (data) return [data];
  return [];
};

export const createComment = async (blogPostId, content) => {
  const { data } = await api.post('/Comment/create-comment', {
    blogPostId,
    activityId: null,
    content,
  });
  return data;
};

export const postReply = async (parentCommentId, content) => {
  const { data } = await api.post('/Comment/reply-comment', { parentCommentId, content });
  return data;
};

