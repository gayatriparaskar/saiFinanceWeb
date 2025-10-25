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

      // Determine redirect path based on user type and role
      let redirectPath = from;
      
      if (result.userType === 'officer') {
        // Officer-specific routing based on officer_type
        const officerType = result.data.result?.officer_type || result.data.officer_type;
        console.log("Officer type:", officerType);
        
        switch (officerType) {
          case 'admin':
            redirectPath = '/admin/dashboard';
            break;
          case 'manager':
            redirectPath = '/manager/dashboard';
            break;
          case 'accounter':
            redirectPath = '/accounter/dashboard';
            break;
          case 'collection_officer':
            redirectPath = '/officer/dashboard';
            break;
          default:
            redirectPath = '/dash/home';
        }
      } else {
        // Regular user routing
        redirectPath = from;
      }

      // Navigate to the determined destination
      console.log("Redirecting to:", redirectPath);
      navigate(redirectPath, { replace: true });

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-teal-600">
      {/* Simple and Sweet Login Container */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src={LogoDark}
            alt="Logo"
            className="w-16 h-16 mx-auto object-contain"
          />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-teal-800 mb-2">
            Welcome Back
          </h1>
          <p className="text-teal-600 text-sm">
            Sign in to your account
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Phone Field */}
          <div className="relative">
            <label className="block text-sm font-medium text-teal-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter your phone number"
                value={phone_number}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 border border-teal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 bg-teal-50"
              />
              {phone_number && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <FiCheck className="w-5 h-5 text-teal-500" />
                </div>
              )}
            </div>
          </div>

          {/* Password Field */}
          <div className="relative">
            <label className="block text-sm font-medium text-teal-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-teal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 bg-teal-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-teal-400 hover:text-teal-600 transition-colors duration-200"
              >
                {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                "SIGN IN"
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-teal-500 text-xs">
            Secure login powered by Sai Finance
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewLogin;
