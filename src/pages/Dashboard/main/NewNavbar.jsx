import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../contexts/AuthContext";

import { IoMdLogOut } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import { FiGlobe } from "react-icons/fi";

import Logo from "../../../Images/Sai-finance-logo.png"
// import axios from "../../axios";
import axios from "../../../axios";

const NewNavbar = () => {
  // const { data: user } = useUser();
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [pro, setPro] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMenuOpen2, setIsMenuOpen2] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');

  const [profile, setProfile] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/users/profile');
        setProfile(response?.data?.result);
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };

    // Load saved language
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && savedLanguage !== currentLanguage) {
      i18n.changeLanguage(savedLanguage);
      setCurrentLanguage(savedLanguage);
    }

    fetchProfile();
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMenuOpen2(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const toggleDropdown = (menu) => {
    setOpenDropdown((prev) => (prev === menu ? null : menu));
  };

  const closeDropdown = () => {
    setOpenDropdown(null);
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setCurrentLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <nav className="w-full top-0 flex items-center justify-between bg-white p-4 shadow-lg fixed  z-50">
      {/* Logo */}
      <div className="text-xl font-bold text-bgBlue  w-16">
        <img src={Logo} alt="" className="w-full" />
      </div>

      {/* User Name in Center (Mobile Only) */}
      <div className="lg:hidden flex-1 flex justify-center">
        <h1 className="text-xl font-bold text-gray-800">
          {profile?.full_name || 'Welcome'}
        </h1>
      </div>

      {/* Avatar & Logout */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsMenuOpen2(!isMenuOpen2)}
          className="flex  bg-purple rounded-xl p-1 text-white text-xl font-bold focus:ring-2 focus:ring-bgBlue dark:focus:ring-bgBlue mr-4"
        >
          {/* <IoSettings size={28} /> */}
          <CgProfile size={28} />
        </button>
      </div>

      {/* Profile Menu */}
      <div
        ref={dropdownRef}
        className={`w-72 absolute z-50 right-4 top-16 bg-white shadow-xl border border-gray-200 rounded-2xl overflow-hidden ${isMenuOpen2 ? "" : "hidden"
          }`}
        id="user-dropdown"
      >
        {/* Close Button */}
        <button
          type="button"
          className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
          onClick={() => setIsMenuOpen2(false)}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header Section */}
        <div className="bg-blue p-4 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <CgProfile size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{profile?.full_name || 'User'}</h3>
              <p className="text-white/80 text-sm">Welcome back!</p>
            </div>
          </div>
        </div>

        {/* User Details Section */}
        <div className="p-4 space-y-3">
          {/* Name */}
          <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
            <CgProfile className="text-purple w-5 h-5" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Full Name</p>
              <p className="text-sm font-medium text-gray-800">{profile?.full_name || 'N/A'}</p>
            </div>
          </div>

          {/* Phone Number */}
          {profile?.phone_number && (
            <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
              <svg className="w-5 h-5 text-green" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
              </svg>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Phone Number</p>
                <p className="text-sm font-medium text-gray-800">{profile?.phone_number}</p>
              </div>
            </div>
          )}
        </div>

        {/* Language Selector */}
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center justify-center mb-3">
            <FiGlobe className="text-purple mr-2" size={18} />
            <span className="text-sm font-semibold text-gray-700">Language / भाषा</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => changeLanguage('en')}
              className={`flex-1 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                currentLanguage === 'en'
                  ? 'bg-purple text-white shadow-md transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              English
            </button>
            <button
              onClick={() => changeLanguage('hi')}
              className={`flex-1 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                currentLanguage === 'hi'
                  ? 'bg-purple text-white shadow-md transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              हिंदी
            </button>
          </div>
        </div>

        {/* Logout Section */}
        <div className="border-t border-gray-100 p-4">
          <button
            onClick={async () => {
              await logout();
              navigate("/login");
            }}
            className="w-full flex items-center justify-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 p-3 rounded-lg transition-all duration-200 font-medium"
          >
            <IoMdLogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NewNavbar;
