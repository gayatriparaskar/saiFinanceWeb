import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import {
  FaHandHoldingUsd,
  FaChartLine,
  FaUserFriends,
  FaMoneyBillWave,
} from "react-icons/fa";

function CollectionOfficerDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalCollection: 0,
    totalLoan: 0,
    totalSaving: 0,
    loanUsers: 0,
    savingUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("daily");
  const [periodStats, setPeriodStats] = useState({
    totalLoan: 0,
    totalSaving: 0,
    loanUsers: 0,
    savingUsers: 0,
    totalCollections: 0,
    totalAmount: 0,
  });

  const officerName = user?.name || user?.phone_number || "Collection Officer";

  useEffect(() => {
    fetchDashboardData();
    fetchPeriodData(selectedPeriod);
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Import axios here to avoid circular dependency
      const axios = (await import("../../axios")).default;

      console.log("🔄 Fetching real officer dashboard data...");
      console.log("🔄 Current user:", user);
      console.log("🔄 User role:", user?.officer_type);

      // Fetch officer data with user_collections
      console.log("🔄 Making API call to /officers...");
      const officerResponse = await axios.get(
        `officers/${user?.officerId || user?._id}`
      );
      console.log("🔄 API Response received:", officerResponse);
      console.log("🔄 Response status:", officerResponse.status);
      console.log("🔄 Response data:", officerResponse.data);

      const officerData = officerResponse.data.result || {};
      const assignedUsers = officerData.user_collections || [];

      console.log(
        "👥 Assigned users from user_collections:",
        assignedUsers.length
      );
      console.log("👥 Users data:", assignedUsers);
      console.log("👥 Officer data:", officerData);

      // Store assigned users for table display
      setAssignedUsers(assignedUsers);

      // Calculate stats from user_collections data
      const loanUsers = assignedUsers.filter(
        (user) => user.account_type === "loan account"
      ).length;
      const savingUsers = assignedUsers.filter(
        (user) => user.account_type === "saving account"
      ).length;

      // Calculate total amounts from user_collections
      let totalLoanAmount = 0;
      let totalSavingAmount = 0;

      assignedUsers.forEach((user) => {
        if (user.account_type === "loan account") {
          totalLoanAmount += user.total_amount || 0;
        }
        if (user.account_type === "saving account") {
          totalSavingAmount += user.total_amount || 0;
        }
      });

      const totalCollection = totalLoanAmount + totalSavingAmount;

      setStats({
        totalCollection,
        totalLoan: totalLoanAmount,
        totalSaving: totalSavingAmount,
        loanUsers,
        savingUsers,
      });

      // No need to fetch collection data - focus only on assigned users
      console.log(
        "📊 Focus on assigned users only - no collection data needed"
      );
    } catch (error) {
      console.error("❌ Error fetching dashboard data:", error);

      // Fallback to empty data on error
      setStats({
        totalCollection: 0,
        totalLoan: 0,
        totalSaving: 0,
        loanUsers: 0,
        savingUsers: 0,
      });
      setAssignedUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const fetchPeriodData = async (period) => {
    try {
      const axios = (await import("../../axios")).default;

      console.log(`🔄 Fetching ${period} data...`);

      // Calculate date ranges based on period
      const now = new Date();
      let startDate, endDate;

      switch (period) {
        case "daily":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 1);
          break;
        case "weekly":
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          startDate = new Date(
            startOfWeek.getFullYear(),
            startOfWeek.getMonth(),
            startOfWeek.getDate()
          );
          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 7);
          break;
        case "monthly":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          break;
        default:
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 1);
      }

      // Fetch loan collections
      const loanCollectionsResponse = await axios.get("dailyCollections", {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });

      // Fetch saving collections
      const savingCollectionsResponse = await axios.get(
        "savingDailyCollections",
        {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          },
        }
      );

      const loanCollections = loanCollectionsResponse.data.result || [];
      const savingCollections = savingCollectionsResponse.data.result || [];

      // Calculate period stats
      const totalLoanAmount = loanCollections.reduce(
        (sum, collection) => sum + (collection.amount || 0),
        0
      );
      const totalSavingAmount = savingCollections.reduce(
        (sum, collection) => sum + (collection.deposit_amount || 0),
        0
      );
      const totalCollections =
        loanCollections.length + savingCollections.length;
      const totalAmount = totalLoanAmount + totalSavingAmount;

      // Get unique users
      const loanUsers = new Set(loanCollections.map((c) => c.user_id?._id))
        .size;
      const savingUsers = new Set(savingCollections.map((c) => c.user_id?._id))
        .size;

      setPeriodStats({
        totalLoan: totalLoanAmount,
        totalSaving: totalSavingAmount,
        loanUsers: loanUsers,
        savingUsers: savingUsers,
        totalCollections: totalCollections,
        totalAmount: totalAmount,
      });

      console.log(`📊 ${period} stats updated:`, {
        totalLoan: totalLoanAmount,
        totalSaving: totalSavingAmount,
        totalCollections,
        totalAmount,
      });
    } catch (error) {
      console.error(`❌ Error fetching ${period} data:`, error);
      setPeriodStats({
        totalLoan: 0,
        totalSaving: 0,
        loanUsers: 0,
        savingUsers: 0,
        totalCollections: 0,
        totalAmount: 0,
      });
    }
  };

  // These functions are no longer needed since we're not using collections data

  const startEditing = (id, field) => {
    setEditingId(id);
    setEditingField(field);
  };

  const stopEditing = () => {
    setEditingId(null);
    setEditingField(null);
  };

  const getRemainingDays = (user) => {
    const currentDate = new Date();
    let endDate;

    if (user?.end_date) {
      endDate = new Date(user.end_date);
    } else if (user.created_on) {
      const createdDate = new Date(user.created_on);
      endDate = new Date(createdDate.getTime() + 120 * 24 * 60 * 60 * 1000);
    } else {
      endDate = new Date(currentDate.getTime() + 120 * 24 * 60 * 60 * 1000);
    }

    const timeDiff = endDate - currentDate;
    return Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Loading Collection Officer Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 ">
      {/* Navbar */}

      {/* Main Content */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="pt-8"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Header */}
          <motion.div
            variants={itemVariants}
            className="bg-white shadow-sm border border-gray-200 rounded-xl px-4 sm:px-6 py-4 mt-0 sm:mt-0"
          >
            <div className="flex items-center justify-between mt-0">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Welcome, {officerName}!
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Collection Officer Dashboard - Track your collections and
                  targets
                </p>
              </div>
              <div className="flex items-center gap-4">
                {/* Period Selector */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setSelectedPeriod("daily")}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      selectedPeriod === "daily"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Daily
                  </button>
                  <button
                    onClick={() => setSelectedPeriod("weekly")}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      selectedPeriod === "weekly"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Weekly
                  </button>
                  <button
                    onClick={() => setSelectedPeriod("monthly")}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      selectedPeriod === "monthly"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Monthly
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={itemVariants} className="py-6">
            <div
              className="grid grid-cols-5 gap-4 overflow-x-auto"
              style={{ minWidth: "1000px" }}
            >
              {/* Total Collection */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow min-w-[200px]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {selectedPeriod.charAt(0).toUpperCase() +
                        selectedPeriod.slice(1)}{" "}
                      Collections
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {periodStats.totalCollections}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <FaHandHoldingUsd className="text-xl text-green-600" />
                  </div>
                </div>
              </div>

              {/* Total Loan */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow min-w-[200px]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Amount Collected
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      ₹{periodStats.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <FaMoneyBillWave className="text-xl text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Total Saving */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow min-w-[200px]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Loan Amount
                    </p>
                    <p className="text-2xl font-bold text-purple-600">
                      ₹{periodStats.totalLoan.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <FaChartLine className="text-xl text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Loan Users */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow min-w-[200px]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Saving Amount
                    </p>
                    <p className="text-2xl font-bold text-orange-600">
                      ₹{periodStats.totalSaving.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <FaUserFriends className="text-xl text-orange-600" />
                  </div>
                </div>
              </div>

              {/* Saving Users */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow min-w-[200px]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Active Users
                    </p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {periodStats.loanUsers + periodStats.savingUsers}
                    </p>
                  </div>
                  <div className="p-3 bg-indigo-100 rounded-full">
                    <FaUserFriends className="text-xl text-indigo-600" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Assigned Users Table */}
          <motion.div variants={itemVariants} className="py-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Assigned Users
                </h3>
                <button
                  onClick={fetchDashboardData}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Refreshing..." : "Refresh Data"}
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sr No.
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Account Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        EMI Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Remaining Days
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assignedUsers.map((user, index) => (
                      <tr
                        key={user.user_id || index}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-gray-500">
                              {user.address}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.phone_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.account_type === "loan account"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {user.account_type === "loan account"
                              ? "Loan"
                              : "Saving"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{user.emiAmount || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{user.total_amount || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{user.collected_amount || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{user.total_due_amount || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getRemainingDays(user)} days
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
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
