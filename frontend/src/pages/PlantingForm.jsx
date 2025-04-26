import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import PlantingPlanService from '../services/plantingPlanService';
import '../styles/cursor.css';

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

    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        // Redirect if not authenticated
        if (!isAuthenticated) {
            navigate('/login?redirect=plantingfoam');
            return;
        }
        
        const updateMousePosition = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', updateMousePosition);

        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
        };
    }, [isAuthenticated, navigate]);

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
                userId: currentUser._id,
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
                navigate(`/planting-plans/${response.data.id}`);
            }, 1500);
        } catch (err) {
            console.error("Error creating planting plan:", err);
            setError("Failed to create planting plan. Please try again.");
            setLoading(false);
        }
    };

    return (
        <>
            <motion.div
                className="custom-cursor"
                animate={{
                    x: mousePosition.x - 16,
                    y: mousePosition.y - 16,
                    rotate: mousePosition.x * 0.05,
                    scale: 1
                }}
                whileTap={{ scale: 0.8 }}
                transition={{
                    type: "spring",
                    damping: 12,
                    stiffness: 150,
                    mass: 0.1
                }}
            >
                <motion.span 
                    className="cursor-content"
                    animate={{ 
                        rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    🌿
                </motion.span>
            </motion.div>
            <motion.div 
                className="leaf-cursor min-h-screen bg-gradient-to-b from-green-50 to-green-100 py-12 px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <motion.div 
                    initial={{ y: -20 }}
                    animate={{ y: 0 }}
                    className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden"
                >
                    <motion.div 
                        whileHover={{ scale: 1.01 }}
                        className="bg-green-600 py-6 px-8"
                    >
                        <motion.h1 
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="text-3xl font-bold text-center text-white"
                        >
                            🌱 Plant Growth Tracking System
                        </motion.h1>
                        <p className="text-center text-green-100 mt-2">
                            Track and monitor your plant's journey from seed to harvest
                        </p>
                    </motion.div>
                    
                    <motion.div className="p-8">
                        <motion.div
                            initial={{ rotate: -10, scale: 0.9 }}
                            animate={{ 
                                rotate: 5,
                                scale: 1.1,
                                transition: {
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatType: "reverse",
                                    ease: "easeInOut"
                                }
                            }}
                            className="absolute top-10 right-10 text-8xl transform -rotate-12 opacity-30 select-none floating-leaf"
                            style={{ zIndex: 0 }}
                        >
                            🌿
                        </motion.div>
                        <motion.div
                            initial={{ rotate: 10, scale: 0.9 }}
                            animate={{ 
                                rotate: -5,
                                scale: 1.1,
                                transition: {
                                    duration: 2.5,
                                    repeat: Infinity,
                                    repeatType: "reverse",
                                    ease: "easeInOut"
                                }
                            }}
                            className="absolute bottom-10 left-10 text-8xl transform rotate-45 opacity-30 select-none floating-leaf"
                            style={{ zIndex: 0 }}
                        >
                            🌿
                        </motion.div>
                        
                        {/* Success message */}
                        {success && (
                            <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                                <strong className="font-bold">Success!</strong>
                                <span className="block sm:inline"> Your planting plan has been created. Redirecting you to the details page...</span>
                            </div>
                        )}
                        
                        {/* Error message */}
                        {error && (
                            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                                <strong className="font-bold">Error!</strong>
                                <span className="block sm:inline"> {error}</span>
                            </div>
                        )}
                        
                        {/* Form content */}
                        <form onSubmit={handleSubmit} className="space-y-6 relative" style={{ zIndex: 1 }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Plant Type</label>
                                    <select
                                        name="plantType"
                                        value={plantingData.plantType}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                        required
                                        disabled={loading}
                                    >
                                        <option value="">Select a plant type</option>
                                        {Object.entries(plantCategories).map(([category, plants]) => (
                                            <optgroup key={category} label={category}>
                                                {plants.map((plant) => (
                                                    <option key={plant} value={plant}>
                                                        {plant}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                </div>

                                <div className="bg-green-50 p-4 rounded-lg">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date Planted</label>
                                    <input
                                        type="date"
                                        name="datePlanted"
                                        value={plantingData.datePlanted}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="mt-8">
                                <motion.h2 
                                    className="text-xl font-semibold text-gray-700 mb-4"
                                    whileHover={{ x: 5 }}
                                >
                                    Growth Steps
                                </motion.h2>
                                <AnimatePresence>
                                    {plantingData.steps.map((step, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -100 }}
                                            className="bg-green-50 p-6 rounded-lg mb-4 relative"
                                        >
                                            <div className="flex justify-between items-center mb-3">
                                                <label className="text-lg font-medium text-gray-700">
                                                    Step {index + 1}
                                                </label>
                                                {plantingData.steps.length > 1 && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleDeleteStep(index)}
                                                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                                        disabled={loading}
                                                    >
                                                        Remove Step
                                                    </button>
                                                )}
                                            </div>
                                            <textarea
                                                value={step.description}
                                                onChange={(e) => handleStepChange(index, e)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                                placeholder="Describe this growth step..."
                                                rows="3"
                                                required
                                                disabled={loading}
                                            />
                                            <div className="mt-3">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    📸 Add Photos for Step {index + 1}
                                                </label>
                                                <input
                                                    type="file"
                                                    onChange={(e) => handlePhotoChange(index, e)}
                                                    className="w-full"
                                                    multiple
                                                    disabled={loading}
                                                />
                                                <small className="text-gray-500 mt-1 block">
                                                    Note: Photo upload is not fully implemented in this version
                                                </small>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                <motion.button 
                                    type="button" 
                                    onClick={addStep}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                    disabled={loading}
                                >
                                    <span>➕ Add Another Step</span>
                                </motion.button>
                            </div>

                            <div className="bg-green-50 p-4 rounded-lg mt-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Expected Harvest Date</label>
                                <input
                                    type="date"
                                    name="expectedHarvest"
                                    value={plantingData.expectedHarvest}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <motion.button 
                                type="submit"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`w-full px-6 py-4 text-white text-lg font-semibold rounded-lg transition-colors mt-8 shadow-lg ${
                                    loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                                }`}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="inline-block animate-spin mr-2">🔄</span>
                                        Submitting...
                                    </>
                                ) : (
                                    <>🌿 Submit Planting Plan</>
                                )}
                            </motion.button>
                        </form>
                    </motion.div>
                </motion.div>
            </motion.div>
        </>
    );
}

export default PlantingForm;
