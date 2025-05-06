// src/pages/HomePage.js
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { FaSeedling, FaUsers, FaMedal, FaLeaf } from 'react-icons/fa';
import agriImage from '../images/home/agri.png'; // ✅ Import the image

function HomePage() {
  const { currentUser } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl shadow-lg overflow-hidden mb-12">
        <div className="bg-opacity-90 bg-green-800 bg-blend-overlay p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-md">
            Welcome to <span className="text-yellow-300">Agri-App!</span>
          </h1>
          <p className="text-xl text-white mb-6 max-w-3xl drop-shadow">
            Your platform for tracking plant growth, sharing agricultural knowledge,
            and connecting with a community of plant enthusiasts.
          </p>

          {/* ✅ Added Agri Image */}
          <img
            src={agriImage}
            alt="Sri Lankan Agriculture"
            className="w-full max-w-full mx-auto rounded-lg shadow-lg mb-6"
          />

          <div className="h-0.5 bg-white bg-opacity-30 w-full my-6"></div>

          {currentUser ? (
            <div className="space-y-4">
              <p className="text-white text-lg">Track your plants, share your progress, and learn from others.</p>
              <div className="flex flex-wrap gap-3">
                <Link to="/plans" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-md transform hover:-translate-y-1 transition-all duration-200 flex items-center">
                  <FaSeedling className="mr-2" /> View Planting Plans
                </Link>
                <Link to="/posts" className="bg-white hover:bg-gray-100 text-green-700 px-6 py-3 rounded-lg shadow-md transform hover:-translate-y-1 transition-all duration-200 flex items-center">
                  <FaUsers className="mr-2" /> Browse Community Posts
                </Link>
                <Link to="/plant-progress/:progressId" className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg shadow-md transform hover:-translate-y-1 transition-all duration-200 flex items-center">
                  <FaLeaf className="mr-2" /> Add Plant Progress
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-white text-lg">Join our community today to start your plant growing journey!</p>
              <div className="flex flex-wrap gap-3">
                <Link to="/register" className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg shadow-md transform hover:-translate-y-1 transition-all duration-200 flex items-center">
                  <FaUsers className="mr-2" /> Sign Up
                </Link>
                <Link to="/login" className="bg-white hover:bg-gray-100 text-green-700 px-6 py-3 rounded-lg shadow-md transform hover:-translate-y-1 transition-all duration-200 flex items-center">
                  Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {/* Card 1 */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-green-500">
          <div className="p-6">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
              <FaSeedling className="text-green-500 text-2xl" />
            </div>
            <h5 className="text-xl font-bold text-center text-green-800 mb-3">Track Plant Progress</h5>
            <p className="text-gray-700 text-center">Monitor your plants' growth journey with our progress tracking system.</p>
            <div className="mt-6 text-center">
              <Link to="/plants" className="inline-block text-green-600 hover:text-green-800 font-medium border-b-2 border-green-400 hover:border-green-600 transition-colors">
                Start Tracking →
              </Link>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-blue-500">
          <div className="p-6">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
              <FaUsers className="text-blue-500 text-2xl" />
            </div>
            <h5 className="text-xl font-bold text-center text-blue-800 mb-3">Share Knowledge</h5>
            <p className="text-gray-700 text-center">Contribute to the community by sharing your agricultural expertise.</p>
            <div className="mt-6 text-center">
              <Link to="/community" className="inline-block text-blue-600 hover:text-blue-800 font-medium border-b-2 border-blue-400 hover:border-blue-600 transition-colors">
                Join Community →
              </Link>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-amber-500">
          <div className="p-6">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
              <FaMedal className="text-amber-500 text-2xl" />
            </div>
            <h5 className="text-xl font-bold text-center text-amber-800 mb-3">Earn Badges</h5>
            <p className="text-gray-700 text-center">Get recognized for your achievements with our badge system.</p>
            <div className="mt-6 text-center">
              <Link to="/badges" className="inline-block text-amber-600 hover:text-amber-800 font-medium border-b-2 border-amber-400 hover:border-amber-600 transition-colors">
                View Badges →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
