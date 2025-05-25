
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; // Import getAuth
import { getFirestore } from "firebase/firestore"; // Import getFirestore

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
let app;
let analytics;
let auth;
let db;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); // Get the default app if already initialized
}

// Ensure services are initialized only once per app instance
try {
    analytics = getAnalytics(app);
} catch (e) {
    console.warn("Firebase Analytics could not be initialized (already initialized or other issue):", e);
}
auth = getAuth(app);
db = getFirestore(app);


export { app, analytics, auth, db }; // Export app, analytics, auth, and db
