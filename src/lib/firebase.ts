import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC2ejWA3dwonStnCRGGokvljBpSFc8nu1A",
  authDomain: "traq-cd4c0.firebaseapp.com",
  projectId: "traq-cd4c0",
  storageBucket: "traq-cd4c0.firebasestorage.app",
  messagingSenderId: "183542852190",
  appId: "1:183542852190:web:335766f3478d1b90bba2cf"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);