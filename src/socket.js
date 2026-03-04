import { io } from "socket.io-client";

// This connects your frontend to your backend port
const SOCKET_URL = "https://melobattle-backend1.onrender.com"; 

const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  transports: ["websocket"]
});

export default socket;