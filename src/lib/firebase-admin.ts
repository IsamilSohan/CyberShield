// This file is for server-side Firebase Admin SDK initialization only.
// Do not import it in client-side code.
import admin from 'firebase-admin';
import type { Firestore } from 'firebase-admin/firestore';

let adminDb: Firestore | undefined = undefined; // Initialize as undefined

const serviceAccountKeyJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON;

if (serviceAccountKeyJson) {
  if (!admin.apps.length) {
    try {
      console.log('Attempting to initialize Firebase Admin SDK...');
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccountKeyJson)),
      });
      console.log('Firebase Admin SDK initialized successfully.');
      adminDb = admin.firestore();
    } catch (error: any) {
      console.error('CRITICAL: Firebase Admin SDK initialization error. Check your FIREBASE_SERVICE_ACCOUNT_KEY_JSON in .env and ensure the server was restarted.');
      console.error('Error details:', error.message); 
      // adminDb remains undefined
    }
  } else {
    // Already initialized, get the default app's firestore instance
    console.log('Firebase Admin SDK already initialized. Getting Firestore instance.');
    adminDb = admin.firestore();
  }
} else {
  if (process.env.NODE_ENV === 'production') {
    console.error(
      'CRITICAL: Firebase Admin SDK: Service account key JSON is NOT SET in environment variables (FIREBASE_SERVICE_ACCOUNT_KEY_JSON). Admin operations will fail.'
    );
  } else {
    console.warn(
      'Firebase Admin SDK: Service account key JSON is NOT SET (FIREBASE_SERVICE_ACCOUNT_KEY_JSON). This is required for server-side admin operations. Ensure it is correctly set in your .env file and the server was restarted. Admin operations will fail.'
    );
  }
  // adminDb remains undefined
}

export { adminDb }; // adminDb will be undefined if initialization failed or key was missing
