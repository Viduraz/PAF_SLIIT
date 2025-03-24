import api from "./api";

const PlantingPlanService = {
  // Get all planting plans
  getAllPlans: () => {
    return api.get("/planting-plans");
  },

  // Get a specific planting plan by ID
  getPlanById: (planId) => {
    return api.get(`/planting-plans/${planId}`);
  },

  // Create a new planting plan (admin only)
  createPlan: (planData) => {
    return api.post("/planting-plans", planData);
  },

  // Update a planting plan (admin only)
  updatePlan: (planId, planData) => {
    return api.put(`/planting-plans/${planId}`, planData);
  },

  // Delete a planting plan (admin only)
  deletePlan: (planId) => {
    return api.delete(`/planting-plans/${planId}`);
  },

  // Get plans by category
  getPlansByCategory: (category) => {
    return api.get(`/planting-plans/category/${category}`);
  },

  // Search plans by keyword
  searchPlans: (keyword) => {
    return api.get(`/planting-plans/search?keyword=${keyword}`);
  }
};

export default PlantingPlanService;