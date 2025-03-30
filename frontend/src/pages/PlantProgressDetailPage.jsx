import React, { useState } from "react";
import { useAuth } from "../utils/AuthContext";
import { CheckCircle, Circle, Plus } from "lucide-react";

const PlantProgressDetailPage = () => {
  const { currentUser } = useAuth();
  const [steps, setSteps] = useState([]);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [formInput, setFormInput] = useState("");
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [notes, setNotes] = useState({}); // Object to store notes for each step

  const handleInputChange = (e) => {
    setFormInput(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedSteps = formInput
      .split("\n")
      .map((step) => step.trim())
      .filter((step) => step.length > 0);
    setSteps(parsedSteps);
    setProgress(0);
    setCompleted(false);
    setCompletedSteps(new Array(parsedSteps.length).fill(false));
    setFormInput("");
  };

  const toggleStepCompletion = (index) => {
    if (!isEditMode && completedSteps[index]) {
      // In normal mode, if the step is already completed, do nothing
      return;
    }

    // If the previous step is not completed and we're not in edit mode, prevent going ahead
    if (index > 0 && !completedSteps[index - 1] && !isEditMode) {
      return;
    }

    // Toggle step completion in edit mode or normal mode
    const newCompletedSteps = [...completedSteps];
    newCompletedSteps[index] = !newCompletedSteps[index];
    setCompletedSteps(newCompletedSteps);

    // If the step is undone, also remove the note
    if (!newCompletedSteps[index]) {
      const newNotes = { ...notes };
      delete newNotes[index]; // Remove the note when the step is undone
      setNotes(newNotes);
    }

    // Update progress
    const completedCount = newCompletedSteps.filter((step) => step).length;
    const newProgress = Math.round((completedCount / steps.length) * 100);
    setProgress(newProgress);

    // If all steps are completed
    if (newProgress === 100) {
      setCompleted(true);
    } else {
      setCompleted(false);
    }
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  // Function to handle adding notes
  const handleNoteChange = (index, event) => {
    const newNotes = { ...notes, [index]: event.target.value };
    setNotes(newNotes);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      {currentUser && (
        <div className="text-center text-xl font-semibold mb-4">
          Welcome, {currentUser.username}!
        </div>
      )}

      <h2 className="text-2xl font-semibold text-center mb-4">
        Track Your Plant's Progress
      </h2>

      <form onSubmit={handleSubmit} className="mb-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Enter steps (one per line):
        </label>
        <textarea
          value={formInput}
          onChange={handleInputChange}
          rows="5"
          className="w-full px-3 py-2 border rounded-md text-gray-700"
          placeholder="Step 1: Prepare soil... (Enter steps one per line)"
        />
        <button
          type="submit"
          className="mt-4 w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
        >
          Submit Steps
        </button>
      </form>

      {/* Progress bar */}
      <div className="bg-white p-10 rounded-lg shadow-md  max-w-screen-xl mx-auto">
      {" "}
        <div className="relative pt-1 mb-4">
          <div className="relative pt-1 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-green-600">
                Progress
              </span>
              <span className="text-sm font-semibold text-green-600">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div
                className="bg-green-300 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
        {/* Steps buttons */}
        {steps.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <button
                  className={`flex items-center justify-between px-6 py-3 border rounded-lg transition-all duration-300 text-left ${
                    completedSteps[index]
                      ? "bg-green-500 text-white"
                      : "bg-white text-gray-700"
                  } hover:shadow-md`}
                  onClick={() => toggleStepCompletion(index)}
                  disabled={!isEditMode && completedSteps[index]} // Disable if already completed and not in edit mode
                >
                  <span>{`Stage ${index + 1}: ${step}`}</span>
                  {completedSteps[index] ? (
                    <CheckCircle size={24} />
                  ) : (
                    <Circle size={24} />
                  )}
                </button>

                {/* Only show the Plus icon if the step is completed */}
                {completedSteps[index] && (
                  <button
                    type="button"
                    onClick={() => {
                      // Open note input on Plus icon click
                      const newNotes = { ...notes };
                      if (!newNotes[index]) {
                        newNotes[index] = "";
                      }
                      setNotes(newNotes);
                    }}
                    className="mt-2 text-green-500 hover:text-green-600"
                  >
                    <Plus size={20} />
                  </button>
                )}

                {/* Notes input field */}
                {notes[index] !== undefined && (
                  <textarea
                    value={notes[index]}
                    onChange={(e) => handleNoteChange(index, e)}
                    rows="3"
                    className="mt-2 w-full px-3 py-2 border rounded-md text-gray-700"
                    placeholder="Add your notes here..."
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Congratulations message */}
      {completed && (
        <div className="mt-4 text-center text-xl font-bold text-green-600">
          Congratulations! Your plant is fully grown! 🌱🎉
        </div>
      )}

      {/* Edit Mode Toggle Button */}
      <button
        onClick={toggleEditMode}
        className="mt-4 w-full px-4 py-2 bg-green-900 text-white rounded-lg hover:bg-blue-600 transition"
      >
        {isEditMode ? "Exit Edit Mode" : "Edit Mode"}
      </button>
    </div>
  );
};

export default PlantProgressDetailPage;
