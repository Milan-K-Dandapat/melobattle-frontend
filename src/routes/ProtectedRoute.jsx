import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  // 🔥 Syncing with AuthContext states
  const { user, loading } = useAuth();
  const location = useLocation();
  const token = localStorage.getItem("token");

  /**
   * 🛡️ LOADING SHIELD
   * Prevents premature redirection while the session is being validated.
   * This is essential for dynamic routes like /profile/:id to load correctly.
   */
  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#050810] flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(147,51,234,0.2)]" />
        <p className="mt-6 text-purple-400 font-black text-[10px] uppercase tracking-[0.5em] animate-pulse">
          Verifying Identity...
        </p>
      </div>
    );
  }

  /**
   * 🔒 AUTHENTICATION GUARD
   * Only redirects to login if BOTH the user object and the JWT token are missing.
   * We preserve the 'from' location so the user is sent back to the profile 
   * they were trying to view after successful login.
   */
  if (!user && !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;