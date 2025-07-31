import React, { useEffect, useState } from "react";
import {
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  FaMoneyBillWave,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaPhone,
  FaRupeeSign,
  FaChartLine,
  FaWallet,
  FaUser,
  FaCreditCard
} from "react-icons/fa";
import axios from "../../axios";
import UserLogo from "../../Images/60111.jpg";
import dayjs from "dayjs";

const HomePage = () => {
  const toast = useToast();

  const [isAmountModalOpen, setIsAmountModalOpen] = useState(false);
  const [isPenaltyModalOpen, setIsPenaltyModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [collected_officer_code, setPin] = useState("");
  const [profile, setProfile] = useState([]);
  const [addPenaltyFlag, setPenalty] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get("/users/profile");
        setProfile(response?.data?.result);
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };

    fetchProfile();
  }, []);

  const openAmountModal = () => {
    setIsAmountModalOpen(true);
  };

  const openPenaltyModal = () => {
    setIsPenaltyModalOpen(true);
  };

  const handleAmountSubmit = async (e) => {
    e.preventDefault();
    setIsAmountModalOpen(false);
    setIsPenaltyModalOpen(false);

    let obj = { amount, collected_officer_code };

    try {
      const response = await axios.post("/dailyCollections", obj);
      if (response.data) {
        toast({
          title: "Success! Amount Added successfully",
          status: "success",
          duration: 4000,
          isClosable: true,
          position: "top",
        });
        window.location.reload();
      }
    } catch (error) {
      toast({
        title: "Something Went Wrong!",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const handlePenaltySubmit = async (e) => {
    e.preventDefault();
    setIsAmountModalOpen(false);
    setIsPenaltyModalOpen(false);

    const obj = { collected_officer_code, addPenaltyFlag };

    try {
      const response = await axios.post("/dailyCollections", obj);
      if (response.data) {
        toast({
          title: "Success! Penalty Added successfully",
          status: "success",
          duration: 4000,
          isClosable: true,
          position: "top",
        });
        window.location.reload();
      }
    } catch (error) {
      toast({
        title: "Something Went Wrong!",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
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

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-20 pb-8 px-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <motion.div
          className="text-center mb-8"
          variants={itemVariants}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple to-crimson bg-clip-text text-transparent mb-2">
            Welcome Back, {profile?.full_name}!
          </h1>
          <p className="text-gray-600 text-lg">Your financial dashboard overview</p>
        </motion.div>

        {/* Stats Cards Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={itemVariants}
        >
          {/* Loan Amount Card */}
          <motion.div
            className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-blue-500 hover:shadow-2xl transition-all duration-300"
            variants={cardVariants}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Loan</p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatCurrency(profile?.active_loan_id?.loan_amount)}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FaWallet className="text-blue-600 text-xl" />
              </div>
            </div>
          </motion.div>

          {/* EMI Card */}
          <motion.div
            className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-green-500 hover:shadow-2xl transition-all duration-300"
            variants={cardVariants}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Monthly EMI</p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatCurrency(profile?.active_loan_id?.emi_day)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FaCreditCard className="text-green-600 text-xl" />
              </div>
            </div>
          </motion.div>

          {/* Total Due Card */}
          <motion.div
            className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-orange-500 hover:shadow-2xl transition-all duration-300"
            variants={cardVariants}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Amount Due</p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatCurrency(profile?.active_loan_id?.total_due_amount)}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <FaChartLine className="text-orange-600 text-xl" />
              </div>
            </div>
          </motion.div>

          {/* Penalty Card */}
          <motion.div
            className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-red-500 hover:shadow-2xl transition-all duration-300"
            variants={cardVariants}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Penalty</p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatCurrency(profile?.active_loan_id?.total_penalty_amount)}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <FaExclamationTriangle className="text-red-600 text-xl" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div
            className="lg:col-span-1"
            variants={itemVariants}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl p-8 text-center h-full"
              variants={cardVariants}
              whileHover={{ scale: 1.02 }}
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={UserLogo}
                  alt="Profile"
                  className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-purple shadow-lg"
                />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{profile?.full_name}</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center space-x-3 text-gray-600">
                  <FaPhone className="text-purple" />
                  <span className="font-medium">{profile?.phone_number}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <FaCalendarAlt className="text-purple" />
                  <span className="font-medium">
                    {dayjs(profile?.created_on).format("D MMM, YYYY")}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <FaUser className="text-purple" />
                  <span className="font-medium">Customer ID: {profile?.id}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Payment Summary & Actions */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            variants={itemVariants}
          >
            {/* Payment Summary */}
            <motion.div
              className="bg-white rounded-2xl shadow-xl p-8"
              variants={cardVariants}
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <FaRupeeSign className="text-purple mr-3" />
                Payment Summary
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                    <span className="font-medium text-gray-700">Total Paid</span>
                    <span className="font-bold text-green-600 text-lg">
                      {formatCurrency(profile?.active_loan_id?.total_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                    <span className="font-medium text-gray-700">Loan Amount</span>
                    <span className="font-bold text-blue-600 text-lg">
                      {formatCurrency(profile?.active_loan_id?.loan_amount)}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-orange-50 rounded-xl">
                    <span className="font-medium text-gray-700">Amount Due</span>
                    <span className="font-bold text-orange-600 text-lg">
                      {formatCurrency(profile?.active_loan_id?.total_due_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-red-50 rounded-xl">
                    <span className="font-medium text-gray-700">Penalty</span>
                    <span className="font-bold text-red-600 text-lg">
                      {formatCurrency(profile?.active_loan_id?.total_penalty_amount)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="bg-white rounded-2xl shadow-xl p-8"
              variants={cardVariants}
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.button
                  onClick={openAmountModal}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-3"
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(34, 197, 94, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaMoneyBillWave className="text-xl" />
                  <span>Add Payment</span>
                </motion.button>

                <motion.button
                  onClick={openPenaltyModal}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-3"
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(239, 68, 68, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaExclamationTriangle className="text-xl" />
                  <span>Add Penalty</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>


      {/* Enhanced Modal for Amount Details */}
      <Modal
        isOpen={isAmountModalOpen}
        onClose={() => setIsAmountModalOpen(false)}
        size="md"
      >
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent
          margin="auto"
          w={{ base: "90%", sm: "400px" }}
          borderRadius="2xl"
          boxShadow="2xl"
        >
          <ModalHeader
            fontSize="2xl"
            fontWeight="bold"
            color="gray.800"
            borderTopRadius="2xl"
            bg="gradient-to-r from-green-50 to-emerald-50"
            display="flex"
            alignItems="center"
            gap={3}
          >
            <FaMoneyBillWave color="#22c55e" />
            Add Payment Amount
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody p={8}>
            <FormControl id="amount" isRequired mb={6}>
              <FormLabel fontSize="lg" fontWeight="semibold" color="gray.700">
                Payment Amount
              </FormLabel>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter payment amount"
                size="lg"
                borderRadius="xl"
                borderColor="gray.300"
                _focus={{ borderColor: "green.500", boxShadow: "0 0 0 3px rgba(34, 197, 94, 0.1)" }}
              />
            </FormControl>
            <FormControl id="pin" isRequired>
              <FormLabel fontSize="lg" fontWeight="semibold" color="gray.700">
                Officer PIN
              </FormLabel>
              <Input
                type="password"
                value={collected_officer_code}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter officer PIN"
                size="lg"
                borderRadius="xl"
                borderColor="gray.300"
                _focus={{ borderColor: "green.500", boxShadow: "0 0 0 3px rgba(34, 197, 94, 0.1)" }}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter display="flex" gap={4} p={8}>
            <Button
              onClick={() => setIsAmountModalOpen(false)}
              variant="outline"
              colorScheme="gray"
              size="lg"
              borderRadius="xl"
              flex={1}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAmountSubmit}
              colorScheme="green"
              size="lg"
              borderRadius="xl"
              flex={1}
              bg="gradient-to-r from-green-500 to-green-600"
              _hover={{ bg: "gradient-to-r from-green-600 to-green-700" }}
            >
              Submit Payment
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Enhanced Modal for Penalty Details */}
      <Modal
        isOpen={isPenaltyModalOpen}
        onClose={() => setIsPenaltyModalOpen(false)}
        size="md"
      >
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent
          margin="auto"
          w={{ base: "90%", sm: "400px" }}
          borderRadius="2xl"
          boxShadow="2xl"
        >
          <ModalHeader
            fontSize="2xl"
            fontWeight="bold"
            color="gray.800"
            borderTopRadius="2xl"
            bg="gradient-to-r from-red-50 to-rose-50"
            display="flex"
            alignItems="center"
            gap={3}
          >
            <FaExclamationTriangle color="#ef4444" />
            Add Penalty Charge
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody p={8}>
            <FormControl id="pin" isRequired>
              <FormLabel fontSize="lg" fontWeight="semibold" color="gray.700">
                Officer PIN
              </FormLabel>
              <Input
                type="password"
                value={collected_officer_code}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter officer PIN"
                size="lg"
                borderRadius="xl"
                borderColor="gray.300"
                _focus={{ borderColor: "red.500", boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.1)" }}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter display="flex" gap={4} p={8}>
            <Button
              onClick={() => setIsPenaltyModalOpen(false)}
              variant="outline"
              colorScheme="gray"
              size="lg"
              borderRadius="xl"
              flex={1}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePenaltySubmit}
              colorScheme="red"
              size="lg"
              borderRadius="xl"
              flex={1}
              bg="gradient-to-r from-red-500 to-red-600"
              _hover={{ bg: "gradient-to-r from-red-600 to-red-700" }}
            >
              Add Penalty
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </motion.div>
  );
};

export default HomePage;
