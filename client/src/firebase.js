import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add your own Firebase configuration below
const firebaseConfig = {
  apiKey: "AIzaSyAeb7axXzvV1nIXx1QlIe3SL9Rl35gCdJA",
  authDomain: "virus-scanner-app.firebaseapp.com",
  projectId: "virus-scanner-app",
  storageBucket: "virus-scanner-app.firebasestorage.app",
  messagingSenderId: "688814595878",
  appId: "1:688814595878:web:92dc00e601c1be2571ebe7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export default app; 