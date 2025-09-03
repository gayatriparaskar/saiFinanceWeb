import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaHandHoldingUsd, 
  FaChartLine, 
  FaUserFriends, 
  FaMoneyBillWave
} from 'react-icons/fa';

function CollectionOfficerDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalCollection: 0,
    totalLoan: 0,
    totalSaving: 0,
    loanUsers: 0,
    savingUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingField, setEditingField] = useState(null);

  const officerName = user?.name || user?.phone_number || 'Collection Officer';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch collection data (you can add these endpoints later)
      // For now, using mock data
      setStats({
        totalCollection: 450000,
        totalLoan: 300000,
        totalSaving: 150000,
        loanUsers: 45,
        savingUsers: 32
      });

                    // Mock collection data
        setCollections([
          {
            id: 1,
            date: '2024-01-15',
            day: 'Monday',
            userName: 'Rahul Sharma',
            assignedTo: 'officer',
            amountAssigned: 50000,
            status: 'Completed',
            amountPaid: 50000,
            remainingAmount: 0
          },
          {
            id: 2,
            date: '2024-01-14',
            day: 'Sunday',
            userName: 'Priya Patel',
            assignedTo: 'manager',
            amountAssigned: 75000,
            status: 'In Progress',
            amountPaid: 45000,
            remainingAmount: 30000
          },
          {
            id: 3,
            date: '2024-01-13',
            day: 'Saturday',
            userName: 'Amit Kumar',
            assignedTo: 'accounter',
            amountAssigned: 60000,
            status: 'Pending',
            amountPaid: 0,
            remainingAmount: 60000
          }
        ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleAssignedChange = (id, newValue) => {
    setCollections(collections.map(collection => 
      collection.id === id 
        ? { ...collection, assignedTo: newValue }
        : collection
    ));
  };

  const handleStatusChange = (id, newValue) => {
    setCollections(collections.map(collection => 
      collection.id === id 
        ? { ...collection, status: newValue }
        : collection
    ));
  };

  const startEditing = (id, field) => {
    setEditingId(id);
    setEditingField(field);
  };

  const stopEditing = () => {
    setEditingId(null);
    setEditingField(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Collection Officer Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 ">
      {/* Navbar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 bg-transparent shadow-none border-b-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                     <div className="flex justify-between items-center h-14 sm:h-16">
             {/* Left side - Logo */}
             <div className="flex items-center gap-2 sm:gap-3">
               <img src="/Sai-removebg-preview.png" alt="Sai Finance" className="h-6 sm:h-7 w-auto" />
             </div>

             {/* Center - Officer Name and Type */}
             <div className="flex flex-col items-center text-center">
               <h1 className="text-lg sm:text-xl font-bold text-gray-800">{officerName}</h1>
               <p className="text-sm text-gray-600">Collection Officer</p>
             </div>

             {/* Right side - Empty for balance */}
             <div className="w-20 sm:w-24"></div>
           </div>
        </div>


      </motion.nav>

      {/* Main Content */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="pt-24"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        {/* <motion.div 
          variants={itemVariants}
          className="bg-white shadow-sm border border-gray-200 rounded-xl px-4 sm:px-6 py-4 mt-4 sm:mt-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Welcome, {officerName}!</h1>
              <p className="text-sm sm:text-base text-gray-600">Collection Officer Dashboard - Track your daily collections and targets</p>
            </div>
          </div>
        </motion.div> */}

                 {/* Stats Cards */}
         <motion.div 
           variants={itemVariants}
           className="py-6"
         >
           <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">
             {/* Total Collection */}
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm font-medium text-gray-600">Total Collection</p>
                   <p className="text-2xl font-bold text-green-600">₹{stats.totalCollection.toLocaleString()}</p>
                 </div>
                 <div className="p-3 bg-green-100 rounded-full">
                   <FaHandHoldingUsd className="text-xl text-green-600" />
                 </div>
               </div>
             </div>

             {/* Total Loan */}
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm font-medium text-gray-600">Total Loan</p>
                   <p className="text-2xl font-bold text-blue-600">₹{stats.totalLoan.toLocaleString()}</p>
                 </div>
                 <div className="p-3 bg-blue-100 rounded-full">
                   <FaMoneyBillWave className="text-xl text-blue-600" />
                 </div>
               </div>
             </div>

             {/* Total Saving */}
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm font-medium text-gray-600">Total Saving</p>
                   <p className="text-2xl font-bold text-purple-600">₹{stats.totalSaving.toLocaleString()}</p>
                 </div>
                 <div className="p-3 bg-purple-100 rounded-full">
                   <FaChartLine className="text-xl text-purple-600" />
                 </div>
               </div>
             </div>

             {/* Loan Users */}
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm font-medium text-gray-600">Loan Users</p>
                   <p className="text-2xl font-bold text-orange-600">{stats.loanUsers}</p>
                 </div>
                 <div className="p-3 bg-orange-100 rounded-full">
                   <FaUserFriends className="text-xl text-orange-600" />
                 </div>
               </div>
             </div>

             {/* Saving Users */}
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm font-medium text-gray-600">Saving Users</p>
                   <p className="text-2xl font-bold text-indigo-600">{stats.savingUsers}</p>
                 </div>
                 <div className="p-3 bg-indigo-100 rounded-full">
                   <FaUserFriends className="text-xl text-indigo-600" />
                 </div>
               </div>
             </div>
           </div>
         </motion.div>

                 {/* Collection Details Table */}
         <motion.div 
           variants={itemVariants}
           className="py-6"
         >
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
             <h3 className="text-lg font-semibold text-gray-900 mb-4">Collection Details</h3>
             <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-200">
                                   <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Paid</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {collections.map((collection) => (
                      <tr key={collection.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{collection.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{collection.day}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{collection.userName}</td>
                                                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                           {editingId === collection.id && editingField === 'assignedTo' ? (
                             <select
                               value={collection.assignedTo || 'officer'}
                               onChange={(e) => handleAssignedChange(collection.id, e.target.value)}
                               onBlur={stopEditing}
                               className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                               autoFocus
                             >
                               <option value="officer">Officer</option>
                               <option value="manager">Manager</option>
                               <option value="accounter">Accounter</option>
                               <option value="admin">Admin</option>
                             </select>
                           ) : (
                             <div 
                               className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                               onClick={() => startEditing(collection.id, 'assignedTo')}
                             >
                               {collection.assignedTo ? collection.assignedTo.charAt(0).toUpperCase() + collection.assignedTo.slice(1) : 'Officer'}
                             </div>
                           )}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap">
                           {editingId === collection.id && editingField === 'status' ? (
                             <select
                               value={collection.status}
                               onChange={(e) => handleStatusChange(collection.id, e.target.value)}
                               onBlur={stopEditing}
                               className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                             >
                               <option value="In Progress">In Progress</option>
                               <option value="Pending">Pending</option>
                               <option value="Failed">Failed</option>
                               <option value="Completed">Completed</option>
                             </select>
                           ) : (
                             <span 
                               className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer hover:opacity-80 ${
                                 collection.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                 collection.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                                 collection.status === 'Failed' ? 'bg-red-100 text-red-800' :
                                 'bg-gray-100 text-gray-800'
                               }`}
                               onClick={() => startEditing(collection.id, 'status')}
                             >
                               {collection.status}
                             </span>
                           )}
                         </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">₹{collection.amountPaid.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">₹{collection.remainingAmount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
           </div>
         </motion.div>


        </div>
      </motion.div>
    </div>
  );
}

export default CollectionOfficerDashboard;
