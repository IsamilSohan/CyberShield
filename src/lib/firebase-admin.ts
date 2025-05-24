
// This file is for server-side Firebase Admin SDK initialization only.
// Do not import it in client-side code.
import admin from 'firebase-admin';
import type { Firestore } from 'firebase-admin/firestore';

let adminDb: Firestore | undefined = undefined; // Initialize as undefined

const serviceAccountKeyJsonString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON;

if (serviceAccountKeyJsonString) {
  console.log('Firebase Admin SDK: Found FIREBASE_SERVICE_ACCOUNT_KEY_JSON in .env.');
  if (!admin.apps.length) {
    try {
      console.log('Firebase Admin SDK: Attempting to parse service account JSON...');
      const serviceAccount = JSON.parse(serviceAccountKeyJsonString);
      console.log('Firebase Admin SDK: Service account JSON parsed successfully.');
      
      console.log('Firebase Admin SDK: Attempting to initialize Firebase Admin app...');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin SDK: Firebase Admin app initialized successfully.');
      adminDb = admin.firestore();
      console.log('Firebase Admin SDK: Firestore instance obtained.');
    } catch (error: any) {
      console.error('CRITICAL: Firebase Admin SDK initialization error. This is likely due to malformed JSON in FIREBASE_SERVICE_ACCOUNT_KEY_JSON or an issue with the key itself.');
      console.error('Error details during Admin SDK init:', error.message);
      console.error('Full error stack:', error.stack);
      // adminDb remains undefined
    }
  } else {
    // Already initialized, get the default app's firestore instance
    console.log('Firebase Admin SDK: Firebase Admin app already initialized. Getting Firestore instance.');
    adminDb = admin.firestore();
  }
} else {
  if (process.env.NODE_ENV === 'production') {
    console.error(
      'CRITICAL: Firebase Admin SDK: Service account key JSON string is NOT SET in environment variables (FIREBASE_SERVICE_ACCOUNT_KEY_JSON). Admin operations will fail.'
    );
  } else {
    console.warn(
      'Firebase Admin SDK: Service account key JSON string is NOT SET (FIREBASE_SERVICE_ACCOUNT_KEY_JSON). This is required for server-side admin operations. Ensure it is correctly set in your .env file (as a single-line string) and the server was restarted. Admin operations will fail.'
    );
  }
  // adminDb remains undefined
}

export { adminDb }; // adminDb will be undefined if initialization failed or key was missing
