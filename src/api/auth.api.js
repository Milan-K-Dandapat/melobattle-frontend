import API from "./axios"; // This should point to your axiosInstance.js

/**
 * Exchange Firebase ID Token for Backend JWT
 * @param {string} idToken - The token received from Firebase signInWithPopup
 */
export const googleLogin = async (idToken) => {
  try {
    // 🔥 FIXED: Matches the pluralized backend route
    const response = await API.post("/users/create", { idToken });
    
    // axiosInstance interceptor already returns 'response.data'
    if (response.success && response.token) {
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.data || response.user));
    }
    
    return response;
  } catch (error) {
    console.error("Auth API Error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fetch Full User Profile & Wallet State
 * Used on app refresh, dashboard mount, or wallet refresh
 */
export const getProfile = async () => {
  try {
    // 🔥 FIXED: Standardized to use singular '/user' or plural '/users'
    // This now pulls the latest walletBalance from MongoDB for refreshUser()
    const response = await API.get("/user/profile");
    
    // 🔥 SYNC: Ensure local storage is always updated with the latest server data (Balance, Win count, etc.)
    if (response.success && (response.data || response.user)) {
      localStorage.setItem("user", JSON.stringify(response.data || response.user));
    }
    
    return response; 
  } catch (error) {
    // Token-related errors are already handled by the Axios Interceptor,
    // but we keep this as a secondary safety guard
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    throw error;
  }
};

/**
 * Update Gamer Profile (Name, Avatar, & Location)
 * Matches the PUT /api/user/profile route
 */
export const updateProfile = async (profileData) => {
  try {
    /**
     * 🔥 DATA SYNC: 
     * profileData now includes { name, avatar, location: { city } }
     * This ensures the unique username and city are saved to MongoDB
     */
    const response = await API.put("/user/profile", profileData);
    
    // Update local user storage if the update was successful
    if (response.success && (response.data || response.user)) {
      localStorage.setItem("user", JSON.stringify(response.data || response.user));
    }
    
    return response;
  } catch (error) {
    /** * 🔥 USERNAME GUARD: 
     * If backend returns 400 because name is taken, this error will 
     * be caught by Profile.jsx
     */
    console.error("Update API Error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Secure Logout
 * Clears local storage and refreshes state
 */
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  // Redirect to login using replace to prevent back-button loops
  window.location.replace("/login"); 
};