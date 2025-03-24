import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import PlantProgressService from "../services/plantProgressService";

function PlantProgressDetailPage() {
  const { progressId } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const [progress, setProgress] = useState(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    fetchProgressDetails();
  }, [progressId, isAuthenticated, navigate]);

  const fetchProgressDetails = async () => {
    try {
      setLoading(true);
      const response = await PlantProgressService.getProgressDetail(progressId);
      setProgress(response.data);
      setNotes(response.data.notes || "");
      setLoading(false);
    } catch (err) {
      setError("Failed to load progress details");
      setLoading(false);
      console.error(err);
    }
  };

  const handleCompleteMilestone = async (milestoneId) => {
    try {
      setIsSubmitting(true);
      await PlantProgressService.completeMilestone(progressId, milestoneId);
      fetchProgressDetails(); // Refresh data
    } catch (err) {
      console.error("Failed to complete milestone:", err);
      alert("Failed to update progress. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      setIsSubmitting(true);
      await PlantProgressService.updateNotes(progressId, notes);
      alert("Notes saved successfully!");
    } catch (err) {
      console.error("Failed to save notes:", err);
      alert("Failed to save notes. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProgress = async () => {
    if (!confirm("Are you sure you want to delete your progress on this planting plan? This action cannot be undone.")) {
      return;
    }

    try {
      await PlantProgressService.deleteProgress(progressId);
      navigate("/planting-plans");
      alert("Progress tracking deleted successfully");
    } catch (err) {
      console.error("Failed to delete progress:", err);
      alert("Failed to delete progress. Please try again.");
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

  if (!progress) {
    return <div className="alert alert-warning mt-3">Progress not found</div>;
  }

  // Check if the current user owns this progress
  const isOwner = currentUser && progress.user === currentUser._id;
  if (!isOwner) {
    return <div className="alert alert-danger mt-3">You don't have permission to view this progress</div>;
  }

  const completedMilestoneIds = progress.completedMilestones.map(m => m._id);
  
  return (
    <div className="container mt-4">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/planting-plans">Planting Plans</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to={`/planting-plans/${progress.plantingPlan._id}`}>
              {progress.plantingPlan.title}
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            My Progress
          </li>
        </ol>
      </nav>

      <div className="row">
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-body">
              <h2 className="card-title mb-3">
                {progress.plantingPlan.title} - My Progress
              </h2>
              
              <div className="mb-4">
                <div className="progress" style={{ height: "30px" }}>
                  <div 
                    className="progress-bar bg-success progress-bar-striped" 
                    role="progressbar" 
                    style={{ width: `${progress.progressPercentage}%` }} 
                    aria-valuenow={progress.progressPercentage} 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  >
                    {progress.progressPercentage}% Complete
                  </div>
                </div>
                <div className="d-flex justify-content-between mt-2">
                  <small className="text-muted">
                    Started: {new Date(progress.createdAt).toLocaleDateString()}
                  </small>
                  <small className="text-muted">
                    Last updated: {new Date(progress.updatedAt).toLocaleDateString()}
                  </small>
                </div>
              </div>
              
              <h4 className="mb-3">Milestones</h4>
              <div className="list-group mb-4">
                {progress.plantingPlan.milestones.map((milestone, index) => {
                  const isCompleted = completedMilestoneIds.includes(milestone._id);
                  
                  return (
                    <div 
                      key={milestone._id} 
                      className={`list-group-item ${isCompleted ? 'list-group-item-success' : ''}`}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h5 className="mb-1">
                            {index + 1}. {milestone.title}
                            {isCompleted && <i className="bi bi-check-circle-fill text-success ms-2"></i>}
                          </h5>
                          <p className="mb-1">{milestone.description}</p>
                          {milestone.tips && (
                            <small className="text-muted">
                              <strong>Tip:</strong> {milestone.tips}
                            </small>
                          )}
                        </div>
                        
                        {!isCompleted && (
                          <button 
                            className="btn btn-success"
                            onClick={() => handleCompleteMilestone(milestone._id)}
                            disabled={isSubmitting}
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <h4 className="mb-3">My Notes</h4>
              <div className="mb-3">
                <textarea
                  className="form-control"
                  rows="5"
                  placeholder="Write your notes, observations, or reminders here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
              </div>
              <button 
                className="btn btn-primary"
                onClick={handleSaveNotes}
                disabled={isSubmitting}
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">Progress Summary</h5>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Completed Milestones
                  <span className="badge bg-success rounded-pill">
                    {progress.completedMilestones.length} of {progress.plantingPlan.milestones.length}
                  </span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Progress
                  <span className="badge bg-primary rounded-pill">
                    {progress.progressPercentage}%
                  </span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Days Since Start
                  <span className="badge bg-info rounded-pill">
                    {Math.floor((new Date() - new Date(progress.createdAt)) / (1000 * 60 * 60 * 24))}
                  </span>
                </li>
              </ul>
            </div>
          </div>
          
          {progress.progressPercentage === 100 && (
            <div className="card mb-4 bg-success text-white">
              <div className="card-body text-center">
                <h5 className="card-title">🎉 Congratulations! 🎉</h5>
                <p className="card-text">You've completed all milestones in this planting plan!</p>
                {progress.badges && progress.badges.length > 0 && (
                  <div>
                    <p>You've earned:</p>
                    <div className="d-flex justify-content-center">
                      {progress.badges.map((badge, index) => (
                        <div key={index} className="badge bg-light text-success p-2 mx-1" title={badge.description}>
                          {badge.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="d-grid gap-2">
            <button 
              className="btn btn-outline-danger"
              onClick={handleDeleteProgress}
            >
              Delete Progress Tracking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlantProgressDetailPage;