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
  Box,
  Text,
  Avatar,
  VStack,
  HStack,
  Grid,
  GridItem,
  Progress,
  Badge,
  Card,
  CardBody,
  Flex,
  Icon,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import axios from "../../axios";
import { getAccountType, storeAccountType } from "../../utils/indexedDB";
import UserLogo from "../../Images/60111.jpg";
import bgImage from "../../Images/homepagebg.jpg";
import dayjs from "dayjs";

// Motion components
const MotionBox = motion(Box);
const MotionCard = motion(Card);
const MotionButton = motion(Button);

const HomePage = () => {
  const toast = useToast();
  const { t, i18n } = useTranslation();

  // Translation object for HomePage
  const translations = {
    en: {
      active_account: "Active Account",
      loan_progress_overview: "📊 Loan Progress Overview",
      loan_completion: "Loan Completion",
      loan_amount: "💰 Loan Amount",
      total_due: " Total Due",
      total_paid: "✅ Total Paid",
      account_information: "📋 Account Information",
      account_created: "📅 Account Created",
      mobile_number: "📱 Mobile Number",
      allotted_officer: "👮 Allotted Officer",
      monthly_emi: "💳 Daily EMI",
      penalty_amount: "⚠️ Penalty Amount",
      quick_overview: "⚡ Quick Overview",
      payment_progress: "Payment Progress",
      remaining_balance: "Remaining Balance",
      account_status: "Account Status",
      completed: "Completed ✅",
      active: "Active",
      add_payment: "💰 Add Payment",
      add_penalty: "⚠️ Add Penalty",
      withdraw: "💸 Withdraw",
      add_amount: "💰 Add Amount",
      add_payment_details: "💰 Add Payment Amount",
      add_penalty_details: "⚠️ Add Penalty Charge",
      add_withdraw_details: "💸 Withdraw Amount",
      withdraw_amount: "Withdraw Amount",
      enter_withdraw_amount: "Enter amount to withdraw",
      submit_withdraw: "Submit Withdrawal",
      success_withdraw_completed: "Success! Withdrawal completed successfully",
      payment_amount: "Payment Amount",
      officer_pin: "Officer PIN",
      enter_amount: "Enter amount to pay",
      enter_officer_pin: "Enter officer PIN",
      cancel: "Cancel",
      submit_payment: "Submit Payment",
      apply_penalty: "Apply Penalty",
      success_amount_added: "Success! Amount Added successfully",
      success_penalty_added: "Success! Penalty Added successfully",
      something_went_wrong: "Something Went Wrong!",
      account_balance_overview: "💰 Account Balance Overview",
      current_balance: "💰 Current Balance",
      account_type: "📋 Account Type",
      saving_account: "Saving Account",
      loan_account: "Loan Account",
      saving_account_dashboard: "Saving Account Dashboard",
      loan_account_dashboard: "Loan Account Dashboard",
      EMI_Payment: "EMI Payment",
      Send_Deposit_Amount: "Send Deposit Amount",
      Deposit_Amount: "Deposit Amount",
      Enter_Deposit_Amount: "Enter amount to deposit",
    },
    hi: {
      active_account: "सक्रिय खाता",
      loan_progress_overview: "ऋण प्रगति अवलोकन",
      loan_completion: "ऋण पूर्णता",
      loan_amount: "ऋण राशि",
      total_due: "कुल बकाया",
      total_paid: "कुल भुगतान",
      account_information: "खाता जानकारी",
      account_created: "खाता बनाया गया",
      mobile_number: "मोबाइल नंबर",
      monthly_emi: "दैनिक ईएमआई",
      penalty_amount: "जुर्माना राशि",
      quick_overview: "त्वरित अवलोकन",
      payment_progress: "भुगतान प्रगति",
      remaining_balance: "शेष राशि",
      account_status: "खाता उपस्थिति",
      completed: "पूर्ण",
      active: "सक्रिय",
      add_payment: "भुगतान जोड़ें",
      add_penalty: "जुर्माना जोड़ें",
      withdraw: "निकालें",
      add_amount: "राशि जोड़ें",
      add_payment_details: "भुगतान राशि जोड़ें",
      add_penalty_details: "जुर्माना शुल्क जोड़ें",
      payment_amount: "भुगतान राशि",
      officer_pin: "अधिकारी पिन",
      enter_amount: "भुगतान राशि दर्ज करें",
      enter_officer_pin: "अधिकारी पिन दर्ज करें",
      cancel: "रद्द करें",
      submit_payment: "भुगतान जमा करें",
      apply_penalty: "जुर्माना लगाएं",
      add_withdraw_details: "निकासी राशि",
      withdraw_amount: "निकासी राशि",
      enter_withdraw_amount: "निकासी राशि दर्ज करें",
      submit_withdraw: "निकासी जमा करें",
      success_amount_added: "सफलता! राशि सफलतापूर्वक जोड़ी गई",
      success_penalty_added: "सफलता! जुर्माना सफलतापूर्वक जोड़ा गया",
      success_withdraw_completed: "सफलता! निकासी सफलतापूर्वक पूरी हुई",
      something_went_wrong: "कुछ गलत हुआ!",
      account_balance_overview: "खाता बैलेंस अवलोकन",
      current_balance: "वर्तमान शेष राशि",
      account_type: "खाता प्रकार",
      saving_account: "बचत खाता",
      loan_account: "ऋण खाता",
      saving_account_dashboard: "बचत खाता डैशबोर्ड",
      loan_account_dashboard: "ऋण खाता डैशबोर्ड",
      EMI_Payment: "ईएमआई भुगतान",
      Send_Deposit_Amount: "जमा राशि भेजें",
      Deposit_Amount: "जमा राशि",
      Enter_Deposit_Amount: "जमा करने के लिए राशि दर्ज करें",
    },
  };

  const currentLang = i18n.language || "en";
  const getText = (key) =>
    translations[currentLang]?.[key] || translations.en[key];

  const [isAmountModalOpen, setIsAmountModalOpen] = useState(false);
  const [isPenaltyModalOpen, setIsPenaltyModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [collected_officer_code, setPin] = useState("");
  const [profile, setProfile] = useState([]);
  const [addPenaltyFlag, setPenalty] = useState(true);
  const [isUpdatingBalance, setIsUpdatingBalance] = useState(false);
  const [userAccountType, setUserAccountType] = useState(null);
  const [isLoadingAccountType, setIsLoadingAccountType] = useState(true);

  // Function to fetch and update profile data
  const fetchProfile = async (showLoading = false) => {
    try {
      if (showLoading) setIsUpdatingBalance(true);
      const response = await axios.get("/users/profile");
      const profileData = response?.data?.result;
      setProfile(profileData);
      console.log("Profile data updated:", profileData);

      // Check if we need to update the account type in IndexedDB
      if (profileData?.account_type) {
        const currentStoredType = await getAccountType();
        console.log("Current stored account type:", currentStoredType);
        console.log("Profile account type:", profileData.account_type);

        // If we have a pending fetch or no account type stored, update it
        if (
          !currentStoredType ||
          currentStoredType === "pending_profile_fetch"
        ) {
          try {
            await storeAccountType(profileData.account_type);
            console.log(
              "✅ Account type updated in IndexedDB from profile:",
              profileData.account_type
            );
            setUserAccountType(profileData.account_type);
          } catch (indexedDbError) {
            console.error(
              "❌ Error updating account type in IndexedDB:",
              indexedDbError
            );
          }
        }
      }

      return profileData;
    } catch (error) {
      console.error("Error fetching user data", error);
      throw error;
    } finally {
      if (showLoading) setIsUpdatingBalance(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      // Get account type from IndexedDB first
      try {
        const accountType = await getAccountType();
        console.log("Account type retrieved from IndexedDB:", accountType);

        // If we have a valid account type (not pending), use it
        if (accountType && accountType !== "pending_profile_fetch") {
          setUserAccountType(accountType);
          setIsLoadingAccountType(false);
        } else {
          console.log(
            "Account type is pending or missing, will fetch from profile"
          );
          // Keep loading state until profile is fetched
        }
      } catch (error) {
        console.error("Error getting account type from IndexedDB:", error);
        setIsLoadingAccountType(false);
      }

      // Fetch profile (this will also handle account type storage if needed)
      try {
        const profileData = await fetchProfile();

        // If we didn't have a valid account type before, set loading to false now
        if (!userAccountType || userAccountType === "pending_profile_fetch") {
          setIsLoadingAccountType(false);
        }
      } catch (profileError) {
        console.error("Error fetching profile:", profileError);
        setIsLoadingAccountType(false);
      }
    };

    initializeData();
  }, []);

  const openAmountModal = () => {
    setIsAmountModalOpen(true);
  };

  const openPenaltyModal = () => {
    setIsPenaltyModalOpen(true);
  };

  const openWithdrawModal = () => {
    setIsWithdrawModalOpen(true);
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
          title: getText("success_amount_added"),
          status: "success",
          duration: 4000,
          isClosable: true,
          position: "top",
        });

        // Clear form fields
        setAmount("");
        setPin("");

        // Refetch profile data to get updated balance
        try {
          await fetchProfile(true);
        } catch (profileError) {
          console.error("Error refetching profile:", profileError);
          // Fallback to page reload if profile refetch fails
          window.location.reload();
        }
      }
    } catch (error) {
      toast({
        title: getText("something_went_wrong"),
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const handlessavingAmountSubmit = async (e) => {
    e.preventDefault();
    setIsAmountModalOpen(false);
    setIsPenaltyModalOpen(false);

    // Validate amount
    if (!amount || amount.trim() === "") {
      toast({
        title: getText("please_enter_amount"),
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    if (parseFloat(amount) <= 0) {
      toast({
        title: "Amount must be greater than 0",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    // Validate officer code
    if (!collected_officer_code || collected_officer_code.trim() === "") {
      toast({
        title: getText("please_enter_officer_pin"),
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    let obj = { deposit_amount: parseFloat(amount), collected_officer_code };

    try {
      const response = await axios.post("/savingDailyCollections", obj);
      if (response.data) {
        toast({
          title: getText("success_amount_added"),
          status: "success",
          duration: 4000,
          isClosable: true,
          position: "top",
        });

        // Clear form fields
        setAmount("");
        setPin("");

        // Refetch profile data to get updated balance
        try {
          await fetchProfile(true);
        } catch (profileError) {
          console.error("Error refetching profile:", profileError);
          // Fallback to page reload if profile refetch fails
          window.location.reload();
        }
      }
    } catch (error) {
      toast({
        title: getText("something_went_wrong"),
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
          title: getText("success_penalty_added"),
          status: "success",
          duration: 4000,
          isClosable: true,
          position: "top",
        });

        // Clear form fields
        setPin("");

        // Refetch profile data to get updated information
        try {
          await fetchProfile();
        } catch (profileError) {
          console.error("Error refetching profile:", profileError);
          // Fallback to page reload if profile refetch fails
          window.location.reload();
        }
      }
    } catch (error) {
      toast({
        title: getText("something_went_wrong"),
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    setIsWithdrawModalOpen(false);

    // Validation
    if (!withdrawAmount || !collected_officer_code) {
      toast({
        title: "Please fill in all required fields",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    if (parseFloat(withdrawAmount) <= 0) {
      toast({
        title: "Withdrawal amount must be greater than 0",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    const obj = {
      amount: parseFloat(withdrawAmount),
      collected_officer_code,
      transaction_type: "withdraw",
    };

    try {
      const response = await axios.post("/savings/withdraw", obj);
      if (response.data) {
        toast({
          title: getText("success_withdraw_completed"),
          status: "success",
          duration: 4000,
          isClosable: true,
          position: "top",
        });
        setWithdrawAmount("");
        setPin("");

        // Refetch profile data to get updated balance
        try {
          await fetchProfile();
        } catch (profileError) {
          console.error("Error refetching profile:", profileError);
          // Fallback to page reload if profile refetch fails
          window.location.reload();
        }
      }
    } catch (error) {
      toast({
        title: getText("something_went_wrong"),
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    }
  };

  // Account type logic - prioritize IndexedDB value over profile value
  const accountType = userAccountType || profile?.account_type;
  const isSavingAccount = accountType?.toLowerCase().includes("saving account");
  const isLoanAccount = accountType?.toLowerCase().includes("loan account");

  // Show loading state while account type is being retrieved
  if (isLoadingAccountType) {
    return (
      <Box
        minH="100vh"
        bg="linear-gradient(135deg, #1e3a8a 0%, #3730a3 25%, #1e40af 50%, #1e3a8a 100%)"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text color="white" fontSize="xl" fontWeight="bold">
          Loading...
        </Text>
      </Box>
    );
  }

  // Calculate loan progress
  const loanAmount = parseFloat(profile?.active_loan_id?.loan_amount) || 0;
  const totalPaid = parseFloat(profile?.active_loan_id?.total_amount) || 0;
  const totalDue = parseFloat(profile?.active_loan_id?.total_due_amount) || 0;
  const loanProgress =
    loanAmount > 0 ? Math.min((totalPaid / loanAmount) * 100, 100) : 0;

  // Account balance for saving account
  const accountBalance =
    parseFloat(profile?.saving_account_id?.current_amount) || 0;
  const depositAmount = parseFloat(profile?.saving_account_id?.current_amount);

  return (
    <Box
      minH="100vh"
      bg="linear-gradient(135deg, #1e3a8a 0%, #3730a3 25%, #1e40af 50%, #1e3a8a 100%)"
      position="relative"
      overflow="hidden"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {/* Professional Background Pattern */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        opacity="0.1"
        bgImage={`radial-gradient(circle at 25px 25px, white 2px, transparent 2px)`}
        bgSize="50px 50px"
      />

      {/* Animated Background Elements */}
      <MotionBox
        position="absolute"
        top="10%"
        left="5%"
        w="200px"
        h="200px"
        bg="linear-gradient(45deg, #3b82f6, #60a5fa)"
        borderRadius="full"
        opacity="0.1"
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <MotionBox
        position="absolute"
        bottom="15%"
        right="8%"
        w="150px"
        h="150px"
        bg="linear-gradient(45deg, #8b5cf6, #a78bfa)"
        borderRadius="full"
        opacity="0.1"
        animate={{
          y: [0, 20, 0],
          scale: [1.1, 1, 1.1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main Content Container */}
      <Box
        px={{ base: 4, md: 8 }}
        py={{ base: 6, md: 8 }}
        pt={{ base: "100px", md: "120px" }}
        maxW="7xl"
        w="full"
        position="relative"
        zIndex="1"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
      >
        {/* Header Section */}
        {/* <MotionBox
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          textAlign="center"
          mb={{ base: 6, md: 8 }}
          w="full"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Avatar
              src={UserLogo}
              size={{ base: "xl", md: "2xl" }}
              border="4px solid"
              borderColor="white"
              shadow="2xl"
              mb={4}
              bg="white"
            />
          </motion.div>
          
          <Text
            fontSize={{ base: "2xl", md: "4xl", lg: "5xl" }}
            fontWeight="bold"
            color="white"
            mb={3}
            fontFamily="Poppins, sans-serif"
            textShadow="2px 2px 4px rgba(0,0,0,0.3)"
          >
            {profile?.full_name}
          </Text>

          <Badge
            bg="#10b981"
            color="white"
            fontSize={{ base: "md", md: "lg" }}
            px={{ base: 4, md: 6 }}
            py={2}
            borderRadius="full"
            fontWeight="bold"
            textTransform="capitalize"
          >
            ✓ {getText('active_account')}
          </Badge>
        </MotionBox> */}

        {/* Main Content Section - Conditional based on account type */}
        <MotionCard
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          bg="white"
          shadow="2xl"
          borderRadius="2xl"
          mb={{ base: 6, md: 8 }}
          overflow="hidden"
          w="full"
          maxW="6xl"
        >
          <CardBody p={{ base: 6, md: 8 }}>
            {isSavingAccount ? (
              // Saving Account Overview
              <>
                <Text
                  fontSize={{ base: "xl", md: "2xl" }}
                  fontWeight="bold"
                  color="gray.800"
                  textAlign="center"
                  mb={6}
                >
                  {getText("saving_account_dashboard")}
                </Text>

                <Grid
                  templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                  gap={{ base: 4, md: 6 }}
                >
                  <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    <Card bg="#d1fae5" borderLeft="4px solid #10b981">
                      <CardBody p={6} textAlign="center">
                        <Text fontSize="sm" color="gray.600" mb={2}>
                          {getText("current_balance")}
                        </Text>
                        <Text
                          fontSize={{ base: "2xl", md: "3xl" }}
                          fontWeight="bold"
                          color="#059669"
                        >
                          ₹{depositAmount?.toLocaleString() || "0"}
                          {isUpdatingBalance && (
                            <span
                              style={{ marginLeft: "8px", fontSize: "16px" }}
                            >
                              ...
                            </span>
                          )}
                        </Text>
                      </CardBody>
                    </Card>
                  </MotionBox>

                  <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  >
                    <Card bg="#eff6ff" borderLeft="4px solid #3b82f6">
                      <CardBody p={6} textAlign="center">
                        <Text fontSize="sm" color="gray.600" mb={2}>
                          {getText("account_type")}
                        </Text>
                        <Text
                          fontSize={{ base: "xl", md: "2xl" }}
                          fontWeight="bold"
                          color="#1e40af"
                        >
                          {getText("saving_account")}
                        </Text>
                      </CardBody>
                    </Card>
                  </MotionBox>
                </Grid>
              </>
            ) : (
              // Loan Account Overview (Default)
              <>
                <Text
                  fontSize={{ base: "xl", md: "2xl" }}
                  fontWeight="bold"
                  color="gray.800"
                  textAlign="center"
                  mb={6}
                >
                  {getText("loan_account_dashboard")}
                </Text>

                <Box mb={6}>
                  <Flex justify="space-between" align="center" mb={2}>
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      {getText("loan_completion")}
                    </Text>
                    <Text fontSize="sm" color="gray.800" fontWeight="bold">
                      {loanProgress.toFixed(1)}%
                    </Text>
                  </Flex>
                  <Progress
                    value={loanProgress}
                    size="lg"
                    colorScheme="blue"
                    borderRadius="full"
                    bg="gray.100"
                  />
                </Box>

                <Grid
                  templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
                  gap={{ base: 4, md: 6 }}
                >
                  <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    <Card bg="#eff6ff" borderLeft="4px solid #3b82f6">
                      <CardBody p={4} textAlign="center">
                        <Text fontSize="sm" color="gray.600" mb={1}>
                          {getText("loan_amount")}
                        </Text>
                        <Text
                          fontSize={{ base: "xl", md: "2xl" }}
                          fontWeight="bold"
                          color="#1e40af"
                        >
                          ₹{loanAmount.toLocaleString()}
                        </Text>
                      </CardBody>
                    </Card>
                  </MotionBox>

                  <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  >
                    <Card bg="#fef3c7" borderLeft="4px solid #f59e0b">
                      <CardBody p={4} textAlign="center">
                        <Text fontSize="sm" color="gray.600" mb={1}>
                          {getText("total_due")}
                        </Text>
                        <Text
                          fontSize={{ base: "xl", md: "2xl" }}
                          fontWeight="bold"
                          color="#d97706"
                        >
                          ₹{totalDue.toLocaleString()}
                        </Text>
                      </CardBody>
                    </Card>
                  </MotionBox>

                  <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                  >
                    <Card bg="#d1fae5" borderLeft="4px solid #10b981">
                      <CardBody p={4} textAlign="center">
                        <Text fontSize="sm" color="gray.600" mb={1}>
                          {getText("total_paid")}
                        </Text>
                        <Text
                          fontSize={{ base: "xl", md: "2xl" }}
                          fontWeight="bold"
                          color="#059669"
                        >
                          ₹{totalPaid.toLocaleString()}
                        </Text>
                      </CardBody>
                    </Card>
                  </MotionBox>
                </Grid>
              </>
            )}
          </CardBody>
        </MotionCard>

        {/* Action Buttons - Conditional based on account type */}
        <MotionBox
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          w="full"
          maxW="4xl"
          mb={{ base: 6, md: 8 }}
        >
          {isSavingAccount ? (
            // Saving Account UI - Show Add Amount button only
            <Flex
              direction={{ base: "column", md: "row" }}
              gap={{ base: 4, md: 8 }}
              justify="center"
              align="center"
            >
              <MotionButton
                whileHover={{ scale: 1.02, y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={openAmountModal}
                bg="linear-gradient(135deg, #10b981, #059669)"
                color="white"
                size="lg"
                borderRadius="xl"
                px={{ base: 8, md: 12 }}
                py={{ base: 6, md: 8 }}
                fontSize={{ base: "lg", md: "xl" }}
                fontWeight="bold"
                shadow="xl"
                _hover={{
                  shadow: "2xl",
                }}
                w={{ base: "full", md: "auto" }}
                minW="200px"
                h={{ base: "60px", md: "70px" }}
              >
                <Text>{getText("add_amount")}</Text>
              </MotionButton>
            </Flex>
          ) : (
            // Loan Account UI (Default) - Show Add Payment and Add Penalty buttons
            <Flex
              direction={{ base: "column", md: "row" }}
              gap={{ base: 4, md: 8 }}
              justify="center"
              align="center"
            >
              <MotionButton
                whileHover={{ scale: 1.02, y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={openAmountModal}
                bg="linear-gradient(135deg, #10b981, #059669)"
                color="white"
                size="lg"
                borderRadius="xl"
                px={{ base: 8, md: 12 }}
                py={{ base: 6, md: 8 }}
                fontSize={{ base: "lg", md: "xl" }}
                fontWeight="bold"
                shadow="xl"
                _hover={{
                  shadow: "2xl",
                }}
                w={{ base: "full", md: "auto" }}
                minW="200px"
                h={{ base: "60px", md: "70px" }}
              >
                <Text>{getText("EMI_Payment")}</Text>
              </MotionButton>

              <MotionButton
                whileHover={{ scale: 1.02, y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={openPenaltyModal}
                bg="linear-gradient(135deg, #ef4444, #dc2626)"
                color="white"
                size="lg"
                borderRadius="xl"
                px={{ base: 8, md: 12 }}
                py={{ base: 6, md: 8 }}
                fontSize={{ base: "lg", md: "xl" }}
                fontWeight="bold"
                shadow="xl"
                _hover={{
                  shadow: "2xl",
                }}
                w={{ base: "full", md: "auto" }}
                minW="200px"
                h={{ base: "60px", md: "70px" }}
              >
                <Text>{getText("add_penalty")}</Text>
              </MotionButton>
            </Flex>
          )}
        </MotionBox>
        {/* Details Grid */}
        <Grid
          templateColumns={{ base: "1fr", lg: "2fr 1fr" }}
          gap={{ base: 6, md: 8 }}
          mb={{ base: 6, md: 8 }}
          w="full"
          maxW="6xl"
        >
          {/* Account Details */}
          <MotionCard
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            bg="white"
            shadow="xl"
            borderRadius="xl"
          >
            <CardBody p={{ base: 6, md: 8 }}>
              <Text
                fontSize={{ base: "lg", md: "xl" }}
                fontWeight="bold"
                color="gray.800"
                mb={6}
              >
                {getText("account_information")}
              </Text>

              <VStack spacing={4} align="stretch">
                {[
                  {
                    key: "account_created",
                    value: dayjs(profile?.created_on).format(
                      "D MMM, YYYY h:mm A"
                    ),
                  },
                  { key: "mobile_number", value: profile?.phone_number },
                  // Add officer information for both account types
                  {
                    key: "allotted_officer",
                    value: profile?.officer_id?.name || 'Not Assigned',
                    icon: "👮",
                  },
                  ...(isSavingAccount
                    ? []
                    : [
                        {
                          key: "monthly_emi",
                          value: `₹${profile?.active_loan_id?.emi_day}`,
                        },
                        {
                          key: "penalty_amount",
                          value: `${profile?.active_loan_id?.total_penalty_amount}`,
                        },
                      ]),
                ].map((item, index) => (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + index * 0.1, duration: 0.4 }}
                  >
                    <Flex
                      justify="space-between"
                      align="center"
                      p={4}
                      bg="gray.50"
                      borderRadius="lg"
                      border="1px solid"
                      borderColor="gray.200"
                      _hover={{
                        bg: "gray.100",
                        borderColor: "gray.300",
                        transform: "translateY(-2px)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <Text
                        color="gray.700"
                        fontWeight="medium"
                        fontSize={{ base: "sm", md: "md" }}
                      >
                        {getText(item.key)}
                      </Text>
                      <Text
                        color="gray.900"
                        fontWeight="bold"
                        fontSize={{ base: "sm", md: "md" }}
                      >
                        {item.value}
                      </Text>
                    </Flex>
                  </motion.div>
                ))}
              </VStack>
            </CardBody>
          </MotionCard>

          {/* Quick Stats */}
          <MotionCard
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            bg="white"
            shadow="xl"
            borderRadius="xl"
          >
            <CardBody p={{ base: 6, md: 8 }}>
              <Text
                fontSize={{ base: "lg", md: "xl" }}
                fontWeight="bold"
                color="gray.800"
                mb={6}
              >
                {getText("quick_overview")}
              </Text>

              <VStack spacing={4}>
                <Card bg="linear-gradient(135deg, #3b82f6, #1d4ed8)" w="full">
                  <CardBody p={4} textAlign="center">
                    <Text
                      color="white"
                      fontSize="sm"
                      fontWeight="medium"
                      opacity="0.9"
                    >
                      {getText("payment_progress")}
                    </Text>
                    <Text color="white" fontSize="2xl" fontWeight="bold">
                      {loanProgress.toFixed(1)}%
                    </Text>
                  </CardBody>
                </Card>

                <Card bg="linear-gradient(135deg, #f59e0b, #d97706)" w="full">
                  <CardBody p={4} textAlign="center">
                    <Text
                      color="white"
                      fontSize="sm"
                      fontWeight="medium"
                      opacity="0.9"
                    >
                      {getText("remaining_balance")}
                    </Text>
                    <Text color="white" fontSize="xl" fontWeight="bold">
                      ₹{totalDue.toLocaleString()}
                    </Text>
                  </CardBody>
                </Card>

                <Card bg="linear-gradient(135deg, #10b981, #059669)" w="full">
                  <CardBody p={4} textAlign="center">
                    <Text
                      color="white"
                      fontSize="sm"
                      fontWeight="medium"
                      opacity="0.9"
                    >
                      {getText("account_status")}
                    </Text>
                    <Text color="white" fontSize="lg" fontWeight="bold">
                      {totalDue === 0
                        ? getText("completed")
                        : getText("active")}
                    </Text>
                  </CardBody>
                </Card>
              </VStack>
            </CardBody>
          </MotionCard>
        </Grid>
      </Box>

      {/* Enhanced Modal for Amount Details */}
      <AnimatePresence>
        {isAmountModalOpen && (
          <Modal
            isOpen={isAmountModalOpen}
            onClose={() => setIsAmountModalOpen(false)}
            isCentered
            size={{ base: "sm", md: "md" }}
          >
            <ModalOverlay bg="blackAlpha.600" />
            <ModalContent
              as={motion.div}
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ duration: 0.3 }}
              mx={4}
              borderRadius="2xl"
              bg="white"
              shadow="2xl"
            >
              <ModalHeader
                fontSize={{ base: "xl", md: "2xl" }}
                fontWeight="bold"
                color="#10b981"
                textAlign="center"
                borderBottom="1px solid"
                borderColor="gray.200"
                pb={4}
              >
                {isSavingAccount
                  ? getText("Deposit_Amount")
                  : getText("EMI_Payment")}
              </ModalHeader>
              <ModalCloseButton size="lg" />
              <ModalBody py={6}>
                <VStack spacing={6}>
                  <FormControl isRequired>
                    <FormLabel
                      fontWeight="semibold"
                      color="gray.700"
                      fontSize="md"
                    >
                      {isSavingAccount
                        ? getText("Deposit_Amount")
                        : getText("payment_amount")}
                    </FormLabel>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={
                        isSavingAccount
                          ? getText("Enter_Deposit_Amount")
                          : getText("enter_amount")
                      }
                      size="lg"
                      borderRadius="xl"
                      border="2px solid"
                      borderColor="gray.200"
                      _focus={{
                        borderColor: "#10b981",
                        boxShadow: "0 0 0 1px #10b981",
                      }}
                      bg="white"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel
                      fontWeight="semibold"
                      color="gray.700"
                      fontSize="md"
                    >
                      {getText("officer_pin")}
                    </FormLabel>
                    <Input
                      type="text"
                      value={collected_officer_code}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder={getText("enter_officer_pin")}
                      size="lg"
                      borderRadius="xl"
                      border="2px solid"
                      borderColor="gray.200"
                      _focus={{
                        borderColor: "#10b981",
                        boxShadow: "0 0 0 1px #10b981",
                      }}
                      bg="white"
                    />
                  </FormControl>
                </VStack>
              </ModalBody>
              <ModalFooter gap={3}>
                <Button
                  onClick={() => setIsAmountModalOpen(false)}
                  variant="outline"
                  borderRadius="xl"
                  size="lg"
                >
                  {getText("cancel")}
                </Button>
                <Button
                  onClick={
                    isSavingAccount
                      ? handlessavingAmountSubmit
                      : handleAmountSubmit
                  }
                  bg="#10b981"
                  color="white"
                  borderRadius="xl"
                  size="lg"
                  _hover={{ bg: "#059669" }}
                >
                  {isSavingAccount
                    ? getText("Send_Deposit_Amount")
                    : getText("submit_payment")}
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>

      {/* Enhanced Modal for Penalty Details */}
      <AnimatePresence>
        {isPenaltyModalOpen && (
          <Modal
            isOpen={isPenaltyModalOpen}
            onClose={() => setIsPenaltyModalOpen(false)}
            isCentered
            size={{ base: "sm", md: "md" }}
          >
            <ModalOverlay bg="blackAlpha.600" />
            <ModalContent
              as={motion.div}
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ duration: 0.3 }}
              mx={4}
              borderRadius="2xl"
              bg="white"
              shadow="2xl"
            >
              <ModalHeader
                fontSize={{ base: "xl", md: "2xl" }}
                fontWeight="bold"
                color="#ef4444"
                textAlign="center"
                borderBottom="1px solid"
                borderColor="gray.200"
                pb={4}
              >
                {getText("add_penalty_details")}
              </ModalHeader>
              <ModalCloseButton size="lg" />
              <ModalBody py={6}>
                <FormControl isRequired>
                  <FormLabel
                    fontWeight="semibold"
                    color="gray.700"
                    fontSize="md"
                  >
                    {getText("officer_pin")}
                  </FormLabel>
                  <Input
                    type="text"
                    value={collected_officer_code}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder={getText("enter_officer_pin")}
                    size="lg"
                    borderRadius="xl"
                    border="2px solid"
                    borderColor="gray.200"
                    _focus={{
                      borderColor: "#ef4444",
                      boxShadow: "0 0 0 1px #ef4444",
                    }}
                    bg="white"
                  />
                </FormControl>
              </ModalBody>
              <ModalFooter gap={3}>
                <Button
                  onClick={() => setIsPenaltyModalOpen(false)}
                  variant="outline"
                  borderRadius="xl"
                  size="lg"
                >
                  {getText("cancel")}
                </Button>
                <Button
                  onClick={handlePenaltySubmit}
                  bg="#ef4444"
                  color="white"
                  borderRadius="xl"
                  size="lg"
                  _hover={{ bg: "#dc2626" }}
                >
                  {getText("apply_penalty")}
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>

      {/* Enhanced Modal for Withdraw Details */}
      <AnimatePresence>
        {isWithdrawModalOpen && (
          <Modal
            isOpen={isWithdrawModalOpen}
            onClose={() => setIsWithdrawModalOpen(false)}
            isCentered
            size={{ base: "sm", md: "md" }}
          >
            <ModalOverlay bg="blackAlpha.600" />
            <ModalContent
              as={motion.div}
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ duration: 0.3 }}
              mx={4}
              borderRadius="2xl"
              bg="white"
              shadow="2xl"
            >
              <ModalHeader
                fontSize={{ base: "xl", md: "2xl" }}
                fontWeight="bold"
                color="#f59e0b"
                textAlign="center"
                borderBottom="1px solid"
                borderColor="gray.200"
                pb={4}
              >
                {getText("add_withdraw_details")}
              </ModalHeader>
              <ModalCloseButton size="lg" />
              <ModalBody py={6}>
                <VStack spacing={6}>
                  <FormControl isRequired>
                    <FormLabel
                      fontWeight="semibold"
                      color="gray.700"
                      fontSize="md"
                    >
                      {getText("withdraw_amount")}
                    </FormLabel>
                    <Input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder={getText("enter_withdraw_amount")}
                      size="lg"
                      borderRadius="xl"
                      border="2px solid"
                      borderColor="gray.200"
                      _focus={{
                        borderColor: "#f59e0b",
                        boxShadow: "0 0 0 1px #f59e0b",
                      }}
                      bg="white"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel
                      fontWeight="semibold"
                      color="gray.700"
                      fontSize="md"
                    >
                      {getText("officer_pin")}
                    </FormLabel>
                    <Input
                      type="text"
                      value={collected_officer_code}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder={getText("enter_officer_pin")}
                      size="lg"
                      borderRadius="xl"
                      border="2px solid"
                      borderColor="gray.200"
                      _focus={{
                        borderColor: "#f59e0b",
                        boxShadow: "0 0 0 1px #f59e0b",
                      }}
                      bg="white"
                    />
                  </FormControl>
                </VStack>
              </ModalBody>
              <ModalFooter gap={3}>
                <Button
                  onClick={() => setIsWithdrawModalOpen(false)}
                  variant="outline"
                  borderRadius="xl"
                  size="lg"
                >
                  {getText("cancel")}
                </Button>
                <Button
                  onClick={handleWithdrawSubmit}
                  bg="#f59e0b"
                  color="white"
                  borderRadius="xl"
                  size="lg"
                  _hover={{ bg: "#d97706" }}
                >
                  {getText("submit_withdraw")}
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default HomePage;
