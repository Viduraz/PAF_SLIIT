// src/pages/HomePage.js
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

function HomePage() {
  const { currentUser } = useAuth();

  return (
    <div className="home-page">
      <div className="jumbotron bg-light p-5 rounded">
        <h1 className="display-4">Welcome to Agri-App!</h1>
        <p className="lead">
          Your platform for tracking plant growth, sharing agricultural knowledge,
          and connecting with a community of plant enthusiasts.
        </p>
        <hr className="my-4" />
        {currentUser ? (
          <div>
            <p>Track your plants, share your progress, and learn from others.</p>
            <div className="d-flex gap-2">
              <Link to="/plans" className="btn btn-success">View Planting Plans</Link>
              <Link to="/posts" className="btn btn-outline-success">Browse Community Posts</Link>
            </div>
          </div>
        ) : (
          <div>
            <p>Join our community today to start your plant growing journey!</p>
            <div className="d-flex gap-2">
              <Link to="/register" className="btn btn-success">Sign Up</Link>
              <Link to="/login" className="btn btn-outline-success">Login</Link>
            </div>
          </div>
        )}
      </div>
      
      <div className="row mt-5">
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Track Plant Progress</h5>
              <p className="card-text">Monitor your plants' growth journey with our progress tracking system.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Share Knowledge</h5>
              <p className="card-text">Contribute to the community by sharing your agricultural expertise.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Earn Badges</h5>
              <p className="card-text">Get recognized for your achievements with our badge system.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;