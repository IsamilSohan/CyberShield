// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAhk1cxSfAB4rWDyFNThlpuGEdMEN45ezk",
  authDomain: "cybershielddefender-5b597.firebaseapp.com",
  projectId: "cybershielddefender-5b597",
  storageBucket: "cybershielddefender-5b597.firebaseapp.com",
  messagingSenderId: "962037136469",
  appId: "1:962037136469:web:0ffa79a6c29c2e9159a8dc",
  measurementId: "G-KCYYJR2F4X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };