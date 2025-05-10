import api from "./api";

const PlantProgressService = {
  // Get all progress entries for a user
  getUserProgress: (userId) => {
    return api.get(`/progress/users/${userId}`);
  },

  // Get single progress detail by ID
  getProgressDetail: (progressId) => {
    if (!progressId) {
      throw new Error("progressId is required to fetch progress details.");
    }
    console.log("Sending request to get progress with ID:", progressId);
    return api.get(`/progress/${progressId}`);
  },

  // Get progress for a specific user and plan
  getProgressByUserAndPlan: (userId, planId) => {
    return api.get(`/progress/users/${userId}/plans/${planId}`);
  },

  // Create new progress tracking
  createProgress: (progressData) => {
    return api.post("/progress", progressData);
  },

  // Complete a milestone
  completeMilestone: (progressId, milestone) => {
    console.log("Sending milestone completion:", {progressId, milestone});
    
    // Send the milestone directly - we've already formatted the date properly
    // Don't do additional formatting here, as it may cause issues
    return api.post(`/progress/${progressId}/milestones`, milestone);
  },

  // Update notes
  updateNotes: (progressId, notes) => {
    return api.put(`/progress/${progressId}`, {
      notes: notes
    });
  },

  // Update progress percentage
  updateProgressPercentage: (progressId) => {
    return api.put(`/progress/${progressId}/percentage`);
  },

  // Delete progress
  deleteProgress: (progressId) => {
    return api.delete(`/progress/${progressId}`);
  },

  // Like a progress
  likeProgress: (progressId) => {
    return api.put(`/progress/${progressId}/like`);
  },

  // Get recent progress for a user
  getRecentProgress: (userId) => {
    return api.get(`/progress/users/${userId}/recent`);
  },

  // Start progress for a plan
  startProgress: (planId, userId) => {
    if (!planId) {
      throw new Error("planId is required to start progress.");
    }
    
    const progressData = {
      plantingPlanId: planId,
      userId: userId, // Make sure userId is included
      progressPercentage: 0,
      completedMilestones: [],
      startedAt: new Date().toISOString().replace('Z', '')
    };
    
    console.log("Starting progress with data:", progressData);
    return api.post("/progress", progressData);
  }
};

export default PlantProgressService;