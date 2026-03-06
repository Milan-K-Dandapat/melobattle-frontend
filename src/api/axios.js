import axios from "axios";

/**
 * ARENA ELITE AXIOS CONFIGURATION
 * Optimized for: JWT Persistence, Large Base64 Payloads, and MongoDB Sync.
 */
const axiosInstance = axios.create({
  // 🔥 FIX: Ensure baseURL includes the version if your backend uses it (e.g., /api/v1)
  // Check your server.js; if routes are under /api/v1, update this string.
  baseURL: import.meta.env.VITE_API_URL,
  
  /**
   * 🔥 TIMEOUT UPGRADE
   * Increased to 60s to accommodate large Base64 banner uploads from laptops.
   * This prevents the "Arena Server unreachable" error.
   */
  timeout: 60000, 
  
  withCredentials: true, // REQUIRED for cross-origin session cookies/tokens
  headers: {
    "Content-Type": "application/json",
  },
});

/* =========================================
    1. REQUEST INTERCEPTOR (Token Injection)
========================================= */
axiosInstance.interceptors.request.use(
  (config) => {
    // Dynamically fetch the latest token from storage
    const token = localStorage.getItem("token");
    
    if (token) {
      // Must match your backend's auth.middleware 'protect' logic
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log diagnostics for debugging URL sync
    if (import.meta.env.DEV) {
      const payloadSize = config.data ? JSON.stringify(config.data).length : 0;
      console.log(`🚀 [Arena Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url} | Payload: ${(payloadSize / 1024).toFixed(2)} KB`);
    }
    
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

/* =========================================
    2. RESPONSE INTERCEPTOR (Data & Error Handling)
========================================= */
axiosInstance.interceptors.response.use(
  (response) => {
    /** * 🔥 UNWRAP DATA
     * By returning response.data here, your components receive 
     * the JSON object { success, data, message } directly.
     */
    return response.data; 
  },
  (error) => {
    const { response, config } = error;

    // 🔥 HANDLE 401: Unauthorized/Session Expired
    if (response?.status === 401) {
      const isLoginPage = window.location.pathname === "/login";

      // If we get a 401 and we aren't on login, the token is invalid
      if (!isLoginPage) {
        console.error("🔒 Session invalidated. Terminating credentials...");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        
        // Use replace to prevent users from navigating back into a broken session
        window.location.replace("/login?expired=true"); 
      }
    }

    // 🔥 HANDLE 413: Payload Too Large
    if (response?.status === 413) {
      console.error("⛔ [413] Image file is too massive for the database matrix.");
    }

    // 🔥 HANDLE 404: Endpoint Typos
    if (response?.status === 404) {
      // Logic enhanced to show the full failed URL for debugging 404 Sync Errors
      console.error(`❌ [404] Backend route missing: ${config?.baseURL}${config?.url}`);
    }

    // 🔥 HANDLE 500: Server Crashes
    if (response?.status === 500) {
      console.error("🔥 [500] Internal Server Error: Check your backend Node.js console for the crash log.");
    }

    // 🔥 HANDLE NETWORK ERRORS / TIMEOUTS
    if (!response) {
      if (error.code === 'ECONNABORTED') {
        console.error("🌐 [Timeout] Upload took too long. Optimize image size.");
      } else {
        console.error("🌐 [Network Error] Arena Server unreachable. Check backend console.");
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;