import axios from "axios";
//  const API_BASE_URL = "https://api.learn2ern.com/api/";
//////////////////////
//  const API_BASE_URL = "https://learn2earn-alpha.vercel.app/";
//////////////////////
 const API_BASE_URL = "https://sai-finance.vercel.app/api/";

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
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

// Add response interceptor to handle network errors
instance.interceptors.response.use(
  (response) => {
    console.log("Response received:", response.status, response.statusText);
    return response;
  },
  (error) => {
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
    } else if (error.message === 'Network Error') {
      console.error("Network connectivity issue - check CORS, server status, or internet connection");
    }

    return Promise.reject(error);
  }
);

export default instance;
