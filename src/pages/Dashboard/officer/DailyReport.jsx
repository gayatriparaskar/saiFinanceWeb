import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  useToast,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Divider,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Grid,
  GridItem,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper
} from '@chakra-ui/react';
import { FiCalendar, FiDollarSign, FiUsers, FiTrendingUp, FiSearch, FiDownload, FiUserPlus, FiCreditCard, FiChevronDown } from 'react-icons/fi';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import axios from '../../../axios';

const DailyReport = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  
  // Debug: Log the selected date
  useEffect(() => {
    console.log('📅 Selected Date:', selectedDate);
    console.log('📅 Today:', dayjs().format('YYYY-MM-DD'));
    console.log('📅 Is Today:', selectedDate === dayjs().format('YYYY-MM-DD'));
  }, [selectedDate]);
  const [filteredData, setFilteredData] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentType, setPaymentType] = useState('loan');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [assignRole, setAssignRole] = useState('');
  const [paymentProcessType, setPaymentProcessType] = useState('');
  const toast = useToast();

  useEffect(() => {
    if (user && user._id) {
      fetchDailyReport();
      fetchOfficers();
    }
  }, [user, selectedDate]);

  const fetchOfficers = async () => {
    try {
      const response = await axios.get('/officers');
      setOfficers(response.data?.result || []);
    } catch (error) {
      console.error('Error fetching officers:', error);
    }
  };

  const handleAssignToManager = () => {
    setAssignRole('manager');
    setIsAssignModalOpen(true);
  };

  const handlePaymentProcess = (processType) => {
    setPaymentProcessType(processType);
    setIsPaymentModalOpen(true);
  };

  const handleAssignSubmit = async () => {
    if (totalCollections === 0) {
      toast({
        title: 'No Collections',
        description: 'No collections found to assign for review',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Call the API to assign daily collections to manager for review
      const payload = {
        officer_id: user._id,
        date: selectedDate,
        collections: filteredData,
        total_amount: totalAmount,
        total_collections: totalCollections,
        loan_collections: reportData?.loanCollections || [],
        saving_collections: reportData?.savingCollections || []
      };
      await axios.post('/assignedCollections/assign', payload);
      
      toast({
        title: 'Success',
        description: `Daily collections assigned to Manager for review successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      setIsAssignModalOpen(false);
      setAssignRole('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to assign collections to Manager for review',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handlePaymentSubmit = async () => {
    if (!selectedUser || !paymentAmount) {
      toast({
        title: 'Error',
        description: 'Please select a user and enter payment amount',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Here you would call the appropriate payment API based on process type
      // const payload = {
      //   amount: paymentAmount,
      //   user_id: selectedUser,
      //   payment_type: paymentType,
      //   process_type: paymentProcessType
      // };
      // await axios.post('/processPayment', payload);
      
      toast({
        title: 'Success',
        description: `Payment processed through ${paymentProcessType} successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      setIsPaymentModalOpen(false);
      setSelectedUser('');
      setPaymentAmount('');
      setPaymentProcessType('');
      // Refresh the report
      fetchDailyReport();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process payment',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchDailyReport = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch officer's daily collections
      const response = await axios.get(`/officers/${user._id}`);
      const officerData = response.data?.result || {};

      // Fetch all daily collections and filter by date and officer
      const dailyResponse = await axios.get(`/dailyCollections`);
      const allDailyCollections = dailyResponse.data?.result || [];
      
      // Filter collections for the selected date and current officer
      const dailyCollections = allDailyCollections.filter(collection => {
        const collectionDate = dayjs(collection.created_on).format('YYYY-MM-DD');
        const isDateMatch = collectionDate === selectedDate;
        const isOfficerMatch = collection.collected_by === user._id;
        
        console.log('🔍 Collection Filter Debug:', {
          collectionId: collection._id,
          collectionDate,
          selectedDate,
          isDateMatch,
          collectedBy: collection.collected_by,
          userId: user._id,
          isOfficerMatch,
          amount: collection.amount
        });
        
        return isDateMatch && isOfficerMatch;
      });
      
      console.log('🔍 Daily Collections Filter:', {
        selectedDate: selectedDate,
        officerId: user._id,
        allDailyCollections: allDailyCollections.length,
        filteredDailyCollections: dailyCollections.length,
        dailyCollections: dailyCollections
      });
      
      // Debug: Log sample collections to understand the data structure
      if (allDailyCollections.length > 0) {
        console.log('🔍 Sample Daily Collection:', allDailyCollections[0]);
        console.log('🔍 Collection fields:', Object.keys(allDailyCollections[0]));
      }

      // Fetch saving collections for the selected date
      let savingCollections = [];
      let savingStats = { totalCount: 0, totalAmount: 0 };
      let allSavingCollections = []; // Declare outside try block
      
      try {
        // If selected date is today, use the optimized endpoint
        const isToday = selectedDate === dayjs().format('YYYY-MM-DD');
        
        if (isToday) {
          try {
            const savingStatsResponse = await axios.get(`/savingDailyCollections/totalSavingCollectionsToday`);
            savingStats = savingStatsResponse.data?.result || { totalCount: 0, totalAmount: 0 };
          } catch (statsError) {
            console.warn('Could not fetch saving stats for today:', statsError);
          }
        }
        
        // Always fetch individual records for detailed view and officer filtering
        const savingResponse = await axios.get(`/savingDailyCollections/getAllSavings`);
        allSavingCollections = savingResponse.data?.result || [];
        
        // Filter collections for the selected date and current officer
        savingCollections = allSavingCollections.filter(collection => {
          const collectionDate = dayjs(collection.created_on).format('YYYY-MM-DD');
          const isDateMatch = collectionDate === selectedDate;
          const isOfficerMatch = collection.collected_by === user._id;
          
          console.log('🔍 Saving Collection Filter Debug:', {
            collectionId: collection._id,
            collectionDate,
            selectedDate,
            isDateMatch,
            collectedBy: collection.collected_by,
            userId: user._id,
            isOfficerMatch,
            depositAmount: collection.deposit_amount
          });
          
          return isDateMatch && isOfficerMatch;
        });
        
        console.log('🔍 Saving Collections Filter:', {
          selectedDate: selectedDate,
          officerId: user._id,
          allSavingCollections: allSavingCollections.length,
          filteredSavingCollections: savingCollections.length,
          savingCollections: savingCollections
        });
        
        // Debug: Log sample saving collections to understand the data structure
        if (allSavingCollections.length > 0) {
          console.log('🔍 Sample Saving Collection:', allSavingCollections[0]);
          console.log('🔍 Saving Collection fields:', Object.keys(allSavingCollections[0]));
        }
      } catch (savingError) {
        console.warn('Could not fetch saving collections:', savingError);
        // Continue without saving collections
      }

      // Process the data and add user information
      const processedLoanCollections = dailyCollections.map(collection => ({
        ...collection,
        account_type: 'loan',
        user_name: collection.user_id?.full_name || 'Unknown User',
        user_phone: collection.user_id?.phone_number || 'No phone'
      }));

      const processedSavingCollections = savingCollections.map(collection => ({
        ...collection,
        account_type: 'saving',
        user_name: collection.user_id?.full_name || 'Unknown User',
        user_phone: collection.user_id?.phone_number || 'No phone'
      }));

      const processedData = {
        officer: officerData,
        date: selectedDate,
        loanCollections: processedLoanCollections,
        savingCollections: processedSavingCollections,
        totalLoanAmount: processedLoanCollections
          .reduce((sum, collection) => sum + (collection.amount || 0), 0),
        totalSavingAmount: processedSavingCollections
          .reduce((sum, collection) => sum + (collection.deposit_amount || 0), 0),
        savingStats: savingStats // Include the stats for additional context
      };

      console.log('📊 Processed Data Summary:', {
        selectedDate,
        officerId: user._id,
        loanCollectionsCount: dailyCollections.length,
        savingCollectionsCount: savingCollections.length,
        totalLoanAmount: processedData.totalLoanAmount,
        totalSavingAmount: processedData.totalSavingAmount,
        allDailyCollectionsCount: allDailyCollections.length,
        allSavingCollectionsCount: allSavingCollections.length
      });

      // Fallback: If no collections found via API, try officer's user_collections
      if (dailyCollections.length === 0 && savingCollections.length === 0) {
        console.log('🔄 No collections found via API, trying officer user_collections fallback...');
        
        const userCollections = officerData.user_collections || [];
        const today = selectedDate;
        
        const todayUserCollections = userCollections.filter(collection => {
          if (!collection.collected_on) return false;
          const collectionDate = dayjs(collection.collected_on).format('YYYY-MM-DD');
          return collectionDate === today;
        });
        
        console.log('🔍 Officer User Collections Fallback:', {
          totalUserCollections: userCollections.length,
          todayUserCollections: todayUserCollections.length,
          todayUserCollectionsData: todayUserCollections
        });
        
        // If we found collections in user_collections, use them
        if (todayUserCollections.length > 0) {
          const fallbackLoanCollections = todayUserCollections
            .filter(c => c.account_type === 'loan account')
            .map(collection => ({
              ...collection,
              account_type: 'loan',
              user_name: collection.name || 'Unknown User',
              user_phone: collection.phone_number || 'No phone',
              amount: collection.collected_amount || 0
            }));
            
          const fallbackSavingCollections = todayUserCollections
            .filter(c => c.account_type === 'saving account')
            .map(collection => ({
              ...collection,
              account_type: 'saving',
              user_name: collection.name || 'Unknown User',
              user_phone: collection.phone_number || 'No phone',
              deposit_amount: collection.collected_amount || 0
            }));
          
          processedData.loanCollections = fallbackLoanCollections;
          processedData.savingCollections = fallbackSavingCollections;
          processedData.totalLoanAmount = fallbackLoanCollections.reduce((sum, c) => sum + (c.amount || 0), 0);
          processedData.totalSavingAmount = fallbackSavingCollections.reduce((sum, c) => sum + (c.deposit_amount || 0), 0);
          
          console.log('✅ Using fallback data from officer user_collections:', {
            loanCollections: fallbackLoanCollections.length,
            savingCollections: fallbackSavingCollections.length,
            totalLoanAmount: processedData.totalLoanAmount,
            totalSavingAmount: processedData.totalSavingAmount
          });
        }
      }

      setReportData(processedData);
      setFilteredData([...processedData.loanCollections, ...processedData.savingCollections]);
    } catch (error) {
      console.error('Error fetching daily report:', error);
      setError('Failed to fetch daily report data');
      toast({
        title: 'Error',
        description: 'Failed to fetch daily report data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return dayjs(date).format('DD MMM, YYYY');
  };

  const formatTime = (date) => {
    return dayjs(date).format('h:mm A');
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleExport = () => {
    if (filteredData.length === 0) {
      toast({
        title: 'No Data',
        description: 'No collections to export',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Create CSV data
    const csvData = filteredData.map(collection => ({
      'Collection ID': collection._id || 'N/A',
      'User Name': collection.user_name || 'N/A',
      'Account Type': collection.account_type || 'N/A',
      'Amount': collection.amount || collection.deposit_amount || 0,
      'Collection Time': formatTime(collection.created_on),
      'Status': collection.status || 'Completed'
    }));

    // Convert to CSV
    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-report-${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Export Successful',
      description: 'Daily report exported successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  if (loading) {
    return (
      <Center h="50vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading daily report...</Text>
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

  const totalAmount = (reportData?.totalLoanAmount || 0) + (reportData?.totalSavingAmount || 0);
  const totalCollections = (reportData?.loanCollections?.length || 0) + (reportData?.savingCollections?.length || 0);
  
  // Debug logging
  console.log('🔍 Daily Report Data:', {
    reportData: reportData,
    totalCollections: totalCollections,
    totalAmount: totalAmount,
    loanCollections: reportData?.loanCollections?.length || 0,
    savingCollections: reportData?.savingCollections?.length || 0,
    filteredData: filteredData.length
  });

  return (
    <Box p={6} maxW="1400px" mx="auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <VStack spacing={4} align="stretch" mb={8}>
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Heading size="lg" color="green.600" display="flex" alignItems="center" gap={2}>
                <FiCalendar />
                Daily Report
              </Heading>
              <Text color="gray.600">
                Collection performance for {formatDate(selectedDate)}
              </Text>
              {selectedDate === dayjs().format('YYYY-MM-DD') && (
                <Text color="green.600" fontSize="sm" fontWeight="semibold">
                  📅 Today's Report
                </Text>
              )}
            </VStack>
            <HStack spacing={3}>
              <InputGroup maxW="200px">
                <InputLeftElement pointerEvents="none">
                  <FiCalendar color="gray.300" />
                </InputLeftElement>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  size="sm"
                />
              </InputGroup>
              <Button
                size="sm"
                colorScheme="blue"
                variant={selectedDate === dayjs().format('YYYY-MM-DD') ? 'solid' : 'outline'}
                onClick={() => setSelectedDate(dayjs().format('YYYY-MM-DD'))}
              >
                Today
              </Button>
              
              {/* Assign Collections Button */}
              <Button
                leftIcon={<FiUserPlus />}
                colorScheme="blue"
                size="sm"
                onClick={() => handleAssignToManager()}
              >
                Assign Collections
              </Button>

              {/* Payment Process Button */}
              <Menu>
                <MenuButton
                  as={Button}
                  leftIcon={<FiCreditCard />}
                  rightIcon={<FiChevronDown />}
                  colorScheme="green"
                  size="sm"
                >
                  Payment Process
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => handlePaymentProcess('manager')}>
                    Manager
                  </MenuItem>
                  <MenuItem onClick={() => handlePaymentProcess('deposit_to_bank')}>
                    Deposit to Bank
                  </MenuItem>
                </MenuList>
              </Menu>

              <Button
                leftIcon={<FiDownload />}
                colorScheme="green"
                size="sm"
                onClick={handleExport}
                isDisabled={filteredData.length === 0}
              >
                Export CSV
              </Button>
            </HStack>
          </HStack>
        </VStack>

        {/* Summary Cards */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6} mb={8}>
          <GridItem>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Total Collections</StatLabel>
                  <StatNumber color="blue.600">{totalCollections}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    {reportData?.loanCollections?.length || 0} loans, {reportData?.savingCollections?.length || 0} savings
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Total Amount</StatLabel>
                  <StatNumber color="green.600">{formatCurrency(totalAmount)}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    {formatCurrency(reportData?.totalLoanAmount || 0)} loans, {formatCurrency(reportData?.totalSavingAmount || 0)} savings
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Loan Collections</StatLabel>
                  <StatNumber color="blue.600">{reportData?.loanCollections?.length || 0}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    {formatCurrency(reportData?.totalLoanAmount || 0)}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Saving Collections</StatLabel>
                  <StatNumber color="purple.600">{reportData?.savingCollections?.length || 0}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    {formatCurrency(reportData?.totalSavingAmount || 0)}
                    {reportData?.savingStats?.totalCount > 0 && selectedDate === dayjs().format('YYYY-MM-DD') && (
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Total today: {reportData.savingStats.totalCount} collections ({formatCurrency(reportData.savingStats.totalAmount)})
                      </Text>
                    )}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>


        {/* Collections Table */}
        <Card>
          <CardHeader>
            <Heading size="md" color="gray.700">
              Collection Details
            </Heading>
          </CardHeader>
          <CardBody>
            {filteredData.length > 0 ? (
              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead>
                  <Tr>
                    <Th>User Name</Th>
                    <Th>Account Type</Th>
                    <Th>Amount</Th>
                    <Th>Collection Time</Th>
                    <Th>Status</Th>
                  </Tr>
                  </Thead>
                  <Tbody>
                    {filteredData.map((collection, index) => (
                      <motion.tr
                        key={collection._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="semibold" color="gray.800">
                              {collection.user_name || collection.user_id?.full_name || 'N/A'}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              📞 {collection.user_phone || collection.user_id?.phone_number || 'No phone'}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={collection.account_type === 'loan' ? 'blue' : 'purple'}
                            fontSize="xs"
                            px={2}
                            py={1}
                          >
                            {collection.account_type === 'loan' ? 'Loan' : 'Saving'}
                          </Badge>
                        </Td>
                        <Td>
                          <Text fontWeight="semibold" color="green.600">
                            {formatCurrency(collection.amount || collection.deposit_amount || 0)}
                          </Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm" color="gray.600">
                            {formatTime(collection.created_on)}
                          </Text>
                        </Td>
                        <Td>
                          <Badge colorScheme="green" fontSize="xs" px={2} py={1}>
                            Completed
                          </Badge>
                        </Td>
                      </motion.tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            ) : (
              <Center py={8}>
                <VStack spacing={4}>
                  <Text color="gray.500" fontSize="lg">
                    No collections found for {formatDate(selectedDate)}
                  </Text>
                  <Text color="gray.400" fontSize="sm">
                    Try selecting a different date
                  </Text>
                </VStack>
              </Center>
            )}
          </CardBody>
        </Card>

        {/* Assign Collections Modal */}
        <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Assign Daily Collections to Manager for Review</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4}>
                <Text>
                  Assign your daily collections to <strong>Manager</strong> for review and approval
                </Text>
                <Text fontSize="sm" color="gray.600">
                  This will send all collections from {formatDate(selectedDate)} to the manager for review.
                </Text>
                <Box p={4} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                  <VStack spacing={2} align="start">
                    <Text fontWeight="semibold" color="blue.700">
                      Collections Summary:
                    </Text>
                    <Text fontSize="sm" color="blue.600">
                      • Total Collections: {totalCollections}
                    </Text>
                    <Text fontSize="sm" color="blue.600">
                      • Total Amount: {formatCurrency(totalAmount)}
                    </Text>
                    <Text fontSize="sm" color="blue.600">
                      • Loan Collections: {reportData?.loanCollections?.length || 0} ({formatCurrency(reportData?.totalLoanAmount || 0)})
                    </Text>
                    <Text fontSize="sm" color="blue.600">
                      • Saving Collections: {reportData?.savingCollections?.length || 0} ({formatCurrency(reportData?.totalSavingAmount || 0)})
                    </Text>
                  </VStack>
                </Box>
                <HStack spacing={3}>
                  <Button onClick={handleAssignSubmit} colorScheme="blue">
                    Assign Collections to Manager
                  </Button>
                  <Button onClick={() => setIsAssignModalOpen(false)}>
                    Cancel
                  </Button>
                </HStack>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Payment Process Modal */}
        <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {paymentProcessType === 'deposit_to_bank' ? 'Deposit to Bank' : 'Payment Process - Manager'}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4}>
                <Text>
                  Process payment through <strong>
                    {paymentProcessType === 'deposit_to_bank' ? 'Bank Deposit' : 'Manager'}
                  </strong>
                </Text>
                <FormControl>
                  <FormLabel>Select User</FormLabel>
                  <Select
                    placeholder="Choose a user"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                  >
                    {filteredData.map((collection) => (
                      <option key={collection._id} value={collection._id}>
                        {collection.user_name} ({collection.account_type}) - {formatCurrency(collection.amount || collection.deposit_amount || 0)}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Payment Type</FormLabel>
                  <Select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                  >
                    <option value="loan">Loan Payment</option>
                    <option value="saving">Saving Deposit</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Amount</FormLabel>
                  <NumberInput
                    value={paymentAmount}
                    onChange={(value) => setPaymentAmount(value)}
                    min={0}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                <HStack spacing={3}>
                  <Button onClick={handlePaymentSubmit} colorScheme="green">
                    {paymentProcessType === 'deposit_to_bank' ? 'Deposit to Bank' : 'Process Payment'}
                  </Button>
                  <Button onClick={() => setIsPaymentModalOpen(false)}>
                    Cancel
                  </Button>
                </HStack>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </motion.div>
    </Box>
  );
};

export default DailyReport;
