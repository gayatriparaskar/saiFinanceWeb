import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../axios";
import { motion } from "framer-motion";

import LogoDark from "../../Images/Sai-removebg-preview.png";
import HomeImage from "../../Images/secure-login-concept-illustration.png";
import { FcGoogle } from "react-icons/fc";
const NewLogin = () => {
  const [phone_number, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Reset any previous errors

    try {
      const response = await axios.post("users/login", { phone_number, password });

      if (response.data && response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        window.location.replace("/dash");
        console.log(response.data)
      }
    } catch (error) {
      setError("Invalid credentials, please try again."); // Set error message if login fails
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const logoVariants = {
    hidden: { opacity: 0, scale: 0.8, rotate: -10 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        type: "spring",
        stiffness: 200
      }
    }
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="rounded-2xl border bg-white/80 backdrop-blur-sm shadow-2xl w-full sm:w-96 overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ y: -2 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-wrap items-center">
          {/* Left Image Section */}
          <motion.div
            className="w-full xl:w-1/2 text-center md:block p-6"
            variants={itemVariants}
          >
            <motion.div
              variants={logoVariants}
              whileHover={{ scale: 1.05, rotate: 2 }}
              transition={{ duration: 0.3 }}
            >
              <Link className="mb-5.5 w-32 inline-block sm:m-auto" to="/">
                <img className="w-44 drop-shadow-lg" src={LogoDark} alt="Logo" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Login Form Section */}
          <motion.div
            className="w-full xl:w-1/2 xl:border-l-2 border-stroke dark:border-strokedark p-4 sm:p-12.5 xl:p-17.5"
            variants={itemVariants}
          >
            <motion.h2
              className="mb-6 text-2xl font-bold text-black dark:text-white sm:text-title-xl2 bg-gradient-to-r from-crimson to-purple bg-clip-text text-transparent"
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              Welcome Back
            </motion.h2>

            {/* Error Message Display */}
            {error && (
              <motion.div
                className="text-red-500 mb-4 p-3 border border-red-300 rounded-lg bg-red-50"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.div>
            )}

            <motion.form
              onSubmit={handleLogin}
              variants={itemVariants}
            >
              {/* Username (Mobile Number) */}
              <motion.div
                className="mb-4"
                variants={itemVariants}
              >
                <motion.label
                  className="text-start mb-2.5 block font-medium text-black dark:text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Mobile
                </motion.label>
                <motion.input
                  type="text"
                  placeholder="Enter Your Mobile"
                  value={phone_number}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-crimson focus:ring-2 focus:ring-crimson/20 dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary transition-all duration-300"
                  whileFocus={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                />
              </motion.div>

              {/* Password */}
              <motion.div
                className="mb-6"
                variants={itemVariants}
              >
                <motion.label
                  className="text-start mb-2.5 block font-medium text-black dark:text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Password
                </motion.label>
                <motion.input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-crimson focus:ring-2 focus:ring-crimson/20 dark:bg-form-input dark:text-white transition-all duration-300"
                  whileFocus={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                />
              </motion.div>

              {/* Submit Button */}
              <motion.div
                className="mb-5"
                variants={itemVariants}
              >
                <motion.button
                  type="submit"
                  className="w-full cursor-pointer rounded-lg border bg-gradient-to-r from-crimson to-purple p-4 text-white font-xl transition-all duration-300 flex justify-center shadow-lg"
                  disabled={loading}
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(255, 126, 66, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  {loading ? (
                    <motion.div
                      className="flex items-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <svg
                        className="animate-spin h-5 w-5 mr-3 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        ></path>
                      </svg>
                      Signing In...
                    </motion.div>
                  ) : (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      LOGIN
                    </motion.span>
                  )}
                </motion.button>
              </motion.div>
            </motion.form>

            {/* Forgot Password Link */}
            <motion.div
              className="text-center"
              variants={itemVariants}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  to="/forgot-password"
                  className="text-sm text-crimson hover:text-purple transition-colors duration-300 font-medium"
                >
                  Forgot Password?
                </Link>
              </motion.div>
            </motion.div>

            <motion.hr
              className="mt-6 border-gray-200"
              variants={itemVariants}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            />

          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NewLogin;
