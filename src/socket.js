import { io } from "socket.io-client";

const SOCKET_URL = "https://melobattle-backend1.onrender.com";

const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ["websocket"],

  // reconnect protection
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
  timeout: 10000,

  // prevents multiple connections
  forceNew: false
});

export default socket;