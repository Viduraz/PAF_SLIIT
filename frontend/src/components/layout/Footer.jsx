import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaLeaf, FaSeedling, FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaEnvelope, FaMapMarkerAlt, FaPhone } from "react-icons/fa";

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 border-t border-green-100">
      {/* Decorative background elements */}
      <div className="absolute inset-0 z-0">
        <svg className="absolute w-full h-64 left-0 top-0 opacity-10" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <pattern id="leafPattern" patternUnits="userSpaceOnUse" width="20" height="20" patternTransform="rotate(45)">
            <path d="M10,0 Q15,10 10,20 Q5,10 10,0" fill="rgba(16, 185, 129, 0.2)" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#leafPattern)" />
        </svg>
        <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-green-200/20 blur-3xl"></div>
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-emerald-200/20 blur-3xl"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand column */}
          <div>
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-full bg-gradient-to-br from-green-200 to-green-300 mr-2">
                <FaSeedling className="text-xl text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">AgriApp</h2>
            </div>
            
            <p className="text-gray-600 mb-6">
              Track your plants, share your knowledge, and grow together with our community of gardening enthusiasts.
            </p>
            
            <div className="flex space-x-4">
              <motion.a 
                href="#" 
                whileHover={{ y: -3 }}
                className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 hover:bg-green-600 hover:text-white transition-colors"
              >
                <FaFacebook />
              </motion.a>
              <motion.a 
                href="#" 
                whileHover={{ y: -3 }}
                className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 hover:bg-green-600 hover:text-white transition-colors"
              >
                <FaTwitter />
              </motion.a>
              <motion.a 
                href="#" 
                whileHover={{ y: -3 }}
                className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 hover:bg-green-600 hover:text-white transition-colors"
              >
                <FaInstagram />
              </motion.a>
              <motion.a 
                href="#" 
                whileHover={{ y: -3 }}
                className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 hover:bg-green-600 hover:text-white transition-colors"
              >
                <FaYoutube />
              </motion.a>
            </div>
          </div>
          
          {/* Links column */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-green-200 pb-2">Quick Links</h3>
            <ul className="space-y-2">
              <motion.li whileHover={{ x: 3 }}>
                <Link to="/planting-plans" className="text-gray-600 hover:text-green-600 flex items-center">
                  <FaLeaf className="mr-2 text-green-500 text-xs" />
                  Planting Plans
                </Link>
              </motion.li>
              <motion.li whileHover={{ x: 3 }}>
                <Link to="/posts" className="text-gray-600 hover:text-green-600 flex items-center">
                  <FaLeaf className="mr-2 text-green-500 text-xs" />
                  Community Posts
                </Link>
              </motion.li>
              <motion.li whileHover={{ x: 3 }}>
                <Link to="/weather" className="text-gray-600 hover:text-green-600 flex items-center">
                  <FaLeaf className="mr-2 text-green-500 text-xs" />
                  Weather Updates
                </Link>
              </motion.li>
              <motion.li whileHover={{ x: 3 }}>
                <Link to="/crop-disease-detector" className="text-gray-600 hover:text-green-600 flex items-center">
                  <FaLeaf className="mr-2 text-green-500 text-xs" />
                  Disease Detector
                </Link>
              </motion.li>
            </ul>
          </div>
          
          {/* Company column */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-green-200 pb-2">Company</h3>
            <ul className="space-y-2">
              <motion.li whileHover={{ x: 3 }}>
                <Link to="/about" className="text-gray-600 hover:text-green-600 flex items-center">
                  <FaLeaf className="mr-2 text-green-500 text-xs" />
                  About Us
                </Link>
              </motion.li>
              <motion.li whileHover={{ x: 3 }}>
                <Link to="/contact" className="text-gray-600 hover:text-green-600 flex items-center">
                  <FaLeaf className="mr-2 text-green-500 text-xs" />
                  Contact
                </Link>
              </motion.li>
              <motion.li whileHover={{ x: 3 }}>
                <Link to="/privacy" className="text-gray-600 hover:text-green-600 flex items-center">
                  <FaLeaf className="mr-2 text-green-500 text-xs" />
                  Privacy Policy
                </Link>
              </motion.li>
              <motion.li whileHover={{ x: 3 }}>
                <Link to="/terms" className="text-gray-600 hover:text-green-600 flex items-center">
                  <FaLeaf className="mr-2 text-green-500 text-xs" />
                  Terms of Service
                </Link>
              </motion.li>
            </ul>
          </div>
          
          {/* Newsletter column */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-green-200 pb-2">Stay Connected</h3>
            <p className="text-gray-600 mb-3">Subscribe to our newsletter for tips, updates, and special offers</p>
            
            <div className="relative mb-4">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="w-full py-2 px-4 pr-10 rounded-full border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-300 bg-white/80 backdrop-blur-sm"
              />
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="absolute right-1 top-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white p-1.5 rounded-full"
              >
                <FaEnvelope />
              </motion.button>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-gray-600">
                <FaMapMarkerAlt className="mr-2 text-green-500" />
                <span>123 Green Street, Plantville</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FaPhone className="mr-2 text-green-500" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-green-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              &copy; {currentYear} AgriApp. All rights reserved.
            </p>
            
            <div className="flex space-x-6">
              <Link to="/terms" className="text-gray-500 text-sm hover:text-green-600 transition-colors">
                Terms of Service
              </Link>
              <Link to="/privacy" className="text-gray-500 text-sm hover:text-green-600 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/cookies" className="text-gray-500 text-sm hover:text-green-600 transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom decorative banner */}
      <div className="h-2 bg-gradient-to-r from-green-400 via-emerald-500 to-green-400"></div>
    </footer>
  );
}

export default Footer;