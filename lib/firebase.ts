import { initializeApp } from "firebase/app";
import { getAuth, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Config with fallback values to prevent build errors during SSR/SSG
const firebaseConfig = {

  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'placeholder-api-key-for-build',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'placeholder.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'placeholder-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'placeholder.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:000000000000:web:0000000000000000000000',

};


// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication with session persistence
export const auth = getAuth(app);

// Set persistence to local (keep user logged in until logout)
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence)
    .catch(error => {
      console.error("Firebase auth persistence error:", error);
    });
}

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Export app instance
export default app;
