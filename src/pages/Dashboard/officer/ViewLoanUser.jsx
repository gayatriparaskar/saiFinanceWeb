import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
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
  Divider,
  Spinner,
  Center,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import axios from '../../../axios';
import dayjs from 'dayjs';

const ViewLoanUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // const toast = useToast();
  
  const [userData, setUserData] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserData();
    fetchDailyData();
  });

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`users/${id}`);
      if (response?.data) {
        setUserData(response.data.result);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to fetch user data');
    }
  };

  const fetchDailyData = async () => {
    try {
      const response = await axios.get(`dailyCollections/${id}`);
      if (response?.data) {
        setDailyData(response.data.result.reverse());
      }
    } catch (error) {
      console.error('Error fetching daily data:', error);
      setError('Failed to fetch collection data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return dayjs(date).format('DD MMM, YYYY h:mm A');
  };

  if (loading) {
    return (
      <Center h="50vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading user details...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="50vh">
        <Alert status="error" maxW="md">
          <AlertIcon />
          {error}
        </Alert>
      </Center>
    );
  }

  if (!userData) {
    return (
      <Center h="50vh">
        <Alert status="warning" maxW="md">
          <AlertIcon />
          User not found
        </Alert>
      </Center>
    );
  }

  const loanDetails = userData.active_loan_id;
  const startDate = loanDetails?.created_on || loanDetails?.start_date;
  const endDate = loanDetails?.end_date;
  const loanAmount = loanDetails?.loan_amount || 0;
  const totalAmount = loanDetails?.total_amount || 0;
  const totalDueAmount = loanDetails?.total_due_amount || 0;
  const penaltyAmount = loanDetails?.total_penalty_amount || 0;
  const dailyEmiAmount = loanDetails?.emi_day || 0;
  const remainingDays = loanDetails?.remaining_emi_days || 120;

  return (
    <Box p={6} maxW="1200px" mx="auto">
      {/* Header */}
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <HStack spacing={4}>
            <Button
              leftIcon={<ArrowBackIcon />}
              onClick={() => navigate('/officer/dashboard')}
              variant="outline"
              size="sm"
            >
              Back to Dashboard
            </Button>
            <Heading size="lg" color="blue.600">
              Loan Account Details
            </Heading>
          </HStack>
        </HStack>

        <Divider />

        {/* User Information Card */}
        <Card>
          <CardHeader>
            <Heading size="md" color="gray.700">
              👤 User Information
            </Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <Text fontWeight="semibold">Name:</Text>
                <Text>{userData.full_name || 'N/A'}</Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontWeight="semibold">Phone:</Text>
                <Text>{userData.phone_number || 'N/A'}</Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontWeight="semibold">Address:</Text>
                <Text maxW="300px" isTruncated>{userData.address || 'N/A'}</Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontWeight="semibold">Account Status:</Text>
                <Badge colorScheme="green" size="lg">
                  Active
                </Badge>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Loan Information Card */}
        <Card>
          <CardHeader>
            <Heading size="md" color="gray.700">
              💰 Loan Information
            </Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <Text fontWeight="semibold">Loan Amount:</Text>
                <Text color="blue.600" fontWeight="bold">
                  {formatCurrency(loanAmount)}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontWeight="semibold">Total Amount (with interest):</Text>
                <Text color="green.600" fontWeight="bold">
                  {formatCurrency(totalAmount)}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontWeight="semibold">Total Due Amount:</Text>
                <Text color="red.600" fontWeight="bold">
                  {formatCurrency(totalDueAmount)}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontWeight="semibold">Daily EMI Amount:</Text>
                <Text color="purple.600" fontWeight="bold">
                  {formatCurrency(dailyEmiAmount)}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontWeight="semibold">Remaining EMI Days:</Text>
                <Badge 
                  colorScheme={remainingDays > 30 ? "green" : remainingDays > 10 ? "yellow" : "red"}
                  size="lg"
                >
                  {remainingDays} days
                </Badge>
              </HStack>
              <HStack justify="space-between">
                <Text fontWeight="semibold">Penalty Amount:</Text>
                <Text color="orange.600" fontWeight="bold">
                  {formatCurrency(penaltyAmount)}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontWeight="semibold">Start Date:</Text>
                <Text>{startDate ? formatDate(startDate) : 'N/A'}</Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontWeight="semibold">End Date:</Text>
                <Text>{endDate ? formatDate(endDate) : 'N/A'}</Text>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Collection History */}
        <Card>
          <CardHeader>
            <Heading size="md" color="gray.700">
              📊 Collection History
            </Heading>
          </CardHeader>
          <CardBody>
            {dailyData.length > 0 ? (
              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Date</Th>
                      <Th>Amount</Th>
                      <Th>Penalty</Th>
                      <Th>Type</Th>
                      <Th>Officer</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {dailyData.map((item, index) => (
                      <Tr key={index}>
                        <Td>{formatDate(item.created_on)}</Td>
                        <Td color="green.600" fontWeight="semibold">
                          {formatCurrency(item.amount)}
                        </Td>
                        <Td color="orange.600">
                          {formatCurrency(item.total_penalty_amount)}
                        </Td>
                        <Td>
                          <Badge colorScheme={item.amount > 0 ? "green" : "red"}>
                            {item.amount > 0 ? "Payment" : "Penalty"}
                          </Badge>
                        </Td>
                        <Td>{item.collected_officer_name || 'N/A'}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            ) : (
              <Text color="gray.500" textAlign="center" py={4}>
                No collection history available
              </Text>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default ViewLoanUser;
