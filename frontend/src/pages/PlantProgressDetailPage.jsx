import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { 
  FaSeedling, 
  FaLeaf, 
  FaCalendarAlt, 
  FaClipboardCheck, 
  FaEdit, 
  FaCamera, 
  FaTrash, 
  FaMedal, 
  FaHeart, 
  FaArrowLeft 
} from 'react-icons/fa';
import PlantProgressService from '../services/plantProgressService';
import PlantingPlanService from '../services/plantingPlanService';

function PlantProgressDetailPage() {
  const { progressId } = useParams();
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [progress, setProgress] = useState(null);
  const [plantingPlan, setPlantingPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Milestone completion
  const [selectedMilestoneId, setSelectedMilestoneId] = useState("");
  const [milestoneNote, setMilestoneNote] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);
  
  // Photo upload handling (not fully implemented)
  const [photoFiles, setPhotoFiles] = useState([]);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Add this state to store edited notes
  const [editedNotes, setEditedNotes] = useState("");

  // Add these state variables for editing milestone notes
  const [editingMilestoneId, setEditingMilestoneId] = useState(null);
  const [editedMilestoneNote, setEditedMilestoneNote] = useState("");

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        setLoading(true);
        console.log("Fetching progress with ID:", progressId);
        
        const progressResponse = await PlantProgressService.getProgressDetail(progressId);
        console.log("Progress data received:", progressResponse.data);
        
        // ENHANCED SOLUTION: Handle completedMilestones more robustly
        let completedMilestones = [];
        
        if (progressResponse.data.completedMilestones) {
          // First check if it's already an array
          if (Array.isArray(progressResponse.data.completedMilestones)) {
            completedMilestones = progressResponse.data.completedMilestones;
          } 
          // Check if it's an empty array represented as an object
          else if (typeof progressResponse.data.completedMilestones === 'object' && 
                  Object.keys(progressResponse.data.completedMilestones).length === 0) {
            completedMilestones = [];
          }
          // Try to convert from object format (MongoDB sometimes returns objects instead of arrays)
          else if (typeof progressResponse.data.completedMilestones === 'object') {
            try {
              // For object with numeric keys
              completedMilestones = Object.values(progressResponse.data.completedMilestones);
              console.log("Converted completedMilestones from object:", completedMilestones);
            } catch (e) {
              console.error("Failed to convert completedMilestones", e);
            }
          }
        }
        
        // Filter out any null or undefined values that might have crept in
        completedMilestones = completedMilestones.filter(m => m && m.milestoneId);
        
        console.log("Final processed completedMilestones:", completedMilestones);
        
        const progressData = {
          ...progressResponse.data,
          completedMilestones: completedMilestones
        };
        
        setProgress(progressData);
        
        // Fetch planting plan details
        const planResponse = await PlantingPlanService.getPlanById(progressData.plantingPlanId);
        console.log("Plan data received:", planResponse.data);
        setPlantingPlan(planResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching progress details:", err);
        setError("Failed to load progress details. Please try again.");
        setLoading(false);
      }
    };
    
    if (progressId) {
      fetchProgressData();
    }
  }, [progressId]);
  
  // Temporary override for testing - remove in production
  const isOwner = true; // or: const isOwner = isAuthenticated;

  // Original check - restore this after testing
  // const isOwner = progress && currentUser && (progress.userId === currentUser._id || progress.userId === currentUser.id);
  
  // Get uncompleted milestones
  const getUncompletedMilestones = () => {
    if (!plantingPlan || !progress) return [];
    
    const completedIds = new Set(progress.completedMilestones.map(cm => cm.milestoneId));
    return plantingPlan.milestones.filter(milestone => !completedIds.has(milestone.id || milestone._id));
  };
  
  // Complete a milestone
  const handleCompleteMilestone = async (e) => {
    e.preventDefault();
    if (!selectedMilestoneId) {
      alert("Please select a milestone to complete");
      return;
    }
    
    try {
      setLoadingAction(true);
      console.log("Completing milestone:", selectedMilestoneId, "with note:", milestoneNote);
      
      // Format date properly for Java LocalDateTime
      const now = new Date();
      const formattedDate = now.toISOString().split('.')[0]; 
      
      const milestone = {
        milestoneId: selectedMilestoneId,
        notes: milestoneNote,
        completedAt: formattedDate,
        mediaUrls: [] // Empty array for now
      };
      
      console.log("Sending milestone data:", milestone);
      
      // Send request to complete the milestone
      const response = await PlantProgressService.completeMilestone(progressId, milestone);
      console.log("Milestone completion response:", response);
      
      // Use the data from the response directly
      if (response && response.data) {
        setProgress(response.data);
      } else {
        // If response doesn't have the data we need, fetch fresh data
        const updatedProgressResponse = await PlantProgressService.getProgressDetail(progressId);
        
        // Process completedMilestones the same way as in useEffect
        let completedMilestones = [];
        if (updatedProgressResponse.data.completedMilestones) {
          if (Array.isArray(updatedProgressResponse.data.completedMilestones)) {
            completedMilestones = updatedProgressResponse.data.completedMilestones;
          } else {
            try {
              completedMilestones = Object.values(updatedProgressResponse.data.completedMilestones);
            } catch (e) {
              console.error("Failed to convert completedMilestones", e);
            }
          }
        }
        
        // Create the updated progress object
        const updatedProgress = {
          ...updatedProgressResponse.data,
          completedMilestones: completedMilestones.filter(m => m && m.milestoneId)
        };
        
        setProgress(updatedProgress);
      }
      
      // Clear form
      setSelectedMilestoneId("");
      setMilestoneNote("");
      setPhotoFiles([]);
      
      setLoadingAction(false);
    } catch (err) {
      console.error("Error completing milestone:", err);
      console.error("Error details:", err.response?.data || "No additional error details");
      setLoadingAction(false);
      alert("Failed to complete milestone. Please try again.");
    }
  };
  
  // Handle liking progress
  const handleLikeProgress = async () => {
    try {
      console.log("Liking progress with ID:", progressId);
      await PlantProgressService.likeProgress(progressId);
      
      // Update progress with new like count
      setProgress({
        ...progress,
        likes: progress.likes + 1
      });
    } catch (err) {
      console.error("Error liking progress:", err);
      alert("Failed to like this progress. Please try again.");
    }
  };
  
  // Handle deleting progress
  const handleDeleteProgress = async () => {
    if (deleteConfirmation !== "DELETE") {
      alert("Please type DELETE to confirm");
      return;
    }
    
    try {
      setLoadingAction(true);
      console.log("Deleting progress with ID:", progressId);
      await PlantProgressService.deleteProgress(progressId);
      
      setLoadingAction(false);
      setShowModal(false);
      
      // Navigate back to plans page
      navigate("/planting-plans");
    } catch (err) {
      console.error("Error deleting progress:", err);
      setLoadingAction(false);
      alert("Failed to delete progress. Please try again.");
    }
  };

  const startProgress = async () => {
    try {
      if (!currentUser || !currentUser._id) {
        alert("You need to be logged in to track progress");
        return;
      }
      
      console.log("Starting progress for plan:", planId, "with user:", currentUser._id);
      const response = await PlantProgressService.startProgress(planId, currentUser._id);
      setProgress(response.data);
      navigate(`/plant-progress/${response.data._id || response.data.id}`);
    } catch (err) {
      console.error("Failed to start tracking progress:", err);
      alert("Failed to start tracking this plan. Please try again.");
    }
  };

  // Add this function to handle saving notes
  const handleSaveNotes = async () => {
    try {
      setLoadingAction(true);
      await PlantProgressService.updateNotes(progressId, editedNotes);
      
      // Update local state
      setProgress({
        ...progress,
        notes: editedNotes
      });
      
      // Exit edit mode
      setIsEditMode(false);
      setLoadingAction(false);
    } catch (err) {
      console.error("Error updating notes:", err);
      setLoadingAction(false);
      alert("Failed to update notes. Please try again.");
    }
  };

  // Add this function to handle saving edited milestone notes
  const handleSaveMilestoneNote = async (milestoneId) => {
    try {
      setLoadingAction(true);
      
      // Find the milestone to update
      const updatedMilestones = progress.completedMilestones.map(milestone => {
        if (milestone.milestoneId === milestoneId) {
          return { ...milestone, notes: editedMilestoneNote };
        }
        return milestone;
      });
      
      // Create updated progress object
      const updatedProgress = {
        ...progress,
        completedMilestones: updatedMilestones
      };
      
      // Update in database
      await PlantProgressService.updateProgress(progressId, updatedProgress);
      
      // Update local state
      setProgress(updatedProgress);
      
      // Exit edit mode
      setEditingMilestoneId(null);
      setEditedMilestoneNote("");
      
      setLoadingAction(false);
    } catch (err) {
      console.error("Error updating milestone note:", err);
      setLoadingAction(false);
      alert("Failed to update milestone note. Please try again.");
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p>{error}</p>
          <Link to="/planting-plans" className="text-red-700 font-medium hover:underline mt-2 inline-block">
            &larr; Back to Planting Plans
          </Link>
        </div>
      </div>
    );
  }
  
  if (!progress || !plantingPlan) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
          <p>Plant progress not found</p>
          <Link to="/planting-plans" className="text-yellow-700 font-medium hover:underline mt-2 inline-block">
            &larr; Back to Planting Plans
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation */}
      <nav className="mb-6">
        <Link to="/planting-plans" className="text-green-600 hover:underline flex items-center">
          <FaArrowLeft className="mr-1" /> Back to Planting Plans
        </Link>
      </nav>
      
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="bg-green-600 p-6">
          <h1 className="text-3xl font-bold text-white">
            {plantingPlan.title} Progress
          </h1>
          <p className="text-green-100 mt-2">
            Started on {new Date(progress.startedAt).toLocaleDateString()}
          </p>
        </div>
        
        <div className="p-6">
          {/* Progress stats */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            {/* Left column */}
            <div className="flex-1">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
                  <FaSeedling className="mr-2 text-green-600" /> Growth Progress
                </h2>
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                        {Math.round(progress.progressPercentage)}% Complete
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-green-600">
                        {progress.completedMilestones.length} of {plantingPlan.milestones.length} milestones
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
                    <div 
                      style={{ width: `${progress.progressPercentage}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 transition-all duration-500"
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* Badges */}
              {progress.awardedBadges && progress.awardedBadges.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                    <FaMedal className="mr-2 text-yellow-500" /> Earned Badges
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {progress.awardedBadges.map((badge, index) => (
                      <span 
                        key={index}
                        className="bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Likes */}
              <div className="mb-6">
                <div className="flex items-center">
                  <button 
                    onClick={handleLikeProgress}
                    className="flex items-center gap-2 bg-white border border-red-300 hover:bg-red-50 text-red-600 px-4 py-2 rounded-lg transition-colors"
                    disabled={!isAuthenticated}
                  >
                    <FaHeart /> Like this progress
                  </button>
                  <span className="ml-2 text-gray-500">
                    {progress.likes} {progress.likes === 1 ? 'like' : 'likes'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Right column - Plant info */}
            <div className="flex-1">
              <div className="bg-green-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Plant Information
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <FaLeaf className="mt-1 mr-2 text-green-600" />
                    <div>
                      <span className="font-medium">Plant Type:</span> 
                      <span className="ml-1">{plantingPlan.categories?.join(", ") || "Not specified"}</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <FaCalendarAlt className="mt-1 mr-2 text-green-600" />
                    <div>
                      <span className="font-medium">Expected Duration:</span> 
                      <span className="ml-1">{plantingPlan.duration || "Unknown"} days</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <FaSeedling className="mt-1 mr-2 text-green-600" />
                    <div>
                      <span className="font-medium">Difficulty:</span> 
                      <span className="ml-1">{plantingPlan.difficulty || "Medium"}</span>
                    </div>
                  </li>
                </ul>
                
                <div className="mt-6">
                  <Link 
                    to={`/planting-plans/${plantingPlan._id || plantingPlan.id}`}
                    className="text-green-600 hover:underline flex items-center"
                  >
                    View full planting plan
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Completed Milestones */}
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Completed Milestones
          </h2>
          
          {progress.completedMilestones.length > 0 ? (
            <div className="space-y-4 mb-8">
              {progress.completedMilestones.map((milestone, index) => {
                const milestoneDetails = plantingPlan.milestones.find(
                  m => (m._id || m.id) === milestone.milestoneId
                );
                
                return (
                  <div
                    key={milestone.milestoneId || index}
                    className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium text-gray-800">
                        {index + 1}. {milestoneDetails?.title || "Unknown milestone"}
                      </h3>
                      <div className="flex items-center">
                        {isOwner && (
                          <button
                            onClick={() => {
                              setEditingMilestoneId(milestone.milestoneId);
                              setEditedMilestoneNote(milestone.notes || "");
                            }}
                            className="mr-3 text-blue-600 hover:text-blue-800"
                            title="Edit notes"
                          >
                            <FaEdit />
                          </button>
                        )}
                        <span className="text-sm text-gray-500">
                          {new Date(milestone.completedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    {milestoneDetails && (
                      <p className="text-gray-700 mt-1">
                        {milestoneDetails.description}
                      </p>
                    )}
                    
                    {editingMilestoneId === milestone.milestoneId ? (
                      <div className="mt-3">
                        <textarea
                          value={editedMilestoneNote}
                          onChange={(e) => setEditedMilestoneNote(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          rows="3"
                          placeholder="Add your notes about this milestone..."
                        ></textarea>
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => setEditingMilestoneId(null)}
                            className="px-4 py-1 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveMilestoneNote(milestone.milestoneId)}
                            className="px-4 py-1 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                            disabled={loadingAction}
                          >
                            {loadingAction ? "Saving..." : "Save Notes"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      milestone.notes && (
                        <div className="bg-white p-3 rounded mt-2 italic text-gray-600">
                          "{milestone.notes}"
                        </div>
                      )
                    )}
                    
                    {milestone.mediaUrls && milestone.mediaUrls.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700">Photos:</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {milestone.mediaUrls.map((url, i) => (
                            <img 
                              key={i} 
                              src={url} 
                              alt={`Milestone ${index + 1} photo ${i + 1}`}
                              className="h-20 w-20 object-cover rounded"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 italic mb-8">
              No milestones completed yet. Start by completing your first milestone!
            </p>
          )}
          
          {/* Complete Milestone Form */}
          {isOwner && getUncompletedMilestones().length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FaClipboardCheck className="mr-2 text-green-600" /> Complete a Milestone
              </h2>
              
              <form onSubmit={handleCompleteMilestone}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Select Milestone
                  </label>
                  <select
                    value={selectedMilestoneId}
                    onChange={(e) => setSelectedMilestoneId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">-- Select a milestone --</option>
                    {getUncompletedMilestones().map((milestone) => (
                      <option key={milestone._id || milestone.id} value={milestone._id || milestone.id}>
                        {milestone.title}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Your Notes (optional)
                  </label>
                  <textarea
                    value={milestoneNote}
                    onChange={(e) => setMilestoneNote(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows="3"
                    placeholder="Share your experience with this milestone..."
                  ></textarea>
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">
                    Add Photos (optional)
                  </label>
                  <div className="flex items-center">
                    <label className="cursor-pointer bg-white px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                      <FaCamera className="inline-block mr-2" />
                      Select Images
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setPhotoFiles(Array.from(e.target.files))}
                      />
                    </label>
                    {photoFiles.length > 0 && (
                      <span className="ml-3 text-sm text-gray-500">
                        {photoFiles.length} {photoFiles.length === 1 ? 'file' : 'files'} selected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Note: Image upload is not fully implemented in this version
                  </p>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                    disabled={loadingAction}
                  >
                    {loadingAction ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Completing...
                      </span>
                    ) : (
                      'Complete Milestone'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Edit/Delete Progress Buttons (for owner only) */}
          {isOwner && (
            <div className="mt-8 border-t border-gray-200 pt-6 flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setEditedNotes(progress.notes || "");
                  setIsEditMode(true);
                }}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <FaEdit className="mr-2" /> Edit Progress
              </button>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <FaTrash className="mr-2" /> Delete Progress
              </button>
            </div>
          )}

          {/* Edit Mode Form */}
          {isEditMode && (
            <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Progress Notes</h3>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Notes
                </label>
                <textarea
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="6"
                  placeholder="Add notes about your overall progress..."
                ></textarea>
              </div>
              
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditMode(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                  disabled={loadingAction}
                >
                  {loadingAction ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete confirmation modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-lg w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Delete Progress</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this progress? This action cannot be undone.
              All your milestone completions and records will be lost.
            </p>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Type "DELETE" to confirm
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setDeleteConfirmation("");
                }}
                className="px-6 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProgress}
                className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                disabled={deleteConfirmation !== "DELETE" || loadingAction}
              >
                {loadingAction ? "Deleting..." : "Delete Progress"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlantProgressDetailPage;
