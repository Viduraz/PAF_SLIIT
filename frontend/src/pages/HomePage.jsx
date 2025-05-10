import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { FaSeedling, FaUsers, FaMedal, FaLeaf, FaArrowDown, FaChevronRight, FaWind } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import agriImage from '../images/home/agri.png';

function HomePage() {
  const { currentUser } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  // Track mouse movement for parallax effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Create floating leaf particles
  const generateLeaves = (count) => {
    return Array.from({ length: count }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute text-green-500 opacity-40 z-0"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          fontSize: `${Math.random() * 20 + 10}px`,
        }}
        animate={{
          y: [0, Math.random() * 100 + 50],
          x: [0, Math.random() * 50 - 25],
          rotate: [0, Math.random() * 360],
          opacity: [0.4, 0]
        }}
        transition={{
          duration: Math.random() * 10 + 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <FaLeaf />
      </motion.div>
    ));
  };

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section - Full screen with image background and parallax effect */}
      <div className="relative h-screen flex flex-col justify-center items-center text-center overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-green-800 to-green-700 z-0">
          <div className="absolute inset-0 opacity-20">
            {generateLeaves(20)}
          </div>
        </div>

        {/* Background image with overlay and parallax effect */}
        <motion.div 
          className="absolute inset-0 z-0"
          style={{ 
            y: scrollY * 0.5,
            scale: 1 + scrollY * 0.0003,
          }}
        >
          <img 
            src={agriImage} 
            alt="Harvest Fields" 
            className="w-full h-full object-cover"
            style={{ 
              objectPosition: `calc(50% + ${mousePosition.x * 0.01}px) calc(50% + ${mousePosition.y * 0.01}px)` 
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/80 to-green-600/60 backdrop-blur-sm"></div>
        </motion.div>

        {/* Decorative floating elements */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.div 
            className="absolute -top-20 -right-20 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply opacity-20 blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              x: [0, 20, 0],
              y: [0, -20, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply opacity-20 blur-3xl"
            animate={{ 
              scale: [1, 1.3, 1],
              x: [0, -20, 0],
              y: [0, 20, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </div>

        {/* Hero Content with enhanced animations */}
        <div className="relative z-10 px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.h1 
              className="text-7xl md:text-9xl font-bold text-white mb-6 drop-shadow-lg tracking-tighter relative"
              style={{ textShadow: "0 8px 16px rgba(0,0,0,0.2)" }}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-green-100 to-white">
                Harvest
              </span>
              <motion.span 
                className="absolute -right-6 top-0 text-green-300 opacity-70"
                animate={{ 
                  rotate: [0, 15, 0, -15, 0],
                  scale: [1, 1.1, 1, 0.9, 1]  
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              >
                <FaLeaf className="text-5xl md:text-6xl" />
              </motion.span>
            </motion.h1>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.p 
              className="text-xl md:text-2xl text-white mb-12 max-w-3xl mx-auto leading-relaxed font-light"
              style={{ textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}
            >
              Join our thriving community of plant enthusiasts. Track growth, share knowledge, 
              and connect with fellow gardeners in a sustainable ecosystem.
            </motion.p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap gap-5 justify-center"
          >
            {currentUser ? (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Link 
                    to="/planting-plans" 
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-10 py-5 rounded-full text-white text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center"
                  >
                    <FaSeedling className="mr-2" /> Start Growing Today
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Link 
                    to="/posts" 
                    className="bg-white/20 backdrop-blur-md hover:bg-white/30 px-10 py-5 rounded-full text-white text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border border-white/30 flex items-center"
                  >
                    <FaUsers className="mr-2" /> Explore Community
                  </Link>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Link 
                    to="/register" 
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-10 py-5 rounded-full text-white text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center"
                  >
                    <span className="mr-2">🌱</span> Get Started
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Link 
                    to="/login" 
                    className="bg-white/20 backdrop-blur-md hover:bg-white/30 px-10 py-5 rounded-full text-white text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border border-white/30 flex items-center"
                  >
                    <span className="mr-2">👤</span> Sign In
                  </Link>
                </motion.div>
              </>
            )}
          </motion.div>
        </div>

        {/* Enhanced scroll indicator with wind effect */}
        <motion.div 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
          animate={{ 
            y: [0, 10, 0],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <motion.span 
            className="text-white/70 text-sm mb-2 font-light tracking-widest"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            SCROLL DOWN
          </motion.span>
          <motion.div
            animate={{ 
              y: [0, 5, 0],
              rotate: [0, 5, 0, -5, 0]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <FaArrowDown className="text-white text-3xl" />
          </motion.div>
        </motion.div>
      </div>

      {/* Features Section with enhanced 3D card effects */}
      <div className="relative bg-gradient-to-b from-white to-green-50 py-24 px-4 overflow-hidden">
        {/* Background decorations */}
        <motion.div 
          className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-green-700/5 to-transparent"
          style={{ 
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 80%)" 
          }}
        />
        
        <motion.div 
          className="absolute -right-32 top-20 w-64 h-64 rounded-full bg-green-200/20 blur-3xl z-0"
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, -20, 0],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <motion.div 
          className="absolute -left-32 bottom-20 w-64 h-64 rounded-full bg-emerald-200/20 blur-3xl z-0"
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 20, 0],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <motion.h2 
              className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Grow <span className="text-green-600">with Us</span>
            </motion.h2>
            <div className="flex justify-center items-center mb-8">
              <div className="h-1 w-12 bg-green-300 rounded-full"></div>
              <div className="h-1 w-24 bg-green-500 mx-3 rounded-full"></div>
              <div className="h-1 w-12 bg-green-300 rounded-full"></div>
            </div>
            <motion.p 
              className="text-xl text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Discover everything you need to nurture your plants and become part of our thriving agricultural community.
            </motion.p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-12">
            {/* Feature Card 1 - Track Growth */}
            <motion.div 
              className="group rounded-2xl overflow-hidden shadow-xl border border-green-200 bg-white relative z-10"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
              whileHover={{ 
                y: -15,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
              }}
            >
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 transform group-hover:scale-110 transition-transform duration-700"></div>
                <div className="relative h-56 flex items-center justify-center">
                  <motion.div
                    animate={{ 
                      y: [0, -10, 0],
                      rotate: [0, 5, 0, -5, 0]
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <FaSeedling className="text-white text-7xl" />
                  </motion.div>
                </div>
                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-white z-20">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                    <FaSeedling className="text-white text-2xl" />
                  </div>
                </div>
              </div>
              <div className="p-8 pt-14 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white via-green-50/30 to-green-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-green-800 mb-3">Track Growth</h3>
                  <p className="text-gray-700 mb-6">Monitor your plants' journey with our advanced tracking system and watch them flourish.</p>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/planting-plans" className="inline-flex items-center text-green-600 hover:text-green-800 font-medium group">
                      <span className="border-b-2 border-green-300 group-hover:border-green-600 transition-colors">Start Tracking</span>
                      <FaChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Feature Card 2 - Share Knowledge */}
            <motion.div 
              className="group rounded-2xl overflow-hidden shadow-xl border border-blue-200 bg-white relative z-10"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ 
                y: -15,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
              }}
            >
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 transform group-hover:scale-110 transition-transform duration-700"></div>
                <div className="relative h-56 flex items-center justify-center">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, 0, -5, 0]
                    }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <FaUsers className="text-white text-7xl" />
                  </motion.div>
                </div>
                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-white z-20">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <FaUsers className="text-white text-2xl" />
                  </div>
                </div>
              </div>
              <div className="p-8 pt-14 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50/30 to-blue-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-blue-800 mb-3">Share Knowledge</h3>
                  <p className="text-gray-700 mb-6">Contribute to the community with your agricultural expertise and grow together.</p>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/posts" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium group">
                      <span className="border-b-2 border-blue-300 group-hover:border-blue-600 transition-colors">Join Community</span>
                      <FaChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Feature Card 3 - Earn Badges */}
            <motion.div 
              className="group rounded-2xl overflow-hidden shadow-xl border border-amber-200 bg-white relative z-10"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ 
                y: -15,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
              }}
            >
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-600 transform group-hover:scale-110 transition-transform duration-700"></div>
                <div className="relative h-56 flex items-center justify-center">
                  <motion.div
                    animate={{ 
                      rotateY: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <FaMedal className="text-white text-7xl" />
                  </motion.div>
                </div>
                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-white z-20">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                    <FaMedal className="text-white text-2xl" />
                  </div>
                </div>
              </div>
              <div className="p-8 pt-14 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white via-amber-50/30 to-amber-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-amber-800 mb-3">Earn Badges</h3>
                  <p className="text-gray-700 mb-6">Get recognized for your achievements with our badge system and showcase your expertise.</p>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/badges" className="inline-flex items-center text-amber-600 hover:text-amber-800 font-medium group">
                      <span className="border-b-2 border-amber-300 group-hover:border-amber-600 transition-colors">View Badges</span>
                      <FaChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Categories Section with enhanced visual effects */}
      <div className="relative bg-gradient-to-b from-green-50 to-gray-50 py-24 px-4 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5 z-0">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 0 10 L 40 10 M 10 0 L 10 40" stroke="currentColor" strokeWidth="0.5" fill="none" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <motion.h2 
              className="text-5xl md:text-6xl font-bold text-gray-800 mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Explore <span className="text-green-600">Categories</span>
            </motion.h2>
            
            <div className="flex justify-center items-center mb-8">
              <div className="h-1 w-12 bg-green-300 rounded-full"></div>
              <div className="h-1 w-24 bg-green-500 mx-3 rounded-full"></div>
              <div className="h-1 w-12 bg-green-300 rounded-full"></div>
            </div>
            
            <motion.p 
              className="text-xl text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Discover plant varieties and growing techniques for every interest in our comprehensive collection.
            </motion.p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Grains Category */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <Link to="/category/grains" className="block relative overflow-hidden group rounded-2xl h-80 shadow-lg transform transition-all duration-500 hover:shadow-2xl">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                <motion.div 
                  className="absolute inset-0 z-0"
                  whileHover={{ scale: 1.15 }}
                  transition={{ duration: 0.7 }}
                >
                  <img src="https://images.unsplash.com/photo-1574323347407-f5e1c91cf981" alt="Grains" className="w-full h-full object-cover" />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                  <div className="relative transform transition-transform duration-500 group-hover:translate-y-0 translate-y-8">
                    <h3 className="text-white font-bold text-3xl mb-1">Grains</h3>
                    <p className="text-white/80 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">Discover cereals, rice, wheat and more sustainable farming techniques.</p>
                    <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Explore Grains →
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
            
            {/* Gardening Category */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative"
            >
              <Link to="/category/gardening" className="block relative overflow-hidden group rounded-2xl h-80 shadow-lg transform transition-all duration-500 hover:shadow-2xl">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                <motion.div 
                  className="absolute inset-0 z-0"
                  whileHover={{ scale: 1.15 }}
                  transition={{ duration: 0.7 }}
                >
                  <img src="https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e" alt="Gardening" className="w-full h-full object-cover" />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                  <div className="relative transform transition-transform duration-500 group-hover:translate-y-0 translate-y-8">
                    <h3 className="text-white font-bold text-3xl mb-1">Gardening</h3>
                    <p className="text-white/80 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">Learn tips and tricks for your home garden and decorative plants.</p>
                    <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Explore Gardening →
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
            
            {/* Livestock Category */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <Link to="/category/livestock" className="block relative overflow-hidden group rounded-2xl h-80 shadow-lg transform transition-all duration-500 hover:shadow-2xl">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                <motion.div 
                  className="absolute inset-0 z-0"
                  whileHover={{ scale: 1.15 }}
                  transition={{ duration: 0.7 }}
                >
                  <img src="https://images.unsplash.com/photo-1516467508483-a7212febe31a" alt="Livestock" className="w-full h-full object-cover" />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                  <div className="relative transform transition-transform duration-500 group-hover:translate-y-0 translate-y-8">
                    <h3 className="text-white font-bold text-3xl mb-1">Livestock</h3>
                    <p className="text-white/80 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">Guidance on ethical and sustainable animal farming practices.</p>
                    <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Explore Livestock →
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
            
            {/* Vegetables Category */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative"
            >
              <Link to="/category/vegetables" className="block relative overflow-hidden group rounded-2xl h-80 shadow-lg transform transition-all duration-500 hover:shadow-2xl">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                <motion.div 
                  className="absolute inset-0 z-0"
                  whileHover={{ scale: 1.15 }}
                  transition={{ duration: 0.7 }}
                >
                  <img src="https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c" alt="Vegetables" className="w-full h-full object-cover" />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                  <div className="relative transform transition-transform duration-500 group-hover:translate-y-0 translate-y-8">
                    <h3 className="text-white font-bold text-3xl mb-1">Vegetables</h3>
                    <p className="text-white/80 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">Everything about growing organic vegetables for your family.</p>
                    <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Explore Vegetables →
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Enhanced CTA Section with animated background */}
      <div className="relative overflow-hidden py-28">
        {/* Animated gradient background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-green-800 via-green-600 to-emerald-700"></div>
          
          {/* Animated overlay elements */}
          <motion.div 
            className="absolute bottom-0 left-0 w-full h-full opacity-10"
            animate={{ 
              y: [0, 10, 0],
              opacity: [0.1, 0.15, 0.1]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path fill="#FFFFFF" d="M47.5,-67.2C58.3,-56.7,61.4,-38.3,65.9,-21.1C70.4,-4,76.2,12,73.2,26.4C70.2,40.8,58.4,53.7,44.2,62.8C30.1,71.9,13.6,77.3,-1.5,79.3C-16.6,81.4,-33.2,80.2,-45.8,71.8C-58.3,63.3,-66.8,47.7,-71.9,31.5C-76.9,15.3,-78.6,-1.5,-73.1,-14.8C-67.7,-28.1,-55.2,-37.9,-42.5,-48C-29.8,-58.1,-16.9,-68.5,0.8,-69.6C18.5,-70.7,36.8,-62.6,47.5,-50.2Z" transform="translate(100 100) scale(1.1)" />
            </svg>
          </motion.div>
          
          <motion.div 
            className="absolute top-0 right-0 w-full h-full opacity-10 rotate-180"
            animate={{ 
              y: [0, -10, 0],
              opacity: [0.1, 0.15, 0.1]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path fill="#FFFFFF" d="M39.2,-57.2C50.9,-49.3,60.4,-37.5,67.1,-23.5C73.8,-9.4,77.6,6.9,73.5,20.8C69.3,34.7,57.2,46.2,43.8,54.6C30.4,63.1,15.2,68.4,-0.4,69C-16,69.5,-32,65.2,-45.2,56.6C-58.5,48,-68.9,35,-71.1,21.2C-73.3,7.3,-67.3,-7.4,-60.7,-21.2C-54.1,-35.1,-47,-48,-36.6,-56.1C-26.3,-64.3,-13.1,-67.6,0.7,-68.6C14.5,-69.6,29,-65.2,39.2,-57.2Z" transform="translate(100 100) scale(1.1)" />
            </svg>
          </motion.div>
          
          {/* Floating leaf animations */}
          {generateLeaves(10)}
        </div>
        
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Ready to start your growing journey?
            </motion.h2>
            
            <motion.p 
              className="text-xl text-green-100 mb-12 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Join thousands of gardeners and farmers who are already tracking their plant growth, sharing knowledge, and creating a more sustainable world together.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link 
                to={currentUser ? "/planting-plans" : "/register"}
                className="inline-flex items-center bg-white text-green-700 hover:bg-green-50 px-10 py-4 rounded-full text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <FaSeedling className="mr-2" />
                {currentUser ? "Start Tracking Today" : "Join the Community"}
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
