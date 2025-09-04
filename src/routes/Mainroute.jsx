import React, { useEffect, useState } from 'react'
import { Route, Routes, Navigate, useLocation } from 'react-router-dom'
import NewDashboard from '../pages/Dashboard/main/NewDashboard';
import OfficerLayout from '../pages/Dashboard/officer/OfficerLayout';
import { Riple } from 'react-loading-indicators';
import NewLogin from '../pages/SignIn/NewLogin';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

const Mainroute = () => {
  const { isAuthenticated, isLoading: authLoading, userType } = useAuth();
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
      setLoading(true);
      const timer = setTimeout(() => {
          setLoading(false);
      }, 1000); // Adjust timeout as needed

      return () => clearTimeout(timer);
  }, [location]);

  // Show loading while checking authentication or during page transitions
  if (authLoading || loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
        <div className="text-center">
          <Riple color="#FF782D" size="medium" text="" textColor="" />
          <p className="mt-4 text-gray-600 font-medium">
            {authLoading ? 'Checking authentication...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path='/login'
        element={
          isAuthenticated ? (
            <Navigate to="/dash/home" replace />
          ) : (
            <NewLogin />
          )
        }
      />

      {/* Root redirect - if authenticated go to appropriate dashboard, else go to login */}
      <Route
        path='/'
        element={
          <Navigate to={
            isAuthenticated 
              ? (userType === 'officer' ? "/officer/dashboard" : "/dash/home")
              : "/login"
          } replace />
        }
      />

      {/* Protected User Dashboard Routes */}
      <Route
        path='/dash/*'
        element={
          <ProtectedRoute>
            <NewDashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected Officer Dashboard Routes */}
      <Route
        path='/officer/*'
        element={
          <ProtectedRoute>
            <OfficerLayout />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path='/admin/*'
        element={
          <ProtectedRoute>
            <OfficerLayout />
          </ProtectedRoute>
        }
      />

      {/* Manager Routes */}
      <Route
        path='/manager/*'
        element={
          <ProtectedRoute>
            <OfficerLayout />
          </ProtectedRoute>
        }
      />

      {/* Accounter Routes */}
      <Route
        path='/accounter/*'
        element={
          <ProtectedRoute>
            <OfficerLayout />
          </ProtectedRoute>
        }
      />

      {/* Catch all route - redirect to appropriate page based on auth status */}
      <Route
        path='*'
        element={
          <Navigate to={
            isAuthenticated 
              ? (userType === 'officer' ? "/officer/dashboard" : "/dash/home")
              : "/login"
          } replace />
        }
      />
    </Routes>
  );
};

export default Mainroute;
