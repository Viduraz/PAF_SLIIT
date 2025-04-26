import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import PostService from "../services/postService";
import CommentService from "../services/commentService";

function PostsPage() {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("latest");
  const [searchTerm, setSearchTerm] = useState("");
  const [commentTexts, setCommentTexts] = useState({});
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");

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

  const handleAddComment = async (postId) => {
    if (!isAuthenticated) {
      alert("You need to login to add a comment");
      return;
    }

    const commentText = commentTexts[postId] || "";
    if (!commentText.trim()) {
      alert("Comment cannot be empty");
      return;
    }

    // Validate postId
    if (!postId || postId === "undefined") {
      console.error("Invalid post ID:", postId);
      alert("Failed to add comment: Invalid post ID");
      return;
    }

    try {
      console.log("Adding comment to post ID:", postId);
      
      // Create comment data with userId explicitly set
      const commentData = {
        content: commentText,
        userId: currentUser._id || currentUser.id,  // Make sure userId is set
      };
      
      console.log("Comment data:", commentData);
      const newComment = await CommentService.addComment(postId, commentData);
      
      console.log("New comment response:", newComment);
      
      // Enhance the returned comment with author info for UI display
      const commentWithAuthor = {
        ...newComment.data,
        userId: currentUser._id || currentUser.id,
        author: {
          _id: currentUser._id || currentUser.id,
          username: currentUser.username || currentUser.name || "You"
        }
      };
      
      // Append the new comment to the comments array
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: [...(post.comments || []), commentWithAuthor],
              }
            : post
        )
      );

      // Clear the comment input field
      setCommentTexts((prev) => ({ ...prev, [postId]: "" }));
    } catch (err) {
      console.error("Failed to add comment:", err);
      alert("Failed to add comment. Please try again.");
    }
  };

  const handleEditComment = async (commentId, postId) => {
    if (!isAuthenticated) {
      alert("You need to login to edit a comment");
      return;
    }
    
    if (!editingText.trim()) {
      alert("Comment cannot be empty");
      return;
    }

    try {
      console.log("Updating comment:", commentId, "with text:", editingText);
      const updatedComment = await CommentService.updateComment(commentId, {
        content: editingText
      });
      
      console.log("Comment updated:", updatedComment);
      
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: post.comments.map((comment) =>
                  comment._id === commentId ? {
                    ...comment,
                    content: editingText,
                    updatedAt: new Date().toISOString()
                  } : comment
                ),
              }
            : post
        )
      );
      setEditingCommentId(null);
      setEditingText("");
      
    } catch (err) {
      console.error("Failed to edit comment:", err);
      alert("Failed to update comment. Please try again.");
    }
  };

  const handleDeleteComment = async (commentId, postId) => {
    if (!isAuthenticated) {
      alert("You need to login to delete a comment");
      return;
    }

    if (!commentId) {
      console.error("Cannot delete comment: Comment ID is undefined");
      alert("Error: Unable to identify the comment to delete");
      return;
    }

    if (!confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      console.log("Deleting comment with ID:", commentId, "from post:", postId);
      
      // Find the comment first to log its details
      const commentToDelete = posts
        .find(p => p._id === postId)?.comments
        .find(c => c._id === commentId);
        
      console.log("Comment to delete:", commentToDelete);
      
      const response = await CommentService.deleteComment(commentId);
      console.log("Delete comment response:", response);
      
      // First update local state for immediate UI feedback
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: post.comments.filter((comment) => comment._id !== commentId),
              }
            : post
        )
      );
      
      // Then refresh data from server to ensure all clients have the same data
      console.log("Comment deleted, refreshing posts from server...");
      await fetchPosts(); // Fetch fresh data from the server
      
    } catch (err) {
      console.error("Failed to delete comment:", err);
      alert("Failed to delete comment. Please try again.");
    }
  };

  const handleCommentTextChange = (postId, text) => {
    setCommentTexts((prev) => ({ ...prev, [postId]: text }));
  };

  const handleDeletePost = async (postId) => {
    if (!isAuthenticated) {
      alert("You need to login to delete a post");
      return;
    }

    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    try {
      await PostService.deletePost(postId);
      setPosts(posts.filter(post => post._id !== postId));
      alert("Post deleted successfully");
    } catch (err) {
      console.error("Failed to delete post:", err);
      alert("Failed to delete post. Please try again.");
    }
  };

  const handleEditPost = (postId) => {
    navigate(`/posts/${postId}/edit`);
  };

  const isCommentAuthor = (comment) => {
    if (!isAuthenticated || !currentUser || !comment) {
      return false;
    }
    
    const currentUserId = currentUser._id || currentUser.id;
    
    // Check if we have an author object
    if (comment.author) {
      const authorId = comment.author._id || comment.author.id;
      if (currentUserId === authorId) return true;
    }
    
    // If we don't have an author object, check userId directly
    if (comment.userId) {
      return currentUserId === comment.userId;
    }
    
    return false;
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

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <div key={post._id || `post-${index}`} className="bg-white rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
                {/* Post Image */}
                {post.image && (
                  <div className="relative h-48 w-full overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                )}
                
                {/* Post Content */}
                <div className="p-5">
                  {/* Author Info */}
                  <div className="flex items-center mb-4">
                    {post.author && post.author.username ? (
                      <Link to={`/profile/${post.author._id || post.author.id}`} className="flex items-center group">
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
                          <p className="font-medium text-gray-800">
                            {post.userId ? `User-${post.userId.substring(0, 5)}...` : "Unknown User"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(post.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
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
                        className={`flex items-center ${
                          isAuthenticated && post.likes && Array.isArray(post.likes) && post.likes.includes(currentUser?._id)
                            ? "text-red-500" 
                            : "text-gray-500 hover:text-red-500"
                        } transition-colors`}
                        onClick={() => likePost(post._id)}
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
                      
                      <Link to={`/posts/${post._id}`} className="flex items-center text-gray-500 hover:text-emerald-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {post.comments?.length || 0}
                      </Link>
                    </div>
                    
                    <Link 
                      to={`/posts/${post._id}`} 
                      className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline transition-colors font-medium"
                    >
                      Read More →
                    </Link>
                  </div>

                  {/* Comments Section */}
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      Comments
                    </h3>
                    
                    {post.comments && post.comments.length > 0 ? (
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-transparent">
                        {post.comments.map((comment) => {
                          const commentId = comment._id || comment.id;
                          if (!commentId) {
                            console.warn("Comment without ID:", comment);
                          }
                          return (
                            <div key={commentId || `temp-${Date.now()}`} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex justify-between items-start">
                                <span className="text-sm font-medium text-gray-700">
                                  {comment.author?.username || 
                                   (comment.userId && comment.userId === (currentUser?._id || currentUser?.id) ? 
                                     "You" : "Anonymous")}
                                </span>
                                {isCommentAuthor(comment) && (
                                  <div className="flex items-center space-x-1">
                                    <button
                                      className="text-gray-400 hover:text-blue-500"
                                      onClick={() => {
                                        setEditingCommentId(commentId);
                                        setEditingText(comment.content);
                                      }}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </button>
                                    <button
                                      className="text-gray-400 hover:text-red-500"
                                      onClick={() => handleDeleteComment(commentId, post._id)}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                )}
                              </div>
                              
                              {editingCommentId === commentId ? (
                                <div className="mt-2">
                                  <input
                                    type="text"
                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    value={editingText}
                                    onChange={(e) => setEditingText(e.target.value)}
                                  />
                                  <div className="mt-2 flex space-x-2">
                                    <button
                                      className="px-3 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                                      onClick={() => handleEditComment(commentId, post._id)}
                                    >
                                      Save
                                    </button>
                                    <button
                                      className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                                      onClick={() => {
                                        setEditingCommentId(null);
                                        setEditingText("");
                                      }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-600 mt-1">{comment.content}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 italic">No comments yet</p>
                    )}
                    
                    {/* Add Comment Section */}
                    {isAuthenticated && (
                      <div className="mt-3">
                        {post._id ? (
                          <div className="mt-2 flex">
                            <input
                              type="text"
                              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              placeholder="Add a comment..."
                              value={commentTexts[post._id] || ""}
                              onChange={(e) => handleCommentTextChange(post._id, e.target.value)}
                            />
                            <button
                              className="px-3 py-2 bg-emerald-600 text-white rounded-r-md hover:bg-emerald-700 transition-colors"
                              onClick={() => handleAddComment(post._id)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <p className="text-red-500 text-sm">Error: Post ID is missing</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-10 shadow-md text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <p className="text-xl text-gray-600 mb-4">
              {filter === "following" && isAuthenticated 
                ? "No posts from people you follow. Start following more users to see their posts here!"
                : "No posts found. Be the first to share your knowledge!"}
            </p>
            {isAuthenticated && (
              <Link 
                to="/posts/new" 
                className="inline-flex items-center px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow transition duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Post
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PostsPage;