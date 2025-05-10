import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import PlantingPlanService from '../services/plantingPlanService';
import { FaSeedling, FaLeaf, FaCloudSun, FaCalendarAlt, FaImage, FaPlus, FaMinus, FaArrowRight } from 'react-icons/fa';

const plantCategories = {
    Vegetables: [
        'Tomato',
        'Carrot',
        'Lettuce',
        'Cucumber',
        'Bell Pepper',
        'Broccoli',
        'Spinach',
        'Green Beans'
    ],
    Fruits: [
        'Strawberry',
        'Watermelon',
        'Cantaloupe',
        'Grape',
        'Lemon'
    ],
    'Ornamental Plants': [
        'Rose',
        'Orchid',
        'Sunflower',
        'Tulip',
        'Lily'
    ]
};

// Static background image for form
const bgImage = 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80';

function PlantingForm() {
    const navigate = useNavigate();
    const { currentUser, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    
    const [plantingData, setPlantingData] = useState({
        plantType: '',
        datePlanted: '',
        expectedHarvest: '',
        steps: [{ description: '', photos: [] }]
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPlantingData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleStepChange = (index, e) => {
        const newSteps = plantingData.steps.map((step, stepIndex) => {
            if (index === stepIndex) {
                return { ...step, description: e.target.value };
            }
            return step;
        });
        setPlantingData(prevState => ({
            ...prevState,
            steps: newSteps
        }));
    };

    const handlePhotoChange = (index, e) => {
        const newSteps = plantingData.steps.map((step, stepIndex) => {
            if (index === stepIndex) {
                return { ...step, photos: [...step.photos, ...e.target.files] };
            }
            return step;
        });
        setPlantingData(prevState => ({
            ...prevState,
            steps: newSteps
        }));
    };

    const addStep = () => {
        setPlantingData(prevState => ({
            ...prevState,
            steps: [...prevState.steps, { description: '', photos: [] }]
        }));
    };

    const handleDeleteStep = (indexToDelete) => {
        setPlantingData(prevState => ({
            ...prevState,
            steps: prevState.steps.filter((_, index) => index !== indexToDelete)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);
        
        try {
            // Format data for API
            const planData = {
                title: `${plantingData.plantType} Planting Plan`,
                description: `Growing ${plantingData.plantType} from ${plantingData.datePlanted} with expected harvest on ${plantingData.expectedHarvest}`,
                userId: currentUser?._id || currentUser?.id,
                milestones: plantingData.steps.map((step, index) => ({
                    title: `Step ${index + 1}`,
                    description: step.description,
                    orderIndex: index,
                    resources: [] // Photo uploads would require a separate file upload service
                })),
                isPublic: true,
                tags: [plantingData.plantType.toLowerCase(), "growing", "planting"]
            };
            
            // Send to backend
            const response = await PlantingPlanService.createPlan(planData);
            
            setSuccess(true);
            setLoading(false);
            
            // Navigate to the created plan details page after a short delay
            setTimeout(() => {
                navigate(`/planting-plans/${response.data._id || response.data.id}`);
            }, 1500);
        } catch (err) {
            console.error("Error creating planting plan:", err);
            setError("Failed to create planting plan. Please try again.");
            setLoading(false);
        }
    };

    // If not authenticated, show a beautiful login prompt
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4" 
                style={{
                    backgroundImage: `url(${bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}>
                {/* Static background with overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-900/70 via-green-800/70 to-green-700/70 backdrop-blur-sm z-0"></div>

                {/* Login card with glass effect */}
                <motion.div
                    className="w-full max-w-md z-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl border border-white/20">
                        <div className="bg-gradient-to-r from-green-600 to-emerald-600 py-8 px-8 relative overflow-hidden">
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
                            <div className="relative z-10">
                                <h1 className="text-4xl font-bold text-center text-white drop-shadow-lg flex items-center justify-center">
                                    <span className="inline-block mr-3">
                                        <FaSeedling size={40} />
                                    </span>
                                    Plant Tracker
                                </h1>
                                <p className="text-center text-white/80 mt-3 text-lg">
                                    Document your green journey
                                </p>
                            </div>
                        </div>

                        <div className="p-8 bg-gradient-to-b from-white/5 to-white/10 text-center relative">
                            <div className="absolute w-40 h-40 bg-emerald-300/10 rounded-full blur-3xl -bottom-20 -left-20"></div>
                            
                            <div className="relative z-10">
                                <div className="text-8xl mb-6 flex justify-center">
                                    🌱
                                </div>
                                <h2 className="text-2xl font-semibold mb-4 text-white">Authentication Required</h2>
                                <p className="mb-8 text-white/80 text-lg">Login to create and track your planting plans</p>
                                
                                <div className="flex flex-col space-y-4">
                                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                        <Link 
                                            to="/login?redirect=plantingfoam" 
                                            className="w-full px-6 py-4 text-white text-lg font-semibold rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg flex items-center justify-center"
                                        >
                                            <FaArrowRight className="mr-2" /> Log In
                                        </Link>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                        <Link 
                                            to="/register" 
                                            className="w-full px-6 py-4 text-white text-lg font-semibold rounded-lg border border-white/30 backdrop-blur-sm hover:bg-white/10 transition-all flex items-center justify-center"
                                        >
                                            <FaPlus className="mr-2" /> Create Account
                                        </Link>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Main form for authenticated users
    return (
        <div className="min-h-screen relative overflow-hidden"
            style={{
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}>
            {/* Static background with overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-900/70 via-green-800/70 to-emerald-900/70 backdrop-blur-sm z-0"></div>

            {/* Main form container */}
            <div className="py-16 px-4 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto bg-white/10 backdrop-blur-2xl rounded-2xl shadow-2xl overflow-hidden border border-white/20"
                >
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 py-8 px-8 relative overflow-hidden">
                        {/* Decorative elements */}
                        <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center justify-center mb-2">
                                <div className="inline-block mr-4">
                                    <FaSeedling size={50} className="text-green-200" />
                                </div>
                                <h1 className="text-4xl font-bold text-white">Plant Growth Tracker</h1>
                            </div>
                            <p className="text-center text-green-100 text-lg">
                                Document and monitor your plant's journey from seed to harvest
                            </p>
                        </div>
                    </div>
                    
                    <div className="p-8 bg-gradient-to-b from-white/5 to-white/10 relative">
                        {/* Success message */}
                        {success && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 bg-green-500/80 backdrop-blur-sm border border-green-400 text-white px-6 py-4 rounded-xl relative"
                                role="alert"
                            >
                                <div className="flex items-center">
                                    <div className="mr-3">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <strong className="font-bold">Success!</strong>
                                        <span className="block sm:inline"> Your planting plan has been created. Redirecting you to the details page...</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        
                        {/* Error message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 bg-red-500/80 backdrop-blur-sm border border-red-400 text-white px-6 py-4 rounded-xl relative"
                                role="alert"
                            >
                                <div className="flex items-center">
                                    <div className="mr-3">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <strong className="font-bold">Error!</strong>
                                        <span className="block sm:inline"> {error}</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        
                        {/* Form content */}
                        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                            <motion.div 
                                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.4 }}
                            >
                                <motion.div 
                                    className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/20"
                                    whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                >
                                    <label className="block text-lg font-semibold text-white mb-3 flex items-center">
                                        <FaLeaf className="mr-2 text-green-300" /> Plant Type
                                    </label>
                                    <select
                                        name="plantType"
                                        value={plantingData.plantType}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-4 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-white"
                                        required
                                        disabled={loading}
                                    >
                                        <option value="" className="bg-green-800 text-white">Select a plant type</option>
                                        {Object.entries(plantCategories).map(([category, plants]) => (
                                            <optgroup key={category} label={category} className="bg-green-800 text-white">
                                                {plants.map((plant) => (
                                                    <option key={plant} value={plant} className="bg-green-800 text-white">
                                                        {plant}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                </motion.div>

                                <motion.div 
                                    className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/20"
                                    whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                >
                                    <label className="block text-lg font-semibold text-white mb-3 flex items-center">
                                        <FaCalendarAlt className="mr-2 text-green-300" /> Date Planted
                                    </label>
                                    <input
                                        type="date"
                                        name="datePlanted"
                                        value={plantingData.datePlanted}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-4 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-white"
                                        required
                                        disabled={loading}
                                    />
                                </motion.div>
                            </motion.div>

                            <motion.div 
                                className="mt-10"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.4 }}
                            >
                                <div className="text-2xl font-semibold text-white mb-6 flex items-center">
                                    <FaCloudSun className="mr-3 text-yellow-300" /> Growth Stages
                                </div>
                                <AnimatePresence>
                                    {plantingData.steps.map((step, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9, x: -100 }}
                                            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md p-6 rounded-xl mb-6 relative shadow-lg border border-white/20"
                                        >
                                            <div className="flex justify-between items-center mb-4">
                                                <label className="text-xl font-medium text-white flex items-center">
                                                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center mr-3 shadow-sm">
                                                        <span className="text-white font-bold">{index + 1}</span>
                                                    </div>
                                                    Growth Stage {index + 1}
                                                </label>
                                                {plantingData.steps.length > 1 && (
                                                    <motion.button 
                                                        type="button"
                                                        onClick={() => handleDeleteStep(index)}
                                                        className="px-4 py-2 bg-red-500/80 text-white rounded-lg hover:bg-red-600/90 transition-colors flex items-center"
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        disabled={loading}
                                                    >
                                                        <FaMinus className="mr-2" /> Remove
                                                    </motion.button>
                                                )}
                                            </div>
                                            <textarea
                                                value={step.description}
                                                onChange={(e) => handleStepChange(index, e)}
                                                className="w-full px-4 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-white"
                                                placeholder="Describe this growth stage in detail..."
                                                rows="4"
                                                required
                                                disabled={loading}
                                            />
                                            <div className="mt-4">
                                                <label className="block text-base font-medium text-white mb-2 flex items-center">
                                                    <FaImage className="mr-2 text-green-300" /> Add Photos for Stage {index + 1}
                                                </label>
                                                <div className="flex items-center bg-white/10 rounded-lg p-3 border border-white/20">
                                                    <label className="cursor-pointer bg-white/20 backdrop-blur-sm hover:bg-white/30 px-4 py-2 rounded-md transition-colors text-white flex items-center">
                                                        <FaImage className="mr-2" /> Select Images
                                                        <input
                                                            type="file"
                                                            onChange={(e) => handlePhotoChange(index, e)}
                                                            className="hidden"
                                                            multiple
                                                            disabled={loading}
                                                            accept="image/*"
                                                        />
                                                    </label>
                                                    {step.photos.length > 0 && (
                                                        <span className="ml-3 text-sm text-white/80">
                                                            {step.photos.length} {step.photos.length === 1 ? 'file' : 'files'} selected
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-white/60 mt-2">
                                                    Note: Image uploads will be available in the next update
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                <motion.button 
                                    type="button" 
                                    onClick={addStep}
                                    whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full px-6 py-4 bg-gradient-to-r from-green-500/80 to-emerald-600/80 backdrop-blur-sm text-white rounded-xl hover:from-green-500/90 hover:to-emerald-600/90 transition-all flex items-center justify-center shadow-lg border border-white/20"
                                    disabled={loading}
                                >
                                    <FaPlus className="mr-2" /> Add Another Growth Stage
                                </motion.button>
                            </motion.div>

                            <motion.div 
                                className="bg-white/10 backdrop-blur-md p-6 rounded-xl mt-8 shadow-lg border border-white/20"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.4 }}
                                whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                            >
                                <label className="block text-lg font-semibold text-white mb-3 flex items-center">
                                    <FaCalendarAlt className="mr-2 text-green-300" /> Expected Harvest Date
                                </label>
                                <input
                                    type="date"
                                    name="expectedHarvest"
                                    value={plantingData.expectedHarvest}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-4 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-white"
                                    required
                                    disabled={loading}
                                />
                            </motion.div>

                            <motion.button 
                                type="submit"
                                whileHover={{ scale: 1.03, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                                whileTap={{ scale: 0.97 }}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8, duration: 0.4 }}
                                className={`w-full px-8 py-5 text-white text-xl font-semibold rounded-xl transition-all mt-10 shadow-xl border border-white/30 ${
                                    loading 
                                        ? 'bg-gray-500/70 backdrop-blur-sm cursor-not-allowed' 
                                        : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                                }`}
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating Your Plan...
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center">
                                        <FaSeedling className="mr-3 text-2xl" /> Create Planting Plan
                                    </div>
                                )}
                            </motion.button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default PlantingForm;
