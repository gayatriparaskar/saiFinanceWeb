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

  const checkAuthState = useCallback(async () => {
    try {
      setIsLoading(true);

      // Get token from localStorage
      const storedToken = localStorage.getItem('token');

      if (storedToken) {
        console.log('Found stored token, validating...');

        // Validate token (you can add token expiry validation here)
        if (isTokenValid(storedToken)) {
          setToken(storedToken);
          setIsAuthenticated(true);

          // You can optionally fetch user profile here
          console.log('Token is valid, user is authenticated');
        } else {
          console.log('Token is invalid or expired, removing...');
          localStorage.removeItem("token");
          setToken(null);
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        console.log('No token found, user is not authenticated');
        setIsAuthenticated(false);
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
    try {
      setIsLoading(true);
      
      // Import axios here to avoid circular dependency
      const axios = (await import('../axios')).default;
      
      console.log("Attempting login with AuthContext...");
      
      const response = await axios.post("users/login", {
        phone_number: credentials.phone_number.trim(),
        password: credentials.password.trim()
      });

      console.log("Login successful:", response.data);

      if (response.data && response.data.accessToken) {
        const accessToken = response.data.accessToken;
        
        // Store token in localStorage
        localStorage.setItem("token", accessToken);
        
        // Update state
        setToken(accessToken);
        setIsAuthenticated(true);
        setUser(response.data.user || {});

        // Store account type in IndexedDB
        const userAccountType = response.data.user?.account_type ||
                               response.data.account_type ||
                               response.data.result?.account_type ||
                               response.data.data?.account_type ||
                               response.data.user?.accountType ||
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

        console.log("Login successful with AuthContext");
        return { success: true, data: response.data };
      } else {
        throw new Error("Login successful but no access token received");
      }
    } catch (error) {
      console.error("Login error in AuthContext:", error);
      
      // Reset auth state on login failure
      setIsAuthenticated(false);
      setToken(null);
      setUser(null);
      
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
