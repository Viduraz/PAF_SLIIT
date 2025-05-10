import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaCamera, FaLeaf, FaExclamationTriangle, FaCloudUploadAlt, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../utils/AuthContext';

function CropDiseaseDetector() {
  const { isAuthenticated } = useAuth();
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.match('image.*')) {
      setError('Please select an image file (jpg, png, etc.)');
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      // Replace with your actual API endpoint
      const response = await fetch('/api/crop-disease/analyze', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError(err.message || 'Failed to analyze image. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRetry = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  // For demo purposes - mock results
  const handleDemoAnalysis = () => {
    setAnalyzing(true);
    setError(null);
    
    // Simulate API call delay
    setTimeout(() => {
      setResult({
        disease: 'Late Blight',
        confidence: 0.92,
        description: 'Late blight is a plant disease caused by the fungus-like oomycete pathogen Phytophthora infestans. It primarily affects plants in the Solanaceae family, including tomatoes and potatoes.',
        treatment: [
          'Remove and destroy all infected plant parts',
          'Apply fungicide containing chlorothalonil or copper compounds',
          'Ensure adequate spacing between plants for air circulation',
          'Water at the base of plants to keep foliage dry'
        ],
        preventiveMeasures: [
          'Use resistant varieties when available',
          'Apply preventive fungicides during humid conditions',
          'Practice crop rotation',
          'Remove plant debris at the end of the season'
        ]
      });
      setAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <h1 className="text-3xl font-bold text-green-800 mb-6 flex items-center">
          <FaLeaf className="mr-3 text-green-600" />
          Crop Disease Detector
        </h1>
        
        <p className="text-gray-600 mb-8">
          Upload a photo of your crop to identify potential diseases and get treatment recommendations.
          Our AI will analyze the image and provide insights to help you manage plant health issues.
        </p>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md">
            <div className="flex items-center">
              <FaExclamationTriangle className="mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          {!previewUrl ? (
            <div 
              className="h-64 border-2 border-dashed border-green-300 rounded-lg flex flex-col items-center justify-center bg-green-50 cursor-pointer hover:bg-green-100 transition-colors"
              onClick={() => fileInputRef.current.click()}
            >
              <FaCloudUploadAlt className="text-5xl text-green-500 mb-3" />
              <p className="text-green-700 font-medium">Click to upload an image of your plant</p>
              <p className="text-green-600 text-sm mt-2">or drag and drop (JPG, PNG)</p>
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          ) : (
            <div className="relative">
              <img 
                src={previewUrl} 
                alt="Crop preview" 
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <button 
                  onClick={handleRetry}
                  className="bg-white text-red-600 px-4 py-2 rounded-lg font-medium"
                >
                  Choose Different Image
                </button>
              </div>
            </div>
          )}
          
          <div className="p-6">
            {previewUrl && !analyzing && !result && (
              <motion.button
                onClick={handleDemoAnalysis} // Use handleUpload for real implementation
                className="w-full bg-green-600 text-white py-3 rounded-lg font-medium flex items-center justify-center hover:bg-green-700 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaCamera className="mr-2" />
                Analyze Image
              </motion.button>
            )}
            
            {analyzing && (
              <div className="text-center py-3">
                <FaSpinner className="animate-spin text-2xl text-green-600 mx-auto mb-2" />
                <p className="text-green-700">Analyzing your crop image...</p>
              </div>
            )}
            
            {result && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-5"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-800">Analysis Results</h3>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
                    {Math.round(result.confidence * 100)}% Confidence
                  </span>
                </div>
                
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                  <h4 className="font-bold text-red-700">Detected Issue: {result.disease}</h4>
                  <p className="text-gray-700 mt-1">{result.description}</p>
                </div>
                
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Recommended Treatment</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {result.treatment.map((item, index) => (
                      <li key={`treatment-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Preventive Measures</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {result.preventiveMeasures.map((item, index) => (
                      <li key={`prevention-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
                
                <motion.button
                  onClick={handleRetry}
                  className="w-full mt-4 border border-green-600 text-green-700 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Analyze Another Image
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
          <h3 className="font-bold text-blue-700 mb-2">How This Works</h3>
          <p className="text-gray-700">
            Our AI technology uses a machine learning model trained on thousands of plant disease images.
            For best results, take clear, well-lit photos of the affected plant parts. The system can 
            identify common diseases in vegetables, fruits, and ornamental plants.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default CropDiseaseDetector;