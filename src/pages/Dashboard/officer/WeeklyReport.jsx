import React, { useState, useEffect, useCallback } from "react";
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
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Select,
  Grid,
  GridItem,
  Progress,
  ProgressLabel
} from '@chakra-ui/react';
import { FiBarChart2, FiDownload } from 'react-icons/fi';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import axios from '../../../axios';

// Extend dayjs with week plugins
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

const WeeklyReport = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const currentWeek = dayjs().week();
    const currentYear = dayjs().year();
    return `${currentYear}-W${currentWeek.toString().padStart(2, '0')}`;
  });
  const [weeklyData, setWeeklyData] = useState([]);
  const toast = useToast();

  useEffect(() => {
    if (user) {
      fetchWeeklyReport();
    }
  }, [user, selectedWeek, fetchWeeklyReport]);

  const fetchWeeklyReport = useCallback(async () => {
    // Calculate week dates outside try block so they're available in catch block
    // Parse week format like "2025-W37" or "2025-W01"
    const weekMatch = selectedWeek.match(/(\d{4})-W(\d{2})/);
    if (!weekMatch) {
      setError(`Invalid week format: ${selectedWeek}`);
      setLoading(false);
      return;
    }
    
    const year = parseInt(weekMatch[1]);
    const weekNumber = parseInt(weekMatch[2]);
    
    // Validate week number
    if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 52) {
      setError(`Invalid week number: ${weekNumber}. Please select a valid week.`);
      setLoading(false);
      return;
    }
    
    // Calculate week start and end dates using proper week calculation for 2025
    // Use dayjs week calculation to get the correct week
    const weekStart = dayjs().year(year).week(weekNumber).startOf('isoWeek');
    const weekEnd = dayjs().year(year).week(weekNumber).endOf('isoWeek');
    
    console.log('📅 Week Calculation Debug:', {
      selectedWeek,
      weekNumber,
      year,
      weekStart: weekStart.format('YYYY-MM-DD dddd'),
      weekEnd: weekEnd.format('YYYY-MM-DD dddd'),
      today: dayjs().format('YYYY-MM-DD dddd'),
      currentWeek: (() => {
        const currentWeek = dayjs().week();
        const currentYear = dayjs().year();
        return `${currentYear}-W${currentWeek.toString().padStart(2, '0')}`;
      })(),
      currentWeekNumber: dayjs().week(),
      currentYear: dayjs().year()
    });

    try {
      setLoading(true);
      setError(null);

      console.log('🚀 Starting weekly report fetch for officer:', user._id);

      // Validate user object
      if (!user || !user._id) {
        throw new Error('User not authenticated or invalid user data');
      }
      
      console.log('Week calculation:', {
        selectedWeek,
        weekNumber,
        year,
        weekStart: weekStart.format('YYYY-MM-DD'),
        weekEnd: weekEnd.format('YYYY-MM-DD')
      });

      // Fetch officer's data first
      const response = await axios.get(`/officers/${user._id}`);
      const officerData = response.data?.result || {};

      console.log('👤 Officer Data:', {
        officerId: user._id,
        officerName: officerData.name,
        userCollectionsCount: officerData.user_collections?.length || 0
      });

      // Fetch daily collections with error handling
      let allDailyCollections = [];
      try {
        const dailyResponse = await axios.get(`/dailyCollections`);
        allDailyCollections = dailyResponse.data?.result || [];
        console.log('📊 Daily Collections API Response:', {
          success: true,
          count: allDailyCollections.length
        });
        
        // Debug: Log sample collections to understand the data structure
        if (allDailyCollections.length > 0) {
          console.log('🔍 Sample Daily Collection:', allDailyCollections[0]);
          console.log('🔍 Collection fields:', Object.keys(allDailyCollections[0]));
        }
      } catch (dailyError) {
        console.warn('⚠️ Daily Collections API failed:', dailyError.message);
        // Continue without daily collections, will use fallback
      }
      
      // Filter collections for the selected week and current officer
      const weeklyCollections = allDailyCollections.filter(collection => {
        const collectionDate = dayjs(collection.created_on);
        const isInWeek = collectionDate.isAfter(weekStart.subtract(1, 'day')) && 
                         collectionDate.isBefore(weekEnd.add(1, 'day'));
        const isOfficerMatch = collection.collected_by === user._id;
        
        console.log('🔍 Weekly Collection Filter Debug:', {
          collectionId: collection._id,
          collectionDate: collectionDate.format('YYYY-MM-DD'),
          weekStart: weekStart.format('YYYY-MM-DD'),
          weekEnd: weekEnd.format('YYYY-MM-DD'),
          isInWeek,
          collectedBy: collection.collected_by,
          userId: user._id,
          isOfficerMatch,
          amount: collection.amount
        });
        
        return isInWeek && isOfficerMatch;
      });

      // Fetch saving collections with error handling
      let savingWeeklyCollections = [];
      try {
        const savingWeeklyResponse = await axios.get(`/savingDailyCollections/getAllSavings`);
        const allSavingWeeklyCollections = savingWeeklyResponse.data?.result || [];
        
        console.log('💰 Saving Collections API Response:', {
          success: true,
          count: allSavingWeeklyCollections.length
        });
        
        // Filter saving collections for the selected week and current officer
        savingWeeklyCollections = allSavingWeeklyCollections.filter(collection => {
          const collectionDate = dayjs(collection.created_on);
          const isInWeek = collectionDate.isAfter(weekStart.subtract(1, 'day')) && 
                           collectionDate.isBefore(weekEnd.add(1, 'day'));
          return isInWeek && collection.collected_by === user._id;
        });
      } catch (savingError) {
        console.warn('⚠️ Saving Collections API failed:', savingError.message);
        // Continue without saving collections
      }

      // Process collections with user information
      const processedWeekCollections = weeklyCollections.map(collection => ({
        ...collection,
        account_type: 'loan',
        user_name: collection.user_id?.full_name || 'Unknown User',
        user_phone: collection.user_id?.phone_number || 'No phone'
      }));

      const processedWeekSavingCollections = savingWeeklyCollections.map(collection => ({
        ...collection,
        account_type: 'saving',
        user_name: collection.user_id?.full_name || 'Unknown User',
        user_phone: collection.user_id?.phone_number || 'No phone'
      }));

      // Use the processed collections
      const weekCollections = processedWeekCollections;
      const weekSavingCollections = processedWeekSavingCollections;

      // Calculate daily breakdown
      const dailyBreakdown = [];
      for (let i = 0; i < 7; i++) {
        const day = weekStart.add(i, 'day');
        const dayCollections = weekCollections.filter(collection => {
          const collectionDate = dayjs(collection.created_on);
          return collectionDate.format('YYYY-MM-DD') === day.format('YYYY-MM-DD');
        });
        const daySavingCollections = weekSavingCollections.filter(collection => {
          const collectionDate = dayjs(collection.created_on);
          return collectionDate.format('YYYY-MM-DD') === day.format('YYYY-MM-DD');
        });
        
        dailyBreakdown.push({
          date: day.format('YYYY-MM-DD'),
          dayName: day.format('dddd'),
          loanCollections: dayCollections.length,
          savingCollections: daySavingCollections.length,
          loanAmount: dayCollections.reduce((sum, collection) => sum + (collection.amount || 0), 0),
          savingAmount: daySavingCollections.reduce((sum, collection) => sum + (collection.deposit_amount || 0), 0),
          totalAmount: dayCollections.reduce((sum, collection) => sum + (collection.amount || 0), 0) + 
                     daySavingCollections.reduce((sum, collection) => sum + (collection.deposit_amount || 0), 0)
        });
      }

      const processedData = {
        officer: officerData,
        week: selectedWeek,
        weekStart: weekStart.format('YYYY-MM-DD'),
        weekEnd: weekEnd.format('YYYY-MM-DD'),
        dailyBreakdown,
        totalLoanAmount: weekCollections.reduce((sum, collection) => sum + (collection.amount || 0), 0),
        totalSavingAmount: weekSavingCollections.reduce((sum, collection) => sum + (collection.deposit_amount || 0), 0),
        totalCollections: weekCollections.length + weekSavingCollections.length
      };

      // Fallback: If no collections found via API, try officer's user_collections
      if (weekCollections.length === 0 && weekSavingCollections.length === 0) {
        console.log('🔄 No weekly collections found via API, trying officer user_collections fallback...');
        
        const userCollections = officerData.user_collections || [];
        const weekUserCollections = userCollections.filter(collection => {
          if (!collection.collected_on) return false;
          const collectionDate = dayjs(collection.collected_on);
          const isInWeek = collectionDate.isAfter(weekStart.subtract(1, 'day')) && 
                           collectionDate.isBefore(weekEnd.add(1, 'day'));
          return isInWeek;
        });
        
        console.log('🔍 Officer User Collections Fallback:', {
          totalUserCollections: userCollections.length,
          weekUserCollections: weekUserCollections.length,
          weekUserCollectionsData: weekUserCollections
        });
        
        // If we found collections in user_collections, use them
        if (weekUserCollections.length > 0) {
          const fallbackLoanCollections = weekUserCollections
            .filter(c => c.account_type === 'loan account')
            .map(collection => ({
              ...collection,
              account_type: 'loan',
              user_name: collection.name || 'Unknown User',
              user_phone: collection.phone_number || 'No phone',
              amount: collection.collected_amount || 0
            }));
            
          const fallbackSavingCollections = weekUserCollections
            .filter(c => c.account_type === 'saving account')
            .map(collection => ({
              ...collection,
              account_type: 'saving',
              user_name: collection.name || 'Unknown User',
              user_phone: collection.phone_number || 'No phone',
              deposit_amount: collection.collected_amount || 0
            }));
          
          // Update processed data with fallback collections
          processedData.totalLoanAmount = fallbackLoanCollections.reduce((sum, c) => sum + (c.amount || 0), 0);
          processedData.totalSavingAmount = fallbackSavingCollections.reduce((sum, c) => sum + (c.deposit_amount || 0), 0);
          processedData.totalCollections = fallbackLoanCollections.length + fallbackSavingCollections.length;
          
          setWeeklyData([...fallbackLoanCollections, ...fallbackSavingCollections]);
          
          console.log('✅ Using fallback data from officer user_collections:', {
            loanCollections: fallbackLoanCollections.length,
            savingCollections: fallbackSavingCollections.length,
            totalLoanAmount: processedData.totalLoanAmount,
            totalSavingAmount: processedData.totalSavingAmount,
            fallbackLoanData: fallbackLoanCollections,
            fallbackSavingData: fallbackSavingCollections
          });

          // Debug today's fallback data
          const todayFallbackLoan = fallbackLoanCollections.filter(collection => {
            const collectionDate = dayjs(collection.collected_on);
            return collectionDate.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD');
          });
          
          const todayFallbackSaving = fallbackSavingCollections.filter(collection => {
            const collectionDate = dayjs(collection.collected_on);
            return collectionDate.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD');
          });

          console.log('🔍 Today\'s Fallback Collections:', {
            today: dayjs().format('YYYY-MM-DD dddd'),
            todayFallbackLoan: todayFallbackLoan.length,
            todayFallbackSaving: todayFallbackSaving.length,
            todayFallbackLoanAmount: todayFallbackLoan.reduce((sum, c) => sum + (c.amount || 0), 0),
            todayFallbackSavingAmount: todayFallbackSaving.reduce((sum, c) => sum + (c.deposit_amount || 0), 0),
            todayFallbackLoanData: todayFallbackLoan,
            todayFallbackSavingData: todayFallbackSaving
          });
        } else {
          setWeeklyData([]);
        }
      } else {
        setWeeklyData([...weekCollections, ...weekSavingCollections]);
      }

      console.log('📊 Weekly Report Data Summary:', {
        selectedWeek,
        weekStart: weekStart.format('YYYY-MM-DD'),
        weekEnd: weekEnd.format('YYYY-MM-DD'),
        officerId: user._id,
        loanCollectionsCount: weekCollections.length,
        savingCollectionsCount: weekSavingCollections.length,
        totalLoanAmount: processedData.totalLoanAmount,
        totalSavingAmount: processedData.totalSavingAmount,
        totalCollections: processedData.totalCollections,
        allDailyCollectionsCount: allDailyCollections.length,
        today: dayjs().format('YYYY-MM-DD'),
        isTodayInWeek: dayjs().isBetween(weekStart, weekEnd, 'day', '[]')
      });

      // Debug: Log today's collections specifically
      const todayCollections = weekCollections.filter(collection => {
        const collectionDate = dayjs(collection.created_on);
        return collectionDate.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD');
      });
      
      const todaySavingCollections = weekSavingCollections.filter(collection => {
        const collectionDate = dayjs(collection.created_on);
        return collectionDate.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD');
      });

      console.log('🔍 Today\'s Collections Debug:', {
        today: dayjs().format('YYYY-MM-DD dddd'),
        todayLoanCollections: todayCollections.length,
        todaySavingCollections: todaySavingCollections.length,
        todayLoanAmount: todayCollections.reduce((sum, c) => sum + (c.amount || 0), 0),
        todaySavingAmount: todaySavingCollections.reduce((sum, c) => sum + (c.deposit_amount || 0), 0),
        todayCollectionsData: todayCollections,
        todaySavingCollectionsData: todaySavingCollections
      });

      setReportData(processedData);
    } catch (error) {
      console.error('❌ Error fetching weekly report:', error);
      
      // Try to get data from officer's user_collections as fallback
      try {
        const response = await axios.get(`/officers/${user._id}`);
        const officerData = response.data?.result || {};
        
        if (officerData.user_collections && officerData.user_collections.length > 0) {
          console.log('🔄 Using fallback data from officer user_collections due to API error');
          
          // Process fallback data
          const userCollections = officerData.user_collections || [];
          const weekUserCollections = userCollections.filter(collection => {
            if (!collection.collected_on) return false;
            const collectionDate = dayjs(collection.collected_on);
            const isInWeek = collectionDate.isAfter(weekStart.subtract(1, 'day')) && 
                             collectionDate.isBefore(weekEnd.add(1, 'day'));
            return isInWeek;
          });
          
          if (weekUserCollections.length > 0) {
            const fallbackLoanCollections = weekUserCollections
              .filter(c => c.account_type === 'loan account')
              .map(collection => ({
                ...collection,
                account_type: 'loan',
                user_name: collection.name || 'Unknown User',
                user_phone: collection.phone_number || 'No phone',
                amount: collection.collected_amount || 0
              }));
              
            const fallbackSavingCollections = weekUserCollections
              .filter(c => c.account_type === 'saving account')
              .map(collection => ({
                ...collection,
                account_type: 'saving',
                user_name: collection.name || 'Unknown User',
                user_phone: collection.phone_number || 'No phone',
                deposit_amount: collection.collected_amount || 0
              }));
            
            // Create fallback processed data
            const fallbackData = {
              officer: officerData,
              week: selectedWeek,
              weekStart: weekStart.format('YYYY-MM-DD'),
              weekEnd: weekEnd.format('YYYY-MM-DD'),
              dailyBreakdown: [], // Will be calculated below
              totalLoanAmount: fallbackLoanCollections.reduce((sum, c) => sum + (c.amount || 0), 0),
              totalSavingAmount: fallbackSavingCollections.reduce((sum, c) => sum + (c.deposit_amount || 0), 0),
              totalCollections: fallbackLoanCollections.length + fallbackSavingCollections.length
            };
            
            // Calculate daily breakdown for fallback data
            const dailyBreakdown = [];
            for (let i = 0; i < 7; i++) {
              const day = weekStart.add(i, 'day');
              const dayCollections = fallbackLoanCollections.filter(collection => {
                const collectionDate = dayjs(collection.collected_on);
                return collectionDate.format('YYYY-MM-DD') === day.format('YYYY-MM-DD');
              });
              const daySavingCollections = fallbackSavingCollections.filter(collection => {
                const collectionDate = dayjs(collection.collected_on);
                return collectionDate.format('YYYY-MM-DD') === day.format('YYYY-MM-DD');
              });
              
              dailyBreakdown.push({
                date: day.format('YYYY-MM-DD'),
                dayName: day.format('dddd'),
                loanCollections: dayCollections.length,
                savingCollections: daySavingCollections.length,
                loanAmount: dayCollections.reduce((sum, collection) => sum + (collection.amount || 0), 0),
                savingAmount: daySavingCollections.reduce((sum, collection) => sum + (collection.deposit_amount || 0), 0),
                totalAmount: dayCollections.reduce((sum, collection) => sum + (collection.amount || 0), 0) + 
                           daySavingCollections.reduce((sum, collection) => sum + (collection.deposit_amount || 0), 0)
              });
            }
            
            fallbackData.dailyBreakdown = dailyBreakdown;
            
            setReportData(fallbackData);
            setWeeklyData([...fallbackLoanCollections, ...fallbackSavingCollections]);
            
            console.log('✅ Fallback data loaded successfully:', {
              loanCollections: fallbackLoanCollections.length,
              savingCollections: fallbackSavingCollections.length,
              totalAmount: fallbackData.totalLoanAmount + fallbackData.totalSavingAmount
            });
            
            // Show success toast instead of error
            toast({
              title: 'Data Loaded',
              description: 'Weekly report loaded using fallback data source',
              status: 'info',
              duration: 3000,
              isClosable: true,
            });
          } else {
            throw new Error('No fallback data available');
          }
        } else {
          throw new Error('No officer data available');
        }
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        setError('Failed to fetch weekly report data');
        toast({
          title: 'Error',
          description: 'Failed to fetch weekly report data',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [selectedWeek, user, toast]);

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

  const handleWeekChange = (event) => {
    setSelectedWeek(event.target.value);
  };

  const handleExport = () => {
    if (weeklyData.length === 0) {
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
    const csvData = weeklyData.map(collection => ({
      'Collection ID': collection._id,
      'User Name': collection.user_name ,
      'Account Type': collection.account_type,
      'Amount': collection.amount || collection.deposit_amount || 0,
      'Collection Date': formatDate(collection.created_on),
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
    a.download = `weekly-report-${selectedWeek}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Export Successful',
      description: 'Weekly report exported successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  if (loading) {
    return (
      <Center h="50vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="purple.500" />
          <Text>Loading weekly report...</Text>
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
  const maxDailyAmount = Math.max(...(reportData?.dailyBreakdown?.map(day => day.totalAmount) || [0]));

  return (
    <Box p={{ base: 4, md: 6 }} maxW="1400px" mx="auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <VStack spacing={4} align="stretch" mb={8}>
          {/* Mobile-first responsive header */}
          <VStack spacing={4} align="stretch">
            {/* Title and info section */}
            <VStack align="start" spacing={1}>
              <Heading size={{ base: "md", md: "lg" }} color="purple.600" display="flex" alignItems="center" gap={2}>
                <FiBarChart2 />
                Weekly Report
              </Heading>
              <Text color="gray.600" fontSize={{ base: "sm", md: "md" }}>
              {selectedWeek} ({formatDate(reportData?.weekStart)} - {formatDate(reportData?.weekEnd)})
              </Text>
            </VStack>

            {/* Controls section - responsive layout */}
            <VStack spacing={3} align="stretch">
              {/* Week controls row */}
              <HStack spacing={2} wrap="wrap">
                <Button
                  size="xs"
                  colorScheme="blue"
                  variant="outline"
                  onClick={() => {
                    const currentWeek = dayjs().week();
                    const currentYear = dayjs().year();
                    setSelectedWeek(`${currentYear}-W${currentWeek.toString().padStart(2, '0')}`);
                  }}
                  fontSize="xs"
                  px={3}
                >
                  Current Week
                </Button>
                <Select
                  value={selectedWeek}
                  onChange={handleWeekChange}
                  size="xs"
                  maxW={{ base: "150px", sm: "200px" }}
                  minW="120px"
                  fontSize="xs"
                >
                  {Array.from({ length: 52 }, (_, i) => {
                    const weekNumber = i + 1;
                    const currentYear = dayjs().year();
                    const weekStr = `${currentYear}-W${weekNumber.toString().padStart(2, '0')}`;
                    const weekStart = dayjs().year(currentYear).week(weekNumber).startOf('isoWeek');
                    const weekEnd = dayjs().year(currentYear).week(weekNumber).endOf('isoWeek');
                    const currentWeek = dayjs().week();
                    const currentWeekStr = `${currentYear}-W${currentWeek.toString().padStart(2, '0')}`;
                    const isCurrentWeek = weekStr === currentWeekStr;
                    return (
                      <option key={weekStr} value={weekStr}>
                        {isCurrentWeek ? '📍 ' : ''}Week {weekNumber} ({weekStart.format('MMM DD')} - {weekEnd.format('MMM DD')}){isCurrentWeek ? ' - Current' : ''}
                      </option>
                    );
                  })}
                </Select>
              </HStack>

              {/* Action buttons - side by side layout */}
              <HStack spacing={2} wrap="wrap" justify="flex-start">
                <Button
                  size="xs"
                  colorScheme="blue"
                  variant="outline"
                  onClick={fetchWeeklyReport}
                  isLoading={loading}
                  fontSize="xs"
                  px={3}
                >
                  <Text display={{ base: "none", sm: "inline" }}>Refresh Data</Text>
                  <Text display={{ base: "inline", sm: "none" }}>Refresh</Text>
                </Button>
                <Button
                  leftIcon={<FiDownload />}
                  colorScheme="purple"
                  size="xs"
                  onClick={handleExport}
                  isDisabled={weeklyData.length === 0}
                  fontSize="xs"
                  px={3}
                >
                  <Text display={{ base: "none", sm: "inline" }}>Export CSV</Text>
                  <Text display={{ base: "inline", sm: "none" }}>Export</Text>
                </Button>
              </HStack>
            </VStack>
          </VStack>
        </VStack>

        {/* Summary Cards */}
        <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={{ base: 4, md: 6 }} mb={8}>
          <GridItem>
            <Card>
              <CardBody p={{ base: 4, md: 6 }}>
                <Stat>
                  <StatLabel fontSize={{ base: "sm", md: "md" }}>Total Collections</StatLabel>
                  <StatNumber color="purple.600" fontSize={{ base: "lg", md: "xl" }}>{reportData?.totalCollections || 0}</StatNumber>
                  <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
                    <StatArrow type="increase" />
                    This week
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card>
              <CardBody p={{ base: 4, md: 6 }}>
                <Stat>
                  <StatLabel fontSize={{ base: "sm", md: "md" }}>Total Amount</StatLabel>
                  <StatNumber color="green.600" fontSize={{ base: "lg", md: "xl" }}>{formatCurrency(totalAmount)}</StatNumber>
                  <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
                    <StatArrow type="increase" />
                    <Text display={{ base: "block", sm: "inline" }}>
                      {formatCurrency(reportData?.totalLoanAmount || 0)} loans
                    </Text>
                    <Text display={{ base: "block", sm: "inline" }} ml={{ base: 0, sm: 1 }}>
                      {formatCurrency(reportData?.totalSavingAmount || 0)} savings
                    </Text>
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card>
              <CardBody p={{ base: 4, md: 6 }}>
                <Stat>
                  <StatLabel fontSize={{ base: "sm", md: "md" }}>Average Daily</StatLabel>
                  <StatNumber color="blue.600" fontSize={{ base: "lg", md: "xl" }}>{formatCurrency(totalAmount / 7)}</StatNumber>
                  <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
                    <StatArrow type="increase" />
                    Per day average
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card>
              <CardBody p={{ base: 4, md: 6 }}>
                <Stat>
                  <StatLabel fontSize={{ base: "sm", md: "md" }}>Best Day</StatLabel>
                  <StatNumber color="orange.600" fontSize={{ base: "lg", md: "xl" }}>
                    {reportData?.dailyBreakdown?.reduce((max, day) => 
                      day.totalAmount > max.totalAmount ? day : max, 
                      { totalAmount: 0, dayName: 'N/A' }
                    ).dayName || 'N/A'}
                  </StatNumber>
                  <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
                    <StatArrow type="increase" />
                    Highest collection day
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* Daily Breakdown */}
        <Card mb={8}>
          <CardHeader>
            <Heading size={{ base: "sm", md: "md" }} color="gray.700">
              Daily Performance Breakdown
            </Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {reportData?.dailyBreakdown?.map((day, index) => (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Box p={{ base: 3, md: 4 }} border="1px" borderColor="gray.200" borderRadius="md">
                    <VStack spacing={3} align="stretch">
                      {/* Day header - mobile responsive */}
                      <HStack justify="space-between" align="start">
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="semibold" fontSize={{ base: "md", md: "lg" }}>
                            {day.dayName}
                          </Text>
                          <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">
                            {formatDate(day.date)}
                          </Text>
                        </VStack>
                        <VStack align="end" spacing={1}>
                          <Text fontWeight="bold" fontSize={{ base: "md", md: "lg" }} color="green.600">
                            {formatCurrency(day.totalAmount)}
                          </Text>
                          <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">
                            {day.loanCollections + day.savingCollections} collections
                          </Text>
                        </VStack>
                      </HStack>
                      
                      {/* Progress bar */}
                      <Progress 
                        value={maxDailyAmount > 0 ? (day.totalAmount / maxDailyAmount) * 100 : 0} 
                        colorScheme="purple" 
                        size={{ base: "md", md: "lg" }}
                        borderRadius="md"
                      >
                        <ProgressLabel fontSize={{ base: "xs", md: "sm" }}>
                          {formatCurrency(day.totalAmount)}
                        </ProgressLabel>
                      </Progress>
                      
                      {/* Collections breakdown - mobile responsive */}
                      <VStack spacing={2} align="stretch">
                        <HStack justify="space-between" align="center">
                          <Text fontSize={{ base: "xs", md: "sm" }} color="blue.600">
                            {day.loanCollections} loans
                          </Text>
                          <Text fontSize={{ base: "xs", md: "sm" }} color="blue.600" fontWeight="semibold">
                            {formatCurrency(day.loanAmount)}
                          </Text>
                        </HStack>
                        <HStack justify="space-between" align="center">
                          <Text fontSize={{ base: "xs", md: "sm" }} color="purple.600">
                            {day.savingCollections} savings
                          </Text>
                          <Text fontSize={{ base: "xs", md: "sm" }} color="purple.600" fontWeight="semibold">
                            {formatCurrency(day.savingAmount)}
                          </Text>
                        </HStack>
                      </VStack>
                    </VStack>
                  </Box>
                </motion.div>
              ))}
            </VStack>
          </CardBody>
        </Card>

        {/* Collections Table */}
        <Card>
          <CardHeader>
            <Heading size={{ base: "sm", md: "md" }} color="gray.700">
              All Collections This Week
            </Heading>
          </CardHeader>
          <CardBody>
            {weeklyData.length > 0 ? (
              <TableContainer overflowX="auto">
                <Table variant="simple" size={{ base: "sm", md: "md" }}>
                  <Thead>
                    <Tr>
                      <Th fontSize={{ base: "xs", md: "sm" }}>User Name</Th>
                      <Th fontSize={{ base: "xs", md: "sm" }}>Account Type</Th>
                      <Th fontSize={{ base: "xs", md: "sm" }}>Amount</Th>
                      <Th fontSize={{ base: "xs", md: "sm" }}>Collection Date</Th>
                      <Th fontSize={{ base: "xs", md: "sm" }}>Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {weeklyData.map((collection, index) => (
                      <motion.tr
                        key={collection._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="semibold" color="gray.800" fontSize={{ base: "xs", md: "sm" }}>
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
                          <Text fontWeight="semibold" color="green.600" fontSize={{ base: "xs", md: "sm" }}>
                            {formatCurrency(collection.amount || collection.deposit_amount || 0)}
                          </Text>
                        </Td>
                        <Td>
                          <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">
                            {formatDate(collection.created_on || collection.collected_on)}
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
                    No collections found for week {selectedWeek}
                  </Text>
                  <Text color="gray.400" fontSize="sm">
                    Try selecting a different week
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

export default WeeklyReport;
