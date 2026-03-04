import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion"; 
import { getProfile, logoutUser } from "../api/auth.api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize user from localStorage to prevent flickering on refresh
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  
  // 🔥 LOCK PROTOCOL: Prevents multiple simultaneous profile fetches
  const fetchInProgress = useRef(false);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    logoutUser(); 
  }, []);

  /**
   * 🔥 SYNC GLOBAL USER STATE
   * FIXED: Now merges updatedData with existing state to prevent data loss 
   * and ensure immediate UI balance updates.
   */
  const updateGlobalUser = useCallback((updatedData) => {
    setUser((prev) => {
      // If no data, clear everything
      if (!updatedData) {
        localStorage.removeItem("user");
        return null;
      }

      // Merge old user data with new data (important for balance updates)
      const mergedData = prev ? { ...prev, ...updatedData } : updatedData;
      localStorage.setItem("user", JSON.stringify(mergedData));
      return mergedData;
    });
  }, []);

  /**
   * 🔥 STABILIZED FETCH PROTOCOL
   * dependency 'user' removed to break the infinite loop
   */
  const fetchUserProfile = useCallback(async () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      setLoading(false);
      setIsAuthenticated(false);
      return;
    }

    // Prevent redundant calls if a fetch is already active
    if (fetchInProgress.current) return;
    fetchInProgress.current = true;

    try {
      const response = await getProfile();
      const userData = response?.data || response;
      
      if (userData) {
        updateGlobalUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Session validation failed:", error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
      fetchInProgress.current = false;
    }
  }, [handleLogout, updateGlobalUser]);

  /**
   * 🔥 REFRESH USER DATA
   * Specifically for updating balance after payments
   */
  const refreshUser = useCallback(async () => {
    try {
      const response = await getProfile();
      const userData = response?.data || response;
      if (userData) {
        updateGlobalUser(userData);
      }
    } catch (error) {
      console.error("User refresh failed:", error);
    }
  }, [updateGlobalUser]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const login = (userData, token) => {
    if (token) localStorage.setItem("token", token);
    updateGlobalUser(userData);
    setIsAuthenticated(true);
  };

  /**
   * 🔥 UPDATED: MULTI-BALANCE SYNC
   * Corrects the issue where depositBalance was showing as 0
   */
  const updateBalance = (balanceData) => {
    setUser((prev) => {
      if (!prev) return null;
      
      const updated = { 
        ...prev, 
        walletBalance: balanceData.total ?? prev.walletBalance,
        depositBalance: balanceData.deposit ?? prev.depositBalance,
        winningBalance: balanceData.winning ?? prev.winningBalance
      };
      
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser: updateGlobalUser, 
      loading, 
      isAuthenticated, 
      login, 
      logout: handleLogout, 
      updateBalance,
      refreshUser // 🔥 Added to the provider for payment updates
    }}>
      {!loading ? children : (
        <div className="h-screen w-screen bg-[#050810] flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(147,51,234,0.2)]" />
          <div className="mt-8 flex flex-col items-center gap-2">
            <p className="text-purple-400 font-black text-xs tracking-[0.4em] animate-pulse uppercase">Synchronizing Arena</p>
            <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="w-full h-full bg-gradient-to-r from-transparent via-purple-500 to-transparent"
                />
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);