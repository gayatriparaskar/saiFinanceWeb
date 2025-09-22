import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DailyReport from './DailyReport';
import WeeklyReport from './WeeklyReport';
import MonthlyReport from './MonthlyReport';
import YearlyReport from './YearlyReport';

const CombinedReport = () => {
  const [activeReport, setActiveReport] = useState('daily');

  const reportButtons = [
    { id: 'daily', label: 'Daily Report', icon: '📊', color: 'bg-blue-500 hover:bg-blue-600' },
    { id: 'weekly', label: 'Weekly Report', icon: '📈', color: 'bg-green-500 hover:bg-green-600' },
    { id: 'monthly', label: 'Monthly Report', icon: '📅', color: 'bg-purple-500 hover:bg-purple-600' },
    { id: 'yearly', label: 'Yearly Report', icon: '📆', color: 'bg-orange-500 hover:bg-orange-600' }
  ];

  const renderActiveReport = () => {
    switch (activeReport) {
      case 'daily':
        return <DailyReport />;
      case 'weekly':
        return <WeeklyReport />;
      case 'monthly':
        return <MonthlyReport />;
      case 'yearly':
        return <YearlyReport />;
      default:
        return <DailyReport />;
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      className="min-h-screen bg-gray-50 pt-24"
    >
      <div className="container mx-auto px-4 py-4">
        {/* Report Type Buttons */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {reportButtons.map((button) => (
              <motion.button
                key={button.id}
                onClick={() => setActiveReport(button.id)}
                className={`${button.color} ${
                  activeReport === button.id ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                } text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm font-medium`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-lg">{button.icon}</span>
                <span>{button.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Active Report Content */}
        <motion.div
          key={activeReport}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-lg"
        >
          {renderActiveReport()}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CombinedReport;
