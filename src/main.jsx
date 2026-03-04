import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { MusicProvider } from "./context/MusicContext";

// 🔥 PWA Service Worker Registration
import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("New update available for Melo Battle. Reload now?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("🚀 Melo Battle is ready for offline use!");
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* AuthProvider must be outside to provide user state to everything else */}
      <AuthProvider>
        <MusicProvider>
          <App />
        </MusicProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);