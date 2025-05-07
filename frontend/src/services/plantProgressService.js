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
    
    // Ensure the date is in the correct format for Spring Boot's LocalDateTime
    if (milestone.completedAt) {
      // Ensure timezone information is properly handled
      milestone.completedAt = milestone.completedAt.replace('Z', '');
    }
    
    // Try with PUT instead of POST
    return api.put(`/progress/${progressId}/milestones`, milestone);
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
  startProgress: (planId) => {
    if (!planId) {
      throw new Error("planId is required to start progress.");
    }
    return api.post("/progress", {
      plantingPlanId: planId,
      progressPercentage: 0,
      completedMilestones: [],
      startedAt: new Date().toISOString()
    });
  }
};

export default PlantProgressService;