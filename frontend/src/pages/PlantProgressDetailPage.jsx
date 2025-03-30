import React, { useState } from "react";
import { useAuth } from "../utils/AuthContext";
import { CheckCircle, Circle, Plus } from "lucide-react";
import leafIcon from "../images/progress/leaf.png"; // Importing the image

const PlantProgressDetailPage = () => {
  const { currentUser } = useAuth();
  const [steps, setSteps] = useState([]);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [formInput, setFormInput] = useState("");
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [notes, setNotes] = useState({});

  const handleInputChange = (e) => setFormInput(e.target.value);

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
    if (!isEditMode && completedSteps[index]) return;
    if (index > 0 && !completedSteps[index - 1] && !isEditMode) return;

    const newCompletedSteps = [...completedSteps];
    newCompletedSteps[index] = !newCompletedSteps[index];
    setCompletedSteps(newCompletedSteps);

    const completedCount = newCompletedSteps.filter((step) => step).length;
    const newProgress = Math.round((completedCount / steps.length) * 100);
    setProgress(newProgress);

    if (newProgress === 100) setCompleted(true);
    else setCompleted(false);

    // Remove note if step is undone in edit mode
    if (isEditMode && !newCompletedSteps[index]) {
      const newNotes = { ...notes };
      delete newNotes[index];
      setNotes(newNotes);
    }
  };

  const toggleEditMode = () => setIsEditMode(!isEditMode);

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
      <div className="bg-white p-10 rounded-lg shadow-md w-full max-w-screen-xl mx-auto">
        <div className="relative pt-1 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-green-600">Progress</span>
            <span className="text-sm font-semibold text-green-600">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div
              className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Steps buttons */}
        {steps.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <button
                  className={`flex items-center gap-3 px-6 py-3 border rounded-lg transition-all duration-300 text-left ${
                    completedSteps[index]
                      ? "bg-green-500 text-white"
                      : "bg-white text-gray-700"
                  } hover:shadow-md`}
                  onClick={() => toggleStepCompletion(index)}
                  disabled={!isEditMode && completedSteps[index]}
                >
                  {/* Leaf Image */}
                  <img src={leafIcon} alt="Leaf" className="w-6 h-6" />

                  <span>{`Stage ${index + 1}: ${step}`}</span>
                  {completedSteps[index] ? <CheckCircle size={24} /> : <Circle size={24} />}
                </button>

                {/* Plus icon to add notes */}
                <button
                  type="button"
                  onClick={() => {
                    const newNotes = { ...notes };
                    if (!newNotes[index]) newNotes[index] = "";
                    setNotes(newNotes);
                  }}
                  className="mt-2 text-green-500 hover:text-green-600"
                >
                  <Plus size={20} />
                </button>

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
        className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      >
        {isEditMode ? "Exit Edit Mode" : "Edit Mode"}
      </button>
    </div>
  );
};

export default PlantProgressDetailPage;
