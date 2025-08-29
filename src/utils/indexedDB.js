// IndexedDB utility for storing user account type
const DB_NAME = 'SaiFinanceDB';
const DB_VERSION = 1;
const STORE_NAME = 'userAccountType';

// Initialize IndexedDB
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('accountType', 'accountType', { unique: false });
      }
    };
  });
};

// Store account type in IndexedDB
export const storeAccountType = async (accountType, userId = 'current_user') => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const userData = {
      id: userId,
      accountType: accountType,
      timestamp: new Date().toISOString()
    };
    
    await store.put(userData);
    console.log('Account type stored successfully:', accountType);
    return true;
  } catch (error) {
    console.error('Error storing account type:', error);
    return false;
  }
};

// Get account type from IndexedDB
export const getAccountType = async (userId = 'current_user') => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.get(userId);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          console.log('Account type retrieved:', result.accountType);
          resolve(result.accountType);
        } else {
          console.log('No account type found');
          resolve(null);
        }
      };
    });
  } catch (error) {
    console.error('Error retrieving account type:', error);
    return null;
  }
};

// Clear account type from IndexedDB (for logout)
export const clearAccountType = async (userId = 'current_user') => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    await store.delete(userId);
    console.log('Account type cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing account type:', error);
    return false;
  }
};

// Debug function to check all stored data in IndexedDB
export const debugIndexedDB = async () => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const allData = request.result;
        console.log('📊 All IndexedDB data:', allData);
        resolve(allData);
      };
    });
  } catch (error) {
    console.error('Error debugging IndexedDB:', error);
    return [];
  }
};
