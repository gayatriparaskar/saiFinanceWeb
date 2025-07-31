import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { IoMdLogOut } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import { FaBell, FaChevronDown, FaHome, FaCog } from "react-icons/fa";

import Logo from "../../../Images/Sai-finance-logo.png"
import axios from "../../../axios";

const NewNavbar = () => {
  // const { data: user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [pro, setPro] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMenuOpen2, setIsMenuOpen2] = useState(false);


  const [profile, setProfile] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/users/profile');
        setProfile(response?.data?.result);
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };

    fetchProfile();
  }, []);


  const toggleDropdown = (menu) => {
    setOpenDropdown((prev) => (prev === menu ? null : menu));
  };

  const closeDropdown = () => {
    setOpenDropdown(null);
  };

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: -10
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: {
        duration: 0.15
      }
    }
  };

  return (
    <motion.nav
      className="w-full top-0 flex items-center justify-between bg-white/95 backdrop-blur-md border-b border-gray-200 px-6 py-4 fixed z-50 shadow-lg"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo Section */}
      <motion.div
        className="flex items-center space-x-4"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="w-12 h-12">
          <img src={Logo} alt="Sai Finance" className="w-full h-full object-contain" />
        </div>
        <div className="hidden md:block">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple to-crimson bg-clip-text text-transparent">
            Sai Finance
          </h1>
          <p className="text-xs text-gray-500">Loan Management System</p>
        </div>
      </motion.div>

      {/* Center Navigation - Hidden on mobile */}
      <div className="hidden lg:flex items-center space-x-8">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link to="/dash" className="flex items-center space-x-2 text-gray-700 hover:text-purple transition-colors duration-200">
            <FaHome />
            <span className="font-medium">Dashboard</span>
          </Link>
        </motion.div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <motion.button
          className="relative p-2 text-gray-600 hover:text-purple hover:bg-purple/10 rounded-xl transition-colors duration-200"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaBell size={20} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            3
          </span>
        </motion.button>

        {/* Profile Dropdown */}
        <div className="relative">
          <motion.button
            onClick={() => setIsMenuOpen2(!isMenuOpen2)}
            className="flex items-center space-x-3 p-2 pr-4 bg-gradient-to-r from-purple/10 to-crimson/10 rounded-xl hover:from-purple/20 hover:to-crimson/20 transition-all duration-300 border border-purple/20"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-purple to-crimson rounded-full flex items-center justify-center text-white">
              <CgProfile size={18} />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-gray-800 truncate max-w-24">
                {profile?.full_name || 'User'}
              </p>
              <p className="text-xs text-gray-500">Online</p>
            </div>
            <motion.div
              animate={{ rotate: isMenuOpen2 ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <FaChevronDown size={12} className="text-gray-600" />
            </motion.div>
          </motion.button>

          {/* Enhanced Profile Dropdown */}
          <AnimatePresence>
            {isMenuOpen2 && (
              <motion.div
                className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-purple to-crimson p-6 text-white">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <CgProfile size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{profile?.full_name}</h3>
                      <p className="text-white/80 text-sm">{profile?.phone_number}</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-4 space-y-2">
                  <motion.div
                    className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                    whileHover={{ x: 4 }}
                  >
                    <CgProfile className="text-purple" />
                    <span className="font-medium text-gray-700">View Profile</span>
                  </motion.div>

                  <motion.div
                    className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                    whileHover={{ x: 4 }}
                  >
                    <FaCog className="text-purple" />
                    <span className="font-medium text-gray-700">Settings</span>
                  </motion.div>

                  <hr className="my-3 border-gray-200" />

                  <motion.button
                    onClick={() => {
                      localStorage.removeItem("token");
                      navigate("/login");
                    }}
                    className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-red-50 text-red-600 transition-colors duration-200"
                    whileHover={{ x: 4 }}
                  >
                    <IoMdLogOut />
                    <span className="font-medium">Sign Out</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.nav>
  );
};

export default NewNavbar;
