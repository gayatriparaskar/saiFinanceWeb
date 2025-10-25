import axios from '../axios';

/**
 * Change user password
 * @param {Object} passwordData - Password change data
 * @param {string} passwordData.currentPassword - Current password
 * @param {string} passwordData.newPassword - New password
 * @returns {Promise<Object>} Success response
 */
export const changeUserPassword = async (passwordData) => {
  try {
    console.log('🔄 Changing user password...');
    
    const response = await axios.put('users/change-password', passwordData);
    
    if (response.data && response.data.message) {
      console.log('✅ User password changed successfully');
      return response.data;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('❌ Error changing user password:', error);
    throw error;
  }
};

/**
 * Get user profile
 * @returns {Promise<Object>} User profile data
 */
export const getUserProfile = async () => {
  try {
    const response = await axios.get('users/profile');
    
    if (response.data && response.data.result) {
      return response.data.result;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('❌ Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Get user details by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User details with loan and saving account info
 */
export const getUserDetails = async (userId) => {
  try {
    console.log('🔄 Fetching user details for:', userId);
    
    const response = await axios.get(`users/${userId}`);
    
    if (response.data && response.data.success) {
      console.log('✅ User details fetched successfully');
      return response.data;
    } else {
      throw new Error(response.data?.message || 'Failed to fetch user details');
    }
  } catch (error) {
    console.error('❌ Error fetching user details:', error);
    throw error;
  }
};

/**
 * Get user's daily collections
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User's daily collections
 */
export const getUserDailyCollections = async (userId) => {
  try {
    console.log('🔄 Fetching daily collections for:', userId);
    
    const response = await axios.get(`dailyCollections/${userId}`);
    
    if (response.data && response.data.success) {
      console.log('✅ Daily collections fetched successfully');
      return response.data;
    } else {
      throw new Error(response.data?.message || 'Failed to fetch daily collections');
    }
  } catch (error) {
    console.error('❌ Error fetching daily collections:', error);
    throw error;
  }
};