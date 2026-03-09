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
  Center,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  IconButton,
  Tooltip
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ViewIcon } from '@chakra-ui/icons';
import axios from '../../../axios'
const CollectionOfficerDashboard = () => {
  const { user, isLoading: authLoading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  
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
  const [setAssignedUsers] = useState([]);
  const [officerAssignUSers,setOfficerAssignUsers] = useState([]);
  const [form, setForm] = useState({
  assignTo: "officer",
  status: "Pending",
  paymentProcess: "officer",
  assignedToManager: null,
  assignedToAccounter: null,
});

  useEffect(() => {
    if (user && !authLoading) {
      fetchOfficerData();
    }
  }, [user, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

const fetchOfficerWiseCollections = async ({ officerId, period }) => {

  const endpointMap = {
    daily: "admins/officerWiseDailyCollections",
    weekly: "admins/officerWiseWeeklyCollections",
    monthly: "admins/officerWiseMonthlyCollections",
  };

  const date = new Date().toISOString().split("T")[0];

  const { data } = await axios.get(endpointMap[period], {
    params: { officerId, date },
  });

  /* 🔥 STEP 1: All officers data */
  const allOfficers = data?.result?.collections || [];

  /* 🔥 STEP 2: Only logged-in officer */
  const officerData = allOfficers.find(
    o => String(o.officer_id) === String(officerId)
  );

  if (!officerData) {
    // officer ka aaj koi collection nahi
    if (period === "daily") {
      setTodayStats({
        todayAmount: 0,
        todayLoans: 0,
        todaySavings: 0,
        todayCount: 0,
      });
    }

    if (period === "monthly") {
      setTotalCollections({
        totalAmount: 0,
        totalLoans: 0,
        totalSavings: 0,
        pendingCollections: 0,
      });
    }
    return;
  }

  const loanAmount = Number(officerData.loan_amount || 0);
  const savingAmount = Number(officerData.saving_amount || 0);
  const totalAmount = Number(officerData.total_amount || 0);
  const count = officerData.collections?.length || 0;

  /* 🔥 STEP 3: SET STATE */
  if (period === "daily") {
    setTodayStats({
      todayAmount: totalAmount,
      todayLoans: loanAmount,
      todaySavings: savingAmount,
      todayCount: count,
    });
  }


    setTotalCollections({
      totalAmount,
      totalLoans: loanAmount,
      totalSavings: savingAmount,
      pendingCollections: 0,
    });
  
};


useEffect(() => {
  if (!user?._id) return;

  fetchOfficerWiseCollections({
    officerId: user._id,
    period: "daily",
  });

},[user._id]);


  const fetchOfficerData = async () => {
    try {
      setLoading(true);
      
      // Check if user data is available
      if (!user) {
        console.warn('User data not available');
        setLoading(false);
        return;
      }
      
      console.log('🔄 Fetching fresh officer data from backend...');
      
      // Import axios here to avoid circular dependency
      const axios = (await import('../../../axios')).default;
      
      // Fetch fresh officer data from backend using existing officers API
      const response = await axios.get(`/officers/${user._id}`);
      const officerData = response.data.result;
      
      // Fetch all daily collections for today's calculation
      const dailyResponse = await axios.get(`/dailyCollections`);
      const allDailyCollections = dailyResponse.data?.result || [];
      
      console.log('✅ Fresh officer data received:', {
        name: officerData.name,
        userCollectionsCount: officerData.user_collections?.length || 0,
        totalLoanAmount: officerData.totalLoanAmount,
        totalSavingAmount: officerData.totalSavingAmount,
        userCollections: officerData.user_collections
      });
      
      // Debug user collections breakdown
      if (officerData.user_collections) {
        const loanCollections = officerData.user_collections.filter(c => c.account_type === 'loan account');
        const savingCollections = officerData.user_collections.filter(c => c.account_type === 'saving account');
        console.log('🔍 Officer collections breakdown:', {
          total: officerData.user_collections.length,
          loanCollections: loanCollections.length,
          savingCollections: savingCollections.length,
          loanUserIds: loanCollections.map(c => c.user_id),
          savingUserIds: savingCollections.map(c => c.user_id)
        });
      }
      
      // Set total collections from officer model fields
      // setTotalCollections({
      //   totalAmount: (officerData.totalLoanAmount || 0) + (officerData.totalSavingAmount || 0),
      //   totalLoans: officerData.totalLoanAmount || 0,
      //   totalSavings: officerData.totalSavingAmount || 0,
      //   pendingCollections: officerData.user_collections?.filter(c => c.collected_amount === 0).length || 0
      // });
      
      // Calculate today's collections for this specific officer
      const today = new Date().toISOString().split('T')[0];
      console.log('📅 Today\'s date:', today, 'Officer ID:', user._id);
      
      // Get officer model fields for reference
      const officerTodayLoanAmount = officerData.todayLoanAmount || 0;
      const officerTodaySavingAmount = officerData.todaySavingAmount || 0;
      
      console.log('📊 Officer Today\'s Performance from Model:', {
        officerTodayLoanAmount,
        officerTodaySavingAmount,
        totalFromModel: officerTodayLoanAmount + officerTodaySavingAmount,
        allDailyCollectionsCount: allDailyCollections.length,
        today: new Date().toISOString().split('T')[0],
        officerId: user._id
      });
      
      // If officer model fields are 0, try real-time calculation as fallback
      if (officerTodayLoanAmount === 0 && officerTodaySavingAmount === 0) {
        console.log('🔄 Officer model fields are 0, trying real-time calculation...');
        
        const today = new Date().toISOString().split('T')[0];
        
        // Get today's loan collections
        const todayLoanCollections = allDailyCollections.filter(collection => {
          const collectionDate = new Date(collection.created_on).toISOString().split('T')[0];
          return collectionDate === today && collection.collected_by === user._id;
        });
        
        console.log('🔍 Today\'s Loan Collections Debug:', {
          allDailyCollectionsCount: allDailyCollections.length,
          todayLoanCollectionsCount: todayLoanCollections.length,
          today,
          officerId: user._id,
          sampleCollection: allDailyCollections[0]
        });
        
        // Get today's saving collections
        let todaySavingCollections = [];
        try {
          const savingResponse = await axios.get(`/savingDailyCollections/getAllSavings`);
          const allSavingCollections = savingResponse.data?.result || [];
          todaySavingCollections = allSavingCollections.filter(collection => {
            const collectionDate = new Date(collection.created_on).toISOString().split('T')[0];
            return collectionDate === today && collection.collected_by === user._id;
          });
          
          console.log('🔍 Today\'s Saving Collections Debug:', {
            allSavingCollectionsCount: allSavingCollections.length,
            todaySavingCollectionsCount: todaySavingCollections.length,
            today,
            officerId: user._id,
            sampleSavingCollection: allSavingCollections[0]
          });
        } catch (savingError) {
          console.warn('Could not fetch today\'s saving collections:', savingError);
        }
        
        // Calculate today's amounts from collections
        const todayLoanAmount = todayLoanCollections.reduce((sum, collection) => sum + (collection.amount || 0), 0);
        const todaySavingAmount = todaySavingCollections.reduce((sum, collection) => sum + (collection.deposit_amount || 0), 0);
        
        console.log('📊 Today\'s Performance Calculation from Collections:', {
          today,
          todayLoanCollections: todayLoanCollections.length,
          todaySavingCollections: todaySavingCollections.length,
          todayLoanAmount,
          todaySavingAmount,
          totalTodayAmount: todayLoanAmount + todaySavingAmount,
          totalTodayCount: todayLoanCollections.length + todaySavingCollections.length
        });
          // ✅ TODAY
    // const todayData = await fetchOfficerWiseCollections({
    //   officerId: user._id,
    //   period: "daily",
    // });
        
    //    setTodayStats({
    //   todayAmount: todayData.totalAmount,
    //   todayLoans: todayData.loanAmount,
    //   todaySavings: todayData.savingAmount,
    //   todayCount: 0, // optional
    // });
      } else {
        // Use officer model fields (preferred method)
        // Calculate counts from collections data
          const today = new Date().toISOString().split('T')[0];
        
        // Get today's loan collections count
        const todayLoanCollections = allDailyCollections.filter(collection => {
          const collectionDate = new Date(collection.created_on).toISOString().split('T')[0];
          const isToday = collectionDate === today;
          const isOfficerCollection = collection.collected_by === user._id;
          
          console.log('🔍 Loan Collection Filter Debug:', {
            collectionId: collection._id,
            createdOn: collection.created_on,
            collectionDate,
            today,
            isToday,
            collectedBy: collection.collected_by,
            officerId: user._id,
            isOfficerCollection,
            amount: collection.collected_amount
          });
          
          return isToday && isOfficerCollection;
        });
        
        // Get today's saving collections count
        let todaySavingCollections = [];
        try {
          const savingResponse = await axios.get(`/savingDailyCollections/getAllSavings`);
          const allSavingCollections = savingResponse.data?.result || [];
          
          console.log('🔍 All Saving Collections Debug:', {
            totalSavingCollections: allSavingCollections.length,
            sampleSavingCollection: allSavingCollections[0],
            today,
            officerId: user._id
          });
          
          todaySavingCollections = allSavingCollections.filter(collection => {
            const collectionDate = new Date(collection.created_on).toISOString().split('T')[0];
            const isToday = collectionDate === today;
            const isOfficerCollection = collection.collected_by === user._id;
            
            console.log('🔍 Saving Collection Filter Debug:', {
              collectionId: collection._id,
              createdOn: collection.created_on,
              collectionDate,
              today,
              isToday,
              collectedBy: collection.collected_by,
              officerId: user._id,
              isOfficerCollection,
              depositAmount: collection.deposit_amount
            });
            
            return isToday && isOfficerCollection;
          });
        } catch (savingError) {
          console.warn('Could not fetch today\'s saving collections for count:', savingError);
        }
        
        const todayLoanCount = todayLoanCollections.length;
        const todaySavingCount = todaySavingCollections.length;
        const totalTodayCount = todayLoanCount + todaySavingCount;
        
        console.log('📊 Today\'s Counts from Collections:', {
          todayLoanCount,
          todaySavingCount,
          totalTodayCount,
          todayLoanAmount: officerTodayLoanAmount,
          todaySavingAmount: officerTodaySavingAmount
        });
        
        // Fallback: If counts are 0, try to get counts from officer's user_collections
        let finalLoanCount = todayLoanCount;
        let finalSavingCount = todaySavingCount;
        
        if (todayLoanCount === 0 && todaySavingCount === 0) {
          console.log('🔄 No collections found via API, trying user_collections fallback...');
          
          const today = new Date().toISOString().split('T')[0];
          const userCollections = officerData.user_collections || [];
          
          const todayUserCollections = userCollections.filter(collection => {
            if (!collection.collected_on) return false;
            const collectionDate = new Date(collection.collected_on).toISOString().split('T')[0];
            return collectionDate === today;
          });
          
          const loanCollections = todayUserCollections.filter(c => c.account_type === 'loan account');
          const savingCollections = todayUserCollections.filter(c => c.account_type === 'saving account');
          
          finalLoanCount = loanCollections.length;
          finalSavingCount = savingCollections.length;
          
          console.log('📊 Fallback Counts from user_collections:', {
            totalUserCollections: userCollections.length,
            todayUserCollections: todayUserCollections.length,
            loanCollections: finalLoanCount,
            savingCollections: finalSavingCount
          });
        }
        
        // Calculate today's actual collection amounts from the collections data
        const apiLoanAmount = todayLoanCollections.reduce((sum, collection) => sum + (collection.collected_amount || 0), 0);
        const apiSavingAmount = todaySavingCollections.reduce((sum, collection) => sum + (collection.deposit_amount || 0), 0);
        let actualTodayAmount = apiLoanAmount + apiSavingAmount;
        
        // If no amount from API collections, try user_collections fallback
        if (actualTodayAmount === 0) {
          console.log('🔄 No amount from API collections, trying user_collections fallback...');
          
          const today = new Date().toISOString().split('T')[0];
          const userCollections = officerData.user_collections || [];
          
          const todayUserCollections = userCollections.filter(collection => {
            if (!collection.collected_on) return false;
            const collectionDate = new Date(collection.collected_on).toISOString().split('T')[0];
            return collectionDate === today;
          });
          
          const loanAmount = todayUserCollections
            .filter(c => c.account_type === 'loan account')
            .reduce((sum, c) => sum + (c.collected_amount || 0), 0);
          
          const savingAmount = todayUserCollections
            .filter(c => c.account_type === 'saving account')
            .reduce((sum, c) => sum + (c.deposit_amount || 0), 0);
          
          actualTodayAmount = loanAmount + savingAmount;
          
          console.log('💰 Fallback Amount Calculation from user_collections:', {
            loanAmount,
            savingAmount,
            actualTodayAmount,
            totalUserCollections: userCollections.length,
            todayUserCollections: todayUserCollections.length
          });
        }
        
        console.log('💰 Today\'s Amount Calculation:', {
          apiLoanAmount,
          apiSavingAmount,
          actualTodayAmount,
          officerModelAmount: officerTodayLoanAmount + officerTodaySavingAmount,
          usingActualAmount: actualTodayAmount > 0
        });
        
        // Calculate amounts for loan and saving cards
        const cardLoanAmount = todayLoanCollections.reduce((sum, collection) => sum + (collection.collected_amount || 0), 0);
        const cardSavingAmount = todaySavingCollections.reduce((sum, collection) => sum + (collection.deposit_amount || 0), 0);
        
        // If no amounts from API collections, try user_collections fallback
        let finalLoanAmount = cardLoanAmount;
        let finalSavingAmount = cardSavingAmount;
        
        if (cardLoanAmount === 0 && cardSavingAmount === 0) {
          console.log('🔄 No amounts from API collections, trying user_collections fallback...');
          
          const today = new Date().toISOString().split('T')[0];
          const userCollections = officerData.user_collections || [];
          
          const todayUserCollections = userCollections.filter(collection => {
            if (!collection.collected_on) return false;
            const collectionDate = new Date(collection.collected_on).toISOString().split('T')[0];
            return collectionDate === today;
          });
          
          finalLoanAmount = todayUserCollections
            .filter(c => c.account_type === 'loan account')
            .reduce((sum, c) => sum + (c.collected_amount || 0), 0);
          
          finalSavingAmount = todayUserCollections
            .filter(c => c.account_type === 'saving account')
            .reduce((sum, c) => sum + (c.deposit_amount || 0), 0);
          
          console.log('💰 Fallback Amount Calculation from user_collections:', {
            loanAmount: finalLoanAmount,
            savingAmount: finalSavingAmount,
            totalAmount: finalLoanAmount + finalSavingAmount
          });
        }
        
        const totalTodayAmount = finalLoanAmount + finalSavingAmount;
        
        console.log('💰 Final Amount Calculation:', {
          loanAmount: finalLoanAmount,
          savingAmount: finalSavingAmount,
          totalAmount: totalTodayAmount,
          officerModelAmount: officerTodayLoanAmount + officerTodaySavingAmount
        });
        
        setTodayStats({
          todayAmount: totalTodayAmount > 0 ? totalTodayAmount : (officerTodayLoanAmount + officerTodaySavingAmount),
          todayLoans: finalLoanAmount, // Amount, not count
          todaySavings: finalSavingAmount, // Amount, not count
          todayCount: finalLoanCount + finalSavingCount // Total count (for reference)
        });
      }
      
      // Set daily collections from user_collections array1
      const collections = officerData.user_collections || [];
      const groupedCollections = {};
      
      collections.forEach(collection => {
        // Add null checks for collection properties
        if (!collection || !collection.collected_on) return;
        
        const date = new Date(collection.collected_on).toISOString().split('T')[0];
        
        // Debug: Log the date conversion
        console.log('🔍 Collection Date Debug:', {
          originalDate: collection.collected_on,
          parsedDate: date,
          formattedDate: new Date(collection.collected_on).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })
        });
        
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
      
      console.log('📊 Daily Collections Array:', dailyCollectionsArray);
      
      setDailyCollections(dailyCollectionsArray);
      
      // Fetch all users from users API
      const usersResponse = await axios.get('/users');
      const allUsers = usersResponse.data.result || [];
      console.log('🔍 All users fetched:', allUsers.length);
    
      // Filter users assigned to this officer  
      const assignedUsers = allUsers.filter(userRecord => 
        userRecord.officer_id && userRecord.officer_id._id === user._id
      );
      console.log('🔍 Users assigned to this officer:', assignedUsers.length);
      console.log('🔍 Assigned users details:', assignedUsers.map(u => ({
        userId: u._id,
        name: u.full_name,
        accountType: u.account_type,
        phone: u.phone_number,
        officerId: u.officer_id?._id
      })));
      
      // Fetch saving collections data for each user individually
      const savingCollectionsPromises = assignedUsers.map(async (user) => {
        try {
          const response = await axios.get(`/savingDailyCollections/${user._id}`);
          return response.data.result;
        } catch (error) {
          console.log(`No saving data found for user ${user._id}:`, error.response?.data?.message || error.message);
          return null;
        }
      });
      
      const savingCollectionsResults = await Promise.all(savingCollectionsPromises);
      const savingCollections = savingCollectionsResults.filter(result => result !== null);
      console.log('🔍 Saving collections fetched for users:', savingCollections.length);
      
      console.log('🔍 Assigned users found:', assignedUsers.length);
      console.log('🔍 Assigned users details:', assignedUsers.map(u => ({
        userId: u._id,
        name: u.full_name,
        accountType: u.account_type
      })));
      
      // Transform users to match our table structure
      const finalUsers = await Promise.all(assignedUsers.map(async (userRecord) => {
        // Since we're getting data from users API, we need to fetch account details separately
        const accountType = userRecord.account_type;
        let accountData = {};
        
        if (accountType === 'loan account' && userRecord.active_loan_id) {
          accountData = {
            // Original amounts from when user was created
            principal_amount: userRecord.active_loan_id.principle_amount || 0,
            original_total_amount: userRecord.active_loan_id.loan_amount || 0,
            original_total_due: userRecord.active_loan_id.total_amount || 0, // Original total with interest
            // Current amounts (remaining to be paid)
            current_total_amount: userRecord.active_loan_id.total_amount || 0, // Current total amount
            current_total_due: userRecord.active_loan_id.total_due_amount || 0, // Current remaining amount
            remaining_emi_days: userRecord.active_loan_id.remaining_emi_days || 0,
            end_date: userRecord.active_loan_id.end_date,
            start_date: userRecord.active_loan_id.created_on,
            emi_day: userRecord.active_loan_id.emi_day || 0
          };
        } else if (accountType === 'saving account' && userRecord.saving_account_id) {
          accountData = {
            // For saving accounts, the original amount is the amount_to_be
            principal_amount: userRecord.saving_account_id.amount_to_be || 0,
            original_total_amount: userRecord.saving_account_id.amount_to_be || 0,
            original_total_due: userRecord.saving_account_id.amount_to_be || 0, // Original target amount
            // Current amounts (remaining to be saved)
            current_total_amount: userRecord.saving_account_id.amount_to_be || 0, // Current target amount
            current_total_due: userRecord.saving_account_id.amount_to_be - (userRecord.saving_account_id.current_amount || 0), // Remaining amount to save
            remaining_emi_days: userRecord.saving_account_id.remaining_emi_days || 0,
            end_date: userRecord.saving_account_id.end_date,
            start_date: userRecord.saving_account_id.created_on,
            emi_day: userRecord.saving_account_id.emi_day || 0
          };
        }
        
        // Extract account data - use correct amounts for display
        const principalAmount = parseFloat(accountData.principal_amount) || 0;
        const originalTotalAmount = parseFloat(accountData.original_total_amount) || 0;
        const originalTotalDue = parseFloat(accountData.original_total_due) || 0; // Original total with interest
        const currentTotalAmount = parseFloat(accountData.current_total_amount) || 0; // Current total amount
        const currentTotalDueAmount = parseFloat(accountData.current_total_due) || 0; // Current remaining amount
        const remainingEmiDays = parseFloat(accountData.remaining_emi_days) || 0;
        const endDate = accountData.end_date;
        const startDate = accountData.start_date;
        const emiDay = accountData.emi_day || 0;
        
        // Calculate daily EMI amount using original total amount
        const dailyEmiAmount = emiDay || (originalTotalAmount > 0 && remainingEmiDays > 0 ? Math.ceil(originalTotalAmount / remainingEmiDays) : 0);
        
        // Fetch collection data for this user
        let lastCollectedOn = null;
        let lastCollectedAmount = 0;
        let totalCollections = 0;
        let penalty = 0;
        
        try {
          if (accountType === 'loan account') {
            // Fetch loan collections
            const loanCollectionsResponse = await axios.get(`/dailyCollections/${userRecord._id}`);
            const loanCollections = loanCollectionsResponse.data?.result || [];
            
            if (loanCollections.length > 0) {
              // Sort by date to get the most recent collection
              const sortedCollections = loanCollections.sort((a, b) => new Date(b.created_on) - new Date(a.created_on));
              const lastCollection = sortedCollections[0];
              
              lastCollectedOn = lastCollection.created_on;
              lastCollectedAmount = lastCollection.amount || 0;
              totalCollections = loanCollections.length;
              penalty = lastCollection.total_penalty_amount || 0;
            }
          } else if (accountType === 'saving account') {
            // Fetch saving collections
            const savingCollectionsResponse = await axios.get(`/savingDailyCollections/${userRecord._id}`);
            const savingCollections = savingCollectionsResponse.data?.result?.collections || [];
            
            if (savingCollections.length > 0) {
              // Sort by date to get the most recent collection
              const sortedCollections = savingCollections.sort((a, b) => new Date(b.created_on) - new Date(a.created_on));
              const lastCollection = sortedCollections[0];
              
              lastCollectedOn = lastCollection.created_on;
              lastCollectedAmount = (lastCollection.deposit_amount || 0) + (lastCollection.withdraw_amount || 0);
              totalCollections = savingCollections.length;
            }
          }
        } catch (error) {
          console.log(`No collection data found for user ${userRecord._id}:`, error.response?.data?.message || error.message);
        }
        
        const status = 'Active';
        
        return {
          user_id: userRecord._id,
          name: userRecord.full_name || 'Unknown User',
          phone_number: userRecord.phone_number || 'No phone',
          address: userRecord.address || 'No address',
          pan_no: 'No PAN', // Not available in users API
          // Financial data from loan/saving account
          account_type: accountType,
          // Original amounts (fixed from when user was created)
          principal_amount: principalAmount,
          total_amount: originalTotalAmount, // Original total amount
          total_due_amount: originalTotalDue, // Original total with interest
          // Current amounts (remaining to be paid/saved)
          current_total_amount: currentTotalAmount, // Current total amount
          current_total_due_amount: currentTotalDueAmount, // Current remaining amount
          current_amount: currentTotalAmount - currentTotalDueAmount, // Amount already paid/saved
          total_with_interest: originalTotalDue, // Original total with interest
          interest_amount: originalTotalDue - principalAmount, // Interest amount
          emi_day: dailyEmiAmount,
          remaining_emi_days: remainingEmiDays,
          start_date: startDate,
          end_date: endDate,
          penalty: penalty,
          status: status,
          // Additional user information
          created_on: startDate,
          updated_on: lastCollectedOn,
          // Collection statistics (now with actual data)
          total_collections: totalCollections,
          last_collected_amount: lastCollectedAmount,
          last_collected_on: lastCollectedOn
        };
      }));
      
      console.log('✅ Final users with collection data:', finalUsers);
      setAssignedUsers(finalUsers);
         const officerResponse = await axios.get(`officers/${allUsers?.officerId || user?._id}`);
         const data = officerResponse.data.result.user_collections;

         console.log(data,"officerResponse");
         
           setOfficerAssignUsers(data)
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

  const handleViewUser = (assignedUser) => {
    console.log('🔍 View User Clicked:', assignedUser);
    if (assignedUser?.account_type === 'loan account') {
      console.log('📋 Navigating to loan view:', `/officer/viewLoan/${assignedUser.user_id}`);
      navigate(`/officer/viewLoan/${assignedUser.user_id}`);
    } else if (assignedUser?.account_type === 'saving account') {
      console.log('💰 Navigating to saving view:', `/officer/viewSaving/${assignedUser.user_id}`);
      navigate(`/officer/viewSaving/${assignedUser.user_id}`);
    } else {
      console.log('❌ Unknown account type:', assignedUser?.account_type);
      toast({
        title: "Error",
        description: "Unknown account type",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  };
console.log(user._id,"userrr");

  const handleUpdate = async () => {
  await axios.put(`/officers/${user._id}`, {
    assignTo: form.assignTo,
    status: form.status,
    paymentProcess: form.paymentProcess,
    assignedToManager: form.assignedToManager,
    assignedToAccounter: form.assignedToAccounter,
  });
};


  const getRemainingDays = (user) => {
  const currentDate = new Date();
  let endDate;

  if (user?.end_date) {
    endDate = new Date(user.end_date);
  } else if (user.created_on) {
    const createdDate = new Date(user.created_on);
    endDate = new Date(createdDate.getTime() + 120 * 24 * 60 * 60 * 1000);
  } else {
    endDate = new Date(currentDate.getTime() + 120 * 24 * 60 * 60 * 1000);
  }

  const timeDiff = endDate - currentDate;
  return Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
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
        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6} mb={8}>
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
                <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                  {formatCurrency(todayStats.todayLoans)}
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
                  {formatCurrency(todayStats.todaySavings)}
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

<div className="overflow-x-auto">
  <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
    <thead className="bg-gray-100 hidden md:table-header-group">
      <tr>
        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Assign To</th>
        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Payment Process</th>
        {/* <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Assigned To Manager</th>
        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Assigned To Accounter</th> */}
        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Action</th>
      </tr>
    </thead>

    <tbody className="divide-y divide-gray-200">
      <tr className="block md:table-row bg-white">
        {/* Assign To */}
        <td className="px-4 py-3 block md:table-cell">
          <span className="md:hidden text-xs font-medium text-gray-500">Assign To</span>
          <select
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.assignTo}
            onChange={(e) =>
              setForm({ ...form, assignTo: e.target.value })
            }
          >
            <option value="accounter">Accounter</option>
            <option value="manager">Manager</option>
          </select>
        </td>

        {/* Status */}
        <td className="px-4 py-3 block md:table-cell">
          <span className="md:hidden text-xs font-medium text-gray-500">Status</span>
          <select
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value })
            }
          >
            <option value="Pending">Pending</option>
            <option value="In Process">In Process</option>
            <option value="Completed">Completed</option>
          </select>
        </td>

        {/* Payment Process */}
        <td className="px-4 py-3 block md:table-cell">
          <span className="md:hidden text-xs font-medium text-gray-500">Payment Process</span>
          <select
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.paymentProcess}
            onChange={(e) =>
              setForm({ ...form, paymentProcess: e.target.value })
            }
          >
            <option value="officer">Officer</option>
            <option value="manager">Manager</option>
            <option value="accounter">Accounter</option>
            <option value="deposite to bank">Deposite to Bank</option>
           
          </select>
        </td>

        {/* Assigned To Manager */}
        {/* <td className="px-4 py-3 block md:table-cell">
          <span className="md:hidden text-xs font-medium text-gray-500">Assigned To Manager</span>
          <input
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Manager ID"
            value={form.assignedToManager || ""}
            onChange={(e) =>
              setForm({ ...form, assignedToManager: e.target.value || null })
            }
          />
        </td> */}

        {/* Assigned To Accounter */}
        {/* <td className="px-4 py-3 block md:table-cell">
          <span className="md:hidden text-xs font-medium text-gray-500">Assigned To Accounter</span>
          <input
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Accounter ID"
            value={form.assignedToAccounter || ""}
            onChange={(e) =>
              setForm({ ...form, assignedToAccounter: e.target.value || null })
            }
          />
        </td> */}

        {/* Action */}
        <td className="px-4 py-4 block md:table-cell text-right md:text-center">
          <button
            onClick={handleUpdate}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
          >
            Update
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</div>


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
            Assigned Customers ({officerAssignUSers.length})
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
            {officerAssignUSers.length > 0 ? (
              <TableContainer overflowX="auto">
                <Table variant="simple" size="sm" minW="1800px">
                  <Thead>
                    <Tr>
                      <Th>User Details</Th>
                      <Th>Account Type</Th>
                      {/* <Th>Status</Th> */}
                      <Th>Principal Amount</Th>
                      <Th>Current Amount</Th>
                      <Th>Daily EMI Amount</Th>
                      <Th>Remaining EMI Days</Th>
                      <Th>Start Date</Th>
                      <Th>End Date</Th>
                      <Th>Penalty</Th>
                      {/* <Th>Last Collection</Th> */}
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {officerAssignUSers.map((assignedUser, index) => (
                      <motion.tr
                        key={assignedUser?.user_id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        _hover={{ bg: "gray.50" }}
                      >
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="semibold" color="gray.800" fontSize="sm">
                              {assignedUser?.name || 'Unknown User'}
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                              📞 {assignedUser?.phone_number || 'No phone'}
                            </Text>
                            <Text fontSize="xs" color="gray.500" maxW="150px" isTruncated>
                              📍 {assignedUser?.address || 'No address'}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Badge 
                            colorScheme={assignedUser?.account_type === 'loan account' ? 'blue' : 'green'}
                            fontSize="xs"
                            px={2}
                            py={1}
                          >
                            {assignedUser?.account_type === 'loan account' ? 'Loan' : 'Saving'}
                          </Badge>
                        </Td>
                        {/* <Td>
                          <Badge 
                            colorScheme={
                              assignedUser?.status === 'Active' ? 'green' : 
                              assignedUser?.status === 'Overdue' ? 'red' : 
                              assignedUser?.status === 'Completed' ? 'blue' : 'gray'
                            }
                            fontSize="xs"
                            px={2}
                            py={1}
                          >
                            {assignedUser?.status || 'Unknown'}
                          </Badge>
                        </Td> */}
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="semibold" color="blue.600" fontSize="sm">
                              {formatCurrency(assignedUser?.total_amount || 0)}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              (principal)
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="semibold" color="purple.600" fontSize="sm">
                              {formatCurrency(assignedUser?.current_amount || assignedUser?.collected_amount)}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              (paid/saved)
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Text fontWeight="semibold" color="green.600" fontSize="sm">
                            {formatCurrency(assignedUser?.emiAmount || 0)}
                          </Text>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontSize="sm" color="gray.700" fontWeight="semibold">
                              {getRemainingDays(assignedUser) || 0} days
                            </Text>
                            {assignedUser?.remaining_emi_days > 0 && (
                              <Box 
                                w="60px" 
                                h="4px" 
                                bg="gray.200" 
                                borderRadius="2px"
                                overflow="hidden"
                              >
                                <Box 
                                  h="100%" 
                                  bg={assignedUser.remaining_emi_days > 30 ? "green.400" : assignedUser.remaining_emi_days > 10 ? "yellow.400" : "red.400"}
                                  w={`${Math.max(0, Math.min(100, ((120 - assignedUser.remaining_emi_days) / 120) * 100))}%`}
                                  transition="width 0.3s ease"
                                />
                              </Box>
                            )}
                          </VStack>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontSize="xs" color="gray.700" fontWeight="semibold">
                              {assignedUser?.start_date ? formatDate(assignedUser.start_date) : 'N/A'}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontSize="xs" color="gray.700" fontWeight="semibold">
                              {assignedUser?.end_date ? formatDate(assignedUser.end_date) : 'N/A'}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Text fontWeight="semibold" color="orange.600" fontSize="sm">
                            {formatCurrency(assignedUser?.penalty || 0)}
                          </Text>
                        </Td>
                        {/* <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontSize="xs" color="gray.700">
                              {assignedUser?.last_collected_on ? formatDate(assignedUser.last_collected_on) : 'N/A'}
                            </Text>
                            {(assignedUser?.last_collected_amount || 0) > 0 && (
                              <Text fontSize="xs" color="green.600" fontWeight="semibold">
                                {formatCurrency(assignedUser.last_collected_amount)}
                              </Text>
                            )}
                          </VStack>
                        </Td> */}
                        <Td>
                          <Tooltip label="View User Details" placement="top">
                            <IconButton
                              aria-label="View User"
                              icon={<ViewIcon />}
                              size="sm"
                              colorScheme="blue"
                              variant="outline"
                              onClick={() => handleViewUser(assignedUser)}
                            />
                          </Tooltip>
                        </Td>
                      </motion.tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
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
