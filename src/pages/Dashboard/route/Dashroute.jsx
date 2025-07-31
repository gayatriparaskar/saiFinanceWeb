import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Riple } from 'react-loading-indicators';
// import DashHome from "../userPanal/dashhome/DashHome";

import HomePage from "../../Hompage/HomePage";

const DashRoute = () => {
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
      setLoading(true);
      const timer = setTimeout(() => {
          setLoading(false);
      }, 1000); // Adjust timeout as needed

      return () => clearTimeout(timer);
  }, [location]);

  return (
    <>
      {/* <Authentication> */}
        {loading && (
          <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
            <Riple color="#000000" size="medium" text="" textColor="" />
          </div>
        )}
        <Routes>
          {/* <Route path='/home' element={<MainMcqs />} /> */}

          {/* User Routes */}
          <Route path='/home' element={<HomePage />} />
       
         
          <Route path="*" element={<Navigate to="/dash/home" replace />} />
         
        </Routes>
      
    </>
  );
};

export default DashRoute;
