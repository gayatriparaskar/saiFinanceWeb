import React, { useState, useEffect } from 'react'
import { getAccountType } from "../../../../utils/indexedDB";

import CardDataStats from "../../../../componant/CardDataStats/CardDataStats";
import ChartOne from "../../../../componant/Charts/ChartOne";
import ChartTwo from "../../../../componant/Charts/ChartTwo";
import ChartThree from "../../../../componant/Charts/ChartThree";
const DashHome = () => {
  const [isAmountModalOpen, setIsAmountModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [userData, setUserData] = useState({
    name: "John Doe",
    date: "2025-03-01",
    mobile: "+1 234 567 890",
    loan: "$5000",
    emi: "$250",
    totalPaid: "$1500",
    due: "$3500",
    penalty: "$100",
  });

  // Open the modal to add an amount
  const openAmountModal = () => {
    setIsAmountModalOpen(true);
  };

  // Close the modal to add an amount
  const closeAmountModal = () => {
    setIsAmountModalOpen(false);
  };

  // Open the PIN input modal
  const openPinModal = () => {
    setIsPinModalOpen(true);
  };

  // Close the PIN input modal
  const closePinModal = () => {
    setIsPinModalOpen(false);
  };

  // Handle amount submission
  const handleAmountSubmit = (e) => {
    e.preventDefault();
    setIsAmountModalOpen(false);
    openPinModal();
  };

  // Handle PIN submission
  const handlePinSubmit = (e) => {
    e.preventDefault();
    alert(`Payment of ${amount} confirmed with PIN: ${pin}`);
    setPin(""); // Clear the PIN field
    closePinModal(); // Close the PIN modal
  };

  return (
    <div className="bg-gray-100 min-h-screen ">
      {/* Card Section */}
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg border border-gray-200 mt-30 pt-25">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">User Details</h2>

        {/* User Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="text-lg font-semibold text-gray-800">Name:</h5>
            <p className="text-gray-600">{userData.name}</p>
          </div>
          <div>
            <h5 className="text-lg font-semibold text-gray-800">Date:</h5>
            <p className="text-gray-600">{userData.date}</p>
          </div>
          <div>
            <h5 className="text-lg font-semibold text-gray-800">Mobile:</h5>
            <p className="text-gray-600">{userData.mobile}</p>
          </div>
          <div>
            <h5 className="text-lg font-semibold text-gray-800">Loan:</h5>
            <p className="text-gray-600">{userData.loan}</p>
          </div>
          <div>
            <h5 className="text-lg font-semibold text-gray-800">EMI:</h5>
            <p className="text-gray-600">{userData.emi}</p>
          </div>
          <div>
            <h5 className="text-lg font-semibold text-gray-800">Total Paid:</h5>
            <p className="text-gray-600">{userData.totalPaid}</p>
          </div>
          <div>
            <h5 className="text-lg font-semibold text-gray-800">Due:</h5>
            <p className="text-gray-600">{userData.due}</p>
          </div>
          <div>
            <h5 className="text-lg font-semibold text-gray-800">Penalty:</h5>
            <p className="text-gray-600">{userData.penalty}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={openAmountModal}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add Amount
          </button>
          <button className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500">
            Add Penalty
          </button>
        </div>
      </div>

      {/* Amount Modal */}
      {isAmountModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Add Amount</h3>
            <form onSubmit={handleAmountSubmit}>
              <div className="mb-4">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Amount
                </label>
                <input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={closeAmountModal}
                  className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PIN Input Modal */}
      {isPinModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Enter PIN</h3>
            <form onSubmit={handlePinSubmit}>
              <div className="mb-4">
                <label htmlFor="pin" className="block text-sm font-medium text-gray-700">
                  PIN
                </label>
                <input
                  id="pin"
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={closePinModal}
                  className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Pay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashHome
