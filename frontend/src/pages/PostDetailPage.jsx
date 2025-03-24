import React from 'react'
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import PostService from "../services/postService";

function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await PostService.getPostById(postId);
      setPost(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load post");
      setLoading(false);
      console.error(err);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      alert("You need to login to like a post");
      return;
    }

    try {
      await PostService.likePost(postId);
      
      // Update post in the state
      setPost(prevPost => {
        const alreadyLiked = prevPost.likes.includes(currentUser._id);
        return {
          ...prevPost,
          likes: alreadyLiked 
            ? prevPost.likes.filter(id => id !== currentUser._id)
            : [...prevPost.likes, currentUser._id]
        };
      });
    } catch (err) {
      console.error("Failed to like post:", err);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    if (!isAuthenticated) {
      alert("You need to login to comment");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await PostService.addComment(postId, { content: comment });
      
      // Update post in the state to include the new comment
      setPost(prevPost => ({
        ...prevPost,
        comments: [...prevPost.comments, response.data]
      }));
      
      setComment("");
    } catch (err) {
      console.error("Failed to add comment:", err);
      alert("Failed to add comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      await PostService.deleteComment(postId, commentId);
      
      // Update post in the state to remove the deleted comment
      setPost(prevPost => ({
        ...prevPost,
        comments: prevPost.comments.filter(c => c._id !== commentId)
      }));
    } catch (err) {
      console.error("Failed to delete comment:", err);
      alert("Failed to delete comment. Please try again.");
    }
  };

  const handleDeletePost = async () => {
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    try {
      await PostService.deletePost(postId);
      navigate("/posts");
      alert("Post deleted successfully");
    } catch (err) {
      console.error("Failed to delete post:", err);
      alert("Failed to delete post. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger mt-3">{error}</div>;
  }

  if (!post) {
    return <div className="alert alert-warning mt-3">Post not found</div>;
  }

  const isAuthor = isAuthenticated && currentUser._id === post.author._id;
  const isLiked = isAuthenticated && post.likes.includes(currentUser._id);

  return (
    <div className="container mt-4">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/posts">Posts</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {post.title}
          </li>
        </ol>
      </nav>

      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex align-items-center mb-4">
            <Link to={`/profile/${post.author._id}`} className="text-decoration-none">
              {post.author.profileImage ? (
                <img 
                  src={post.author.profileImage} 
                  alt={post.author.username} 
                  className="rounded-circle me-3" 
                  width="50" 
                  height="50" 
                />
              ) : (
                <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-3" style={{ width: "50px", height: "50px" }}>
                  {post.author.username.charAt(0).toUpperCase()}
                </div>
              )}
            </Link>
            <div>
              <Link to={`/profile/${post.author._id}`} className="text-decoration-none">
                <h5 className="mb-0">{post.author.username}</h5>
              </Link>
              <small className="text-muted">
                Posted on {new Date(post.createdAt).toLocaleDateString()}
              </small>
            </div>
          </div>

          <h2 className="card-title mb-3">{post.title}</h2>
          
          {post.image && (
            <img 
              src={post.image} 
              alt={post.title} 
              className="img-fluid rounded mb-4" 
              style={{ maxHeight: "500px", objectFit: "contain" }} 
            />
          )}
          
          {/* Render content paragraphs */}
          {post.content.split('\n').map((paragraph, index) => (
            <p key={index} className="card-text lead">
              {paragraph}
            </p>
          ))}
          
          {post.tags && post.tags.length > 0 && (
            <div className="mb-4">
              {post.tags.map((tag, index) => (
                <span key={index} className="badge bg-light text-dark me-2">
                  #{tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="d-flex justify-content-between align-items-center mt-4">
            <div>
              <button 
                className={`btn ${isLiked ? "btn-danger" : "btn-outline-danger"}`}
                onClick={handleLike}
                disabled={!isAuthenticated}
              >
                <i className="bi bi-heart-fill me-1"></i>
                {post.likes.length} {post.likes.length === 1 ? "Like" : "Likes"}
              </button>
              
              <button 
                className="btn btn-outline-primary ms-2"
                onClick={() => document.getElementById('commentInput').focus()}
              >
                <i className="bi bi-chat-fill me-1"></i>
                {post.comments.length} {post.comments.length === 1 ? "Comment" : "Comments"}
              </button>
            </div>
            
            {isAuthor && (
              <div>
                <Link to={`/posts/${post._id}/edit`} className="btn btn-outline-secondary me-2">
                  Edit
                </Link>
                <button 
                  className="btn btn-outline-danger"
                  onClick={handleDeletePost}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h4 className="mb-0">Comments ({post.comments.length})</h4>
        </div>
        <div className="card-body">
          {isAuthenticated ? (
            <form onSubmit={handleSubmitComment} className="mb-4">
              <div className="mb-3">
                <textarea
                  id="commentInput"
                  className="form-control"
                  rows="3"
                  placeholder="Write a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                ></textarea>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Posting..." : "Post Comment"}
              </button>
            </form>
          ) : (
            <div className="alert alert-info mb-4">
              <Link to="/login">Login</Link> or <Link to="/register">Register</Link> to join the conversation
            </div>
          )}

          {post.comments.length > 0 ? (
            <div className="comment-list">
              {post.comments.map(comment => (
                <div key={comment._id} className="card mb-3">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center">
                        <Link to={`/profile/${comment.author._id}`} className="text-decoration-none">
                          {comment.author.profileImage ? (
                            <img 
                              src={comment.author.profileImage} 
                              alt={comment.author.username} 
                              className="rounded-circle me-2" 
                              width="40" 
                              height="40" 
                            />
                          ) : (
                            <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-2" style={{ width: "40px", height: "40px" }}>
                              {comment.author.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </Link>
                        <div>
                          <Link to={`/profile/${comment.author._id}`} className="text-decoration-none">
                            <span className="fw-bold">{comment.author.username}</span>
                          </Link>
                          <br />
                          <small className="text-muted">
                            {new Date(comment.createdAt).toLocaleString()}
                          </small>
                        </div>
                      </div>
                      
                      {(isAuthenticated && (currentUser._id === comment.author._id || currentUser._id === post.author._id)) && (
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteComment(comment._id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      )}
                    </div>
                    <p className="card-text">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted">No comments yet. Be the first to share your thoughts!</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PostDetailPage;
