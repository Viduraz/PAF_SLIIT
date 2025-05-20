import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../utils/AuthContext";
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
  FaArrowLeft,
} from "react-icons/fa";
import PlantProgressService from "../services/plantProgressService";
import PlantingPlanService from "../services/plantingPlanService";

function PlantProgressDetailPage() {
  const { progressId } = useParams();
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Flower raining animation configuration
  const flowerEmojis = useMemo(() => ["🌸", "🌼", "🌺", "🌹", "🌷", "🌻", "💐", "🏵️"], []);
  const flowerCount = 25; // Number of flowers to display
  
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

        const progressResponse = await PlantProgressService.getProgressDetail(
          progressId
        );
        console.log("Progress data received:", progressResponse.data);

        // ENHANCED SOLUTION: Handle completedMilestones more robustly
        let completedMilestones = [];

        if (progressResponse.data.completedMilestones) {
          // First check if it's already an array
          if (Array.isArray(progressResponse.data.completedMilestones)) {
            completedMilestones = progressResponse.data.completedMilestones;
          }
          // Check if it's an empty array represented as an object
          else if (
            typeof progressResponse.data.completedMilestones === "object" &&
            Object.keys(progressResponse.data.completedMilestones).length === 0
          ) {
            completedMilestones = [];
          }
          // Try to convert from object format (MongoDB sometimes returns objects instead of arrays)
          else if (
            typeof progressResponse.data.completedMilestones === "object"
          ) {
            try {
              // For object with numeric keys
              completedMilestones = Object.values(
                progressResponse.data.completedMilestones
              );
              console.log(
                "Converted completedMilestones from object:",
                completedMilestones
              );
            } catch (e) {
              console.error("Failed to convert completedMilestones", e);
            }
          }
        }

        // Filter out any null or undefined values that might have crept in
        completedMilestones = completedMilestones.filter(
          (m) => m && m.milestoneId
        );

        console.log(
          "Final processed completedMilestones:",
          completedMilestones
        );

        const progressData = {
          ...progressResponse.data,
          completedMilestones: completedMilestones,
        };

        setProgress(progressData);

        // Fetch planting plan details
        const planResponse = await PlantingPlanService.getPlanById(
          progressData.plantingPlanId
        );
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

    const completedIds = new Set(
      progress.completedMilestones.map((cm) => cm.milestoneId)
    );
    return plantingPlan.milestones.filter(
      (milestone) => !completedIds.has(milestone.id || milestone._id)
    );
  };
  const handleCompleteMilestone = async (e) => {
    e.preventDefault();
    if (!selectedMilestoneId) {
      alert("Please select a milestone to complete");
      return;
    }

    try {
      setLoadingAction(true);
      const now = new Date();
      const formattedDate = now.toISOString().split(".")[0];

      const milestone = {
        milestoneId: selectedMilestoneId,
        notes: milestoneNote,
        completedAt: formattedDate,
        mediaUrls: [],
      };

      const response = await PlantProgressService.completeMilestone(
        progressId,
        milestone
      );
      let updatedProgress = response?.data;

      if (updatedProgress) {
        // Award badge if 100% complete and not already awarded
        if (
          Math.round(updatedProgress.progressPercentage) === 100 &&
          !updatedProgress.awardedBadges?.includes("Growth Master")
        ) {
          updatedProgress = {
            ...updatedProgress,
            awardedBadges: [
              ...(updatedProgress.awardedBadges || []),
              "Growth Master",
            ],
          };

          await PlantProgressService.updateProgress(
            progressId,
            updatedProgress
          );
        }

        setProgress(updatedProgress);
      } else {
        // Fallback: fetch the latest progress data
        const updatedProgressResponse =
          await PlantProgressService.getProgressDetail(progressId);
        let completedMilestones = [];

        if (updatedProgressResponse.data.completedMilestones) {
          if (Array.isArray(updatedProgressResponse.data.completedMilestones)) {
            completedMilestones =
              updatedProgressResponse.data.completedMilestones;
          } else {
            try {
              completedMilestones = Object.values(
                updatedProgressResponse.data.completedMilestones
              );
            } catch (e) {
              console.error("Failed to convert completedMilestones", e);
            }
          }
        }

        const fallbackProgress = {
          ...updatedProgressResponse.data,
          completedMilestones: completedMilestones.filter(
            (m) => m && m.milestoneId
          ),
        };

        setProgress(fallbackProgress);
      }

      // Clear form
      setSelectedMilestoneId("");
      setMilestoneNote("");
      setPhotoFiles([]);
      setLoadingAction(false);
    } catch (err) {
      console.error("Error completing milestone:", err);
      console.error(
        "Error details:",
        err.response?.data || "No additional error details"
      );
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
        likes: progress.likes + 1,
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

      console.log(
        "Starting progress for plan:",
        planId,
        "with user:",
        currentUser._id
      );
      const response = await PlantProgressService.startProgress(
        planId,
        currentUser._id
      );
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
        notes: editedNotes,
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
      const updatedMilestones = progress.completedMilestones.map(
        (milestone) => {
          if (milestone.milestoneId === milestoneId) {
            return { ...milestone, notes: editedMilestoneNote };
          }
          return milestone;
        }
      );

      // Create updated progress object
      const updatedProgress = {
        ...progress,
        completedMilestones: updatedMilestones,
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
          <Link
            to="/planting-plans"
            className="text-red-700 font-medium hover:underline mt-2 inline-block"
          >
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
          <Link
            to="/planting-plans"
            className="text-yellow-700 font-medium hover:underline mt-2 inline-block"
          >
            &larr; Back to Planting Plans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 relative overflow-hidden">
      {/* Flower Rain Animation */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {Array.from({ length: flowerCount }).map((_, index) => {
          // Randomly select a flower emoji
          const flower = flowerEmojis[Math.floor(Math.random() * flowerEmojis.length)];
          // Random starting position
          const startX = Math.random() * 100;
          const duration = 10 + Math.random() * 15;
          const delay = Math.random() * 20;
          
          return (
            <motion.div
              key={index}
              className="absolute select-none"
              initial={{ 
                top: -50, 
                left: `${startX}vw`,
                opacity: 0.8
              }}
              animate={{ 
                top: "110vh",
                rotate: Math.random() > 0.5 ? 360 : -360
              }}
              transition={{ 
                duration: duration,
                delay: delay,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{ fontSize: `${12 + Math.random() * 16}px` }}
            >
              {flower}
            </motion.div>
          );
        })}
      </div>
      
      {/* Navigation */}
      <nav className="mb-6">
        <Link
          to="/planting-plans"
          className="text-green-600 hover:underline flex items-center"
        >
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
              <div className="mb-6 relative">
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                  <FaSeedling className="mr-2 text-green-600" /> Growth Progress
                </h2>

                <div className="mb-3 flex justify-between items-center text-sm z-10 relative">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative"
                  >
                    <motion.span
                      key={progress.progressPercentage}
                      className="inline-flex items-center px-3 py-1 text-green-700 bg-green-100 font-semibold rounded-full shadow-sm"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                        backgroundColor: progress.progressPercentage === 100 ? '#4ade80' : '#dcfce7',
                        color: progress.progressPercentage === 100 ? '#ffffff' : '#15803d'
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 25
                      }}
                    >
                      <motion.span
                        key={progress.progressPercentage + "-text"}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        {Math.round(progress.progressPercentage)}% Complete
                      </motion.span>
                    </motion.span>
                    {progress.progressPercentage === 100 && (
                      <motion.div
                        className="absolute inset-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                      >
                        <div className="absolute inset-0 rounded-full bg-green-300 blur-sm" />
                      </motion.div>
                    )}
                  </motion.div>
                  <motion.span
                    className="text-green-700"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {progress.completedMilestones.length} of {plantingPlan.milestones.length} milestones
                  </motion.span>
                </div>

                <div className="w-full h-4 bg-green-100 rounded-full shadow-inner overflow-hidden relative z-10">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-400 via-green-500 to-green-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${progress.progressPercentage}%`,
                      scale: progress.progressPercentage === 100 ? [1, 1.02, 1] : 1
                    }}
                    transition={{
                      width: { type: "spring", stiffness: 100, damping: 20 },
                      scale: { 
                        duration: 1.5, 
                        repeat: progress.progressPercentage === 100 ? Infinity : 0,
                        ease: "easeInOut" 
                      }
                    }}
                  >
                    {progress.progressPercentage === 100 && (
                      <motion.div
                        className="absolute inset-0 bg-white opacity-20"
                        animate={{
                          x: ["0%", "100%"]
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                        style={{
                          width: "50%",
                          transform: "skewX(-20deg)"
                        }}
                      />
                    )}
                  </motion.div>
                </div>
              </div>

              {/* Badges */}
              {progress.awardedBadges && progress.awardedBadges.length > 0 && (
                <div className="mb-6 relative">
                  {/* Sparkling stars */}
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute"
                      style={{
                        top: Math.random() * 60 - 20,
                        left: Math.random() * 200,
                        fontSize: "14px",
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                        rotateZ: [0, 180, 360],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.4,
                        ease: "easeInOut",
                      }}
                    >
                      ✨
                    </motion.div>
                  ))}
                  <motion.div
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                      <FaMedal className="mr-2 text-yellow-500" /> Gold Badge
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {progress.awardedBadges.map((badge, index) => (
                        <motion.span
                          key={index}
                          className="bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full"
                          whileHover={{ scale: 1.05 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          {badge}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Likes */}
              <div className="mb-6">
                <div className="flex items-center">
                  <motion.button
                    onClick={handleLikeProgress}
                    className="flex items-center gap-2 bg-white border-2 border-red-300 text-red-600 px-6 py-3 rounded-lg"
                    whileHover={{ 
                      scale: 1.05,
                      backgroundColor: "rgb(254 242 242)",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!isAuthenticated}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ 
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    >
                      <FaHeart className="text-xl" />
                    </motion.span>
                    Like this progress
                  </motion.button>
                  <motion.span 
                    className="ml-3 text-gray-500 font-medium"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {progress.likes} {progress.likes === 1 ? "like" : "likes"}
                  </motion.span>
                </div>
              </div>

            </div>

            {/* Right column - Plant info */}
            
            <div className="flex-1">
              <div className="bg-green-50 rounded-lg p-6">
                {/* Falling leaves inside progress box */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-green-300 text-xl select-none"
              initial={{ y: -50, x: Math.random() * 300, opacity: 0 }}
              animate={{ y: 120, opacity: 1 }}
              transition={{
                duration: 10 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.4,
              }}
            >
              🍃
            </motion.div>
          ))}
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Plant Information
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <FaLeaf className="mt-1 mr-2 text-green-600" />
                    <div>
                      <span className="font-medium">Plant Type:</span>
                      <span className="ml-1">
                        {plantingPlan.categories?.join(", ") || "Not specified"}
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <FaCalendarAlt className="mt-1 mr-2 text-green-600" />
                    <div>
                      <span className="font-medium">Expected Duration:</span>
                      <span className="ml-1">
                        {plantingPlan.duration || "Unknown"} days
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <FaSeedling className="mt-1 mr-2 text-green-600" />
                    <div>
                      <span className="font-medium">Difficulty:</span>
                      <span className="ml-1">
                        {plantingPlan.difficulty || "Medium"}
                      </span>
                    </div>
                  </li>
                </ul>

                <div className="mt-6">
                  <Link
                    to={`/planting-plans/${
                      plantingPlan._id || plantingPlan.id
                    }`}
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
                  (m) => (m._id || m.id) === milestone.milestoneId
                );

                return (
                  <div
                    key={milestone.milestoneId || index}
                    className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium text-gray-800">
                        {index + 1}.{" "}
                        {milestoneDetails?.title || "Unknown milestone"}
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
                          onChange={(e) =>
                            setEditedMilestoneNote(e.target.value)
                          }
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
                            onClick={() =>
                              handleSaveMilestoneNote(milestone.milestoneId)
                            }
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
                        <p className="text-sm font-medium text-gray-700">
                          Photos:
                        </p>
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
              No milestones completed yet. Start by completing your first
              milestone!
            </p>
          )}

          {/* Complete Milestone Form */}
          {isOwner && getUncompletedMilestones().length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FaClipboardCheck className="mr-2 text-green-600" /> Complete a
                Milestone
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
                      <option
                        key={milestone._id || milestone.id}
                        value={milestone._id || milestone.id}
                      >
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



                <div className="flex justify-end">
                  <motion.button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg flex items-center gap-2 shadow-md"
                    whileHover={{ 
                      scale: 1.02,
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20
                    }}
                    disabled={loadingAction}
                  >
                    {loadingAction ? (
                      <motion.span 
                        className="flex items-center"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <svg
                          className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Completing...
                      </motion.span>
                    ) : (
                      <>
                        <FaClipboardCheck className="text-xl" />
                        Complete Milestone
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          )}

          {/* Edit/Delete Progress Buttons (for owner only) */}
          {isOwner && (
            <div className="mt-8 border-t border-gray-200 pt-6 flex gap-4">
              <motion.button
                type="button"
                onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg flex items-center gap-2 shadow-md"
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20
                }}
              >
                <motion.span
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <FaTrash className="text-xl" />
                </motion.span>
                Delete Progress
              </motion.button>
            </div>
          )}

          {/* Edit Mode Form */}
          {isEditMode && (
            <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Edit Progress Notes
              </h3>

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
                      <svg
                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
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
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Delete Progress
            </h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this progress? This action cannot
              be undone. All your milestone completions and records will be
              lost.
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
              <motion.button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setDeleteConfirmation("");
                }}
                className="px-6 py-3 bg-gray-100 text-gray-800 font-medium rounded-lg flex items-center gap-2"
                whileHover={{ 
                  scale: 1.02,
                  backgroundColor: "#f3f4f6"
                }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                type="button"
                onClick={handleDeleteProgress}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg flex items-center gap-2 shadow-md"
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                }}
                whileTap={{ scale: 0.98 }}
                disabled={deleteConfirmation !== "DELETE" || loadingAction}
              >
                {loadingAction ? (
                  <motion.span 
                    className="flex items-center"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Deleting...
                  </motion.span>
                ) : (
                  <>
                    <FaTrash />
                    Delete Progress
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlantProgressDetailPage;
