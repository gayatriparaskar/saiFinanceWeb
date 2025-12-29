import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import OfficerNavbar from './OfficerNavbar';
import CollectionOfficerDashboard from './CollectionOfficerDashboard_old';
import ViewLoanUser from './ViewLoanUser';
import ViewSavingUser from './ViewSavingUser';
import DailyReport from './DailyReport';
import WeeklyReport from './WeeklyReport';
import Reports from '../Reports';

const OfficerLayout = () => {
  return (
    <div>
      <OfficerNavbar />
      <Routes>
        {/* Main Dashboard Route - Shows Collection Officer Dashboard */}
        <Route path="/dashboard" element={<CollectionOfficerDashboard />} />
        
        {/* Collection Officer Specific Route - Same as dashboard */}
        <Route path="/collections" element={<CollectionOfficerDashboard />} />
        
        {/* View User Routes */}
        <Route path="/viewLoan/:id" element={<ViewLoanUser />} />
        <Route path="/viewSaving/:id" element={<ViewSavingUser />} />
        
        {/* Report Routes */}
        <Route path="/reports" element={<Reports />} />
        <Route path="/daily-report" element={<DailyReport />} />
        <Route path="/weekly-report" element={<WeeklyReport />} />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/officer/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/officer/dashboard" replace />} />
      </Routes>
    </div>
  );
};

export default OfficerLayout;
