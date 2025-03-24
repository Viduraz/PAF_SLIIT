import api from "./api";

const PostService = {
  // Get all posts (paginated and sorted by date)
  getAllPosts: (page = 1, limit = 10) => {
    return api.get(`/posts?page=${page}&limit=${limit}`);
  },

  // Get popular posts (sorted by likes)
  getPopularPosts: (page = 1, limit = 10) => {
    return api.get(`/posts/popular?page=${page}&limit=${limit}`);
  },

  // Get posts from users the current user follows
  getFollowingPosts: (page = 1, limit = 10) => {
    return api.get(`/posts/following?page=${page}&limit=${limit}`);
  },

  // Get a specific post
  getPostById: (postId) => {
    return api.get(`/posts/${postId}`);
  },

  // Create a new post
  createPost: (postData) => {
    return api.post("/posts", postData);
  },

  // Update a post
  updatePost: (postId, postData) => {
    return api.put(`/posts/${postId}`, postData);
  },

  // Delete a post
  deletePost: (postId) => {
    return api.delete(`/posts/${postId}`);
  },

  // Like/unlike a post
  likePost: (postId) => {
    return api.post(`/posts/${postId}/like`);
  },

  // Add a comment to a post
  addComment: (postId, commentData) => {
    return api.post(`/posts/${postId}/comments`, commentData);
  },

  // Delete a comment
  deleteComment: (postId, commentId) => {
    return api.delete(`/posts/${postId}/comments/${commentId}`);
  },

  // Search posts by keyword
  searchPosts: (keyword) => {
    return api.get(`/posts/search?keyword=${keyword}`);
  },

  // Get posts by tag
  getPostsByTag: (tag) => {
    return api.get(`/posts/tag/${tag}`);
  },

  // Get user's posts
  getUserPosts: (userId) => {
    return api.get(`/posts/user/${userId}`);
  }
};

export default PostService;