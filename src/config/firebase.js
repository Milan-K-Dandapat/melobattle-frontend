import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD4KS0Gm-K8FLpJWq6v3SnU7ce3lwpuaRg",
  authDomain: "melo-battle.firebaseapp.com",
  projectId: "melo-battle",
  storageBucket: "melo-battle.firebasestorage.app",
  messagingSenderId: "837529745814",
  appId: "1:837529745814:web:c862b005c364e14502c5b7"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configure Google Provider
export const googleProvider = new GoogleAuthProvider();

// 🔥 THE FIX: This ensures a fresh window state for the popup
googleProvider.setCustomParameters({
  prompt: 'select_account'
});