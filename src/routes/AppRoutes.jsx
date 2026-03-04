import { useRoutes, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 
import Login from "../pages/auth/Login";
import MainLayout from "../layout/MainLayout";
import Dashboard from "../pages/dashboard/Dashboard";
import Intro from "../pages/Intro";
import ProtectedRoute from "./ProtectedRoute";
import { PrivacyPolicy, Terms, RefundPolicy, Contact } from "../pages/LegalPages";

// Wallet Pages
import WithdrawalPage from "../pages/wallet/WithdrawalPage"; 
import DepositPage from "../pages/wallet/DepositPage"; 
import WalletHistoryPage from "../pages/wallet/WalletHistoryPage"; 

// Contest Pages
import MyContests from "../pages/contest/MyContests"; 
import ContestDetails from "../pages/contest/ContestDetails";
import Leaderboard from "../pages/contest/Leaderboard"; // Global Leaderboard
import BattleScreen from "../pages/battle/BattleScreen"; 
import BattleLobby from "../pages/battle/BattleLobby"; 
import ContestLeaderboard from "../pages/battle/ContestLeaderboard"; // 🔥 NEW: Specific Standings
import LiveCodingArena from "../pages/battle/LiveCodingArena"; // 🔥 NEW: Live Compiler Arena
import QuizResult from "../pages/QuizResult/QuizResult"; 

// Profile Page
import Profile from "../pages/profile/Profile"; 

// Admin Pages
import AdminPanel from "../pages/admin/AdminPanel"; 

const AppRoutes = () => {
  const { user } = useAuth(); 

  const routes = useRoutes([
    { path: "/login", element: <Login /> },

    // 🔥 PUBLIC LEGAL PAGES (Required for Payment Gateway Approval)
    { path: "/privacy-policy", element: <PrivacyPolicy /> },
    { path: "/terms", element: <Terms /> },
    { path: "/refund-policy", element: <RefundPolicy /> },
    { path: "/contact", element: <Contact /> },
    
    { 
      path: "/intro", 
      element: (
        <ProtectedRoute>
          <Intro />
        </ProtectedRoute>
      ) 
    },
    
    // 🔥 THE WAITING ROOM
    { 
      path: "/battle-lobby/:id", 
      element: (
        <ProtectedRoute>
          <BattleLobby />
        </ProtectedRoute>
      ) 
    },

    // 🔥 THE STANDARD COMBAT ZONE
    { 
      path: "/battle/:id", 
      element: (
        <ProtectedRoute>
          <BattleScreen />
        </ProtectedRoute>
      ) 
    },

    // 🔥 THE NEW LEETCODE-STYLE COMPILER ZONE
    { 
      path: "/live-compiler/:id", 
      element: (
        <ProtectedRoute>
          <LiveCodingArena />
        </ProtectedRoute>
      ) 
    },

    // 🔥 CONTEST-SPECIFIC STANDINGS (Dream11 Style)
    { 
      path: "/contest-leaderboard/:id", 
      element: (
        <ProtectedRoute>
          <ContestLeaderboard />
        </ProtectedRoute>
      ) 
    },

    { 
      path: "/quiz-result", 
      element: (
        <ProtectedRoute>
          <QuizResult />
        </ProtectedRoute>
      ) 
    },
    

    {
      path: "/",
      element: (
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <Navigate to="/dashboard" replace /> },
        { path: "dashboard", element: <Dashboard /> },
        { path: "withdraw", element: <WithdrawalPage /> },
        { path: "deposit", element: <DepositPage /> }, 
        { path: "wallet-history", element: <WalletHistoryPage /> },
        { path: "my-contests", element: <MyContests /> }, 
        { path: "contest/:id", element: <ContestDetails /> }, 
        { path: "leaderboard", element: <Leaderboard /> }, // Global rankings
        
        { path: "profile", element: <Profile /> },
        { path: "profile/:id", element: <Profile /> }, 
        
        { 
          path: "melo-admin-portal", 
          element: user?.role === "ADMIN" ? <AdminPanel /> : <Navigate to="/dashboard" replace /> 
        },     
      ],
    },
    
    { path: "*", element: <Navigate to="/login" replace /> },
  ]);

  return routes;
};

export default AppRoutes;