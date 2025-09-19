import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
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
  IconButton,
  Tooltip,
  Divider,
  SimpleGrid,
  useColorModeValue
} from '@chakra-ui/react';
import { FiSearch, FiDownload, FiRefreshCw, FiCalendar, FiDollarSign, FiUsers, FiTrendingUp } from 'react-icons/fi';
import { motion } from 'framer-motion';
import axios from '../../../axios';
import dayjs from 'dayjs';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const DailyReport = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredReports, setFilteredReports] = useState([]);
  const toast = useToast();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    fetchDailyReports();
  }, [selectedDate]);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm]);

  const fetchDailyReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/reports/daily?date=${selectedDate}`);
      setReports(response.data.reports || []);
    } catch (err) {
      console.error('Error fetching daily reports:', err);
      setError('Failed to fetch daily reports');
      toast({
        title: 'Error',
        description: 'Failed to fetch daily reports',
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
      withdrawals: 0
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
    a.download = `daily-report-${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Box p={8} textAlign="center">
        <Spinner size="xl" color="blue.500" />
        <Text mt={4}>Loading daily reports...</Text>
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
    <Box minH="100vh" bg={bgColor} p={{ base: 4, md: 8 }} pt="300px">
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
                  <Heading size="lg" color="blue.600">
                    <HStack>
                      <FiCalendar />
                      <Text>Daily Report</Text>
                    </HStack>
                  </Heading>
                  <Text color="gray.600">
                    Report for {dayjs(selectedDate).format('MMMM DD, YYYY')}
                  </Text>
                </VStack>
                
                <HStack spacing={3}>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    size="md"
                    maxW="200px"
                  />
                  <Button
                    leftIcon={<FiRefreshCw />}
                    onClick={fetchDailyReports}
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
                  <StatLabel>Total Amount</StatLabel>
                  <StatNumber color="green.500">
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
                  <StatLabel>Loan Collections</StatLabel>
                  <StatNumber color="blue.500">
                    ₹{totals.loanCollections.toLocaleString()}
                  </StatNumber>
                  <StatHelpText>
                    <FiDollarSign />
                    Collections
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg} shadow="md">
              <CardBody>
                <Stat>
                  <StatLabel>Saving Deposits</StatLabel>
                  <StatNumber color="purple.500">
                    ₹{totals.savingDeposits.toLocaleString()}
                  </StatNumber>
                  <StatHelpText>
                    <FiTrendingUp />
                    Deposits
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg} shadow="md">
              <CardBody>
                <Stat>
                  <StatLabel>Withdrawals</StatLabel>
                  <StatNumber color="orange.500">
                    ₹{totals.withdrawals.toLocaleString()}
                  </StatNumber>
                  <StatHelpText>
                    <FiUsers />
                    Withdrawals
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
                    No transactions found for the selected date
                  </Text>
                </Box>
              ) : (
                <TableContainer>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
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
                </TableContainer>
              )}
            </CardBody>
          </Card>
        </MotionBox>
      </VStack>
    </Box>
  );
};

export default DailyReport;
