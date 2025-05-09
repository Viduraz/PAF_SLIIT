import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSeedling, FaClock, FaUsers, FaSearch, FaTags, FaFilter, FaLeaf } from 'react-icons/fa';
import PlantingPlanService from '../services/plantingPlanService';
import PlantProgressService from '../services/plantProgressService';
import { useAuth } from '../utils/AuthContext';

// Animation variants
const containerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2
    }
  }
};

const itemVariant = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

const backdropVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 }
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
  const [showFilters, setShowFilters] = useState(false);
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
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="relative w-20 h-20">
          <motion.div
            className="absolute inset-0 rounded-full border-t-2 border-b-2 border-green-500"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border-r-2 border-l-2 border-green-300"
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <FaSeedling className="absolute inset-0 m-auto text-green-600" size={20} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative mb-10 overflow-hidden rounded-2xl bg-gradient-to-r from-green-800 via-green-600 to-green-500"
      >
        <div className="absolute inset-0 opacity-10 mix-blend-overlay">
          <svg className="w-full h-full" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
            <path d="M14,16.6L10.3,15L16.6,10.3L15,16.6M16.6,59.7L15,66L10.3,65L14,59.7M59.7,14L65,10.3L66,15L59.7,16.6M59.7,66L66,59.7L65,65L59.7,66M30.1,39.9L37,33L33,36.9M39.9,30.1L33,37L36.9,33M30.1,40.1L37,47L33,43.1M40.1,49.9L47,43L43.1,47M49.9,39.9L43,33L47,36.9M39.9,49.9L33,43L36.9,47M30.1,40.1L23,47L27,43.1M40.1,30.1L33,23L36.9,27" fill="rgba(255,255,255,0.4)" fillRule="evenodd" />
          </svg>
        </div>
        <motion.div 
          className="absolute -bottom-10 -right-10" 
          animate={{ rotate: [0, 15, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <FaLeaf className="text-white opacity-20" size={200} />
        </motion.div>
        
        <div className="relative z-10 p-8 sm:p-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Planting Plans Explorer</h1>
            <p className="text-white/90 mb-6 max-w-2xl">
              Discover and track planting plans for your garden. Browse through our collection, find inspiration, and create personalized growing experiences.
            </p>
          </motion.div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-stretch">
            <form onSubmit={handleSearch} className="flex-grow">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search for plants, vegetables, or flowers..."
                  className="w-full px-5 py-3 rounded-lg shadow-sm focus:ring-2 focus:ring-green-300 focus:border-green-300 text-gray-700 bg-white/95 backdrop-blur transition-all border-transparent"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 hover:text-green-700 transition-colors"
                >
                  <FaSearch size={18} />
                </button>
              </div>
            </form>
            
            {isAuthenticated && currentUser?.role === "admin" && (
              <Link
                to="/plantingfoam"
                className="bg-white/90 backdrop-blur text-green-700 hover:bg-white px-6 py-3 rounded-lg font-medium shadow-sm whitespace-nowrap flex items-center justify-center transition-all hover:shadow-md"
              >
                <FaSeedling className="mr-2" /> Create New Plan
              </Link>
            )}
          </div>
        </div>
      </motion.div>
      
      <div className="flex flex-wrap items-center justify-between mb-6">
        <motion.div 
          className="flex flex-wrap gap-2 mb-4 sm:mb-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <button
            onClick={() => setActiveTag("")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTag === "" 
                ? "bg-green-600 text-white shadow-md" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Plants
          </button>
          
          {tags.slice(0, 5).map(({ tag, count }) => (
            <motion.button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTag === tag 
                  ? "bg-green-600 text-white shadow-md" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              #{tag} <span className="text-xs opacity-70">({count})</span>
            </motion.button>
          ))}
          
          {tags.length > 5 && (
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaTags className="mr-1" /> 
              {showFilters ? "Less Tags" : "More Tags"}
            </motion.button>
          )}
        </motion.div>
        
        {isAuthenticated && (
          <motion.button 
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaFilter className="mr-2" /> 
            {showFilters ? "Hide Filters" : "Show Filters"}
          </motion.button>
        )}
      </div>
      
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-5 bg-green-50 rounded-xl shadow-sm border border-green-100">
              {tags.length > 5 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-green-800 mb-3">All Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(({ tag, count }) => (
                      <button
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          activeTag === tag 
                            ? "bg-green-600 text-white" 
                            : "bg-white text-green-700 hover:bg-green-100 border border-green-200"
                        }`}
                      >
                        #{tag} <span className="opacity-70">({count})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {isAuthenticated && (
                <div>
                  <h3 className="text-sm font-medium text-green-800 mb-3">Your Progress Filter</h3>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        filter === "all" ? "bg-green-600 text-white shadow-md" : "bg-white text-gray-700 hover:bg-green-100 border border-green-200"
                      }`}
                      onClick={() => setFilter("all")}
                    >
                      All Plans
                    </button>
                    <button 
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        filter === "started" ? "bg-green-500 text-white shadow-md" : "bg-white text-gray-700 hover:bg-green-100 border border-green-200"
                      }`}
                      onClick={() => setFilter("started")}
                    >
                      In Progress
                    </button>
                    <button 
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        filter === "completed" ? "bg-green-700 text-white shadow-md" : "bg-white text-gray-700 hover:bg-green-100 border border-green-200"
                      }`}
                      onClick={() => setFilter("completed")}
                    >
                      Completed
                    </button>
                    <button 
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        filter === "not-started" ? "bg-green-400 text-white shadow-md" : "bg-white text-gray-700 hover:bg-green-100 border border-green-200"
                      }`}
                      onClick={() => setFilter("not-started")}
                    >
                      Not Started
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div 
          className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 mb-8 rounded-r-md"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p>{error}</p>
          </div>
        </motion.div>
      )}

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
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
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col"
                whileHover={{ y: -5 }}
              >
                <div className="relative h-48 w-full overflow-hidden">
                  {plan.image ? (
                    <img 
                      src={plan.image} 
                      alt={plan.title} 
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                      <motion.div
                        animate={{ 
                          y: [0, -10, 0],
                          rotate: [0, 5, 0, -5, 0]
                        }}
                        transition={{ 
                          duration: 5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <FaSeedling className="text-6xl text-white opacity-70" />
                      </motion.div>
                    </div>
                  )}
                  {progress && progress.progressPercentage === 100 && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                      Completed!
                    </div>
                  )}
                </div>
                
                <div className="p-6 flex-grow flex flex-col">
                  <div className="flex gap-2 flex-wrap mb-3">
                    {plan.tags && plan.tags.slice(0, 3).map((tag, index) => (
                      <span 
                        key={index} 
                        className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                    {plan.tags && plan.tags.length > 3 && (
                      <span className="text-xs text-gray-500 flex items-center">
                        +{plan.tags.length - 3} more
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 text-gray-800 line-clamp-1">{plan.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2 text-sm flex-grow">{plan.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <FaClock className="mr-1 text-green-500" />
                      <span>{plan.duration || "30"} days</span>
                    </div>
                    <div className="flex items-center">
                      <FaUsers className="mr-1 text-green-500" />
                      <span>{plan.usersFollowing?.length || 0} followers</span>
                    </div>
                  </div>
                  
                  {progress && (
                    <div className="mb-4">
                      <div className="relative">
                        <div className="flex mb-2 items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold inline-block text-gray-600">
                              Your Progress
                            </span>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs font-bold inline-block ${
                              progress.progressPercentage === 100 
                                ? "text-green-700" 
                                : progress.progressPercentage > 50 
                                  ? "text-green-600" 
                                  : "text-green-500"
                            }`}>
                              {progress.progressPercentage}%
                            </span>
                          </div>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <motion.div 
                            className={`h-full rounded-full ${
                              progress.progressPercentage === 100 
                                ? "bg-green-700" 
                                : progress.progressPercentage > 50 
                                  ? "bg-green-600" 
                                  : "bg-green-500"
                            }`}
                            style={{ width: "0%" }}
                            animate={{ width: `${progress.progressPercentage}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex justify-between items-center">
                          <span>
                            {progress.completedMilestones.length} of {plan.milestones.length} steps
                          </span>
                          {progress.progressPercentage === 100 && (
                            <span className="flex items-center text-green-600">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Complete
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2 mt-auto">
                    <Link 
                      to={`/planting-plans/${plan._id || plan.id}`}
                      className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-center hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      View Details
                    </Link>
                    
                    {isAuthenticated && !progress && (
                      <button 
                        onClick={() => startProgress(plan._id || plan.id)}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shadow-sm"
                      >
                        Start Tracking
                      </button>
                    )}
                    
                    {isAuthenticated && progress && (
                      <Link 
                        to={`/plant-progress/${progress._id || progress.id}`}
                        className={`flex-1 px-4 py-2 rounded-lg text-white text-sm font-medium shadow-sm ${
                          progress.progressPercentage === 100 
                            ? "bg-green-700 hover:bg-green-800" 
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        Continue
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <motion.div 
            className="col-span-full py-20 text-center"
            variants={backdropVariant}
          >
            <div className="bg-green-50 rounded-xl p-10 max-w-xl mx-auto shadow-sm border border-green-100">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="mx-auto w-16 h-16 mb-4 text-green-300"
              >
                <FaSeedling size={64} />
              </motion.div>
              <h3 className="text-xl font-medium text-green-800 mb-2">No planting plans found</h3>
              <p className="text-green-700 mb-6">Try adjusting your search criteria or filters</p>
              <button 
                onClick={() => {
                  setSearchTerm("");
                  setActiveTag("");
                  setFilter("all");
                }}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
              >
                Reset All Filters
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default PlantingPlanExplorer;