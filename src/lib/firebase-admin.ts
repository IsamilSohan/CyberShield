// This file is for server-side Firebase Admin SDK initialization only.
// Do not import it in client-side code.
import admin from 'firebase-admin';
import type { Firestore } from 'firebase-admin/firestore';

// Ensure this environment variable is set with your service account key JSON string.
const serviceAccountKeyJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON;

if (!serviceAccountKeyJson) {
  if (process.env.NODE_ENV === 'production') {
    console.error(
      'Firebase Admin SDK: Service account key JSON is not set in environment variables. Some server-side Firebase operations will fail.'
    );
  } else {
    console.warn(
      'Firebase Admin SDK: Service account key JSON is not set (FIREBASE_SERVICE_ACCOUNT_KEY_JSON). This is required for server-side admin operations. App will try to continue, but Firestore writes from server actions might fail if not already initialized or if client SDK context is not available.'
    );
  }
}

let adminDb: Firestore;

if (!admin.apps.length && serviceAccountKeyJson) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccountKeyJson)),
      // databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com` // Optional: if using Realtime Database
    });
    console.log('Firebase Admin SDK initialized.');
    adminDb = admin.firestore();
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization error:', error.stack);
    // Fallback or throw error as appropriate for your app's needs
    // For now, we'll let it proceed, and operations using adminDb will fail if it's not initialized.
  }
} else if (admin.apps.length && serviceAccountKeyJson) {
  // If already initialized, get the default app's firestore instance
  adminDb = admin.firestore();
} else {
  // If serviceAccountKeyJson is not available, adminDb will be undefined.
  // Operations attempting to use it will need to handle this.
}

// @ts-ignore
export { adminDb };
