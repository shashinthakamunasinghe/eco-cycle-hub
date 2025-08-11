import { initializeApp } from "firebase/app";
import {
  getAuth,
  browserSessionPersistence,
  setPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Config with fallback values to prevent build errors during SSR/SSG
const firebaseConfig = {
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
};

// Initialize Firebase with error handling for SSR/SSG
let app;
let auth;
let db;
let storage;

// Only initialize Firebase on the client side
if (typeof window !== "undefined") {
  try {
    // Initialize Firebase app
    app = initializeApp(firebaseConfig);

    // Initialize Firebase Authentication
    auth = getAuth(app);

    // Set persistence to session (instead of local storage)
    setPersistence(auth, browserSessionPersistence).catch((error) => {
      console.error("Firebase auth persistence error:", error);
    });

    // Initialize Cloud Firestore
    db = getFirestore(app);

    // Initialize Firebase Storage
    storage = getStorage(app);
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
}

// Export the Firebase services
export { auth, db, storage, app };

// Export app as default
export default app;
