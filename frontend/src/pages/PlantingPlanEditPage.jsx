import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaSave, FaTimes, FaLeaf, FaTag, FaEye, FaEyeSlash } from 'react-icons/fa';
import PlantingPlanService from '../services/plantingPlanService';
import { useAuth } from '../utils/AuthContext';

// Animation variants
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

function PlantingPlanEditPage() {
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
        tags
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

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
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
        <div className="bg-gradient-to-r from-green-600 to-green-500 p-5 text-white">
          <h1 className="text-2xl font-bold">Edit Planting Plan</h1>
          <p className="text-green-100 mt-1">Updating: {plan?.title}</p>
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