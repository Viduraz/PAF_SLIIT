import api from "./api";

const PlantingPlanService = {
  // Get all planting plans
  getAllPlans: () => {
    return api.get("/api/plans");
  },

  // Get a specific planting plan by ID
  getPlanById: (planId) => {
    return api.get(`/api/plans/${planId}`);
  },

  // Create a new planting plan (admin only)
  createPlan: (planData) => {
    return api.post("/api/plans", planData);
  },

  // Update a planting plan (admin only)
  updatePlan: (planId, planData) => {
    return api.put(`/api/plans/${planId}`, planData);
  },

  // Delete a planting plan (admin only)
  deletePlan: (planId) => {
    return api.delete(`/api/plans/${planId}`);
  },

  // Get plans by category
  getPlansByCategory: (category) => {
    return api.get(`/api/plans/category/${category}`);
  },

  // Search plans by keyword
  searchPlans: (title) => {
    return api.get(`/api/plans/search?title=${title}`);
  },
  
  // Get plans by tag
  getPlansByTag: (tag) => {
    return api.get(`/api/plans/tags/${tag}`);
  },
  
  // Like a plan
  likePlan: (planId) => {
    return api.put(`/api/plans/${planId}/like`);
  },
  
  // Get public plans
  getPublicPlans: () => {
    return api.get("/api/plans/public");
  },
  
  // Add milestone to a plan
  addMilestone: (planId, milestone) => {
    return api.post(`/api/plans/${planId}/milestones`, milestone);
  },
  
  // Update a milestone
  updateMilestone: (planId, milestoneId, milestone) => {
    return api.put(`/api/plans/${planId}/milestones/${milestoneId}`, milestone);
  },
  
  // Remove a milestone
  removeMilestone: (planId, milestoneId) => {
    return api.delete(`/api/plans/${planId}/milestones/${milestoneId}`);
  }
};

export default PlantingPlanService;