import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";

import LogoDark from "../../Images/Sai-removebg-preview.png";
import { FiEye, FiEyeOff, FiCheck } from "react-icons/fi";

const NewLogin = () => {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [phone_number, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // const [connectionStatus, setConnectionStatus] = useState("");

  // Get the page user was trying to access before being redirected to login
  const from = location.state?.from?.pathname || "/dash/home";

  // If user is already authenticated, redirect them
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      console.log('User already authenticated, redirecting to:', from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, from]);

  // Test basic connectivity to the API server
  // const testConnection = async () => {
  //   setConnectionStatus("Testing...");
  //   try {
  //     // Use fetch for a simple connectivity test
  //     const controller = new AbortController();
  //     const timeoutId = setTimeout(() => controller.abort(), 5000);

  //     const response = await fetch("https://sai-finance.vercel.app/api/users/login", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ test: "connection" }),
  //       signal: controller.signal
  //     });

  //     clearTimeout(timeoutId);
  //     setConnectionStatus(`✅ Server reachable (${response.status})`);

  //   } catch (error) {
  //     if (error.name === 'AbortError') {
  //       setConnectionStatus("❌ Timeout - Server not responding");
  //     } else {
  //       setConnectionStatus(`❌ Network Error: ${error.message}`);
  //     }
  //   }
  // };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Basic validation
    if (!phone_number || !password) {
      setError("Please enter phone number and password.");
      setLoading(false);
      return;
    }

    try {
      console.log("Attempting login through AuthContext...");

      // Use the login method from AuthContext
      const result = await login({
        phone_number: phone_number.trim(),
        password: password.trim()
      });

      console.log("Login successful through AuthContext:", result);

      // Navigate to the intended destination
      console.log("Redirecting to:", from);
      navigate(from, { replace: true });

    } catch (error) {
      console.error("Login error:", error);

      // Handle different types of errors
      if (error.message === 'Network Error') {
        setError("Network connection failed. Please check your internet connection or try again later.");
      } else if (error.code === 'ECONNABORTED') {
        setError("Request timeout. The server is taking too long to respond.");
      } else if (error.response) {
        // Server responded with an error status
        const status = error.response.status;
        const serverMessage = error.response.data?.message;

        switch (status) {
          case 401:
            const authError = serverMessage || "Invalid phone number or password";
            setError(authError);
            break;
          case 404:
            setError("Login service not available. Please contact support.");
            break;
          case 500:
            setError("Server error. Please try again later.");
            break;
          default:
            setError(`Server error (${status}): ${serverMessage || 'Please try again.'}`);
        }
      } else if (error.request) {
        setError("No response from server. Please check your connection.");
      } else {
        setError(error.message || "An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #3730a3 25%, #1e40af 50%, #1e3a8a 100%)" }}>
      {/* Animated Background Elements */}

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white rounded-full opacity-20"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          transition={{
            duration: Math.random() * 20 + 10,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear",
          }}
        />
      ))}

      {/* Large Floating Orbs */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20 backdrop-blur-sm"
          style={{
            width: Math.random() * 200 + 100,
            height: Math.random() * 200 + 100,
          }}
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: Math.random() * 15 + 10,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Geometric Shapes */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`shape-${i}`}
          className="absolute border border-white/10"
          style={{
            width: Math.random() * 100 + 50,
            height: Math.random() * 100 + 50,
            borderRadius: i % 2 === 0 ? "50%" : "8px",
          }}
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            rotate: 0,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            rotate: 360,
          }}
          transition={{
            duration: Math.random() * 25 + 15,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear",
          }}
        />
      ))}

      {/* Pulsing Light Effects */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-cyan-400/10 to-transparent blur-3xl"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-gradient-to-l from-blue-500/10 to-transparent blur-3xl"
        animate={{
          scale: [1.2, 0.8, 1.2],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* Animated Grid Lines */}
      <div className="absolute inset-0 opacity-5">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={`line-${i}`}
            className="absolute h-full w-px bg-white"
            style={{ left: `${i * 10}%` }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={`hline-${i}`}
            className="absolute w-full h-px bg-white"
            style={{ top: `${i * 10}%` }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.2 + 1,
            }}
          />
        ))}
      </div>

      {/* Animated Gradient Overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10"
        animate={{
          background: [
            "linear-gradient(45deg, rgba(139,69,193,0.1) 0%, transparent 50%, rgba(6,182,212,0.1) 100%)",
            "linear-gradient(225deg, rgba(6,182,212,0.1) 0%, transparent 50%, rgba(139,69,193,0.1) 100%)",
            "linear-gradient(45deg, rgba(139,69,193,0.1) 0%, transparent 50%, rgba(6,182,212,0.1) 100%)",
          ],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Phone Mockup Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative"
      >
        {/* Phone Frame */}
        <div className="w-80 h-auto max-h-[90vh] bg-white rounded-[2.5rem] shadow-2xl p-8 relative overflow-y-auto">

          {/* Main Content */}
          <div className="flex flex-col h-full">

            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-center mb-6"
            >
              <img
                src={LogoDark}
                alt="Logo"
                className="w-20 h-20 mx-auto object-contain"
              />
            </motion.div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-center mb-8 mt-4"
            >
              <h1 className="text-2xl font-bold text-gray-800 tracking-wide">
                HELLO SIGN IN
              </h1>
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm text-center"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-6 flex-1">

              {/* Email/Phone Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="relative"
              >
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={phone_number}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full px-4 py-4 bg-gray-100 border-0 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:bg-gray-50 transition-all duration-300 text-base"
                  />
                  {phone_number && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2"
                    >
                      <FiCheck className="w-5 h-5 text-green-500" />
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="relative"
              >
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-4 bg-gray-100 border-0 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:bg-gray-50 transition-all duration-300 text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                  >
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>


              {/* Forgot Password - Temporarily disabled */}


              {/* Sign In Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="pt-8"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed text-base"
                  style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #3730a3 25%, #1e40af 50%, #1e3a8a 100%)" }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    "SIGN IN"
                  )}
                </motion.button>
              </motion.div>
            </form>

          </div>
        </div>

        {/* Phone Frame Border/Shadow */}
        <div className="absolute inset-0 rounded-[2.5rem] border border-gray-200 pointer-events-none"></div>
      </motion.div>
    </div>
  );
};

export default NewLogin;
