import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSeedling, FaClock, FaLeaf, FaTags, FaUsers, FaChevronDown, FaChevronUp, FaHeart } from 'react-icons/fa';
import PlantingPlanService from '../services/plantingPlanService';
import PlantProgressService from '../services/plantProgressService';
import { useAuth } from '../utils/AuthContext';

const categoryImages = {
  vegetables: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  fruits: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  flowers: 'https://images.unsplash.com/photo-1468327768560-75b778cbb551?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  herbs: 'https://images.unsplash.com/photo-1515586000433-45406d8e6662?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  default: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
};

// Add common plant type images
const plantTypeImages = {
  // Vegetables
  'Tomato': 'https://images.unsplash.com/photo-1582284540020-8acbe03f4924?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'Carrot': 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'Lettuce': 'https://images.unsplash.com/photo-1556801712-76c8eb07bbc9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'Cucumber': 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  
  // Fruits
  'Strawberry': 'https://images.unsplash.com/photo-1518635017498-87f514b751ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'Watermelon': 'https://images.unsplash.com/photo-1563114773-84221bd62daa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'Grape': 'https://images.unsplash.com/photo-1596363505729-4190a9506133?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  
  // Flowers
  'Rose': 'https://images.unsplash.com/photo-1562690868-60bbe7293e94?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'Sunflower': 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'Tulip': 'https://images.unsplash.com/photo-1588905857760-461c84562539?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
};

// Helper function to get appropriate image based on plan tags and title
const getDefaultImage = (plan) => {
  // First check if the title contains a specific plant type
  const title = plan.title ? plan.title.toLowerCase() : '';
  
  for (const [plantType, imageUrl] of Object.entries(plantTypeImages)) {
    if (title.includes(plantType.toLowerCase())) {
      return imageUrl;
    }
  }
  
  // Then check tags
  if (!plan.tags || plan.tags.length === 0) return categoryImages.default;
  
  const lowerTags = plan.tags.map(tag => tag.toLowerCase());
  
  // Check for specific plant types in tags
  for (const [plantType, imageUrl] of Object.entries(plantTypeImages)) {
    if (lowerTags.includes(plantType.toLowerCase())) {
      return imageUrl;
    }
  }
  
  // Check for general categories
  if (lowerTags.some(tag => tag === 'vegetables' || tag === 'vegetable')) 
    return categoryImages.vegetables;
  
  if (lowerTags.some(tag => tag === 'fruits' || tag === 'fruit')) 
    return categoryImages.fruits;
  
  if (lowerTags.some(tag => tag === 'flowers' || tag === 'flower' || tag === 'ornamental')) 
    return categoryImages.flowers;
  
  if (lowerTags.some(tag => tag === 'herbs' || tag === 'herb')) 
    return categoryImages.herbs;
  
  return categoryImages.default;
};

function PlantingPlanDetail() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const [plan, setPlan] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAllMilestones, setShowAllMilestones] = useState(false);
  const [likingPlan, setLikingPlan] = useState(false);

  useEffect(() => {
    const fetchPlanDetails = async () => {
      try {
        setLoading(true);
        const response = await PlantingPlanService.getPlanById(planId);
        setPlan(response.data);
        
        // Debug the condition
        console.log("Auth status:", isAuthenticated);
        console.log("Current user:", currentUser);
        console.log("Plan user ID:", response.data.userId);
        console.log("Should show buttons:", isAuthenticated && 
          (currentUser?.role === "admin" || currentUser?._id === response.data.userId));

        // If user is logged in, check if they're already tracking this plan
        if (isAuthenticated && currentUser) {
          try {
            const progressResponse = await PlantProgressService.getUserProgress(currentUser._id || currentUser.id);
            const userProgress = progressResponse.data.find(
              p => (p.plantingPlan._id || p.plantingPlan.id) === planId
            );
            setProgress(userProgress || null);
          } catch (err) {
            console.error("Error fetching user progress:", err);
          }
        }

        setLoading(false);
      } catch (err) {
        setError("Failed to load planting plan details");
        setLoading(false);
        console.error(err);
      }
    };

    fetchPlanDetails();
  }, [planId, currentUser, isAuthenticated]);

  const startProgress = async () => {
    try {
      setLikingPlan(true);
      const response = await PlantProgressService.startProgress(planId);
      setProgress(response.data);
      
      // Increment the likes count on the plan
      await PlantingPlanService.likePlan(planId);
      
      // Update the plan with the new like count
      setPlan(prevPlan => ({
        ...prevPlan,
        likes: (prevPlan.likes || 0) + 1
      }));
      
      setLikingPlan(false);
      navigate(`/plant-progress/${response.data._id || response.data.id}`);
    } catch (err) {
      setLikingPlan(false);
      console.error("Failed to start tracking progress:", err);
      alert("Failed to start tracking this plan. Please try again.");
    }
  };

  const likePlan = async () => {
    if (!isAuthenticated) {
      navigate("/login?redirect=planting-plans/" + planId);
      return;
    }
    
    try {
      setLikingPlan(true);
      await PlantingPlanService.likePlan(planId);
      
      // Update the plan with the new like count
      setPlan(prevPlan => ({
        ...prevPlan,
        likes: (prevPlan.likes || 0) + 1
      }));
      
      setLikingPlan(false);
    } catch (err) {
      setLikingPlan(false);
      console.error("Failed to like the plan:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500"></div>
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

  if (!plan) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
          <p>Planting plan not found</p>
          <Link to="/planting-plans" className="text-yellow-700 font-medium hover:underline mt-2 inline-block">
            &larr; Back to Planting Plans
          </Link>
        </div>
      </div>
    );
  }

  // Display only first 3 milestones by default, unless expanded
  const displayedMilestones = showAllMilestones 
    ? plan.milestones 
    : (plan.milestones || []).slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-6">
        <Link to="/planting-plans" className="text-green-600 hover:underline flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Planting Plans
        </Link>
      </nav>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        {plan.image ? (
          <div className="h-72 md:h-96 w-full overflow-hidden relative">
            <img 
              src={plan.image} 
              alt={plan.title} 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h1 className="text-4xl font-bold mb-2 drop-shadow-lg">{plan.title}</h1>
              <div className="flex flex-wrap gap-2">
                {(plan.categories || []).map((category, index) => (
                  <span key={index} className="bg-white/20 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full">
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-72 md:h-96 w-full overflow-hidden relative">
            <img 
              src={getDefaultImage(plan)} 
              alt={plan.title} 
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h1 className="text-4xl font-bold mb-2 drop-shadow-lg">{plan.title}</h1>
              <div className="flex flex-wrap gap-2">
                {(plan.categories || []).map((category, index) => (
                  <span key={index} className="bg-white/20 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full">
                    {category}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Decorative elements - subtle leaf patterns */}
            <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <pattern id="leafPattern" patternUnits="userSpaceOnUse" width="20" height="20" patternTransform="rotate(45)">
                <path d="M10,0 Q15,10 10,20 Q5,10 10,0" fill="rgba(255,255,255,0.5)" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#leafPattern)" />
            </svg>
          </div>
        )}
        
        <div className="p-6 md:p-8">
          {/* Remove the title as it's now in the image overlay */}
          <p className="text-gray-700 text-lg mb-6">{plan.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {(plan.categories || []).map((category, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                {category}
              </span>
            ))}
            <span className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full">
              {plan.difficulty || "Beginner"}
            </span>
            <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full flex items-center">
              <FaClock className="mr-1" />
              {plan.duration || "30"} days
            </span>
          </div>
          
          <p className="text-gray-700 text-lg mb-6">{plan.description}</p>
          
          <div className="flex items-center gap-4 mb-6 text-gray-500">
            <div className="flex items-center">
              <FaUsers className="mr-1" />
              <span>{plan.usersFollowing?.length || 0} followers</span>
            </div>
            <div className="flex items-center">
              <FaLeaf className="mr-1" />
              <span>{plan.likes || 0} likes</span>
            </div>
            <div className="text-sm">
              Created on {new Date(plan.createdAt).toLocaleDateString()}
            </div>
          </div>
          
          {plan.requirements && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Requirements</h2>
              <p className="text-gray-700">{plan.requirements}</p>
            </div>
          )}
          
          <div className="mb-12 relative">
            {/* Decorative elements */}
            <div className="absolute -left-4 -top-4 text-6xl text-green-100 transform -rotate-12 z-0">🌱</div>
            <div className="absolute -right-4 -bottom-4 text-6xl text-green-100 transform rotate-12 z-0">🌿</div>
            
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="bg-green-100 text-green-700 p-2 rounded-full mr-3">
                  <FaSeedling className="text-xl" />
                </span>
                Growth Journey
              </h2>
              
              <div className="border-l-4 border-green-300 pl-6 py-2 relative">
                {/* The growth line with animated gradient */}
                <div className="absolute left-[-8px] top-0 bottom-0 w-4 bg-gradient-to-b from-green-100 via-green-300 to-green-500 rounded-full" 
                     style={{background: "linear-gradient(to bottom, #dcfce7 0%, #86efac 50%, #22c55e 100%)"}} />
                
                {/* Timeline markers */}
                {displayedMilestones.map((milestone, index) => (
                  <div key={milestone.id || index} className="relative">
                    {/* Timeline dot */}
                    <div className="absolute left-[-29px] w-8 h-8 bg-white rounded-full border-4 border-green-500 flex items-center justify-center">
                      <span className="text-xs font-bold text-green-700">{index + 1}</span>
                    </div>
                    
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2, type: "spring", stiffness: 100 }}
                      className="bg-white p-5 rounded-lg shadow-lg mb-8 hover:shadow-xl transition-shadow border border-green-100 relative overflow-hidden"
                      whileHover={{ scale: 1.02 }}
                    >
                      {/* Decorative corner element */}
                      <div className="absolute -top-4 -right-4 w-16 h-16 bg-green-100 rounded-full opacity-20"></div>
                      
                      <div className="flex justify-between items-start mb-3 relative z-10">
                        <h3 className="text-lg font-semibold text-green-800">
                          {milestone.title}
                        </h3>
                        {milestone.estimatedDays && (
                          <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full flex items-center">
                            <FaClock className="mr-1" />
                            {milestone.estimatedDays} days
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-700 mb-4 relative z-10">{milestone.description}</p>
                      
                      <div className="mt-4 space-y-3 relative z-10">
                        {milestone.tips && (
                          <div className="bg-yellow-50 p-3 rounded-md border-l-4 border-yellow-400 hover:shadow-md transition-shadow">
                            <p className="text-sm text-yellow-800 italic flex items-start">
                              <span className="mr-2 text-yellow-600 font-bold">💡</span>
                              <span>{milestone.tips}</span>
                            </p>
                          </div>
                        )}
                        
                        {milestone.resources && milestone.resources.length > 0 && (
                          <div className="bg-blue-50 p-3 rounded-md hover:shadow-md transition-shadow">
                            <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                              <span className="mr-2">📚</span>
                              Helpful Resources:
                            </h4>
                            <ul className="list-disc list-inside text-sm text-blue-700 ml-2 space-y-1">
                              {milestone.resources.map((resource, i) => (
                                <li key={i} className="hover:text-blue-900 transition-colors cursor-pointer">
                                  {resource}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
              
              {(plan.milestones || []).length > 3 && (
                <motion.button 
                  className="mt-6 flex items-center mx-auto px-6 py-3 bg-green-50 text-green-700 rounded-full hover:bg-green-100 transition-colors font-medium"
                  onClick={() => setShowAllMilestones(!showAllMilestones)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {showAllMilestones ? (
                    <>
                      <FaChevronUp className="mr-2" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <FaChevronDown className="mr-2" />
                      Show All {plan.milestones.length} Growth Stages
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>
          
          {plan.tips && (
            <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Tips for Success</h3>
              <p className="text-gray-700">{plan.tips}</p>
            </div>
          )}
          
          <div className="flex flex-wrap gap-3 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mr-2 flex items-center">
              <FaTags className="mr-2" /> Tags:
            </h3>
            {(plan.tags || []).map((tag, index) => (
              <Link 
                key={index}
                to={`/planting-plans?tag=${tag}`}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {isAuthenticated ? (
              progress ? (
                <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link 
                    to={`/plant-progress/${progress._id || progress.id}`}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-center py-3 px-6 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-md w-full flex items-center justify-center"
                  >
                    <FaSeedling className="mr-2" /> View My Progress
                  </Link>
                </motion.div>
              ) : (
                <motion.button 
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-md flex items-center justify-center"
                  onClick={startProgress}
                  disabled={likingPlan}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {likingPlan ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Starting...
                    </span>
                  ) : (
                    <>
                      <FaSeedling className="mr-2" /> Start Tracking This Plan
                    </>
                  )}
                </motion.button>
              )
            ) : (
              <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to={`/login?redirect=planting-plans/${planId}`}
                  className="flex-1 bg-gray-100 text-gray-800 text-center py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors shadow-sm w-full flex items-center justify-center"
                >
                  <FaLeaf className="mr-2" /> Log in to track this plan
                </Link>
              </motion.div>
            )}
            
            <motion.button 
              className="flex-1 bg-white border border-green-600 text-green-700 py-3 px-6 rounded-lg font-medium hover:bg-green-50 transition-colors flex items-center justify-center shadow-sm"
              onClick={likePlan}
              disabled={likingPlan}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {likingPlan ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Liking...
                </span>
              ) : (
                <>
                  <FaHeart className="mr-2" /> Like This Plan
                </>
              )}
            </motion.button>
          </div>
          
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-3">
                <Link 
                  to={`/planting-plans/${planId}/edit`}
                  className="flex-1 bg-blue-600 text-white text-center py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Edit Plan
                </Link>
                <button
                  className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete this planting plan? This action cannot be undone.")) {
                      PlantingPlanService.deletePlan(planId)
                        .then(() => {
                          // Show success notification
                          alert("Plan deleted successfully!");
                          navigate("/planting-plans");
                        })
                        .catch(err => {
                          console.error("Failed to delete plan:", err);
                          alert("Failed to delete plan. Please try again.");
                        });
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Delete Plan
                </button>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default PlantingPlanDetail;