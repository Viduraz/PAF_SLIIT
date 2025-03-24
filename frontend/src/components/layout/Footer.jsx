import { Link } from "react-router-dom";

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-dark text-light py-4 mt-5">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-3">
            <h5>AgriApp</h5>
            <p className="text-muted">
              Track your plants, share your knowledge, and grow together with our community of gardening enthusiasts.
            </p>
          </div>
          
          <div className="col-md-2 mb-3">
            <h6>Learn</h6>
            <ul className="list-unstyled">
              <li><Link to="/planting-plans" className="text-muted text-decoration-none">Planting Plans</Link></li>
              <li><Link to="/posts" className="text-muted text-decoration-none">Community Posts</Link></li>
            </ul>
          </div>
          
          <div className="col-md-2 mb-3">
            <h6>Community</h6>
            <ul className="list-unstyled">
              <li><Link to="/about" className="text-muted text-decoration-none">About Us</Link></li>
              <li><Link to="/contact" className="text-muted text-decoration-none">Contact</Link></li>
              <li><Link to="/privacy" className="text-muted text-decoration-none">Privacy Policy</Link></li>
            </ul>
          </div>
          
          <div className="col-md-4 mb-3">
            <h6>Connect With Us</h6>
            <div className="d-flex gap-3">
              <a href="#" className="text-muted fs-5"><i className="bi bi-facebook"></i></a>
              <a href="#" className="text-muted fs-5"><i className="bi bi-twitter"></i></a>
              <a href="#" className="text-muted fs-5"><i className="bi bi-instagram"></i></a>
              <a href="#" className="text-muted fs-5"><i className="bi bi-youtube"></i></a>
            </div>
            <div className="mt-3">
              <p className="mb-0 text-muted">Subscribe to our newsletter</p>
              <div className="input-group">
                <input type="email" className="form-control" placeholder="Email address" />
                <button className="btn btn-primary" type="button">Subscribe</button>
              </div>
            </div>
          </div>
        </div>
        
        <hr className="my-3 bg-secondary" />
        
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
          <div className="text-muted">
            &copy; {currentYear} AgriApp. All rights reserved.
          </div>
          <div className="mt-2 mt-md-0">
            <Link to="/terms" className="text-muted text-decoration-none me-3">Terms of Service</Link>
            <Link to="/privacy" className="text-muted text-decoration-none">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;