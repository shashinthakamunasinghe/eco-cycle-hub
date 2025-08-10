import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
<<<<<<< Updated upstream
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
=======
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "placeholder-api-key-for-build",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "placeholder.firebaseapp.com",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "placeholder-project",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "placeholder.appspot.com",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:000000000000:web:0000000000000000000000",
>>>>>>> Stashed changes
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

<<<<<<< Updated upstream
// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
=======
try {
  // Initialize Firebase
  firebaseApp = initializeApp(firebaseConfig);
} catch (error) {
  console.error("Firebase initialization error:", error);

  // Handle initialization errors to prevent SSR/SSG failures
  if (typeof window !== "undefined") {
    // Only rethrow on client-side for better error reporting
    throw error;
  }
}
>>>>>>> Stashed changes

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

export default app;
