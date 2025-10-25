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

  const isTokenValid = (token) => {
    try {
      if (!token || token.length < 10) return false;
      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  };

  const checkAuthState = useCallback(async () => {
    try {
      setIsLoading(true);

      const storedToken = localStorage.getItem('token');
      const storedUserType = localStorage.getItem('userType');
      const storedUserRole = localStorage.getItem('userRole');
      const storedUser = localStorage.getItem('user');

      if (storedToken) {
        console.log('Found stored token, validating...');
        if (isTokenValid(storedToken)) {
          setToken(storedToken);
          setIsAuthenticated(true);
          setUserType(storedUserType);
          setUserRole(storedUserRole);
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
          console.log('Token is valid, user is authenticated');
        } else {
          console.log('Token invalid or expired, clearing...');
          localStorage.removeItem("token");
          localStorage.removeItem("userType");
          localStorage.removeItem("userRole");
          localStorage.removeItem("user");
          setIsAuthenticated(false);
          setUser(null);
          setUserType(null);
          setUserRole(null);
          setToken(null);
        }
      } else {
        console.log('No token found, user is not authenticated');
        setIsAuthenticated(false);
        setUserType(null);
        setUserRole(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]);

  const login = async (credentials) => {
    if (isLoading) {
      console.log("⚠️ Login already in progress, skipping...");
      return { success: false, message: "Login already in progress" };
    }

    try {
      setIsLoading(true);
      const axios = (await import('../axios')).default;

      console.log("🚀 Attempting login...");

      let response;
      let loginType = 'officer';

      try {
        console.log("Trying officer login...");
        response = await axios.post("officers/login", {
          phone_number: credentials.phone_number.trim(),
          password: credentials.password.trim()
        });
        loginType = 'officer';
      } catch (officerError) {
        console.log("Officer login failed, trying user login...");
        try {
          response = await axios.post("users/login", {
            phone_number: credentials.phone_number.trim(),
            password: credentials.password.trim()
          });
          loginType = 'user';
        } catch (userError) {
          throw officerError;
        }
      }

      let accessToken = null;
      let userData = null;

      if (loginType === 'officer') {
        accessToken = response.data.result?.accessToken;
        userData = response.data.result;
      } else {
        accessToken = response.data.accessToken;
        userData = response.data.result || response.data.user || response.data;
      }

      if (response.data && accessToken && userData) {
        console.log("✅ Token found, storing authentication data...");

        localStorage.setItem("token", accessToken);
        localStorage.setItem("userType", loginType);
        localStorage.setItem("user", JSON.stringify(userData));

        setToken(accessToken);
        setIsAuthenticated(true);
        setUserType(loginType);
        setUser(userData);

        if (loginType === 'officer') {
          const officerType = userData.officer_type;
          setUserRole(officerType);
          localStorage.setItem("userRole", officerType);

          try {
            await storeAccountType(`officer_${officerType}`);
          } catch (e) {
            console.error("Error storing officer type:", e);
          }
        } else {
          const userAccountType = userData.account_type ||
                                 response.data.account_type ||
                                 response.data.result?.account_type ||
                                 userData.accountType;
          if (userAccountType) {
            try {
              await storeAccountType(userAccountType);
            } catch (e) {
              console.error("Error storing account type:", e);
            }
          } else {
            await storeAccountType("pending_profile_fetch");
          }
        }

        console.log("✅ Login complete!");
        return { success: true, data: response.data, userType: loginType };
      } else {
        throw new Error("Login successful but missing access token or user data");
      }
    } catch (error) {
      console.error("Login error:", error);
      setIsAuthenticated(false);
      setToken(null);
      setUser(null);
      setUserType(null);
      setUserRole(null);
      localStorage.removeItem("user");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log("Logging out user...");

      localStorage.removeItem("token");
      localStorage.removeItem("userType");
      localStorage.removeItem("userRole");
      localStorage.removeItem("user");

      try {
        await storeAccountType(null);
        console.log("✅ Cleared account type from IndexedDB");
      } catch (e) {
        console.error("Error clearing IndexedDB:", e);
      }

      setToken(null);
      setIsAuthenticated(false);
      setUser(null);
      setUserType(null);
      setUserRole(null);

      console.log("✅ Logout successful");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
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
