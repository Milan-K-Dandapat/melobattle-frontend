import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    // 🛡️ GUARD: Only establish connection if a user is logged in
    // This prevents anonymous "zombie" connections that cause flickering
    if (!user?._id) return;

    const newSocket = io("http://localhost:5000", {
      withCredentials: true,
      query: { userId: user._id },
      // 🔥 PERSISTENCE OPTIMIZATION: Prevents multiple connection attempts
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      console.log(`🛡️ Matrix Signal Established: ${newSocket.id}`);
    });

    setSocket(newSocket);

    // 🔥 THE CRITICAL FIX: Proper Cleanup
    // This ensures that when the component re-renders or user logs out,
    // the old listeners and connection are completely destroyed.
    return () => {
      console.log("❌ Terminating Matrix Signal...");
      newSocket.off(); // Removes all listeners
      newSocket.disconnect(); // Closes the connection
    };
  }, [user?._id]); // Only re-run if the specific User ID changes

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);