import axios from "axios";

/**
 * ARENA ELITE AXIOS CONFIGURATION
 * Optimized for: JWT Persistence, Large Base64 Payloads, and MongoDB Sync.
 */

const pendingRequests = new Map(); // 🔥 prevents duplicate requests

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,

  /**
   * 🔥 TIMEOUT UPGRADE
   */
  timeout: 60000,

  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/* =========================================
    1. REQUEST INTERCEPTOR (Token Injection)
========================================= */
axiosInstance.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 🔥 Prevent duplicate simultaneous requests
    const requestKey = `${config.method}_${config.url}`;

    if (pendingRequests.has(requestKey)) {
      pendingRequests.get(requestKey).abort();
    }

    const controller = new AbortController();
    config.signal = controller.signal;

    pendingRequests.set(requestKey, controller);

    // Log diagnostics for debugging URL sync
    if (import.meta.env.DEV) {
      const payloadSize = config.data ? JSON.stringify(config.data).length : 0;

      console.log(
        `🚀 [Arena Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url} | Payload: ${(payloadSize / 1024).toFixed(2)} KB`
      );
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

    // 🔥 Remove request from pending list
    const requestKey = `${response.config.method}_${response.config.url}`;
    pendingRequests.delete(requestKey);

    return response.data;

  },
async (error) => {

  const { response, config } = error;

  // 🔥 IGNORE cancelled requests completely
  if (error.code === "ERR_CANCELED" || error.name === "CanceledError") {
    return Promise.resolve(); 
  }

  // 🔥 IGNORE CANCELLED REQUESTS (navigation or duplicate requests)
  if (error.code === "ERR_CANCELED" || error.name === "CanceledError") {

    const requestKey = `${config?.method}_${config?.url}`;
    pendingRequests.delete(requestKey);

    return Promise.reject(error);
  }

    // 🔥 HANDLE 429: Rate Limit Protection
    if (response?.status === 429) {

      console.warn("⚠️ Too many requests. Slowing down client...");

      // wait before allowing next request
      await new Promise(resolve => setTimeout(resolve, 2000));

      return Promise.reject(error);
    }

    // 🔥 HANDLE 401: Unauthorized/Session Expired
    if (response?.status === 401) {

      const isLoginPage = window.location.pathname === "/login";

      if (!isLoginPage) {

        console.error("🔒 Session invalidated. Terminating credentials...");

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.replace("/login?expired=true");
      }
    }

    // 🔥 HANDLE 413: Payload Too Large
    if (response?.status === 413) {
      console.error("⛔ [413] Image file is too massive for the database matrix.");
    }

    // 🔥 HANDLE 404: Endpoint Typos
    if (response?.status === 404) {
      console.error(`❌ [404] Backend route missing: ${config?.baseURL}${config?.url}`);
    }

    // 🔥 HANDLE 500: Server Crashes
    if (response?.status === 500) {
      console.error("🔥 [500] Internal Server Error: Check your backend Node.js console for the crash log.");
    }

    // 🔥 HANDLE NETWORK ERRORS / TIMEOUTS
    if (!response) {

      if (error.code === "ECONNABORTED") {
        console.error("🌐 [Timeout] Upload took too long. Optimize image size.");
      } else {
        console.error("🌐 [Network Error] Arena Server unreachable. Check backend console.");
      }

    }

    return Promise.reject(error);
  }
);

export default axiosInstance;