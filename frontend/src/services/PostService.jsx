import api from "./api";

const PostService = {
  // Get all posts (paginated and sorted by date)
  getAllPosts: (page = 1, limit = 10) => {
    return api.get(`/posts?page=${page}&limit=${limit}&includeAuthor=true`);
  },

  // Get popular posts (sorted by likes)
  getPopularPosts: (page = 1, limit = 10) => {
    return api.get(`/posts/popular?page=${page}&limit=${limit}&includeAuthor=true`);
  },

  // Get posts from users the current user follows
  getFollowingPosts: (page = 1, limit = 10) => {
    return api.get(`/posts/following?page=${page}&limit=${limit}&includeAuthor=true`);
  },

  // Get a specific post
  getPostById: (postId) => {
    if (!postId || postId === 'undefined') {
      return Promise.reject(new Error("Invalid post ID"));
    }
    return api.get(`/posts/${postId}`);
  },

  // Create a new post
  createPost: (postData) => {
    return api.post("/posts", postData)
      .then(response => {
        console.log("Create post API response:", response);
        // Check for both id and _id to handle both backend formats
        if (!response.data || (!response.data._id && !response.data.id)) {
          console.error("API returned success but without proper post data:", response);
        }
        return {
          ...response,
          data: {
            ...response.data,
            // Create a consistent _id property for the frontend
            _id: response.data._id || response.data.id
          }
        };
      })
      .catch(error => {
        console.error("Create post API error:", error);
        throw error;
      });
  },

  // Create a new post with an image
  createPostWithImage: (formData) => {
    return api.post("/posts/with-image", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
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
    // Try POST method instead of PUT if that's what your backend expects
    return api.post(`/posts/${postId}/like`);
  },

  // Add a comment to a post
  addComment: (postId, commentData) => {
    // Make sure we're sending the right format for your backend
    return api.post(`/comments`, {
      content: commentData.content,
      referenceType: "POST",
      referenceId: postId,
      authorId: commentData.authorId
    });
  },

  // Delete a comment
  deleteComment: (postId, commentId) => {
    // Use the comments endpoint directly
    return api.delete(`/comments/${commentId}`);
  },

  // Get post data for editing
  getPostForEdit: (postId) => {
    return api.get(`/posts/${postId}/edit`).catch(error => {
      // Fallback to regular get if edit endpoint doesn't exist
      if (error.response && error.response.status === 404) {
        return api.get(`/posts/${postId}`);
      }
      throw error;
    });
  },

  // Search posts by keyword
  searchPosts: (keyword) => {
    return api.get(`/posts/search?title=${keyword}`);
  },

  // Get posts by tag
  getPostsByTag: (tag) => {
    return api.get(`/posts/tag/${tag}`);
  },

  // Get user's posts
  getUserPosts: (userId) => {
    // Try different API endpoints since the current one returns 404
    return api.get(`/posts?userId=${userId}`)
      .then(response => {
        // Normalize the data to ensure each post has an _id field
        return {
          ...response,
          data: Array.isArray(response.data) ? response.data.map(post => ({
            ...post,
            _id: post._id || post.id
          })) : response.data
        };
      });
  }
};

export default PostService;