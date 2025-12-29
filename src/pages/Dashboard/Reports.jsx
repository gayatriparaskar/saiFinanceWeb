import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { motion } from "framer-motion";
import {
  Box,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  VStack,
  Spinner,
  Center,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Grid,
  GridItem,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  FiTrendingUp,
  FiUsers,
  FiDollarSign,
  FiCalendar,
  FiBarChart2,
  FiClock,
  FiChevronDown,
  FiChevronRight,
} from "react-icons/fi";
import axios from '../../axios'
// Weekly Report Table Component with Day-wise Grouping
const WeeklyReportTable = ({ data }) => {
  const [expandedDays, setExpandedDays] = useState({});
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Group collections by day
  const groupedByDay = data.reduce((acc, collection) => {
    const dayName = new Date(collection.date).toLocaleDateString("en-US", {
      weekday: "long",
    });
    if (!acc[dayName]) {
      acc[dayName] = [];
    }
    acc[dayName].push(collection);
    return acc;
  }, {});

  // Sort days in week order
  const dayOrder = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const sortedDays = dayOrder.filter((day) => groupedByDay[day]);

  const toggleDayExpansion = (day) => {
    setExpandedDays((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  const getDayTotal = (day) => {
    return groupedByDay[day].reduce(
      (sum, collection) => sum + collection.totalAmount,
      0
    );
  };

  const getDayCount = (day) => {
    return groupedByDay[day].length;
  };

  if (data.length === 0) {
    return (
      <Table variant="simple">
        <Tbody>
          <Tr>
            <Td colSpan={7} textAlign="center" py={8}>
              <VStack>
                <FiBarChart2 size={48} color="#9CA3AF" />
                <Text color="gray.500" fontSize="lg">
                  No collections found for weekly report
                </Text>
                <Text color="gray.400" fontSize="sm">
                  Collections will appear here once you start collecting
                  payments
                </Text>
              </VStack>
            </Td>
          </Tr>
        </Tbody>
      </Table>
    );
  }

  return (
    <Table variant="simple">
      <Thead bg="gray.50">
        <Tr>
          <Th>Day</Th>
          <Th>Collections</Th>
          <Th isNumeric>Total Amount</Th>
          <Th>Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {sortedDays.map((day) => (
          <React.Fragment key={day}>
            {/* Day Summary Row */}
            <Tr
              _hover={{ bg: "gray.50" }}
              cursor="pointer"
              onClick={() => toggleDayExpansion(day)}
              bg={expandedDays[day] ? "blue.50" : "white"}
            >
              <Td>
                <HStack>
                  {expandedDays[day] ? <FiChevronDown /> : <FiChevronRight />}
                  <Text fontWeight="bold" color="blue.600">
                    {day}
                  </Text>
                </HStack>
              </Td>
              <Td>
                <HStack>
                  <FiUsers color="#6B7280" />
                  <Text>{getDayCount(day)} collections</Text>
                </HStack>
              </Td>
              <Td isNumeric fontWeight="bold" color="green.600">
                ₹{getDayTotal(day).toLocaleString()}
              </Td>
              <Td>
                <Text fontSize="sm" color="gray.500">
                  Click to {expandedDays[day] ? "collapse" : "expand"}
                </Text>
              </Td>
            </Tr>

            {/* Expanded Day Details */}
            {expandedDays[day] && (
              <>
                {groupedByDay[day].map((collection, index) => (
                  <Tr key={`${day}-${index}`} bg="gray.25" pl={8}>
                    <Td pl={8}>
                      <HStack>
                        <FiClock color="#6B7280" />
                        <Text fontSize="sm">{collection.time}</Text>
                      </HStack>
                    </Td>
                    <Td>
                      <HStack>
                        <FiUsers color="#6B7280" />
                        <Text fontWeight="medium" fontSize="sm">
                          {collection.userName}
                        </Text>
                      </HStack>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={
                          collection.accountType === "Loan" ? "blue" : "green"
                        }
                        variant="subtle"
                        px={2}
                        py={1}
                        borderRadius="full"
                        fontSize="xs"
                      >
                        {collection.accountType}
                      </Badge>
                    </Td>
                    <Td isNumeric>
                      <VStack align="end" spacing={0}>
                        <Text fontSize="sm" fontWeight="medium">
                          ₹{collection.amount.toLocaleString()}
                        </Text>
                        {collection.penalty > 0 && (
                          <Text fontSize="xs" color="red.500">
                            +₹{collection.penalty.toLocaleString()} penalty
                          </Text>
                        )}
                        <Text fontSize="sm" fontWeight="bold" color="green.600">
                          ₹{collection.totalAmount.toLocaleString()}
                        </Text>
                      </VStack>
                    </Td>
                  </Tr>
                ))}
              </>
            )}
          </React.Fragment>
        ))}
      </Tbody>
    </Table>
  );
};

const Reports = () => {
  const { user } = useAuth();
  const [reportData, setReportData] = useState({
    daily: [],
    weekly: [],
    monthly: [],
  });
  const [selectedReportType, setSelectedReportType] = useState("daily");
  const [reportLoading, setReportLoading] = useState(false);
  const [stats, setStats] = useState({
    totalCollections: 0,
    totalAmount: 0,
    loanCollections: 0,
    savingCollections: 0,
  });

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const REPORT_API_MAP = {
    daily: "admins/officerWiseDailyCollections",
    weekly: "admins/officerWiseWeeklyCollections",
    monthly: "admins/officerWiseMonthlyCollections",
  };

  useEffect(() => {
    fetchReportData(selectedReportType);
  }, []);


const fetchReportData = async (reportType) => {
  try {
    setReportLoading(true);

    const endpoint = REPORT_API_MAP[reportType];
    const params = {};

    /* 🔥 DATE (ONLY DAILY) */
    if (reportType === "daily") {
      params.date = new Date().toISOString().split("T")[0];
    }
        console.log(user)
    /* 🔥 OFFICER ID — ALWAYS SEND IF AVAILABLE */
      params.officer_id = user._id || user.officer_id;
    

    const res = await axios.get(endpoint, { params });

    /* 🔥 Backend already filtered by officer_id */
    const officers = res.data?.result?.collections || [];

    /* 🔁 Flatten data */
   const flatData = officers
  .filter(
    (officer) =>
      String(officer._id || officer.officer_id) ===
      String(user?.officer_id?._id || user?._id)
  )
  .flatMap((officer) =>
    officer.collections.map((col) => ({
      id: `${officer.officer_id}-${col.user_id}-${col.created_on}`,
      date: new Date(col.created_on).toLocaleDateString(),
      rawDate: col.created_on,
      time: new Date(col.created_on).toLocaleTimeString(),
      userName: col.user_name || "N/A",
      accountType: col.type === "loan" ? "Loan" : "Saving",
      amount: col.type === "loan" ? col.amount : col.net_amount,
      penalty: col.penalty || 0,
      totalAmount:
        col.type === "loan"
          ? col.amount + (col.penalty || 0)
          : col.net_amount,
    }))
  );


    /* 📊 STATS (sirf login officer ka) */
    const totalCollections = flatData.length;
    const totalAmount = flatData.reduce((s, i) => s + i.totalAmount, 0);

    setStats({
      totalCollections,
      totalAmount,
      loanCollections: flatData.filter((i) => i.accountType === "Loan").length,
      savingCollections: flatData.filter((i) => i.accountType === "Saving").length,
    });

    setReportData((prev) => ({
      ...prev,
      [reportType]: flatData,
    }));
  } catch (err) {
    console.error(err);
    setReportData((prev) => ({
      ...prev,
      [reportType]: [],
    }));
  } finally {
    setReportLoading(false);
  }
};

  const handleReportTypeChange = (reportType) => {
    setSelectedReportType(reportType);
    fetchReportData(reportType);
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
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const getReportTitle = () => {
    const now = new Date();
    switch (selectedReportType) {
      case "daily":
        return `Daily Report - ${now.toLocaleDateString()}`;
      case "weekly":
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return `Weekly Report - ${startOfWeek.toLocaleDateString()} to ${endOfWeek.toLocaleDateString()}`;
      case "monthly":
        return `Monthly Report - ${now.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })}`;
      default:
        return "Report";
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gray-50"
    >
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <FiBarChart2 className="mr-3 text-blue-600" />
                Collection Reports
              </h1>
          
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => handleReportTypeChange("daily")}
                colorScheme={selectedReportType === "daily" ? "blue" : "gray"}
                variant={selectedReportType === "daily" ? "solid" : "outline"}
                leftIcon={<FiCalendar />}
                p={2}
              >
                Daily
              </Button>
              <Button
                onClick={() => handleReportTypeChange("weekly")}
                colorScheme={selectedReportType === "weekly" ? "blue" : "gray"}
                variant={selectedReportType === "weekly" ? "solid" : "outline"}
                leftIcon={<FiCalendar />}
                p={2}
              >
                Weekly
              </Button>
              <Button
                onClick={() => handleReportTypeChange("monthly")}
                colorScheme={selectedReportType === "monthly" ? "blue" : "gray"}
                variant={selectedReportType === "monthly" ? "solid" : "outline"}
                leftIcon={<FiCalendar />}
                p={2}
              >
                Monthly
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Report Title */}
        <motion.div variants={itemVariants} className="mb-6">
          <Text fontSize="xl" fontWeight="semibold" color="gray.700">
            {getReportTitle()}
          </Text>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="mb-8">
          <Grid
            templateColumns={{
              base: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            }}
            gap={{ base: 3, md: 6 }}
          >
            <GridItem>
              <Box
                bg={bgColor}
                p={{ base: 3, md: 4 }}
                borderRadius="lg"
                border="1px"
                borderColor={borderColor}
              >
                <Stat>
                  <StatLabel color="gray.600" fontSize="sm" fontWeight="medium">
                    Total Collections
                  </StatLabel>
                  <StatNumber color="blue.600" fontSize="2xl" fontWeight="bold">
                    {stats.totalCollections}
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    {selectedReportType} collections
                  </StatHelpText>
                </Stat>
              </Box>
            </GridItem>

            <GridItem>
              <Box
                bg={bgColor}
                p={2}
                borderRadius="lg"
                border="1px"
                borderColor={borderColor}
                shadow="sm"
              >
                <Stat>
                  <StatLabel color="gray.600" fontSize="sm" fontWeight="medium">
                    Total Amount
                  </StatLabel>
                  <StatNumber
                    color="green.600"
                    fontSize="2xl"
                    fontWeight="bold"
                  >
                    ₹{stats.totalAmount.toLocaleString()}
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    Collected amount
                  </StatHelpText>
                </Stat>
              </Box>
            </GridItem>

            <GridItem>
              <Box
                bg={bgColor}
                p={2}
                borderRadius="lg"
                border="1px"
                borderColor={borderColor}
                shadow="sm"
              >
                <Stat>
                  <StatLabel color="gray.600" fontSize="sm" fontWeight="medium">
                    Loan Collections
                  </StatLabel>
                  <StatNumber
                    color="purple.600"
                    fontSize="2xl"
                    fontWeight="bold"
                  >
                    {stats.loanCollections}
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    Loan accounts
                  </StatHelpText>
                </Stat>
              </Box>
            </GridItem>

            <GridItem>
              <Box
                bg={bgColor}
                p={2}
                borderRadius="lg"
                border="1px"
                borderColor={borderColor}
                shadow="sm"
              >
                <Stat>
                  <StatLabel color="gray.600" fontSize="sm" fontWeight="medium">
                    Saving Collections
                  </StatLabel>
                  <StatNumber color="teal.600" fontSize="2xl" fontWeight="bold">
                    {stats.savingCollections}
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    Saving accounts
                  </StatHelpText>
                </Stat>
              </Box>
            </GridItem>
          </Grid>
        </motion.div>

        {/* Report Table */}
        <motion.div variants={itemVariants}>
          <Box
            bg={bgColor}
            borderRadius="lg"
            border="1px"
            borderColor={borderColor}
            shadow="sm"
            overflow="hidden"
          >
            <Box p={6} borderBottom="1px" borderColor={borderColor}>
              <HStack justify="space-between">
                <Text fontSize="lg" fontWeight="semibold" color="gray.700">
                  Collection Details
                </Text>
                {reportLoading && (
                  <HStack>
                    <Spinner size="sm" color="blue.500" />
                    <Text fontSize="sm" color="gray.500">
                      Loading...
                    </Text>
                  </HStack>
                )}
              </HStack>
            </Box>

            {reportLoading ? (
              <Center py={12}>
                <VStack>
                  <Spinner size="lg" color="blue.500" />
                  <Text color="gray.500">Loading report data...</Text>
                </VStack>
              </Center>
            ) : (
              <Box overflowX="auto" maxW="100vw">
                {selectedReportType === "weekly" ? (
                  // Weekly report with day-wise grouping
                  <WeeklyReportTable data={reportData[selectedReportType]} />
                ) : (
                  // Daily and Monthly reports with regular table
                  <Table variant="simple" size={{ base: "sm", md: "md" }}>
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>Date</Th>
                        <Th>Time</Th>
                        <Th>User Name</Th>
                        <Th>Account Type</Th>
                        <Th isNumeric>Amount</Th>
                        <Th isNumeric>Penalty</Th>
                        <Th isNumeric>Total</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {reportData[selectedReportType].length === 0 ? (
                        <Tr>
                          <Td colSpan={7} textAlign="center" py={8}>
                            <VStack>
                              <FiBarChart2 size={48} color="#9CA3AF" />
                              <Text color="gray.500" fontSize="lg">
                                No collections found for {selectedReportType}{" "}
                                report
                              </Text>
                              <Text color="gray.400" fontSize="sm">
                                Collections will appear here once you start
                                collecting payments
                              </Text>
                            </VStack>
                          </Td>
                        </Tr>
                      ) : (
                        reportData[selectedReportType].map((collection) => (
                          <Tr key={collection.id} _hover={{ bg: "gray.50" }}>
                            <Td>
                              <HStack>
                                <FiCalendar color="#6B7280" />
                                <Text>{collection.date}</Text>
                              </HStack>
                            </Td>
                            <Td>
                              <HStack>
                                <FiClock color="#6B7280" />
                                <Text>{collection.time}</Text>
                              </HStack>
                            </Td>
                            <Td>
                              <HStack>
                                <FiUsers color="#6B7280" />
                                <Text fontWeight="medium">
                                  {collection.userName}
                                </Text>
                              </HStack>
                            </Td>
                            <Td>
                              <Badge
                                colorScheme={
                                  collection.accountType === "Loan"
                                    ? "blue"
                                    : "green"
                                }
                                variant="subtle"
                                px={3}
                                py={1}
                                borderRadius="full"
                              >
                                {collection.accountType}
                              </Badge>
                            </Td>
                            <Td isNumeric fontWeight="medium">
                              ₹{collection.amount.toLocaleString()}
                            </Td>
                            <Td
                              isNumeric
                              color={
                                collection.penalty > 0 ? "red.500" : "gray.500"
                              }
                            >
                              ₹{collection.penalty.toLocaleString()}
                            </Td>
                            <Td isNumeric fontWeight="bold" color="green.600">
                              ₹{collection.totalAmount.toLocaleString()}
                            </Td>
                          </Tr>
                        ))
                      )}
                    </Tbody>
                  </Table>
                )}
              </Box>
            )}

            {reportData[selectedReportType].length > 0 && (
              <Box p={6} bg="gray.50" borderTop="1px" borderColor={borderColor}>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    Total Collections:{" "}
                    <Text as="span" fontWeight="bold">
                      {reportData[selectedReportType].length}
                    </Text>
                  </Text>
                  <Text fontSize="sm" fontWeight="bold" color="green.600">
                    Total Amount: ₹
                    {reportData[selectedReportType]
                      .reduce(
                        (sum, collection) => sum + collection.totalAmount,
                        0
                      )
                      .toLocaleString()}
                  </Text>
                </HStack>
              </Box>
            )}
          </Box>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Reports;
