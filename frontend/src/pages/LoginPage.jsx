// src/pages/LoginPage.js
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import UserService from '../services/userService';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaSeedling, FaGoogle } from 'react-icons/fa';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();

  // Check for saved username
  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberedUsername');
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!username.trim() || !password) {
      setError('Username and password are required');
      setLoading(false);
      return;
    }
    
    // Handle remember me
    if (rememberMe) {
      localStorage.setItem('rememberedUsername', username.trim());
    } else {
      localStorage.removeItem('rememberedUsername');
    }
    
    try {
      // Clear any previous console errors
      console.clear();
      
      // Make the login request
      const response = await UserService.login({
        username: username.trim(),
        password: password
      });
      
      // Check if the response contains user data and token
      if (response.data && response.data.user && response.data.token) {
        login(response.data);
        navigate('/');
      } else if (response.data && response.data.token) {
        // Handle case where user data is directly in the response
        login({ user: response.data, token: response.data.token });
        navigate('/');
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Provide more detailed error messages based on the type of error
      if (err.response) {
        // Server responded with error status
        if (err.response.status === 500) {
          setError('Server error. Please check server logs or contact support.');
        } else if (err.response.status === 401 || err.response.status === 403) {
          setError('Invalid username or password. Please try again.');
        } else {
          setError(err.response.data?.message || 'Login failed. Please check your credentials.');
        }
      } else if (err.request) {
        // Request was made but no response
        setError('No response from server. Please check if the backend is running.');
      } else {
        // Other errors
        setError(err.message || 'An error occurred during login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      console.error('Google login error:', err);
      setError('Failed to login with Google. Please try again.');
    } finally {
      setGoogleLoading(false);
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
      
      {/* Login Container */}
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
          <h1 className="text-4xl font-bold text-white mb-2">Welcome!</h1>
          <p className="text-green-100 text-xl">Today will be great.</p>
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
        
        {/* Google Sign In Button */}
        <motion.button 
          type="button" 
          onClick={handleGoogleLogin}
          className="relative w-full py-3 px-4 rounded-lg bg-white text-gray-700 font-medium mb-4 shadow-lg flex items-center justify-center"
          disabled={googleLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {googleLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </>
          ) : (
            <>
              <FaGoogle className="mr-2 text-red-500" />
              Sign in with Google
            </>
          )}
        </motion.button>
        
        <div className="relative flex items-center py-4">
          <div className="flex-grow border-t border-white/20"></div>
          <span className="flex-shrink mx-4 text-white/60 text-sm">or</span>
          <div className="flex-grow border-t border-white/20"></div>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaUser className="text-white/70" />
            </div>
            <input
              type="text"
              className="py-3 pl-10 pr-4 block w-full rounded-lg bg-white/10 border border-white/30 placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 backdrop-blur-sm"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-white/30 bg-white/10 text-green-600 focus:ring-green-500"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-white">
              Remember my Username
            </label>
          </div>
          
          <motion.button 
            type="submit" 
            className={`relative w-full py-3 px-4 rounded-lg text-white font-medium ${
              loading 
                ? 'bg-green-700/50 cursor-not-allowed' 
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
            } transition-all shadow-lg flex items-center justify-center`}
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
                Logging in...
              </>
            ) : 'Login'}
          </motion.button>
        </form>
        
        <div className="mt-8 text-center space-y-4">
          <p className="text-white/80">
            Don't have an account? <Link to="/register" className="text-white hover:text-green-200 font-semibold underline">Register</Link>
          </p>
          
          <div className="pt-2 border-t border-white/20 flex justify-center space-x-6 text-sm">
            <Link to="/forgot-password" className="text-white/80 hover:text-white">Forgot Password</Link>
            <Link to="/help" className="text-white/80 hover:text-white">Help</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginPage;