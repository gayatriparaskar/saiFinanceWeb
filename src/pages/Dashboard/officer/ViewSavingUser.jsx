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
  useToast
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import axios from '../../../axios';
import dayjs from 'dayjs';

const ViewSavingUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // const toast = useToast();
  
  const [userData, setUserData] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, [id]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`savingDailyCollections/${id}`);
      if (response?.data?.result) {
        // The new API returns complete user data with saving account and collections
        setUserData(response.data.result);
        const collections = response.data.result.collections || [];
        console.log(collections, "collections");
        setDailyData(collections.reverse());
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to fetch user data');
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

  const savingDetails = userData.saving_account;
  const startDate = savingDetails?.created_on || savingDetails?.start_date;
  const currentAmount = savingDetails?.current_amount || 0;
  const amountToBe = savingDetails?.amount_to_be || 0;
  // const totalWithdrawal = savingDetails?.total_withdrawal || 0;
  const interestRate = savingDetails?.interest_rate || 0;
  const dailyEmiAmount = savingDetails?.emi_amount || 0;
  const remainingDays = savingDetails?.remaining_emi_days || 120;
  const totalInterestPay = savingDetails?.total_interest_pay || 0;
  // Calculate total amount with interest (ignore the incorrect total_amount from backend)
  const totalAmount = amountToBe + totalInterestPay; // 10,000 + 2,000 = 12,000
  const remainingAmount = totalAmount - currentAmount; // 12,000 - 100 = 11,900

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
            <Heading size="lg" color="green.600">
              Saving Account Details
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

        {/* Saving Account Information Card */}
        <Card>
          <CardHeader>
            <Heading size="md" color="gray.700">
              💰 Saving Account Information
            </Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <Text fontWeight="semibold">Account Number:</Text>
                <Text color="blue.600" fontWeight="bold">
                  {savingDetails?.account_number || 'N/A'}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontWeight="semibold">Current Amount:</Text>
                <Text color="green.600" fontWeight="bold">
                  {formatCurrency(currentAmount)}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontWeight="semibold">Principal Amount:</Text>
                <Text color="purple.600" fontWeight="bold">
                  {formatCurrency(amountToBe)}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontWeight="semibold">Interest Amount:</Text>
                <Text color="orange.600" fontWeight="bold">
                  {formatCurrency(totalInterestPay)}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontWeight="semibold">Total Amount (with Interest):</Text>
                <Text color="green.600" fontWeight="bold">
                  {formatCurrency(totalAmount)}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontWeight="semibold">Remaining Amount:</Text>
                <Text color="red.600" fontWeight="bold">
                  {formatCurrency(remainingAmount)}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontWeight="semibold">Interest Rate:</Text>
                <Text color="blue.600" fontWeight="bold">
                  {interestRate}%
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontWeight="semibold">Daily EMI Amount:</Text>
                <Text color="purple.600" fontWeight="bold">
                  {formatCurrency(dailyEmiAmount)}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontWeight="semibold">Remaining Days:</Text>
                <Badge 
                  colorScheme={remainingDays > 30 ? "green" : remainingDays > 10 ? "yellow" : "red"}
                  size="lg"
                >
                  {remainingDays} days
                </Badge>
              </HStack>
              <HStack justify="space-between">
                <Text fontWeight="semibold">Start Date:</Text>
                <Text>{startDate ? formatDate(startDate) : 'N/A'}</Text>
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
                        <Td>
                          <Badge colorScheme="green">
                            {item.amount > 0 ? "Deposit" : "Withdrawal"}
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

export default ViewSavingUser;
