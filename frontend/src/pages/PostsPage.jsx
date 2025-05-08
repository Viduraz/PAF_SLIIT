import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import PostService from "../services/postService";
import { Modal, Button, Form, Spinner } from "react-bootstrap";

function PostsPage() {
  const { currentUser, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("latest"); // latest, popular, following
  const [searchTerm, setSearchTerm] = useState("");
  
  // Add these states for the edit popup
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [updatingPost, setUpdatingPost] = useState(false);
  const [editFormData, setEditFormData] = useState({
    _id:"",
    title: "",
    content: "",
    tags: ""
  });

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
      
      // Update the post in the state
      setPosts(posts.map(post => {
        if (post._id === postId) {
          // Make sure post.likes is an array
          const currentLikes = Array.isArray(post.likes) ? post.likes : [];
          // Toggle like
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
      
      const postData = {
        ...editFormData,
        tags: tagsArray
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
                          <span className="fw-bold">unknwon</span>
                          <br />
                          <small className="text-muted">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <h5 className="card-title">{post.title}</h5>
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
                        onClick={() => likePost(post.id)}
                      >
                        <i className="bi bi-heart-fill me-1"></i>
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
  );
}

export default PostsPage;