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

      setPosts(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load posts");
      setLoading(false);
      console.error(err);
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

    try {
      const newComment = await CommentService.addComment(postId, {
        content: commentText,
        authorId: currentUser._id,
      });
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, comments: [...(post.comments || []), newComment.data] }
            : post
        )
      );
      setCommentTexts((prev) => ({ ...prev, [postId]: "" }));
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  const handleEditComment = async (commentId, postId) => {
    if (!isAuthenticated) {
      alert("You need to login to edit a comment");
      return;
    }

    try {
      const updatedComment = await CommentService.updateComment(commentId, {
        content: editingText,
      });
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: post.comments.map((comment) =>
                  comment._id === commentId ? updatedComment.data : comment
                ),
              }
            : post
        )
      );
      setEditingCommentId(null);
      setEditingText("");
    } catch (err) {
      console.error("Failed to edit comment:", err);
    }
  };

  const handleDeleteComment = async (commentId, postId) => {
    if (!isAuthenticated) {
      alert("You need to login to delete a comment");
      return;
    }

    try {
      await CommentService.deleteComment(commentId);
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
    } catch (err) {
      console.error("Failed to delete comment:", err);
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
    if (!isAuthenticated || !currentUser || !comment || !comment.author) {
      return false;
    }
    
    const currentUserId = currentUser._id || currentUser.id;
    const authorId = comment.author._id || comment.author.id;
    
    return currentUserId === authorId;
  };

  if (loading && posts.length === 0) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Community Posts</h1>
        {isAuthenticated && (
          <Link to="/posts/new" className="btn btn-primary">
            Create New Post
          </Link>
        )}
      </div>

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="btn-group">
            <button 
              className={`btn ${filter === "latest" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setFilter("latest")}
            >
              Latest
            </button>
            <button 
              className={`btn ${filter === "popular" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setFilter("popular")}
            >
              Popular
            </button>
            {isAuthenticated && (
              <button 
                className={`btn ${filter === "following" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setFilter("following")}
              >
                Following
              </button>
            )}
          </div>
        </div>
        <div className="col-md-6">
          <form className="d-flex" onSubmit={handleSearch}>
            <input
              type="search"
              className="form-control me-2"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-outline-success" type="submit">
              Search
            </button>
          </form>
        </div>
      </div>

      {error && <div className="alert alert-danger mb-4">{error}</div>}

      {posts.length > 0 ? (
        <div className="row">
          {posts.map((post, index) => (
            <div className="col-md-6 mb-4" key={post._id || `post-${index}`}>
              <div className="card h-100">
                {post.image && (
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="card-img-top" 
                    style={{ height: "200px", objectFit: "cover" }} 
                  />
                )}
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    {post.author && post.author.username ? (
                      <Link to={`/profile/${post.author._id || post.author.id}`} className="text-decoration-none">
                        {post.author.profileImage ? (
                          <img 
                            src={post.author.profileImage} 
                            alt={post.author.username} 
                            className="rounded-circle me-2" 
                            width="40" 
                            height="40" 
                          />
                        ) : (
                          <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-2" style={{ width: "40px", height: "40px" }}>
                            {post.author.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <span className="fw-bold">{post.author.username}</span>
                          <br />
                          <small className="text-muted">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                      </Link>
                    ) : (
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-2" style={{ width: "40px", height: "40px" }}>
                          <i className="bi bi-person"></i>
                        </div>
                        <div>
                          <span className="fw-bold">
                            {post.userId ? `User-${post.userId.substring(0, 5)}...` : "Unknown User"}
                          </span>
                          <br />
                          <small className="text-muted">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <h5 className="card-title">{post.title}</h5>
                  
                  {isAuthenticated && currentUser && post.author && 
                   (currentUser._id === post.author._id || currentUser.id === post.author._id) && (
                    <div className="mb-3">
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleEditPost(post._id)}
                      >
                        <i className="bi bi-pencil"></i> Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeletePost(post._id)}
                      >
                        <i className="bi bi-trash"></i> Delete
                      </button>
                    </div>
                  )}
                  
                  <p className="card-text">
                    {post.content.length > 150 
                      ? post.content.substring(0, 150) + "..." 
                      : post.content}
                  </p>
                  
                  {post.tags && post.tags.length > 0 && (
                    <div className="mb-3">
                      {post.tags.map((tag, index) => (
                        <span key={`${post._id}-tag-${index}`} className="badge bg-light text-dark me-1">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <button 
                        className={`btn btn-sm ${isAuthenticated && post.likes && Array.isArray(post.likes) && post.likes.includes(currentUser?._id) 
                          ? "btn-danger" 
                          : "btn-outline-danger"}`}
                        onClick={() => likePost(post._id)}
                      >
                        <i className="bi bi-heart-fill me-1"></i>
                        {Array.isArray(post.likes) ? post.likes.length : 0}
                      </button>
                      
                      <Link to={`/posts/${post._id}`} className="btn btn-sm btn-outline-primary ms-2">
                        <i className="bi bi-chat-fill me-1"></i>
                        {post.comments?.length || 0}
                      </Link>
                    </div>
                    
                    <Link to={`/posts/${post._id}`} className="btn btn-sm btn-link">
                      Read More
                    </Link>
                  </div>

                  <div className="mt-3">
                    <h6>Comments</h6>
                    {post.comments && post.comments.length > 0 ? (
                      post.comments.map((comment) => (
                        <div key={comment._id} className="p-2 border-bottom">
                          <div className="d-flex justify-content-between">
                            <strong>{comment.author?.username || "Anonymous"}:</strong>
                            {isCommentAuthor(comment) && (
                              <div>
                                <button
                                  className="btn btn-sm btn-link py-0"
                                  onClick={() => {
                                    setEditingCommentId(comment._id);
                                    setEditingText(comment.content);
                                  }}
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-link text-danger py-0"
                                  onClick={() => handleDeleteComment(comment._id, post._id)}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            )}
                          </div>
                          
                          {editingCommentId === comment._id ? (
                            <div className="mt-1">
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                              />
                              <div className="mt-1">
                                <button
                                  className="btn btn-sm btn-primary me-2"
                                  onClick={() => handleEditComment(comment._id, post._id)}
                                >
                                  Save
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-secondary"
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
                            <div>{comment.content}</div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-muted small">No comments yet</p>
                    )}
                    
                    {isAuthenticated && (
                      <div className="mt-2">
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Add a comment..."
                            value={commentTexts[post._id] || ""}
                            onChange={(e) => handleCommentTextChange(post._id, e.target.value)}
                          />
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => handleAddComment(post._id)}
                          >
                            <i className="bi bi-send"></i>
                          </button>
                        </div>
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
    </div>
  );
}

export default PostsPage;