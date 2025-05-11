import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import UserService from '../services/userService';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaEnvelope, FaSeedling, FaCheck } from 'react-icons/fa';

function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await UserService.register(formData);
      login(response.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center" 
         style={{
           backgroundImage: "url('https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
           backgroundSize: 'cover',
           backgroundPosition: 'center',
         }}>
      
      {/* Overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-900/70 to-emerald-800/60 backdrop-blur-sm"></div>
      
      {/* Register Container */}
      <motion.div 
        className="relative z-10 w-full max-w-md px-6 py-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center">
              <FaSeedling className="text-white text-3xl" />
            </div>
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-2">Join Us!</h1>
          <p className="text-green-100 text-xl">Start growing with our community</p>
        </div>
        
        {error && (
          <motion.div 
            className="bg-red-100/80 backdrop-blur-sm border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <p>{error}</p>
          </motion.div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaUser className="text-white/70" />
            </div>
            <input
              type="text"
              className="py-3 pl-10 pr-4 block w-full rounded-lg bg-white/10 border border-white/30 placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 backdrop-blur-sm"
              placeholder="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaEnvelope className="text-white/70" />
            </div>
            <input
              type="email"
              className="py-3 pl-10 pr-4 block w-full rounded-lg bg-white/10 border border-white/30 placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 backdrop-blur-sm"
              placeholder="Email address"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaLock className="text-white/70" />
            </div>
            <input
              type="password"
              className="py-3 pl-10 pr-4 block w-full rounded-lg bg-white/10 border border-white/30 placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 backdrop-blur-sm"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaCheck className="text-white/70" />
            </div>
            <input
              type="password"
              className="py-3 pl-10 pr-4 block w-full rounded-lg bg-white/10 border border-white/30 placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 backdrop-blur-sm"
              placeholder="Confirm password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          
          <motion.button 
            type="submit" 
            className={`relative w-full py-3 px-4 rounded-lg text-white font-medium ${
              loading 
                ? 'bg-green-700/50 cursor-not-allowed' 
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
            } transition-all shadow-lg flex items-center justify-center mt-6`}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </>
            ) : 'Create Account'}
          </motion.button>
        </form>
        
        <div className="mt-8 text-center space-y-4">
          <p className="text-white/80">
            Already have an account? <Link to="/login" className="text-white hover:text-green-200 font-semibold underline">Login</Link>
          </p>
          
          <div className="pt-2 border-t border-white/20 flex justify-center space-x-6 text-sm">
            <Link to="/terms" className="text-white/80 hover:text-white">Terms of Service</Link>
            <Link to="/privacy" className="text-white/80 hover:text-white">Privacy Policy</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default RegisterPage;
