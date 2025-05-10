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
    // In a real implementation, we'd also update a theme context or localStorage
  };
  
  return (
    <nav className={`
      fixed top-0 w-full z-50 transition-all duration-300
      ${scrolled ? 'py-2' : 'py-4'}
      ${darkMode 
        ? 'bg-gradient-to-r from-indigo-900 via-purple-800 to-indigo-900 text-white shadow-lg shadow-indigo-900/20' 
        : 'bg-gradient-to-r from-green-50 to-emerald-50 text-gray-800 shadow-sm'}
    `}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center"
          >
            <Link to="/" className="flex items-center space-x-2">
              <div className={`
                p-2 rounded-full ${darkMode ? 'bg-white/10' : 'bg-gradient-to-br from-green-200 to-green-300'}
              `}>
                <FaSeedling className={`text-xl ${darkMode ? 'text-green-300' : 'text-green-600'}`} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl tracking-tight">AgriApp</span>
                <span className="text-xs tracking-wider opacity-70">Grow Together</span>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3">
            {[
              { path: "/", icon: <FaHome />, label: "Home" },
              { path: "/planting-plans", icon: <FaMapMarkedAlt />, label: "Plans" },
              { path: "/posts", icon: <FaUsers />, label: "Community" },
              { path: "/weather", icon: <FaCloudSun />, label: "Weather" },
              { path: "/crop-disease-detector", icon: <FaLeaf />, label: "Disease Detector" }
            ].map((item) => (
              <motion.div 
                key={item.path}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                className="relative"
              >
                <Link 
                  to={item.path} 
                  className={`
                    px-4 py-3 rounded-full flex items-center space-x-1.5 font-medium
                    ${darkMode 
                      ? 'hover:bg-white/10 transition-colors' 
                      : 'hover:bg-green-100 text-green-800 hover:text-green-700 transition-colors'}
                  `}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
                <motion.div 
                  className={`h-1 rounded-full bg-green-500 absolute bottom-0 left-0 right-0 mx-auto`}
                  initial={{ width: 0, opacity: 0 }}
                  whileHover={{ width: '50%', opacity: 1 }}
                  transition={{ duration: 0.3 }}
                ></motion.div>
              </motion.div>
            ))}
          </div>

          {/* Right side - Search, Theme toggle, Auth */}
          <div className="flex items-center space-x-3">
            {/* Search */}
            <motion.div 
              className="relative"
              ref={searchRef}
              initial={false}
              animate={searchOpen ? "open" : "closed"}
              variants={{
                open: { width: "200px" },
                closed: { width: "40px" }
              }}
            >
              <motion.button 
                onClick={() => setSearchOpen(!searchOpen)}
                className={`
                  p-2 rounded-full flex items-center justify-center
                  ${darkMode ? 'hover:bg-white/10' : 'hover:bg-green-100 bg-green-50'}
                  ${searchOpen ? (darkMode ? 'bg-white/10' : 'bg-green-100') : ''}
                `}
                whileTap={{ scale: 0.97 }}
              >
                <FaSearch className={darkMode ? 'text-white/90' : 'text-green-600'} />
              </motion.button>
              
              {searchOpen && (
                <motion.input
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  type="text"
                  placeholder="Search..."
                  className={`
                    absolute right-0 top-0 h-full rounded-full pl-10 pr-4
                    ${darkMode 
                      ? 'bg-white/10 text-white placeholder-white/50 border border-white/20' 
                      : 'bg-white text-gray-800 border border-green-200 shadow-sm'}
                    focus:outline-none focus:ring-2 
                    ${darkMode ? 'focus:ring-purple-400/50' : 'focus:ring-green-300/50'}
                  `}
                  autoFocus
                />
              )}
            </motion.div>

            {/* Theme toggle */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={toggleDarkMode}
              className={`
                p-2 rounded-full transition-colors
                ${darkMode ? 'hover:bg-white/10' : 'hover:bg-green-100 bg-green-50'}
              `}
            >
              {darkMode ? <FaSun className="text-yellow-200" /> : <FaMoon className="text-green-600" />}
            </motion.button>

            {/* New plant button - Always visible on desktop */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="hidden sm:block"
            >
              <Link 
                to="/plantingfoam" 
                className={`
                  flex items-center space-x-1 px-4 py-2 rounded-full font-medium transition-all
                  ${darkMode 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-400 text-white hover:shadow-lg hover:shadow-green-500/25' 
                    : 'bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:shadow-md hover:shadow-green-400/25'}
                `}
              >
                <FaPlus className="text-xs" />
                <span>New Plant</span>
              </Link>
            </motion.div>

            {/* Auth buttons or profile */}
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <motion.button 
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowDropdown(!showDropdown)}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-full
                    ${darkMode ? 'hover:bg-white/10' : 'hover:bg-green-100 bg-green-50'}
                  `}
                >
                  <div className={`
                    h-8 w-8 rounded-full flex items-center justify-center overflow-hidden
                    ${darkMode ? 'bg-purple-300 text-purple-900' : 'bg-green-300 text-green-800'} 
                    ${currentUser.profilePicture ? 'p-0' : 'border-2 border-white'}
                  `}>
                    {currentUser.profilePicture ? (
                      <img 
                        src={currentUser.profilePicture} 
                        alt={currentUser.username || 'User'} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="font-semibold text-sm">
                        {currentUser?.username?.charAt(0).toUpperCase() || 
                         currentUser?.name?.charAt(0).toUpperCase() || 
                         currentUser?.email?.charAt(0).toUpperCase() || '?'}
                      </span>
                    )}
                  </div>
                  <span className="hidden md:block font-medium">
                    {currentUser?.username || currentUser?.name || 'Account'}
                  </span>
                </motion.button>

                <AnimatePresence>
                  {showDropdown && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.2 }}
                      className={`
                        absolute right-0 mt-2 w-64 rounded-2xl overflow-hidden shadow-xl z-20
                        ${darkMode ? 'bg-gray-900 border border-purple-500/20' : 'bg-white border border-green-100'}
                      `}
                    >
                      <div className={`p-4 ${darkMode ? 'border-b border-gray-800' : 'border-b border-gray-100'}`}>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Signed in as</p>
                        <p className={`font-medium truncate ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {currentUser?.email || 'User'}
                        </p>
                      </div>
                      
                      <div className="p-2">
                        {[
                          { path: "/profile", icon: "user", label: "My Profile" },
                          { path: "/plant-progress", icon: "chart", label: "My Progress" },
                          { path: "/settings", icon: "settings", label: "Settings" }
                        ].map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setShowDropdown(false)}
                            className={`
                              block px-4 py-2 rounded-lg text-sm font-medium
                              ${darkMode 
                                ? 'hover:bg-white/10 text-white' 
                                : 'hover:bg-green-50 text-gray-700 hover:text-green-700'}
                            `}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                      
                      <div className={`p-2 ${darkMode ? 'border-t border-gray-800' : 'border-t border-gray-100'}`}>
                        <button
                          onClick={handleLogout}
                          className={`
                            w-full text-left px-4 py-2 rounded-lg text-sm font-medium
                            ${darkMode 
                              ? 'text-red-400 hover:bg-red-500/10' 
                              : 'text-red-600 hover:bg-red-50'}
                          `}
                        >
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                  <Link 
                    to="/login"
                    className={`
                      px-4 py-2 rounded-full text-sm font-medium
                      ${darkMode 
                        ? 'text-white border border-white/20 hover:bg-white/10' 
                        : 'text-green-700 border border-green-300 hover:bg-green-50 bg-white'}
                    `}
                  >
                    Sign In
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Link 
                    to="/register"
                    className={`
                      px-4 py-2 rounded-full text-sm font-medium
                      ${darkMode 
                        ? 'bg-white text-indigo-900' 
                        : 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'}
                      hover:shadow-lg transition-all
                    `}
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <motion.button 
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowDropdown(!showDropdown)}
                className={`
                  p-2 rounded-full
                  ${darkMode ? 'hover:bg-white/10' : 'hover:bg-green-100 bg-green-50'}
                `}
              >
                {!showDropdown ? (
                  <svg className={`h-6 w-6 ${darkMode ? 'text-white' : 'text-green-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className={`h-6 w-6 ${darkMode ? 'text-white' : 'text-green-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className={`
              md:hidden overflow-hidden
              ${darkMode ? 'bg-indigo-900/95 backdrop-blur-sm' : 'bg-white/95 backdrop-blur-sm shadow-lg'}
            `}
          >
            <div className="px-3 py-4 space-y-2">
              {/* Main navigation links */}
              {[
                { path: "/", icon: <FaHome className="mr-3" />, label: "Home" },
                { path: "/planting-plans", icon: <FaMapMarkedAlt className="mr-3" />, label: "Planting Plans" },
                { path: "/plantingfoam", icon: <FaPlus className="mr-3" />, label: "Track New Plant" },
                { path: "/posts", icon: <FaUsers className="mr-3" />, label: "Community" },
                { path: "/weather", icon: <FaCloudSun className="mr-3" />, label: "Weather" },
                { path: "/crop-disease-detector", icon: <FaLeaf className="mr-3" />, label: "Crop Disease Detector" }
              ].map((item, index) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <Link
                    to={item.path}
                    onClick={() => setShowDropdown(false)}
                    className={`
                      flex items-center py-3 px-4 rounded-xl font-medium
                      ${darkMode 
                        ? 'text-white hover:bg-white/10' 
                        : 'text-green-700 hover:bg-green-50 hover:text-green-800'}
                      ${item.path === "/plantingfoam" ? (darkMode ? 'bg-white/10' : 'bg-green-50') : ''}
                    `}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              {/* User actions */}
              {currentUser ? (
                <>
                  <div className={darkMode ? 'border-t border-white/10' : 'border-t border-green-100'} />
                  
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    <Link
                      to="/profile"
                      onClick={() => setShowDropdown(false)}
                      className={`
                        flex items-center py-3 px-4 rounded-xl font-medium
                        ${darkMode ? 'text-white hover:bg-white/10' : 'text-green-700 hover:bg-green-50'}
                      `}
                    >
                      <svg className={`mr-3 h-5 w-5 ${darkMode ? 'text-purple-300' : 'text-green-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </Link>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <button
                      onClick={handleLogout}
                      className={`
                        w-full flex items-center py-3 px-4 rounded-xl font-medium
                        ${darkMode ? 'text-red-300 hover:bg-red-500/20' : 'text-red-600 hover:bg-red-50'}
                      `}
                    >
                      <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </motion.div>
                </>
              ) : (
                <>
                  <div className={darkMode ? 'border-t border-white/10' : 'border-t border-green-100'} />
                  
                  <div className="px-4 py-3 flex flex-col space-y-3">
                    <Link
                      to="/login"
                      onClick={() => setShowDropdown(false)}
                      className={`
                        py-3 px-4 rounded-xl font-medium text-center
                        ${darkMode 
                          ? 'border border-white/20 text-white hover:bg-white/10' 
                          : 'border border-green-200 text-green-700 hover:bg-green-50'}
                      `}
                    >
                      Sign In
                    </Link>
                    
                    <Link
                      to="/register"
                      onClick={() => setShowDropdown(false)}
                      className={`
                        py-3 px-4 rounded-xl font-medium text-center
                        ${darkMode 
                          ? 'bg-white text-indigo-800' 
                          : 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'}
                      `}
                    >
                      Create an Account
                    </Link>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;