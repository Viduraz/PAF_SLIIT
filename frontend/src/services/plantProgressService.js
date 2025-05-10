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
    
    // Format the date properly for Java LocalDateTime
    if (milestone.completedAt) {
      // Remove timezone information to prevent timezone conversion issues
      milestone.completedAt = milestone.completedAt.replace('Z', '');
    }
    
    // Try POST first, then fall back to PUT if needed
    return api.post(`/progress/${progressId}/milestones`, milestone)
      .catch(error => {
        console.log("POST failed, trying PUT as fallback:", error);
        return api.put(`/progress/${progressId}/milestones`, milestone);
      })
      .then(response => {
        console.log("Milestone completion successful, response:", response);
        // Force a refresh from server to get the latest data
        return PlantProgressService.getProgressDetail(progressId);
      })
      .then(refreshResponse => {
        console.log("Refreshed progress data:", refreshResponse.data);
        return refreshResponse;
      });
  },

  // Update the entire progress object - this is the robust way to ensure changes are saved
  updateProgress: (progressId, progressData) => {
    return api.put(`/progress/${progressId}`, progressData);
  },

  // Update notes (use the method above)
  updateNotes: (progressId, notes) => {
    // Instead of just updating notes, get the current progress and update it
    return PlantProgressService.getProgressDetail(progressId)
      .then(response => {
        const updatedProgress = {
          ...response.data,
          notes: notes
        };
        return PlantProgressService.updateProgress(progressId, updatedProgress);
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