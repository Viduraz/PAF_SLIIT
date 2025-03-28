import React, { useState } from 'react';
import { useAuth } from '../utils/AuthContext'; // Import your AuthContext here

const PlantProgressDetailPage = () => {
  const { currentUser } = useAuth(); // Retrieve logged-in user info from AuthContext
  const [steps, setSteps] = useState([]); // Store the steps entered by the user
  const [progress, setProgress] = useState(0); // Progress value
  const [completed, setCompleted] = useState(false); // Track if the progress is completed
  const [formInput, setFormInput] = useState(''); // Store form input for steps

  // Handle input change for the steps form
  const handleInputChange = (e) => {
    setFormInput(e.target.value);
  };

  // Submit form and generate the steps
  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedSteps = formInput.split('\n').map(step => step.trim()).filter(step => step.length > 0);
    setSteps(parsedSteps); // Set the steps entered by the user
    setProgress(0); // Reset progress
    setCompleted(false); // Reset completed state
    setFormInput(''); // Clear the form input
  };

  // Update the progress when a step button is clicked
  const updateProgress = (increment) => {
    const newProgress = Math.min(progress + increment, 100); // Prevent progress from going over 100%
    setProgress(newProgress);
    if (newProgress === 100) {
      setCompleted(true); // Set completed to true when 100% is reached
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      {/* Display logged-in user's name at the top */}
      {currentUser && (
        <div className="text-center text-xl font-semibold mb-4">
          Welcome, {currentUser.username}!
        </div>
      )}

      <h2 className="text-2xl font-semibold text-center mb-4">Track Your Plant's Progress</h2>

      {/* Step Input Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">Enter steps (one per line):</label>
        <textarea
          value={formInput}
          onChange={handleInputChange}
          rows="5"
          className="w-full px-3 py-2 border rounded-md text-gray-700"
          placeholder="Step 1: Prepare soil... (Enter steps one per line)"
        />
        <button
          type="submit"
          className="mt-4 w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Submit Steps
        </button>
      </form>

      {/* Progress Bar */}
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-green-200 text-green-600">
              Progress
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600">
              {progress}%
            </span>
          </div>
        </div>
        <div className="flex mb-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-green-500 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Dynamically created buttons based on the steps */}
      {steps.length > 0 && (
        <div className="flex flex-col space-y-2">
          {steps.map((step, index) => (
            <button
              key={index}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              onClick={() => updateProgress((100 / steps.length))}
            >
              {`Stage ${index + 1}: ${step}`}
            </button>
          ))}
        </div>
      )}

      {/* Congratulations message */}
      {completed && (
        <div className="mt-4 text-center text-xl font-bold text-green-600">
          Congratulations! Your plant is fully grown! 🌱🎉
        </div>
      )}
    </div>
  );
};

export default PlantProgressDetailPage;
