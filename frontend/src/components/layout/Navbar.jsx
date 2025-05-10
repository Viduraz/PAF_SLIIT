import { Link } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function Navbar() {
  const { currentUser, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };
  
  return (
    <nav className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-600 backdrop-filter backdrop-blur-sm shadow-lg relative z-50">
      {/* Decorative element */}
      <div className="absolute inset-0 bg-white opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <pattern id="leaf-pattern" width="70" height="70" patternUnits="userSpaceOnUse" patternTransform="rotate(25)">
            <path d="M10,10 C30,30 30,50 10,50 C-10,50 -10,30 10,10" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#leaf-pattern)" />
        </svg>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link className="flex items-center text-white font-bold text-xl" to="/">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v18m0-18c-3.333 2.667-6 4-8 4 0 6.667 2.667 10 8 10 5.333 0 8-3.333 8-10-2 0-4.667-1.333-8-4z" />
                </svg>
                <span className="font-extrabold tracking-wider">Agri</span>
                <span className="font-light tracking-tight">App</span>
              </Link>
            </motion.div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <motion.button 
              whileTap={{ scale: 0.95 }}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span className="sr-only">Open main menu</span>
              {!showDropdown ? (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </motion.button>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden sm:flex sm:items-center sm:flex-1 ml-6 justify-between">
            {/* Main nav links */}
            <div className="flex items-center space-x-1">
              {[
                { path: "/", label: "Home", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
                { path: "/planting-plans", label: "Planting Plans", icon: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8" },
                { path: "/posts", label: "Community", icon: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" },
                { path: "/weather", label: "Weather", icon: "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" }
              ].map((link) => (
                <motion.div 
                  key={link.path}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  <Link 
                    className="text-white hover:bg-white/10 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center" 
                    to={link.path}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={link.icon} />
                    </svg>
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              
              {/* Special highlighted button for Track New Plant */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  className="bg-white text-green-600 hover:bg-green-50 px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-all duration-300 flex items-center space-x-1.5"
                  to="/plantingfoam"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Track Plant</span>
                </Link>
              </motion.div>
            </div>

            {/* Profile section */}
            <div className="flex items-center ml-4">
              {currentUser ? (
                <div className="relative" ref={dropdownRef}>
                  <motion.button 
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center text-sm font-medium text-white px-3 py-2 rounded-lg transition-all duration-300"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    {currentUser.profilePicture ? (
                      <img 
                        src={currentUser.profilePicture} 
                        alt={currentUser.username} 
                        className="rounded-full mr-2 h-8 w-8 object-cover border-2 border-white shadow-sm" 
                      />
                    ) : (
                      <div className="rounded-full bg-white text-green-600 flex items-center justify-center mr-2 h-8 w-8 text-md font-bold border-2 border-white shadow-sm">
                        {currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : 
                         currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 
                         currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : '?'}
                      </div>
                    )}
                    <span className="hidden md:block">{currentUser?.username || currentUser?.name || currentUser?.email || 'User'}</span>
                    <svg className="ml-1 h-5 w-5 hidden md:block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </motion.button>
                  
                  <AnimatePresence>
                    {showDropdown && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="origin-top-right absolute right-0 mt-2 w-56 rounded-xl shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm text-gray-500">Signed in as</p>
                          <p className="text-sm font-medium text-gray-800 truncate">{currentUser?.email || 'User'}</p>
                        </div>
                        
                        <Link 
                          to="/profile" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                          onClick={() => setShowDropdown(false)}
                        >
                          <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            My Profile
                          </span>
                        </Link>
                        <Link 
                          to="/plant-progress" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                          onClick={() => setShowDropdown(false)}
                        >
                          <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            My Progress
                          </span>
                        </Link>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button 
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          onClick={handleLogout}
                        >
                          <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign out
                          </span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/login" className="text-white hover:bg-white/10 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300">
                      Sign in
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/register" className="bg-white text-green-600 hover:bg-green-50 px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-all duration-300">
                      Join now
                    </Link>
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu with smooth animations */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="sm:hidden bg-green-700/90 backdrop-blur-md"
            id="mobile-menu"
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="px-2 pt-2 pb-3 space-y-1 max-h-[70vh] overflow-y-auto"
            >
              {[
                { path: "/", label: "Home", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
                { path: "/planting-plans", label: "Planting Plans", icon: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8" },
                { path: "/plantingfoam", label: "Track New Plant", icon: "M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" },
                { path: "/posts", label: "Community Posts", icon: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" },
                { path: "/weather", label: "Weather", icon: "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" }
              ].map((link, index) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link 
                    to={link.path} 
                    className={`flex items-center text-white ${link.path === "/plantingfoam" ? "bg-white/20" : "hover:bg-white/10"} px-3 py-3 rounded-lg font-medium transition-all duration-300`}
                    onClick={() => setShowDropdown(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={link.icon} />
                    </svg>
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              
              {currentUser ? (
                <>
                  <div className="border-t border-white/20 my-2"></div>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link 
                      to="/profile" 
                      className="flex items-center text-white hover:bg-white/10 px-3 py-3 rounded-lg font-medium transition-all duration-300"
                      onClick={() => setShowDropdown(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link 
                      to="/plant-progress" 
                      className="flex items-center text-white hover:bg-white/10 px-3 py-3 rounded-lg font-medium transition-all duration-300"
                      onClick={() => setShowDropdown(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      My Progress
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <button 
                      onClick={handleLogout}
                      className="flex items-center w-full text-left text-white hover:bg-white/10 px-3 py-3 rounded-lg font-medium transition-all duration-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign out
                    </button>
                  </motion.div>
                </>
              ) : (
                <>
                  <div className="border-t border-white/20 my-2"></div>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="px-2 pt-2 pb-3 flex flex-col space-y-2"
                  >
                    <Link 
                      to="/login" 
                      className="flex items-center justify-center text-white border border-white/30 hover:bg-white/10 px-3 py-3 rounded-lg font-medium transition-all duration-300"
                      onClick={() => setShowDropdown(false)}
                    >
                      Sign in
                    </Link>
                    <Link 
                      to="/register" 
                      className="flex items-center justify-center bg-white text-green-600 hover:bg-green-50 px-3 py-3 rounded-lg font-medium shadow-md transition-all duration-300"
                      onClick={() => setShowDropdown(false)}
                    >
                      Create an account
                    </Link>
                  </motion.div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;