import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Text, 
  VStack, 
  HStack, 
  Grid, 
  Card, 
  CardBody,
  Badge,
  Button,
  useToast,
  Spinner,
  Center
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';

const CollectionOfficerDashboard = () => {
  const { user, isLoading: authLoading } = useAuth();
  const toast = useToast();
  
  const [loading, setLoading] = useState(true);
  const [dailyCollections, setDailyCollections] = useState([]);
  const [totalCollections, setTotalCollections] = useState({
    totalAmount: 0,
    totalLoans: 0,
    totalSavings: 0,
    pendingCollections: 0
  });
  const [todayStats, setTodayStats] = useState({
    todayAmount: 0,
    todayLoans: 0,
    todaySavings: 0,
    todayCount: 0
  });
  const [assignedUsers, setAssignedUsers] = useState([]);

  useEffect(() => {
    if (user && !authLoading) {
      fetchOfficerData();
    }
  }, [user, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchOfficerData = async () => {
    try {
      setLoading(true);
      
      // Check if user data is available
      if (!user) {
        console.warn('User data not available');
        setLoading(false);
        return;
      }
      
      // Since there's no GET endpoint for officer collection data,
      // we'll use the officer data from the login response and
      // fetch additional data from available endpoints
      
      // Get officer's basic collection data from the user object
      const officerData = user;
      
      // Set total collections from officer model fields
      setTotalCollections({
        totalAmount: (officerData.totalLoanAmount || 0) + (officerData.totalSavingAmount || 0),
        totalLoans: officerData.totalLoanAmount || 0,
        totalSavings: officerData.totalSavingAmount || 0,
        pendingCollections: officerData.user_collections?.filter(c => c.collected_amount === 0).length || 0
      });
      
      // Set today's stats from officer model fields
      setTodayStats({
        todayAmount: (officerData.todayLoanAmount || 0) + (officerData.todaySavingAmount || 0),
        todayLoans: officerData.todayLoanAmount || 0,
        todaySavings: officerData.todaySavingAmount || 0,
        todayCount: officerData.user_collections?.filter(c => {
          const today = new Date().toISOString().split('T')[0];
          const collectionDate = new Date(c.collected_on).toISOString().split('T')[0];
          return collectionDate === today && c.collected_amount > 0;
        }).length || 0
      });
      
      // Set daily collections from user_collections array1
      const collections = officerData.user_collections || [];
      const groupedCollections = {};
      
      collections.forEach(collection => {
        // Add null checks for collection properties
        if (!collection || !collection.collected_on) return;
        
        const date = new Date(collection.collected_on).toISOString().split('T')[0];
        if (!groupedCollections[date]) {
          groupedCollections[date] = {
            date,
            amount: 0,
            totalCollections: 0,
            loanCollections: 0,
            savingCollections: 0
          };
        }
        
        groupedCollections[date].amount += collection.collected_amount || 0;
        groupedCollections[date].totalCollections += 1;
        
        if (collection.account_type === 'loan account') {
          groupedCollections[date].loanCollections += 1;
        } else if (collection.account_type === 'saving account') {
          groupedCollections[date].savingCollections += 1;
        }
      });
      
      const dailyCollectionsArray = Object.values(groupedCollections)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10); // Get last 10 days
      
      setDailyCollections(dailyCollectionsArray);
      
      // Set assigned users from user_collections
      const users = officerData.user_collections || [];
      const uniqueUsers = users.reduce((acc, collection) => {
        // Add null checks for collection properties
        if (!collection || !collection.user_id) return acc;
        
        const existingUser = acc.find(u => u.user_id === collection.user_id);
        if (!existingUser) {
          acc.push({
            user_id: collection.user_id,
            name: collection.name || 'Unknown User',
            phone_number: collection.phone_number || 'No phone',
            account_type: collection.account_type || 'unknown',
            last_collected_amount: collection.collected_amount || 0,
            last_collected_on: collection.collected_on || new Date().toISOString(),
            total_collections: users.filter(c => c && c.user_id === collection.user_id).length,
            total_collected: users
              .filter(c => c && c.user_id === collection.user_id)
              .reduce((sum, c) => sum + (c.collected_amount || 0), 0)
          });
        }
        return acc;
      }, []);
      
      setAssignedUsers(uniqueUsers);
      
    } catch (error) {
      console.error('Error fetching officer data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch collection data",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
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
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Show loading state while authentication is loading or user data is not available
  if (authLoading || loading || !user) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>
            {authLoading ? 'Authenticating...' : 
             !user ? 'Loading user data...' : 
             'Loading your dashboard...'}
          </Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <VStack spacing={4} align="stretch" mb={8}>
          <Text fontSize="3xl" fontWeight="bold" color="gray.800">
            Collection Officer Dashboard
          </Text>
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Text fontSize="lg" color="gray.600">
                Welcome, {user.name || 'Officer'}
              </Text>
              <Text fontSize="sm" color="gray.500">
                Officer Code: {user.officer_code || 'N/A'}
              </Text>
            </VStack>
            <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
              Collection Officer
            </Badge>
          </HStack>
        </VStack>
      </motion.div>
      {/* Today's Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Text fontSize="xl" fontWeight="semibold" mb={4} color="gray.700">
          Today's Performance
        </Text>
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6} mb={8}>
          <Card bg="white" shadow="md" borderRadius="lg">
            <CardBody p={6}>
              <VStack spacing={2}>
                <Text fontSize="2xl" fontWeight="bold" color="green.500">
                  {formatCurrency(todayStats.todayAmount)}
                </Text>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Today's Collection
                </Text>
              </VStack>
            </CardBody>
          </Card>

          <Card bg="white" shadow="md" borderRadius="lg">
            <CardBody p={6}>
              <VStack spacing={2}>
                <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                  {todayStats.todayCount}
                </Text>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Total Collections
                </Text>
              </VStack>
            </CardBody>
          </Card>

          <Card bg="white" shadow="md" borderRadius="lg">
            <CardBody p={6}>
              <VStack spacing={2}>
                <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                  {todayStats.todayLoans}
                </Text>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Loan Collections
                </Text>
              </VStack>
            </CardBody>
          </Card>

          <Card bg="white" shadow="md" borderRadius="lg">
            <CardBody p={6}>
              <VStack spacing={2}>
                <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                  {todayStats.todaySavings}
                </Text>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Saving Collections
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </Grid>
      </motion.div>

      {/* Total Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Text fontSize="xl" fontWeight="semibold" mb={4} color="gray.700">
          Overall Performance
        </Text>
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6} mb={8}>
          <Card bg="white" shadow="md" borderRadius="lg">
            <CardBody p={6}>
              <VStack spacing={2}>
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  {formatCurrency(totalCollections.totalAmount)}
                </Text>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Total Amount Collected
                </Text>
              </VStack>
            </CardBody>
          </Card>

          <Card bg="white" shadow="md" borderRadius="lg">
            <CardBody p={6}>
              <VStack spacing={2}>
                <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                  {totalCollections.totalLoans}
                </Text>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Total Loan Collections
                </Text>
              </VStack>
            </CardBody>
          </Card>

          <Card bg="white" shadow="md" borderRadius="lg">
            <CardBody p={6}>
              <VStack spacing={2}>
                <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                  {totalCollections.totalSavings}
                </Text>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Total Saving Collections
                </Text>
              </VStack>
            </CardBody>
          </Card>

          <Card bg="white" shadow="md" borderRadius="lg">
            <CardBody p={6}>
              <VStack spacing={2}>
                <Text fontSize="2xl" fontWeight="bold" color="red.500">
                  {totalCollections.pendingCollections}
                </Text>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Pending Collections
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </Grid>
      </motion.div>

      {/* Recent Collections */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <HStack justify="space-between" mb={4}>
          <Text fontSize="xl" fontWeight="semibold" color="gray.700">
            Recent Collections
          </Text>
          <Button
            size="sm"
            colorScheme="blue"
            variant="outline"
            onClick={fetchOfficerData}
          >
            Refresh
          </Button>
        </HStack>

        <Card bg="white" shadow="md" borderRadius="lg">
          <CardBody p={6}>
            {dailyCollections.length > 0 ? (
              <VStack spacing={4} align="stretch">
                {dailyCollections.slice(0, 10).map((collection, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <HStack justify="space-between" p={4} bg="gray.50" borderRadius="md">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="semibold" color="gray.800">
                          {formatDate(collection.date)}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {collection.totalCollections} collections
                        </Text>
                      </VStack>
                      <VStack align="end" spacing={1}>
                        <Text fontWeight="bold" color="green.600">
                          {formatCurrency(collection.amount)}
                        </Text>
                        <HStack spacing={4}>
                          <Text fontSize="sm" color="blue.600">
                            Loans: {collection.loanCollections}
                          </Text>
                          <Text fontSize="sm" color="purple.600">
                            Savings: {collection.savingCollections}
                          </Text>
                        </HStack>
                      </VStack>
                    </HStack>
                  </motion.div>
                ))}
              </VStack>
            ) : (
              <Center py={8}>
                <VStack spacing={4}>
                  <Text color="gray.500">No collection data available</Text>
                  <Button
                    colorScheme="blue"
                    variant="outline"
                    onClick={fetchOfficerData}
                  >
                    Refresh Data
                  </Button>
                </VStack>
              </Center>
            )}
          </CardBody>
        </Card>
      </motion.div>

      {/* Spacing between sections */}
      <Box h={8} />

      {/* Assigned Users Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <HStack justify="space-between" mb={4}>
          <Text fontSize="xl" fontWeight="semibold" color="gray.700">
            Assigned Users ({assignedUsers.length})
          </Text>
          <Button
            size="sm"
            colorScheme="blue"
            variant="outline"
            onClick={fetchOfficerData}
          >
            Refresh
          </Button>
        </HStack>

        <Card bg="white" shadow="md" borderRadius="lg">
          <CardBody p={6}>
            {assignedUsers.length > 0 ? (
              <VStack spacing={4} align="stretch">
                {assignedUsers.map((assignedUser, index) => (
                  <motion.div
                    key={assignedUser?.user_id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <HStack 
                      justify="space-between" 
                      p={4} 
                      bg="gray.50" 
                      borderRadius="md"
                      _hover={{ bg: "gray.100", cursor: "pointer" }}
                    >
                      <VStack align="start" spacing={1}>
                        <HStack spacing={3}>
                          <Text fontWeight="semibold" color="gray.800">
                            {assignedUser?.name || 'Unknown User'}
                          </Text>
                          <Badge 
                            colorScheme={assignedUser?.account_type === 'loan account' ? 'blue' : 'green'}
                            fontSize="xs"
                          >
                            {assignedUser?.account_type === 'loan account' ? 'Loan' : 'Saving'}
                          </Badge>
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                          {assignedUser?.phone_number || 'No phone'}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {assignedUser?.total_collections || 0} collections • Last: {assignedUser?.last_collected_on ? formatDate(assignedUser.last_collected_on) : 'N/A'}
                        </Text>
                      </VStack>
                      <VStack align="end" spacing={1}>
                        <Text fontWeight="bold" color="green.600">
                          {formatCurrency(assignedUser?.total_collected || 0)}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          Total Collected
                        </Text>
                        {(assignedUser?.last_collected_amount || 0) > 0 && (
                          <Text fontSize="xs" color="blue.600">
                            Last: {formatCurrency(assignedUser.last_collected_amount)}
                          </Text>
                        )}
                      </VStack>
                    </HStack>
                  </motion.div>
                ))}
              </VStack>
            ) : (
              <Center py={8}>
                <VStack spacing={4}>
                  <Text color="gray.500">No users assigned to you yet</Text>
                  <Text fontSize="sm" color="gray.400" textAlign="center">
                    Contact your manager to get users assigned for collection
                  </Text>
                </VStack>
              </Center>
            )}
          </CardBody>
        </Card>
      </motion.div>
    </Box>
  );
};

export default CollectionOfficerDashboard;
