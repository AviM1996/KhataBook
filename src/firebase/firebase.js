import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA7d8dW5RkefzBAX6dSR2qhlQ30anxOm0U",
  authDomain: "khatabook-4b57a.firebaseapp.com",
  databaseURL: "https://khatabook-4b57a-default-rtdb.firebaseio.com",
  projectId: "khatabook-4b57a",
  storageBucket: "khatabook-4b57a.firebasestorage.app",
  messagingSenderId: "603782263038",
  appId: "1:603782263038:web:3ff164c23ac6721a0435af"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
