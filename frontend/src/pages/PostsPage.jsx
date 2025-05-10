import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import PostService from "../services/postService";
import CommentService from "../services/commentService";
import { Modal, Button, Form, Spinner } from "react-bootstrap";

function PostsPage() {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("latest");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal state
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [updatingPost, setUpdatingPost] = useState(false);
  const [editFormData, setEditFormData] = useState({
    _id: "",
    title: "",
    content: "",
    tags: ""
  });

  // Add these state variables near your other useState declarations
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let response;

      switch (filter) {
        case "popular":
          response = await PostService.getPopularPosts();
          break;
        case "following":
          if (!isAuthenticated) {
            setPosts([]);
            setLoading(false);
            return;
          }
          response = await PostService.getFollowingPosts();
          break;
        case "latest":
        default:
          response = await PostService.getAllPosts();
          break;
      }

      console.log("Fetched posts response:", response.data);

      // Fetch comments for each post
      const postsWithComments = await Promise.all(
        response.data.map(async (post) => {
          const commentsResponse = await CommentService.getCommentsByReference("POST", post._id || post.id);
          return {
            ...post,
            _id: post._id || post.id,
            comments: commentsResponse.data || [],
          };
        })
      );

      console.log("Posts with comments:", postsWithComments);

      setPosts(postsWithComments);
      setLoading(false);
    } catch (err) {
      setError("Failed to load posts");
      setLoading(false);
      console.error("Error fetching posts:", err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      fetchPosts();
      return;
    }

    try {
      setLoading(true);
      const response = await PostService.searchPosts(searchTerm);
      setPosts(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to search posts");
      setLoading(false);
      console.error(err);
    }
  };

  const likePost = async (postId) => {
    if (!isAuthenticated) {
      alert("You need to login to like a post");
      return;
    }

    try {
      await PostService.likePost(postId);

      setPosts(posts.map(post => {
        if (post._id === postId) {
          const currentLikes = Array.isArray(post.likes) ? post.likes : [];
          const alreadyLiked = currentLikes.includes(currentUser._id);
          return {
            ...post,
            likes: alreadyLiked
              ? currentLikes.filter(id => id !== currentUser._id)
              : [...currentLikes, currentUser._id]
          };
        }
        return post;
      }));
    } catch (err) {
      console.error("Failed to like post:", err);
    }
  };

  const handleEditClick = (post) => {
    console.log("Editing post:", post);
    setEditingPost(post);
    setEditFormData({
      _id: post._id || "",
      title: post.title || "",
      content: post.content || "",
      tags: Array.isArray(post.tags) ? post.tags.join(", ") : ""
    });
    setShowEditPopup(true);
  };

  const handleEditPost = (postId) => {
    const post = posts.find(p => p._id === postId || p.id === postId);
    if (post) {
      handleEditClick(post);
    } else {
      console.error("Post not found for editing:", postId);
      setError("Failed to edit post: Post not found");
    }
  };

  const handleCloseEditPopup = () => {
    setShowEditPopup(false);
    setEditingPost(null);
    setEditFormData({ title: "", content: "", tags: "" });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    if (!editingPost) return;

    try {
      setUpdatingPost(true);
      setError(""); // Clear any previous errors

      // Convert tags string to array
      const tagsArray = editFormData.tags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag !== "");
      
      // Include image properties from the original post
      const postData = {
        ...editFormData,
        tags: tagsArray,
        // Preserve image data
        imageUrl: editingPost.imageUrl,
        imagePublicId: editingPost.imagePublicId
      };

      console.log("editingPost:", editingPost);
      console.log("Updating post with data:", postData);
      console.log("Post ID:", editingPost.id);

      // Make sure we're passing a valid ID to the update function
      if (!editingPost.id) {
        throw new Error("Invalid post ID for update");
      }

      const response = await PostService.updatePost(editingPost.id, postData);
      console.log("Update response:", response);

      // Update the post in the local state - handle different API response formats
      setPosts(prev =>
        prev.map(post => {
          if (post.id === editingPost.id) {
            // Create a merged object with updated data
            const updatedPost = {
              ...post,
              ...response.data,
              // Ensure these fields are preserved properly
              _id: post._id, // Keep the original ID to ensure consistency
              author: post.author, // Preserve author information
              createdAt: post.createdAt, // Preserve creation date
              tags: tagsArray, // Use our formatted tags
              imageUrl: post.imageUrl, // Preserve image URL
              imagePublicId: post.imagePublicId // Preserve image ID
            };
            return updatedPost;
          }
          return post;
        })
      );

      // Show success message
      setError("Post updated successfully"); // Using the error state for success message
      setTimeout(() => setError(""), 3000); // Clear after 3 seconds

      // Close the popup
      handleCloseEditPopup();

    } catch (err) {
      console.error("Failed to update post:", err);

      // More detailed error message
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(`Failed to update post: ${err.response.data.message || err.response.statusText || 'Server error'}`);
        console.error("Response data:", err.response.data);
        console.error("Response status:", err.response.status);
      } else if (err.request) {
        // The request was made but no response was received
        setError("Failed to update post: No response from server. Check your network connection.");
        console.error("Request:", err.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(`Failed to update post: ${err.message}`);
      }
    } finally {
      setUpdatingPost(false);
    }
  };

  const handleDeletePost = async (postId, e) => {
    // Stop event propagation to prevent navigating to post details
    e.stopPropagation();

    // Confirm deletion with the user
    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    try {
      await PostService.deletePost(postId);

      // Remove the deleted post from state
      setPosts(posts.filter(post => post.id !== postId));

      // Show success message
      setError("Post deleted successfully");
      setTimeout(() => setError(""), 3000);
    } catch (err) {
      console.log("Error deleting post:", err);
      console.error("Failed to delete post:", err);

      if (err.response) {
        setError(`Failed to delete post: ${err.response.data.message || err.response.statusText || 'Server error'}`);
      } else if (err.request) {
        setError("Failed to delete post: No response from server. Check your network connection.");
      } else {
        setError(`Failed to delete post: ${err.message}`);
      }
    }
  };

  // Add these functions alongside your other handler functions
  const toggleComments = (postId) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
    setNewCommentText("");
  };

  const handleAddComment = async (postId) => {
    if (!isAuthenticated) {
      alert("You need to login to comment");
      return;
    }
    
    if (!newCommentText.trim()) return;
    
    try {
      const response = await PostService.addComment(postId, {
        content: newCommentText,
        authorId: currentUser._id || currentUser.id
      });
      
      // Add new comment to the post
      setPosts(posts.map(post => {
        if (post._id === postId || post.id === postId) {
          const newComment = {
            ...response.data,
            author: {
              _id: currentUser._id || currentUser.id,
              username: currentUser.username,
              profileImage: currentUser.profileImage
            },
            createdAt: new Date().toISOString()
          };
          
          return {
            ...post,
            comments: [...(post.comments || []), newComment]
          };
        }
        return post;
      }));
      
      setNewCommentText("");
    } catch (err) {
      console.error("Failed to add comment:", err);
      setError("Failed to add comment. Please try again.");
    }
  };

  // Update the startEditComment function to handle both id formats
  const startEditComment = (comment) => {
    console.log("Starting to edit comment:", comment);
    
    // Check for either _id or id property
    const commentId = comment?._id || comment?.id;
    
    if (!comment || !commentId) {
      console.error("Invalid comment data:", comment);
      setError("Error: Cannot edit this comment");
      return;
    }
    
    setEditingCommentId(commentId);
    setEditCommentText(comment.content || "");
  };

  // Update the handleUpdateComment function
  const handleUpdateComment = async (postId, commentId) => {
    console.log(`Updating comment ${commentId} for post ${postId} with text: ${editCommentText}`);
    
    try {
      if (!editCommentText.trim()) {
        setError("Comment text cannot be empty");
        return;
      }
      
      const response = await CommentService.updateComment(commentId, { content: editCommentText });
      console.log("Comment update response:", response);
      
      // Update comment in the posts state
      setPosts(posts.map(post => {
        if (post._id === postId || post.id === postId) {
          return {
            ...post,
            comments: post.comments.map(comment => {
              const currentCommentId = comment._id || comment.id;
              if (currentCommentId === commentId) {
                return { 
                  ...comment, 
                  content: editCommentText,
                  updatedAt: new Date().toISOString()
                };
              }
              return comment;
            })
          };
        }
        return post;
      }));
      
      // Clear the edit state
      setEditingCommentId(null);
      setEditCommentText("");
      
      // Show success message
      setError("✅ Comment updated successfully");
      setTimeout(() => setError(""), 3000);
    } catch (err) {
      console.error("Failed to update comment:", err);
      setError("❌ Failed to update comment. Please try again.");
    }
  };

  // Update handleDeleteComment function
  const handleDeleteComment = async (postId, commentId) => {
    console.log(`Attempting to delete comment ${commentId} from post ${postId}`);
    
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }
    
    try {
      await CommentService.deleteComment(commentId);
      console.log(`Comment ${commentId} deleted successfully`);
      
      // Remove deleted comment from the posts state
      setPosts(posts.map(post => {
        if (post._id === postId || post.id === postId) {
          return {
            ...post,
            comments: post.comments.filter(comment => {
              const currentCommentId = comment._id || comment.id;
              return currentCommentId !== commentId;
            })
          };
        }
        return post;
      }));
      
      // Show success message
      setError("🗑️ Comment deleted successfully");
      setTimeout(() => setError(""), 3000);
    } catch (err) {
      console.error("Failed to delete comment:", err);
      setError("❌ Failed to delete comment. Please try again.");
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-t-4 border-b-4 border-emerald-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-emerald-600 font-medium">Loading posts...</p>
        </div>
      </div>
    );
  }

  const renderEditModal = () => {
    if (!showEditPopup) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-lg w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Edit Post</h3>
            <button
              onClick={handleCloseEditPopup}
              className="text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
          </div>

          <form onSubmit={handleUpdatePost}>
            <div className="mb-3">
              <label className="block text-gray-700 mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={editFormData.title}
                onChange={handleEditFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="mb-3">
              <label className="block text-gray-700 mb-1">Content</label>
              <textarea
                rows={4}
                name="content"
                value={editFormData.content}
                onChange={handleEditFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              ></textarea>
            </div>

            <div className="mb-3">
              <label className="block text-gray-700 mb-1">Tags (comma separated)</label>
              <input
                type="text"
                name="tags"
                value={editFormData.tags}
                onChange={handleEditFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="technology, programming, react"
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={handleCloseEditPopup}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                disabled={updatingPost}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={updatingPost}
              >
                {updatingPost ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⟳</span>
                    Updating...
                  </>
                ) : 'Update Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-emerald-50 min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-800 mb-4 sm:mb-0">
            Community Posts
          </h1>
          {isAuthenticated && (
            <Link
              to="/posts/new"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg shadow-md transition duration-200 ease-in-out transform hover:scale-105 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Post
            </Link>
          )}
        </div>

        {/* Filter & Search Section */}
        <div className="bg-white p-4 rounded-xl shadow-md mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                className={`px-4 py-2 rounded-md transition-all ${
                  filter === "latest"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-100 hover:bg-emerald-200 text-emerald-700"
                }`}
                onClick={() => setFilter("latest")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Latest
              </button>
              <button
                className={`px-4 py-2 rounded-md transition-all ${
                  filter === "popular"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-100 hover:bg-emerald-200 text-emerald-700"
                }`}
                onClick={() => setFilter("popular")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Popular
              </button>
              {isAuthenticated && (
                <button
                  className={`px-4 py-2 rounded-md transition-all ${
                    filter === "following"
                      ? "bg-emerald-600 text-white"
                      : "bg-emerald-100 hover:bg-emerald-200 text-emerald-700"
                  }`}
                  onClick={() => setFilter("following")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Following
                </button>
              )}
            </div>
            <form onSubmit={handleSearch} className="flex w-full md:w-auto">
              <input
                type="search"
                placeholder="Search posts..."
                className="px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="submit"
                className="bg-emerald-600 text-white px-4 py-2 rounded-r-md hover:bg-emerald-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md">
            <div className="flex">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {posts.length > 0 ? (
          <div className="row">
            {posts.map((post, index) => (
              <div className="col-md-6 mb-4" key={post._id || `post-${index}`}>
                <div className="card h-100">
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="card-img-top"
                      style={{ height: "200px", objectFit: "cover" }}
                    />
                  )}
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-3">
                      {post.author ? (
                        <Link to={`/profile/${post.author._id}`} className="text-decoration-none">
                          {post.author.profileImage ? (
                            <img
                              src={post.author.profileImage}
                              alt={post.author.username}
                              className="w-10 h-10 rounded-full mr-3 object-cover ring-2 ring-emerald-500"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-bold">
                              {post.author.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-800 group-hover:text-emerald-600 transition-colors">
                              {post.author.username}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(post.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </Link>
                      ) : (
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-gray-200 text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <span className="fw-bold">unknwon</span>
                            <br />
                            <small className="text-muted">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </small>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{post.title}</h2>

                    {/* Post Management Buttons */}
                    {isAuthenticated && currentUser && post.author &&
                      (currentUser._id === post.author._id || currentUser.id === post.author._id) && (
                        <div className="flex gap-2 mb-4">
                          <button
                            className="flex items-center text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                            onClick={() => handleEditPost(post._id)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            className="flex items-center text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                            onClick={() => handleDeletePost(post._id)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      )}

                    {/* Content */}
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.content.length > 150
                        ? post.content.substring(0, 150) + "..."
                        : post.content}
                    </p>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {post.tags.map((tag, index) => (
                          <span
                            key={`${post._id}-tag-${index}`}
                            className="bg-emerald-100 text-emerald-600 text-xs px-2 py-1 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Post Actions */}
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                        <button
                          className={`btn btn-sm ${isAuthenticated && post.likes && Array.isArray(post.likes) && post.likes.includes(currentUser?._id)
                            ? "btn-danger"
                            : "btn-outline-danger"}`}
                          onClick={() => likePost(post.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill={
                            isAuthenticated && post.likes && Array.isArray(post.likes) && post.likes.includes(currentUser?._id)
                              ? "currentColor"
                              : "none"
                          } viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {Array.isArray(post.likes) ? post.likes.length : 0}
                        </button>

                        <Link to={`/posts/${post.id}`} className="btn btn-sm btn-outline-primary ms-2">
                          <i className="bi bi-chat-fill me-1"></i>
                          {post.comments?.length || 0}
                        </Link>

                        {/* Add Edit button - only show for posts authored by current user */}
                        {/* {isAuthenticated && post.author && post.author._id === currentUser?._id && ( */}
                        <button
                          className="btn btn-sm btn-outline-secondary ms-2"
                          onClick={() => handleEditClick(post)}
                        >
                          <i className="bi bi-pencil-fill me-1"></i>
                          Edit
                        </button>
                        {/* )} */}

                        {/* Add Delete button - only show for posts authored by current user */}
                        {/* {isAuthenticated && post.author && post.author._id === currentUser?._id && ( */}
                        <button
                          className="btn btn-sm btn-outline-danger ms-2"
                          onClick={(e) => handleDeletePost(post.id, e)}
                        >
                          <i className="bi bi-trash-fill me-1"></i>
                          Delete
                        </button>
                        {/* )} */}
                      </div>

                      <Link to={`/posts/${post.id}`} className="btn btn-sm btn-link">
                        Read More
                      </Link>
                    </div>

                    {/* Comments Section */}
                    <div className="mt-4">
                      <button
                        onClick={() => toggleComments(post._id || post.id)}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        {expandedPostId === (post._id || post.id) ? 
                          <span><i className="bi bi-dash-circle mr-1"></i>Hide Comments</span> : 
                          <span><i className="bi bi-plus-circle mr-1"></i>Show Comments ({post.comments?.length || 0})</span>
                        }
                      </button>
                      
                      {expandedPostId === (post._id || post.id) && (
                        <div className="mt-3 border-t pt-3">
                          {/* Comment List */}
                          {post.comments && post.comments.length > 0 ? (
                            <div className="space-y-3 mb-4">
                              {post.comments.map(comment => (
                                <div key={comment._id} className="bg-gray-50 p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-center mb-1">
                                      {comment.author ? (
                                        <Link to={`/profile/${comment.author._id || comment.author.id}`} className="flex items-center">
                                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-2 text-emerald-700">
                                            {comment.author.username.charAt(0).toUpperCase()}
                                          </div>
                                          <span className="font-medium text-sm">{comment.author.username}</span>
                                        </Link>
                                      ) : (
                                        <div className="flex items-center">
                                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2 text-gray-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                          </div>
                                          <span className="font-medium text-sm">Unknown User</span>
                                        </div>
                                      )}
                                      <span className="text-xs text-gray-500 ml-2">
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {(editingCommentId === comment._id || editingCommentId === comment.id) ? (
                                    <div className="mt-2">
                                      <textarea
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={editCommentText}
                                        onChange={(e) => setEditCommentText(e.target.value)}
                                        rows="2"
                                        autoFocus
                                      ></textarea>
                                      <div className="flex justify-end gap-2 mt-2">
                                        <button
                                          onClick={() => setEditingCommentId(null)}
                                          className="px-3 py-1.5 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                                        >
                                          Cancel ❌
                                        </button>
                                        <button
                                          onClick={() => handleUpdateComment(post._id || post.id, comment._id || comment.id)}
                                          className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                        >
                                          Save ✅
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <p className="text-sm mt-1 break-words">{comment.content}</p>
                                      
                                      {/* ALWAYS VISIBLE EDIT/DELETE BUTTONS */}
                                      <div className="flex justify-end mt-2 gap-2">
                                        <button 
                                          onClick={() => startEditComment(comment)}
                                          className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                                        >
                                          Edit ✏️
                                        </button>
                                        <button 
                                          onClick={() => handleDeleteComment(post._id || post.id, comment._id || comment.id)}
                                          className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
                                        >
                                          Delete 🗑️
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 py-2">No comments yet.</p>
                          )}
                          
                          {/* Add Comment Form */}
                          {isAuthenticated && (
                            <div className="mt-3">
                              <div className="flex gap-2">
                                <textarea
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                                  placeholder="Write a comment..."
                                  value={newCommentText}
                                  onChange={(e) => setNewCommentText(e.target.value)}
                                  rows="2"
                                ></textarea>
                                <button
                                  onClick={() => handleAddComment(post._id || post.id)}
                                  disabled={!newCommentText.trim()}
                                  className={`px-4 py-2 rounded-md text-white text-sm ${
                                    newCommentText.trim() ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"
                                  }`}
                                >
                                  Post
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5">
            <p className="lead text-muted">
              {filter === "following" && isAuthenticated
                ? "No posts from people you follow. Start following more users to see their posts here!"
                : "No posts found. Be the first to share your knowledge!"}
            </p>
            {isAuthenticated && (
              <Link to="/posts/new" className="btn btn-primary mt-3">
                Create New Post
              </Link>
            )}
          </div>
        )}

      {/* Add the Edit Post Modal */}
      <Modal show={showEditPopup} onHide={handleCloseEditPopup} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdatePost}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={editFormData.title}
                onChange={handleEditFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="content"
                value={editFormData.content}
                onChange={handleEditFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tags (comma separated)</Form.Label>
              <Form.Control
                type="text"
                name="tags"
                value={editFormData.tags}
                onChange={handleEditFormChange}
                placeholder="technology, programming, react"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditPopup} disabled={updatingPost}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdatePost} 
            disabled={updatingPost}
          >
            {updatingPost ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-2">Updating...</span>
              </>
            ) : 'Update Post'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
    </div>
  );
}

export default PostsPage;