import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storeAccountType } from '../utils/indexedDB';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [userType, setUserType] = useState(null); // 'user' or 'officer'
  const [userRole, setUserRole] = useState(null); // For officers: 'admin', 'manager', 'accounter', 'collection_officer'

  const checkAuthState = useCallback(async () => {
    try {
      setIsLoading(true);

      // Get token and user type from localStorage
      const storedToken = localStorage.getItem('token');
      const storedUserType = localStorage.getItem('userType');
      const storedUserRole = localStorage.getItem('userRole');

      if (storedToken) {
        console.log('Found stored token, validating...');

        // Validate token (you can add token expiry validation here)
        if (isTokenValid(storedToken)) {
          setToken(storedToken);
          setIsAuthenticated(true);
          setUserType(storedUserType);
          setUserRole(storedUserRole);

          // You can optionally fetch user profile here
          console.log('Token is valid, user is authenticated');
        } else {
          console.log('Token is invalid or expired, removing...');
          localStorage.removeItem("token");
          localStorage.removeItem("userType");
          localStorage.removeItem("userRole");
          setToken(null);
          setIsAuthenticated(false);
          setUser(null);
          setUserType(null);
          setUserRole(null);
        }
      } else {
        console.log('No token found, user is not authenticated');
        setIsAuthenticated(false);
        setUserType(null);
        setUserRole(null);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check for existing authentication on mount
  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]);

  const isTokenValid = (token) => {
    try {
      // Basic token validation - you can add more sophisticated validation
      if (!token || token.length < 10) {
        return false;
      }
      
      // If your token is JWT, you can decode and check expiry
      // For now, we'll do basic validation
      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    } 
  };

  const login = async (credentials) => {
    // Prevent multiple simultaneous login attempts
    if (isLoading) {
      console.log("⚠️ Login already in progress, skipping...");
      return { success: false, message: "Login already in progress" };
    }
    
    try {
      setIsLoading(true);
      
      // Import axios here to avoid circular dependency
      const axios = (await import('../axios')).default;
      
      console.log("🚀🚀🚀 FRESH CODE VERSION 4 - Attempting login with AuthContext...");
      console.log("🚀 Login attempt timestamp:", new Date().toISOString());
      
      // Try officer login first, then user login
      let response;
      let loginType = 'officer';
      
      try {
        console.log("Trying officer login first...");
        response = await axios.post("officers/login", {
          phone_number: credentials.phone_number.trim(),
          password: credentials.password.trim()
        });
        loginType = 'officer';
        console.log("Officer login successful:", response.data);
          
          // DIRECT TOKEN EXTRACTION AND STORAGE - BYPASS COMPLEX FLOW
          const accessToken = response.data.result?.accessToken;
          const userData = response.data.result;
          
          console.log("🔑 DIRECT EXTRACTION - accessToken:", !!accessToken);
          console.log("🔑 DIRECT EXTRACTION - userData:", !!userData);
          console.log("🔑 DIRECT EXTRACTION - officer_type:", userData?.officer_type);
          
          if (accessToken && userData) {
            console.log("✅ DIRECT STORAGE - Storing authentication data...");
            
            // Store in localStorage
            localStorage.setItem("token", accessToken);
            localStorage.setItem("userType", loginType);
            localStorage.setItem("userRole", userData.officer_type);
            
            // Update state
            setToken(accessToken);
            setIsAuthenticated(true);
            setUserType(loginType);
            setUser(userData);
            setUserRole(userData.officer_type);
            
            console.log("✅ DIRECT STORAGE - Authentication complete!");
            console.log("✅ DIRECT STORAGE - Token in localStorage:", !!localStorage.getItem("token"));
            
            return { success: true, data: response.data, userType: loginType };
          } else {
            console.log("❌ DIRECT EXTRACTION - Missing token or userData");
            throw new Error("Token or user data missing from response");
          }
      } catch (officerError) {
        console.log("Officer login failed, trying user login...");
        
        // If officer login fails, try user login
        try {
          response = await axios.post("users/login", {
            phone_number: credentials.phone_number.trim(),
            password: credentials.password.trim()
          });
          loginType = 'user';
          console.log("User login successful:", response.data);
        } catch (userError) {
          console.log("Both officer and user login failed");
          throw officerError; // Throw the original officer error
        }
      }

      // Check for access token in different response structures
      let accessToken = null;
      let userData = null;
      
      console.log("🔍 Token extraction - loginType:", loginType);
      console.log("🔍 Token extraction - response.data:", response.data);
      
      if (loginType === 'officer') {
        // Officer login response structure: { success: true, result: { accessToken, ...officerData } }
        console.log("🔍 Officer login - response.data.result:", response.data.result);
        console.log("🔍 Officer login - response.data.result.accessToken:", response.data.result?.accessToken);
        
        accessToken = response.data.result?.accessToken;
        userData = response.data.result;
        
        console.log("🔍 Officer login - accessToken extracted:", accessToken);
        console.log("🔍 Officer login - userData extracted:", userData);
      } else {
        // User login response structure: { accessToken, user: {...} }
        accessToken = response.data.accessToken;
        userData = response.data.result || response.data.user || response.data;
      }

      console.log("🔍 Final check - response.data:", !!response.data);
      console.log("🔍 Final check - accessToken:", !!accessToken);
      console.log("🔍 Final check - accessToken value:", accessToken);
      
      if (response.data && accessToken) {
        console.log("✅ Token found, proceeding with authentication setup");
        
        // Store token and user type in localStorage
        localStorage.setItem("token", accessToken);
        localStorage.setItem("userType", loginType);
        
        // Update state
        setToken(accessToken);
        setIsAuthenticated(true);
        setUserType(loginType);
        setUser(userData);

        if (loginType === 'officer') {
          // Handle officer-specific data
          const officerType = userData.officer_type;
          setUserRole(officerType);
          localStorage.setItem("userRole", officerType);
          
          // Store officer type in IndexedDB
          try {
            await storeAccountType(`officer_${officerType}`);
            console.log("✅ Officer type stored in IndexedDB:", officerType);
          } catch (indexedDbError) {
            console.error("❌ Error storing officer type in IndexedDB:", indexedDbError);
          }
        } else {
          // Handle user-specific data
          const userAccountType = userData.account_type ||
                                 response.data.account_type ||
                                 response.data.result?.account_type ||
                                 response.data.data?.account_type ||
                                 userData.accountType ||
                                 response.data.accountType;

          console.log("Extracted account type:", userAccountType);

          if (userAccountType) {
            try {
              await storeAccountType(userAccountType);
              console.log("✅ Account type stored in IndexedDB:", userAccountType);
            } catch (indexedDbError) {
              console.error("❌ Error storing account type in IndexedDB:", indexedDbError);
            }
          } else {
            console.warn("⚠️ No account type found in login response - storing temporary flag");
            try {
              await storeAccountType("pending_profile_fetch");
              console.log("🔄 Stored temporary flag - will fetch from profile");
            } catch (indexedDbError) {
              console.error("❌ Error storing temporary flag:", indexedDbError);
            }
          }
        }

        console.log("Login successful with AuthContext");
        return { success: true, data: response.data, userType: loginType };
      } else {
        console.error("❌ Token extraction failed:");
        console.error("❌ response.data exists:", !!response.data);
        console.error("❌ accessToken exists:", !!accessToken);
        console.error("❌ accessToken value:", accessToken);
        console.error("❌ response.data structure:", response.data);
        throw new Error("Login successful but no access token received");
      }
    } catch (error) {
      console.error("Login error in AuthContext:", error);
      
      // Reset auth state on login failure
      setIsAuthenticated(false);
      setToken(null);
      setUser(null);
      setUserType(null);
      setUserRole(null);
      
      throw error; // Re-throw to be handled by the login component
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log("Logging out user...");
      
      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("userType");
      localStorage.removeItem("userRole");
      
      // Clear IndexedDB account type
      try {
        await storeAccountType(null);
        console.log("✅ Cleared account type from IndexedDB");
      } catch (indexedDbError) {
        console.error("❌ Error clearing account type from IndexedDB:", indexedDbError);
      }
      
      // Clear state
      setToken(null);
      setIsAuthenticated(false);
      setUser(null);
      setUserType(null);
      setUserRole(null);
      
      console.log("Logout successful");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    token,
    userType,
    userRole,
    login,
    logout,
    updateUser,
    checkAuthState
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
