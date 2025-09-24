import axios from "axios";
//  const API_BASE_URL = "https://api.learn2ern.com/api/";
//////////////////////
//  const API_BASE_URL = "https://learn2earn-alpha.vercel.app/";
//////////////////////
//  const API_BASE_URL = "https://sai-finance.vercel.app/api/";
const API_BASE_URL = "https://saifinancebackend.onrender.com/api/";
// const API_BASE_URL = "http://localhost:3001/api/";

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout - increased for slow server responses
  headers: {
    "Content-Type": "application/json",
  },
  // Add CORS and network error handling
  withCredentials: false,
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    console.log("Making request to:", config.baseURL + config.url);
    console.log("Token:", token ? "Present" : "Not present");
    console.log("API Base URL:", API_BASE_URL);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => {
    console.error("Request interceptor error:", err);
    return Promise.reject(err);
  }
);

// Retry configuration
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

// Function to retry requests
const retryRequest = async (config, retryCount = 0) => {
  if (retryCount >= MAX_RETRIES) {
    throw new Error(`Request failed after ${MAX_RETRIES} retries`);
  }
  
  // Wait before retrying
  await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
  
  console.log(`Retrying request (attempt ${retryCount + 1}/${MAX_RETRIES}):`, config.url);
  return instance(config);
};

// Add response interceptor to handle network errors
instance.interceptors.response.use(
  (response) => {
    console.log("Response received:", response.status, response.statusText);
    return response;
  },
  async (error) => {
    const config = error.config;
    
    console.error("Network/Response Error Details:", JSON.stringify({
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      timeout: error.config?.timeout,
      method: error.config?.method
    }, null, 2));

    // Handle specific network errors
    if (error.code === 'ECONNABORTED') {
      console.error("Request timeout - server took too long to respond");
      
      // Retry timeout errors
      if (config && !config._retryCount) {
        config._retryCount = 0;
      }
      
      if (config && config._retryCount < MAX_RETRIES) {
        config._retryCount++;
        console.log(`Retrying timeout request (attempt ${config._retryCount}/${MAX_RETRIES})`);
        return retryRequest(config, config._retryCount - 1);
      }
    } else if (error.message === 'Network Error') {
      console.error("Network connectivity issue - check CORS, server status, or internet connection");
      
      // Retry network errors
      if (config && !config._retryCount) {
        config._retryCount = 0;
      }
      
      if (config && config._retryCount < MAX_RETRIES) {
        config._retryCount++;
        console.log(`Retrying network error request (attempt ${config._retryCount}/${MAX_RETRIES})`);
        return retryRequest(config, config._retryCount - 1);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
