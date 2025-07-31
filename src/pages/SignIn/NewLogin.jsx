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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="rounded-lg border bg-white shadow-xl w-full sm:w-96">
        <div className="flex flex-wrap items-center">
          {/* Left Image Section */}
          <div className="w-full xl:w-1/2 text-center  md:block">
            <Link className="mb-5.5 w-32 inline-block sm:m-auto " to="/">
              <img className="w-44" src={LogoDark} alt="Logo" />
            </Link>
            {/* <div className="w-2/4 m-auto">
              <img className="w-full" src={HomeImage} alt="Home Image" />
            </div> */}
          </div>

          {/* Login Form Section */}
          <div className="w-full xl:w-1/2 xl:border-l-2 border-stroke dark:border-strokedark p-4 sm:p-12.5 xl:p-17.5">
            <h2 className="mb-6 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">Log In</h2>

            {/* Error Message Display */}
            {error && (
              <div className="text-red-500 mb-4 p-2 border border-red-500 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              {/* Username (Mobile Number) */}
              <div className="mb-4">
                <label className="text-start mb-2.5 block font-medium text-black dark:text-white">Mobile</label>
                <input
                  type="text"
                  placeholder="Enter Your Mobile"
                  value={phone_number}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              {/* Password */}
              <div className="mb-6">
                <label className="text-start mb-2.5 block font-medium text-black dark:text-white">Password</label>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg bg-transparent py-4 pl-6 pr-10 text-black focus:ring-0 dark:bg-form-input dark:text-white dark:focus:ring-0"
                />
              </div>

              {/* Submit Button */}
              <div className="mb-5">
                <button
                  type="submit"
                  className="w-full cursor-pointer rounded-lg border bg-crimson p-4 text-white font-xl transition hover:bg-opacity-90 flex justify-center"
                  disabled={loading}
                >
                  {loading ? (
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
                  ) : (
                    "LOGIN"
                  )}
                </button>
              </div>
            </form>

            {/* Forgot Password Link */}
            <div className="text-center">
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Forgot Password?
              </Link>
            </div>
           
            <hr className="mt-6" />
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewLogin;
