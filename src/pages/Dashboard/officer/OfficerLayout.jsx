import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import OfficerNavbar from './OfficerNavbar';
import CollectionOfficerDashboard from './CollectionOfficerDashboard';

const OfficerLayout = () => {
  return (
    <div>
      <OfficerNavbar />
      <Routes>
        {/* Main Dashboard Route - Shows Collection Officer Dashboard */}
        <Route path="/dashboard" element={<CollectionOfficerDashboard />} />
        
        {/* Collection Officer Specific Route - Same as dashboard */}
        <Route path="/collections" element={<CollectionOfficerDashboard />} />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/officer/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/officer/dashboard" replace />} />
      </Routes>
    </div>
  );
};

export default OfficerLayout;
