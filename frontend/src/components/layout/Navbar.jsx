import { Link } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaLeaf, FaSeedling, FaSearch, FaSun, FaMoon, 
  FaHome, FaMapMarkedAlt, FaUsers, FaCloudSun, FaPlus 
} from 'react-icons/fa';

function Navbar() {
  const { currentUser, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, searchRef]);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  return (
    <nav className={`
      fixed top-0 w-full z-50 transition-all duration-300
      ${scrolled ? 'py-2' : 'py-3'} 
      ${darkMode 
        ? 'bg-gradient-to-r from-green-900 to-emerald-800 text-white' 
        : 'bg-white/90 backdrop-blur-sm text-gray-800 border-b border-green-100'}
    `}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo - Left aligned */}
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center">
              <div className="p-2 rounded-full bg-green-100">
                <FaSeedling className="text-xl text-green-600" />
              </div>
              <div className="ml-2">
                <span className="font-bold text-xl">Agri Buddy</span>
                <span className="text-xs text-green-600 block">Grow Together</span>
              </div>
            </Link>
          </div>
          
          {/* Center - Navigation */}
          <div className="hidden md:flex items-center justify-center space-x-1">
            <Link to="/" className="px-3 py-2 rounded-md hover:bg-green-50 text-green-700">
              <FaHome className="inline mr-1" /> Home
            </Link>
            <Link to="/planting-plans" className="px-3 py-2 rounded-md hover:bg-green-50 text-green-700">
              <FaMapMarkedAlt className="inline mr-1" /> Plans
            </Link>
            <Link to="/posts" className="px-3 py-2 rounded-md hover:bg-green-50 text-green-700">
              <FaUsers className="inline mr-1" /> Community
            </Link>
            <Link to="/weather" className="px-3 py-2 rounded-md hover:bg-green-50 text-green-700">
              <FaCloudSun className="inline mr-1" /> Weather
            </Link>
            <Link to="/crop-disease-detector" className="px-3 py-2 rounded-md hover:bg-green-50 text-green-700">
              <FaLeaf className="inline mr-1" /> Disease Detector
            </Link>
          </div>
          
          {/* Right - Search, Theme, Auth buttons */}
          <div className="flex items-center space-x-3">
            <div ref={searchRef} className="relative hidden sm:block">
              <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 rounded-full hover:bg-green-100">
                <FaSearch className="text-green-600" />
              </button>
              
              {searchOpen && (
                <div className="absolute right-0 top-full mt-1">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="border border-green-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    autoFocus
                  />
                </div>
              )}
            </div>
            
            <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-green-100">
              {darkMode ? <FaSun className="text-yellow-300" /> : <FaMoon className="text-green-600" />}
            </button>
            
            {/* "New Plant" button */}
            <Link 
              to="/plantingfoam"
              className="hidden sm:flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md shadow-sm"
            >
              <FaPlus className="mr-1" /> New Plant
            </Link>
            
            {/* Auth buttons - clearly visible on right */}
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 hover:bg-green-50 p-2 rounded-md"
                >
                  <div className="h-8 w-8 rounded-full bg-green-200 flex items-center justify-center">
                    {currentUser.profilePicture ? (
                      <img src={currentUser.profilePicture} alt="Profile" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <span className="font-bold text-green-800">
                        {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <span className="hidden md:block">{currentUser?.username || 'User'}</span>
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-100">
                    <Link to="/profile" onClick={() => setShowDropdown(false)} className="block px-4 py-2 hover:bg-green-50 text-gray-700">
                      My Profile
                    </Link>
                    <Link to="/plant-progress" onClick={() => setShowDropdown(false)} className="block px-4 py-2 hover:bg-green-50 text-gray-700">
                      My Progress
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-red-50 text-red-600">
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="text-green-600 border border-green-500 px-4 py-1.5 rounded-md hover:bg-green-50">
                  Sign In
                </Link>
                <Link to="/register" className="bg-green-500 text-white px-4 py-1.5 rounded-md hover:bg-green-600 shadow-sm">
                  Sign Up
                </Link>
              </div>
            )}
            
            {/* Mobile menu button */}
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="md:hidden p-2 rounded-md hover:bg-green-50"
            >
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile dropdown menu */}
      {showDropdown && (
        <div className="md:hidden bg-white shadow-lg mt-2 rounded-b-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link to="/" onClick={() => setShowDropdown(false)} className="block px-3 py-2 rounded-md hover:bg-green-50 text-green-700">
              <FaHome className="inline mr-2" /> Home
            </Link>
            <Link to="/planting-plans" onClick={() => setShowDropdown(false)} className="block px-3 py-2 rounded-md hover:bg-green-50 text-green-700">
              <FaMapMarkedAlt className="inline mr-2" /> Plans
            </Link>
            <Link to="/posts" onClick={() => setShowDropdown(false)} className="block px-3 py-2 rounded-md hover:bg-green-50 text-green-700">
              <FaUsers className="inline mr-2" /> Community
            </Link>
            <Link to="/weather" onClick={() => setShowDropdown(false)} className="block px-3 py-2 rounded-md hover:bg-green-50 text-green-700">
              <FaCloudSun className="inline mr-2" /> Weather
            </Link>
            <Link to="/crop-disease-detector" onClick={() => setShowDropdown(false)} className="block px-3 py-2 rounded-md hover:bg-green-50 text-green-700">
              <FaLeaf className="inline mr-2" /> Disease Detector
            </Link>
            <Link to="/plantingfoam" onClick={() => setShowDropdown(false)} className="block px-3 py-2 rounded-md bg-green-500 text-white">
              <FaPlus className="inline mr-2" /> New Plant
            </Link>
            
            {!currentUser && (
              <div className="border-t border-gray-200 mt-2 pt-2 flex flex-col space-y-1">
                <Link to="/login" onClick={() => setShowDropdown(false)} className="block px-3 py-2 text-center border border-green-500 rounded-md text-green-600">
                  Sign In
                </Link>
                <Link to="/register" onClick={() => setShowDropdown(false)} className="block px-3 py-2 text-center bg-green-500 rounded-md text-white">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;