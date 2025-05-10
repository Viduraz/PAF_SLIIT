import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaCloud, 
  FaWind, 
  FaEye, 
  FaSun, 
  FaMoon, 
  FaTemperatureHigh, 
  FaUmbrella, 
  FaArrowDown, 
  FaArrowUp,
  FaLeaf
} from 'react-icons/fa';
import axios from 'axios';

function WeatherPage() {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [location, setLocation] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Default location
    fetchWeatherData('Colombo');
  }, []);

  const fetchWeatherData = async (loc) => {
    setLoading(true);
    setError('');
    try {
      // Using WeatherAPI.com as it provides all the requested data
      const API_KEY = '737bd6dc9dd8457e812113232251005'; // Replace with your actual API key
      const response = await axios.get(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${loc}&days=7&aqi=yes&alerts=no`);
      
      setCurrentWeather(response.data.current);
      setForecast(response.data.forecast.forecastday);
      setLocation(response.data.location.name + ', ' + response.data.location.country);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching weather data:", err);
      setError("Failed to fetch weather data. Please try again.");
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchLocation.trim()) {
      fetchWeatherData(searchLocation);
    }
  };

  const getWeatherBackground = (code) => {
    // Weather condition code mapping to background images
    const weatherImages = {
      sunny: 'https://images.unsplash.com/photo-1623944889288-3f8290f59767',
      cloudy: 'https://images.unsplash.com/photo-1525087740718-9e0f2c58c7ef',
      rainy: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721',
      stormy: 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28',
      snowy: 'https://images.unsplash.com/photo-1610560415411-5a1a7299f8e3',
      foggy: 'https://images.unsplash.com/photo-1482841628122-9080d44bb807',
      default: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05'
    };
    
    // Very simplified condition mapping - you can enhance this based on actual API codes
    if (!code) return weatherImages.default;
    if (code >= 1000 && code < 1003) return weatherImages.sunny;
    if (code >= 1003 && code < 1063) return weatherImages.cloudy;
    if (code >= 1063 && code < 1183) return weatherImages.rainy;
    if (code >= 1183 && code < 1220) return weatherImages.stormy;
    if (code >= 1220 && code < 1280) return weatherImages.snowy;
    if (code >= 1280) return weatherImages.foggy;
    
    return weatherImages.default;
  };

  const getUVIndexDescription = (uvIndex) => {
    if (uvIndex <= 2) return { level: 'Low', color: 'text-green-500' };
    if (uvIndex <= 5) return { level: 'Moderate', color: 'text-yellow-500' };
    if (uvIndex <= 7) return { level: 'High', color: 'text-orange-500' };
    if (uvIndex <= 10) return { level: 'Very High', color: 'text-red-500' };
    return { level: 'Extreme', color: 'text-purple-500' };
  };

  const formatTime = (time) => {
    return new Date(time).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getDayName = (dateStr) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date(dateStr).getDay()];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 overflow-hidden">
        <div className="relative">
          {/* Animated Sun */}
          <motion.div 
            className="absolute z-10"
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ 
              scale: [0.8, 1.1, 0.8],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            <FaSun className="text-yellow-400 text-8xl drop-shadow-lg" />
          </motion.div>
          
          {/* Cloud 1 moving from left to right */}
          <motion.div 
            className="absolute"
            initial={{ left: -80, top: -30 }}
            animate={{ left: 80 }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          >
            <FaCloud className="text-white text-5xl opacity-80" />
          </motion.div>
          
          {/* Cloud 2 moving from right to left */}
          <motion.div 
            className="absolute"
            initial={{ right: -60, top: 40 }}
            animate={{ right: 100 }}
            transition={{ 
              duration: 10, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          >
            <FaCloud className="text-white text-4xl opacity-90" />
          </motion.div>
          
          {/* Cloud 3 moving slower */}
          <motion.div 
            className="absolute"
            initial={{ left: 80, top: 60 }}
            animate={{ left: -40 }}
            transition={{ 
              duration: 12, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          >
            <FaCloud className="text-white text-5xl opacity-70" />
          </motion.div>
          
          {/* Loading text */}
          <motion.div 
            className="mt-48 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-white text-xl font-medium mb-3">Fetching weather data</p>
            <motion.div 
              className="flex justify-center space-x-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="h-2 w-2 bg-white rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
              />
              <motion.div
                className="h-2 w-2 bg-white rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              />
              <motion.div
                className="h-2 w-2 bg-white rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button 
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            onClick={() => fetchWeatherData('Colombo')}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic background based on weather condition */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${getWeatherBackground(currentWeather?.condition?.code)})` 
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70 backdrop-blur-sm"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Search bar */}
        <motion.div 
          className="max-w-md mx-auto mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              placeholder="Search location..."
              className="flex-1 px-4 py-3 rounded-l-lg border-0 focus:ring-2 focus:ring-green-500 bg-white/90 backdrop-blur-sm"
            />
            <button 
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-r-lg transition-colors"
            >
              Search
            </button>
          </form> */}
        </motion.div>

        {/* Current weather */}
        <motion.div 
          className="bg-white/80 backdrop-blur-md rounded-xl overflow-hidden shadow-xl mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-gradient-to-r from-green-600 to-green-400 p-6 text-white">
            <h1 className="text-3xl font-bold mb-1">{location}</h1>
            <p className="text-xl opacity-90">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center mb-6 md:mb-0">
                <img 
                  src={currentWeather.condition.icon} 
                  alt={currentWeather.condition.text}
                  className="w-24 h-24 mr-4"
                />
                <div>
                  <div className="text-5xl font-bold text-gray-800">
                    {currentWeather.temp_c}°C
                  </div>
                  <div className="text-xl text-gray-600">
                    {currentWeather.condition.text}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <FaTemperatureHigh className="mx-auto text-2xl text-red-500 mb-1" />
                  <div className="text-sm text-gray-500">Feels Like</div>
                  <div className="text-xl font-semibold">{currentWeather.feelslike_c}°C</div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <FaUmbrella className="mx-auto text-2xl text-blue-500 mb-1" />
                  <div className="text-sm text-gray-500">Precipitation</div>
                  <div className="text-xl font-semibold">{currentWeather.precip_mm} mm</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Detailed weather metrics */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Wind Speed */}
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              <FaWind className="text-3xl text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-800">Wind</h3>
            </div>
            <div className="text-4xl font-bold text-gray-800 mb-2">{currentWeather.wind_kph} km/h</div>
            <div className="text-gray-600">Direction: {currentWeather.wind_dir}</div>
            <div className="text-gray-600">Gust: {currentWeather.gust_kph} km/h</div>
          </div>

          {/* Visibility */}
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              <FaEye className="text-3xl text-purple-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-800">Visibility</h3>
            </div>
            <div className="text-4xl font-bold text-gray-800 mb-2">{currentWeather.vis_km} km</div>
            <div className="text-gray-600">
              {currentWeather.vis_km > 10 ? 'Excellent visibility' : 
               currentWeather.vis_km > 5 ? 'Good visibility' : 'Limited visibility'}
            </div>
          </div>

          {/* UV Index */}
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              <FaSun className="text-3xl text-yellow-500 mr-3" />
              <h3 className="text-xl font-semibold text-gray-800">UV Index</h3>
            </div>
            <div className={`text-4xl font-bold ${getUVIndexDescription(currentWeather.uv).color} mb-2`}>
              {currentWeather.uv}
            </div>
            <div className="text-gray-600">
              {getUVIndexDescription(currentWeather.uv).level} exposure risk
            </div>
          </div>

          {/* Sunrise & Sunset */}
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              <div className="text-3xl text-amber-500 mr-3">🌅</div>
              <h3 className="text-xl font-semibold text-gray-800">Sunrise & Sunset</h3>
            </div>
            <div className="flex justify-between mb-3">
              <div>
                <FaSun className="text-xl text-yellow-500 inline-block mr-2" />
                <span className="text-gray-800 font-medium">Sunrise</span>
              </div>
              <div className="text-xl font-semibold text-gray-800">
                {formatTime(forecast[0]?.astro?.sunrise)}
              </div>
            </div>
            <div className="flex justify-between">
              <div>
                <FaMoon className="text-xl text-blue-400 inline-block mr-2" />
                <span className="text-gray-800 font-medium">Sunset</span>
              </div>
              <div className="text-xl font-semibold text-gray-800">
                {formatTime(forecast[0]?.astro?.sunset)}
              </div>
            </div>
          </div>
          
          {/* Humidity */}
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              <div className="text-3xl text-blue-400 mr-3">💧</div>
              <h3 className="text-xl font-semibold text-gray-800">Humidity</h3>
            </div>
            <div className="text-4xl font-bold text-gray-800 mb-2">{currentWeather.humidity}%</div>
            <div className="text-gray-600">
              {currentWeather.humidity > 70 ? 'High humidity' : 
               currentWeather.humidity > 30 ? 'Moderate humidity' : 'Low humidity'}
            </div>
          </div>
          
          {/* Pressure */}
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              <div className="text-3xl text-green-500 mr-3">🌡️</div>
              <h3 className="text-xl font-semibold text-gray-800">Pressure</h3>
            </div>
            <div className="text-4xl font-bold text-gray-800 mb-2">{currentWeather.pressure_mb} mb</div>
            <div className="text-gray-600">
              {currentWeather.pressure_mb > 1013 ? 'High pressure' : 'Low pressure'}
            </div>
          </div>
        </motion.div>

        {/* 7-day forecast */}
        <motion.div
          className="bg-white/80 backdrop-blur-md rounded-xl overflow-hidden shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="bg-gradient-to-r from-green-600 to-green-400 p-6 text-white">
            <h2 className="text-2xl font-bold">7-Day Forecast</h2>
          </div>
          
          <div className="overflow-x-auto">
            <div className="flex p-6 min-w-max">
              {forecast.map((day, index) => (
                <motion.div
                  key={day.date}
                  className={`flex-1 min-w-[160px] p-4 rounded-lg ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + (index * 0.1) }}
                >
                  <div className="text-center">
                    <div className="font-bold text-gray-800 mb-2">
                      {index === 0 ? 'Today' : getDayName(day.date)}
                    </div>
                    <img 
                      src={day.day.condition.icon} 
                      alt={day.day.condition.text}
                      className="w-16 h-16 mx-auto"
                    />
                    <div className="text-sm text-gray-600 mb-3">{day.day.condition.text}</div>
                    
                    <div className="flex justify-between text-sm mb-2">
                      <div className="flex items-center">
                        <FaArrowUp className="text-red-500 mr-1" />
                        <span className="font-medium">{day.day.maxtemp_c}°</span>
                      </div>
                      <div className="flex items-center">
                        <FaArrowDown className="text-blue-500 mr-1" />
                        <span className="font-medium">{day.day.mintemp_c}°</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-600">
                      <div className="flex items-center">
                        <FaUmbrella className="text-blue-400 mr-1" />
                        <span>{day.day.totalprecip_mm}mm</span>
                      </div>
                      <div className="flex items-center">
                        <FaWind className="text-gray-400 mr-1" />
                        <span>{day.day.maxwind_kph}km/h</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
        
        {/* Agricultural Impact Section */}
        <motion.div
          className="mt-10 bg-white/80 backdrop-blur-md rounded-xl overflow-hidden shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="bg-gradient-to-r from-amber-600 to-amber-400 p-6 text-white">
            <h2 className="text-2xl font-bold">Agricultural Impact</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 p-5 rounded-lg border border-green-100">
                <div className="flex items-center mb-3">
                  <FaLeaf className="text-2xl text-green-600 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-800">Growing Conditions</h3>
                </div>
                <p className="text-gray-700 mb-3">
                  {currentWeather.temp_c > 25 
                    ? "High temperatures may stress certain crops. Consider additional watering."
                    : currentWeather.temp_c < 10
                    ? "Low temperatures may slow growth. Protect sensitive plants."
                    : "Current temperatures are favorable for most crop growth."}
                </p>
                <p className="text-gray-700">
                  {currentWeather.precip_mm > 5
                    ? "Significant precipitation may affect soil saturation. Check drainage."
                    : currentWeather.precip_mm > 0
                    ? "Light precipitation provides natural irrigation."
                    : "No precipitation recorded. Monitor soil moisture levels."}
                </p>
              </div>
              
              <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                <div className="flex items-center mb-3">
                  <div className="text-2xl text-blue-600 mr-2">🚜</div>
                  <h3 className="text-xl font-semibold text-gray-800">Field Work Advisory</h3>
                </div>
                <p className="text-gray-700 mb-3">
                  {currentWeather.precip_mm > 0
                    ? "Field work may be impacted by current precipitation. Wait for drier conditions."
                    : currentWeather.wind_kph > 20
                    ? "Strong winds may affect spraying operations. Exercise caution."
                    : "Current conditions are suitable for most field operations."}
                </p>
                <p className="text-gray-700">
                  {forecast[0]?.day.daily_chance_of_rain > 50
                    ? `High chance of rain (${forecast[0]?.day.daily_chance_of_rain}%) in the forecast. Plan field work accordingly.`
                    : `Low chance of rain (${forecast[0]?.day.daily_chance_of_rain}%) in the forecast.`}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default WeatherPage;