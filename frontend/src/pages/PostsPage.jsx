import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import PostService from "../services/postService";

function PostsPage() {
  const { currentUser, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("latest"); // latest, popular, following
  const [searchTerm, setSearchTerm] = useState("");

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
          // Toggle like
          const alreadyLiked = post.likes.includes(currentUser._id);
          return {
            ...post,
            likes: alreadyLiked 
              ? post.likes.filter(id => id !== currentUser._id)
              : [...post.likes, currentUser._id]
          };
        }
        return post;
      }));
    } catch (err) {
      console.error("Failed to like post:", err);
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
                          <span className="fw-bold">Unknown User</span>
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
                        className={`btn btn-sm ${isAuthenticated && post.likes && post.likes.includes(currentUser?._id) 
                          ? "btn-danger" 
                          : "btn-outline-danger"}`}
                        onClick={() => likePost(post._id)}
                      >
                        <i className="bi bi-heart-fill me-1"></i>
                        {post.likes ? post.likes.length : 0}
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