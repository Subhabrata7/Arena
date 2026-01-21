import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

/**
 * IMPORTANT:
 * 1) In production, keep these in ENV variables.
 * 2) For now we keep it inline because you're building/testing quickly.
 */
const firebaseConfig = {
  apiKey: "AIzaSyDbeWlKGV9iN2ZJ3Ub52sZSM5DLzABezh4",
  authDomain: "efootball-78.firebaseapp.com",
  databaseURL:
    "https://efootball-78-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "efootball-78",
  storageBucket: "efootball-78.firebasestorage.app",
  messagingSenderId: "752411493506",
  appId: "1:752411493506:web:5c8d8a9141d23a8dfb609b",
  measurementId: "G-E4L1KSTXH7",
};

export const APP_ID = "efootball-78"; // used for artifacts paths

export const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const auth = getAuth(app);
