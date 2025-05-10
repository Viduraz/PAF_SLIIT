import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSeedling, FaArrowLeft, FaSave, FaTimes, FaLeaf, FaTag, FaEye, FaEyeSlash, FaImage, FaClock } from 'react-icons/fa';
import PlantingPlanService from '../services/plantingPlanService';
import { useAuth } from '../utils/AuthContext';

// Import the plant image mappings from PlantingPlanDetail
const categoryImages = {
  vegetables: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  fruits: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  flowers: 'https://images.unsplash.com/photo-1468327768560-75b778cbb551?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  herbs: 'https://images.unsplash.com/photo-1515586000433-45406d8e6662?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  default: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
};

// Add plant type images
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

// Animation variants (keep existing ones)
const containerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariant = {
  hidden: { y: 20, opacity: 0 },
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

// Helper function to get appropriate image based on plan tags and title
const getDefaultImage = (plan) => {
  // First check if the title contains a specific plant type
  const title = plan?.title ? plan.title.toLowerCase() : '';
  
  for (const [plantType, imageUrl] of Object.entries(plantTypeImages)) {
    if (title.includes(plantType.toLowerCase())) {
      return imageUrl;
    }
  }
  
  // Then check tags
  if (!plan?.tags || plan.tags.length === 0) return categoryImages.default;
  
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

function PlantingPlanEditPage() {
  // ... existing state variables
  const { planId } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  
  // Add new form fields for image and category
  const [imageUrl, setImageUrl] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoryInput, setCategoryInput] = useState("");
  const [duration, setDuration] = useState("30");
  const [difficulty, setDifficulty] = useState("Beginner");

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setLoading(true);
        const response = await PlantingPlanService.getPlanById(planId);
        const planData = response.data;
        
        setPlan(planData);
        
        // Set form fields
        setTitle(planData.title || "");
        setDescription(planData.description || "");
        setIsPublic(planData.isPublic !== false);
        setTags(planData.tags || []);
        setImageUrl(planData.image || "");
        setCategories(planData.categories || []);
        setDuration(planData.duration || "30");
        setDifficulty(planData.difficulty || "Beginner");
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching plan:", err);
        setError("Failed to load plan details");
        setLoading(false);
      }
    };

    fetchPlan();
  }, [planId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      setSaving(true);
      
      const updatedPlan = {
        ...plan,
        title,
        description,
        isPublic,
        tags,
        image: imageUrl,
        categories,
        duration,
        difficulty
      };
      
      await PlantingPlanService.updatePlan(planId, updatedPlan);
      
      setSaving(false);
      navigate(`/planting-plans/${planId}`);
    } catch (err) {
      console.error("Error updating plan:", err);
      setError("Failed to update plan");
      setSaving(false);
    }
  };

  // Keep existing handlers
  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // Add new handlers for categories
  const handleAddCategory = () => {
    if (categoryInput && !categories.includes(categoryInput)) {
      setCategories([...categories, categoryInput]);
      setCategoryInput("");
    }
  };

  const handleRemoveCategory = (categoryToRemove) => {
    setCategories(categories.filter(category => category !== categoryToRemove));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <motion.div 
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          <FaLeaf className="text-green-500 opacity-50" />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="max-w-3xl mx-auto px-4 py-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
        <Link to={`/planting-plans/${planId}`} className="text-green-600 hover:underline flex items-center">
          <FaArrowLeft className="mr-2" />
          Back to Plan Details
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="max-w-3xl mx-auto px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Background decorator elements */}
      <motion.div
        className="fixed -z-10 top-20 right-10 text-8xl text-green-200 opacity-20"
        animate={{ 
          rotate: [0, 10, 0, -10, 0],
          scale: [1, 1.05, 1, 0.95, 1]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <FaLeaf />
      </motion.div>
      <motion.div
        className="fixed -z-10 bottom-20 left-10 text-8xl text-green-200 opacity-10"
        animate={{ 
          rotate: [0, -10, 0, 10, 0],
          scale: [1, 0.95, 1, 1.05, 1]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      >
        <FaLeaf />
      </motion.div>

      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Link 
          to={`/planting-plans/${planId}`} 
          className="text-green-600 hover:text-green-700 hover:underline flex items-center mb-6 group"
        >
          <motion.div
            whileHover={{ x: -3 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <FaArrowLeft className="mr-2 group-hover:text-green-700" />
          </motion.div>
          Back to Plan Details
        </Link>
      </motion.div>
      
      <motion.div 
        className="bg-white rounded-xl shadow-lg overflow-hidden relative"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Image preview header */}
        <div className="h-48 md:h-64 w-full overflow-hidden relative">
          <img 
            src={imageUrl || getDefaultImage(plan)}
            alt={title || "Planting Plan"}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 className="text-3xl font-bold mb-2 drop-shadow-lg">{title || "Edit Planting Plan"}</h1>
            <div className="flex flex-wrap gap-2">
              {categories.map((category, index) => (
                <span key={index} className="bg-white/20 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full">
                  {category}
                </span>
              ))}
            </div>
          </div>
          
          {/* Decorative elements */}
          <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <pattern id="leafPattern" patternUnits="userSpaceOnUse" width="20" height="20" patternTransform="rotate(45)">
              <path d="M10,0 Q15,10 10,20 Q5,10 10,0" fill="rgba(255,255,255,0.5)" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#leafPattern)" />
          </svg>
        </div>

        <div className="p-6 md:p-8">
          <motion.form 
            onSubmit={handleSubmit}
            variants={containerVariant}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="space-y-6" variants={containerVariant}>
              <motion.div variants={itemVariant}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  required
                />
              </motion.div>
              
              <motion.div variants={itemVariant}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  rows="4"
                  required
                ></textarea>
              </motion.div>
              
              {/* Add image URL field */}
              <motion.div variants={itemVariant}>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FaImage className="mr-2 text-green-600" /> Image URL
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Enter image URL (or leave empty for automatic image)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to use automatic image based on tags and title</p>
              </motion.div>
              
              {/* Add plant categories */}
              <motion.div variants={itemVariant}>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FaSeedling className="mr-2 text-green-600" /> Plant Categories
                </label>
                <div className="flex flex-wrap gap-2 mb-2 min-h-[40px]">
                  {categories.map((category, index) => (
                    <motion.span 
                      key={index} 
                      className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full flex items-center"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FaSeedling className="mr-1 text-blue-600" />
                      {category}
                      <motion.button 
                        type="button"
                        onClick={() => handleRemoveCategory(category)}
                        className="ml-1 text-blue-800 hover:text-red-500 transition-colors rounded-full h-4 w-4 flex items-center justify-center"
                        whileHover={{ scale: 1.2, backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
                        whileTap={{ scale: 0.9 }}
                      >
                        &times;
                      </motion.button>
                    </motion.span>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    placeholder="Add a category (e.g., Vegetables, Fruits)"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
                  />
                  <motion.button
                    type="button"
                    onClick={handleAddCategory}
                    className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors flex items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaSeedling className="mr-2" />
                    Add
                  </motion.button>
                </div>
              </motion.div>
              
              {/* Add growing duration */}
              <motion.div variants={itemVariant} className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FaClock className="mr-2 text-green-600" /> Duration (days)
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    min="1"
                    max="365"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  />
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </motion.div>
              
              <motion.div variants={itemVariant}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
                <div className="mt-1 flex space-x-4">
                  <motion.label 
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${isPublic ? 'bg-green-100 border border-green-300' : 'bg-gray-50 border border-gray-200'}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={isPublic}
                      onChange={() => setIsPublic(true)}
                      className="form-radio h-4 w-4 text-green-600 hidden"
                    />
                    <FaEye className={`mr-2 ${isPublic ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className={isPublic ? 'text-green-800' : 'text-gray-600'}>Public</span>
                  </motion.label>
                  
                  <motion.label 
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${!isPublic ? 'bg-red-100 border border-red-300' : 'bg-gray-50 border border-gray-200'}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={!isPublic}
                      onChange={() => setIsPublic(false)}
                      className="form-radio h-4 w-4 text-red-600 hidden"
                    />
                    <FaEyeSlash className={`mr-2 ${!isPublic ? 'text-red-600' : 'text-gray-400'}`} />
                    <span className={!isPublic ? 'text-red-800' : 'text-gray-600'}>Private</span>
                  </motion.label>
                </div>
              </motion.div>
              
              <motion.div variants={itemVariant}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2 min-h-[40px]">
                  {tags.map((tag, index) => (
                    <motion.span 
                      key={index} 
                      className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full flex items-center"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FaTag className="mr-1 text-green-600" />
                      {tag}
                      <motion.button 
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-green-800 hover:text-red-500 transition-colors rounded-full h-4 w-4 flex items-center justify-center"
                        whileHover={{ scale: 1.2, backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
                        whileTap={{ scale: 0.9 }}
                      >
                        &times;
                      </motion.button>
                    </motion.span>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <motion.button
                    type="button"
                    onClick={handleAddTag}
                    className="bg-green-600 text-white px-4 py-2 rounded-r-lg hover:bg-green-700 transition-colors flex items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaTag className="mr-2" />
                    Add
                  </motion.button>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex justify-end pt-4 border-t border-gray-100 mt-8"
                variants={itemVariant}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={`/planting-plans/${planId}`}
                    className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 mr-3 inline-flex items-center"
                  >
                    <FaTimes className="mr-2" />
                    Cancel
                  </Link>
                </motion.div>
                
                <motion.button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 flex items-center"
                  disabled={saving}
                  whileHover={!saving ? { scale: 1.05, boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" } : {}}
                  whileTap={!saving ? { scale: 0.95 } : {}}
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      Save Changes
                    </>
                  )}
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.form>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default PlantingPlanEditPage;