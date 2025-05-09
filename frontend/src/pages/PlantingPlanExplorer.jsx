import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSeedling, FaClock, FaTag, FaUsers, FaSearch } from 'react-icons/fa';
import PlantingPlanService from '../services/plantingPlanService';
import PlantProgressService from '../services/plantProgressService';
import { useAuth } from '../utils/AuthContext';

// Animation variants
const containerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariant = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

function PlantingPlanExplorer() {
  const [plans, setPlans] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [tags, setTags] = useState([]);
  const { currentUser, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        
        let response;
        if (activeTag) {
          response = await PlantingPlanService.getPlansByTag(activeTag);
        } else if (searchTerm) {
          response = await PlantingPlanService.searchPlans(searchTerm);
        } else {
          response = await PlantingPlanService.getAllPlans();
        }
        
        setPlans(response.data);
        
        // Extract and count unique tags
        const tagCounts = {};
        response.data.forEach(plan => {
          if (plan.tags && Array.isArray(plan.tags)) {
            plan.tags.forEach(tag => {
              tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
          }
        });
        
        // Convert to array and sort by count
        const tagArray = Object.entries(tagCounts)
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10); // Take top 10 tags
          
        setTags(tagArray);

        // If user is logged in, fetch their progress
        if (isAuthenticated) {
          const progressResponse = await PlantProgressService.getUserProgress(currentUser._id || currentUser.id);
          setUserProgress(progressResponse.data);
        }

        setLoading(false);
      } catch (err) {
        setError("Failed to load planting plans");
        setLoading(false);
        console.error(err);
      }
    };

    fetchPlans();
  }, [currentUser, isAuthenticated, searchTerm, activeTag]);

  const startProgress = async (planId) => {
    try {
      const response = await PlantProgressService.startProgress(planId);
      
      // Update the user progress state
      setUserProgress([...userProgress, response.data]);
    } catch (err) {
      console.error("Failed to start tracking progress:", err);
      alert("Failed to start tracking this plan. Please try again.");
    }
  };

  const getFilteredPlans = () => {
    if (!isAuthenticated || filter === "all") {
      return plans;
    }

    const progressMap = new Map(
      userProgress.map(progress => [progress.plantingPlan._id || progress.plantingPlan.id, progress])
    );

    return plans.filter(plan => {
      const progress = progressMap.get(plan._id || plan.id);
      
      if (filter === "started" && progress) {
        return progress.progressPercentage < 100;
      }
      
      if (filter === "completed" && progress) {
        return progress.progressPercentage === 100;
      }
      
      if (filter === "not-started") {
        return !progress;
      }
      
      return true;
    });
  };

  const getUserProgressForPlan = (planId) => {
    return userProgress.find(p => (p.plantingPlan._id || p.plantingPlan.id) === planId);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search term will trigger useEffect
  };

  const handleTagClick = (tag) => {
    setActiveTag(activeTag === tag ? "" : tag);
    setSearchTerm("");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-8 mb-8 shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-4">Planting Plans Explorer</h1>
        <p className="text-green-100 mb-6">
          Discover and track planting plans for your garden. Browse through our collection or create your own!
        </p>
        
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-grow">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for plants..."
                className="w-full px-4 py-3 rounded-lg shadow-sm focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-colors"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-600 p-2"
              >
                <FaSearch />
              </button>
            </div>
          </form>
          
          {isAuthenticated && currentUser?.role === "admin" && (
            <Link
              to="/plantingfoam"
              className="bg-white text-green-700 hover:bg-green-50 px-6 py-3 rounded-lg font-medium shadow-sm whitespace-nowrap flex items-center justify-center"
            >
              <FaSeedling className="mr-2" /> Create New Plan
            </Link>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveTag("")}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            activeTag === "" 
              ? "bg-green-600 text-white" 
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          All
        </button>
        
        {tags.map(({ tag, count }) => (
          <button
            key={tag}
            onClick={() => handleTagClick(tag)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              activeTag === tag 
                ? "bg-green-600 text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            #{tag} <span className="text-xs">({count})</span>
          </button>
        ))}
      </div>
      
      {isAuthenticated && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === "all" ? "bg-green-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setFilter("all")}
          >
            All Plans
          </button>
          <button 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === "started" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setFilter("started")}
          >
            In Progress
          </button>
          <button 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === "completed" ? "bg-orange-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setFilter("completed")}
          >
            Completed
          </button>
          <button 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === "not-started" ? "bg-purple-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setFilter("not-started")}
          >
            Not Started
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariant}
        initial="hidden"
        animate="visible"
      >
        {getFilteredPlans().length > 0 ? (
          getFilteredPlans().map(plan => {
            const progress = getUserProgressForPlan(plan._id || plan.id);
            
            return (
              <motion.div
                key={plan._id || plan.id}
                variants={itemVariant}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                {plan.image ? (
                  <img 
                    src={plan.image} 
                    alt={plan.title} 
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="h-48 w-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                    <FaSeedling className="text-6xl text-white opacity-50" />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex gap-2 flex-wrap mb-3">
                    {plan.tags && plan.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 text-gray-800">{plan.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{plan.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <FaClock className="mr-1" />
                      <span>{plan.duration || "30"} days</span>
                    </div>
                    <div className="flex items-center">
                      <FaUsers className="mr-1" />
                      <span>{plan.usersFollowing?.length || 0} followers</span>
                    </div>
                  </div>
                  
                  {progress && (
                    <div className="mb-4">
                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold inline-block text-green-600">
                              Progress
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold inline-block text-green-600">
                              {progress.progressPercentage}%
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-green-200">
                          <div 
                            style={{ width: `${progress.progressPercentage}%` }} 
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {progress.completedMilestones.length} of {plan.milestones.length} milestones completed
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Link 
                      to={`/planting-plans/${plan._id || plan.id}`}
                      className="flex-1 bg-white border border-green-600 text-green-700 px-4 py-2 rounded-lg text-center hover:bg-green-50 transition-colors"
                    >
                      View Details
                    </Link>
                    
                    {isAuthenticated && !progress && (
                      <button 
                        onClick={() => startProgress(plan._id || plan.id)}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Start Tracking
                      </button>
                    )}
                    
                    {isAuthenticated && progress && (
                      <Link 
                        to={`/plant-progress/${progress._id || progress.id}`}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        View Progress
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center">
            <FaSeedling className="text-5xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">No planting plans found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
            <button 
              onClick={() => {
                setSearchTerm("");
                setActiveTag("");
                setFilter("all");
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default PlantingPlanExplorer;