import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  useColorModeValue
} from '@chakra-ui/react';
import { FiSearch, FiDownload, FiRefreshCw, FiCalendar, FiBarChart2, FiTrendingUp, FiUsers } from 'react-icons/fi';
import { motion } from 'framer-motion';
import axios from '../../../axios';
import dayjs from 'dayjs';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const WeeklyReport = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(dayjs().format('YYYY-[W]WW'));
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredReports, setFilteredReports] = useState([]);
  const [isMonthlyView, setIsMonthlyView] = useState(false);
  const toast = useToast();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    fetchWeeklyReports();
  }, [selectedWeek, isMonthlyView]);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm]);

  const fetchWeeklyReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const endpoint = isMonthlyView ? '/reports/monthly' : '/reports/weekly';
      const response = await axios.get(`${endpoint}?period=${selectedWeek}`);
      setReports(response.data.reports || []);
    } catch (err) {
      console.error('Error fetching weekly reports:', err);
      setError('Failed to fetch weekly reports');
      toast({
        title: 'Error',
        description: 'Failed to fetch weekly reports',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    if (!searchTerm) {
      setFilteredReports(reports);
      return;
    }

    const filtered = reports.filter(report =>
      report.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.officer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.transaction_type?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredReports(filtered);
  };

  const calculateTotals = () => {
    const totals = {
      totalAmount: 0,
      totalTransactions: reports.length,
      loanCollections: 0,
      savingDeposits: 0,
      withdrawals: 0,
      averageDaily: 0
    };

    reports.forEach(report => {
      totals.totalAmount += parseFloat(report.amount) || 0;
      
      if (report.transaction_type === 'loan_collection') {
        totals.loanCollections += parseFloat(report.amount) || 0;
      } else if (report.transaction_type === 'saving_deposit') {
        totals.savingDeposits += parseFloat(report.amount) || 0;
      } else if (report.transaction_type === 'withdrawal') {
        totals.withdrawals += parseFloat(report.amount) || 0;
      }
    });

    // Calculate average daily collection
    const days = isMonthlyView ? 30 : 7;
    totals.averageDaily = totals.totalAmount / days;

    return totals;
  };

  const totals = calculateTotals();

  const getTransactionTypeColor = (type) => {
    switch (type) {
      case 'loan_collection':
        return 'green';
      case 'saving_deposit':
        return 'blue';
      case 'withdrawal':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const getTransactionTypeLabel = (type) => {
    switch (type) {
      case 'loan_collection':
        return 'Loan Collection';
      case 'saving_deposit':
        return 'Saving Deposit';
      case 'withdrawal':
        return 'Withdrawal';
      default:
        return type;
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Date', 'Customer Name', 'Officer Name', 'Transaction Type', 'Amount', 'Time'],
      ...filteredReports.map(report => [
        dayjs(report.created_at).format('YYYY-MM-DD'),
        report.customer_name || 'N/A',
        report.officer_name || 'N/A',
        getTransactionTypeLabel(report.transaction_type),
        report.amount || '0',
        dayjs(report.created_at).format('HH:mm:ss')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${isMonthlyView ? 'monthly' : 'weekly'}-report-${selectedWeek}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getWeekRange = () => {
    if (isMonthlyView) {
      const startOfMonth = dayjs().startOf('month');
      const endOfMonth = dayjs().endOf('month');
      return `${startOfMonth.format('MMM DD')} - ${endOfMonth.format('MMM DD, YYYY')}`;
    } else {
      const startOfWeek = dayjs().startOf('week');
      const endOfWeek = dayjs().endOf('week');
      return `${startOfWeek.format('MMM DD')} - ${endOfWeek.format('MMM DD, YYYY')}`;
    }
  };

  if (loading) {
    return (
      <Box p={8} textAlign="center">
        <Spinner size="xl" color="blue.500" />
        <Text mt={4}>Loading {isMonthlyView ? 'monthly' : 'weekly'} reports...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={8}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={bgColor} p={{ base: 4, md: 8 }} pt="100px">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card bg={cardBg} shadow="lg">
            <CardHeader>
              <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                <VStack align="start" spacing={2}>
                  <Heading size="lg" color="purple.600">
                    <HStack>
                      <FiBarChart2 />
                      <Text>{isMonthlyView ? 'Monthly' : 'Weekly'} Report</Text>
                    </HStack>
                  </Heading>
                  <Text color="gray.600">
                    Report for {getWeekRange()}
                  </Text>
                </VStack>
                
                <HStack spacing={3}>
                  <Button
                    onClick={() => setIsMonthlyView(false)}
                    colorScheme={!isMonthlyView ? "blue" : "gray"}
                    variant={!isMonthlyView ? "solid" : "outline"}
                    size="md"
                  >
                    Weekly
                  </Button>
                  <Button
                    onClick={() => setIsMonthlyView(true)}
                    colorScheme={isMonthlyView ? "blue" : "gray"}
                    variant={isMonthlyView ? "solid" : "outline"}
                    size="md"
                  >
                    Monthly
                  </Button>
                  <Button
                    leftIcon={<FiRefreshCw />}
                    onClick={fetchWeeklyReports}
                    colorScheme="blue"
                    variant="outline"
                    size="md"
                  >
                    Refresh
                  </Button>
                  <Button
                    leftIcon={<FiDownload />}
                    onClick={exportToCSV}
                    colorScheme="green"
                    size="md"
                    isDisabled={filteredReports.length === 0}
                  >
                    Export CSV
                  </Button>
                </HStack>
              </Flex>
            </CardHeader>
          </Card>
        </MotionBox>

        {/* Summary Cards */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <Card bg={cardBg} shadow="md">
              <CardBody>
                <Stat>
                  <StatLabel>Total {isMonthlyView ? 'Monthly' : 'Weekly'} Collection</StatLabel>
                  <StatNumber color="purple.500">
                    ₹{totals.totalAmount.toLocaleString()}
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    {totals.totalTransactions} transactions
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg} shadow="md">
              <CardBody>
                <Stat>
                  <StatLabel>Average Daily Collection</StatLabel>
                  <StatNumber color="blue.500">
                    ₹{totals.averageDaily.toLocaleString()}
                  </StatNumber>
                  <StatHelpText>
                    <FiTrendingUp />
                    Per day
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg} shadow="md">
              <CardBody>
                <Stat>
                  <StatLabel>Loan Collections</StatLabel>
                  <StatNumber color="green.500">
                    ₹{totals.loanCollections.toLocaleString()}
                  </StatNumber>
                  <StatHelpText>
                    <FiUsers />
                    Collections
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg} shadow="md">
              <CardBody>
                <Stat>
                  <StatLabel>Saving Deposits</StatLabel>
                  <StatNumber color="orange.500">
                    ₹{totals.savingDeposits.toLocaleString()}
                  </StatNumber>
                  <StatHelpText>
                    <FiCalendar />
                    Deposits
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
        </MotionBox>

        {/* Search and Filters */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card bg={cardBg} shadow="md">
            <CardBody>
              <HStack spacing={4} wrap="wrap">
                <InputGroup maxW="300px">
                  <InputLeftElement>
                    <FiSearch color="gray.300" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search by customer, officer, or type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
                
                <Text fontSize="sm" color="gray.600">
                  Showing {filteredReports.length} of {reports.length} transactions
                </Text>
              </HStack>
            </CardBody>
          </Card>
        </MotionBox>

        {/* Transactions Table */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card bg={cardBg} shadow="lg">
            <CardHeader>
              <Heading size="md">Transaction Details</Heading>
            </CardHeader>
            <CardBody>
              {filteredReports.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <Text color="gray.500" fontSize="lg">
                    No transactions found for the selected {isMonthlyView ? 'month' : 'week'}
                  </Text>
                </Box>
              ) : (
                <Box overflowX="auto">
                  <Table variant="simple" size="sm" minW="600px">
                    <Thead>
                      <Tr>
                        <Th>Date</Th>
                        <Th>Time</Th>
                        <Th>Customer</Th>
                        <Th>Officer</Th>
                        <Th>Type</Th>
                        <Th isNumeric>Amount</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredReports.map((report, index) => (
                        <Tr key={index}>
                          <Td>
                            <Text fontSize="sm">
                              {dayjs(report.created_at).format('MMM DD')}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm">
                              {dayjs(report.created_at).format('HH:mm:ss')}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontWeight="medium">
                              {report.customer_name || 'N/A'}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm" color="gray.600">
                              {report.officer_name || 'N/A'}
                            </Text>
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={getTransactionTypeColor(report.transaction_type)}
                              variant="subtle"
                            >
                              {getTransactionTypeLabel(report.transaction_type)}
                            </Badge>
                          </Td>
                          <Td isNumeric>
                            <Text fontWeight="bold" color="green.600">
                              ₹{parseFloat(report.amount || 0).toLocaleString()}
                            </Text>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </CardBody>
          </Card>
        </MotionBox>
      </VStack>
    </Box>
  );
};

export default WeeklyReport;
