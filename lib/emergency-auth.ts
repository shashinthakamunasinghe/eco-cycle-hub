// This module provides a direct emergency authentication solution
// when normal Firebase auth methods are failing with invalid-credential errors

import { auth, db } from "./firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  getAuth,
  setPersistence,
  inMemoryPersistence,
  browserSessionPersistence
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import type { User } from "@/types";

// Clear ALL authentication related data and force a clean state
export const forceAuthReset = async () => {
  console.log("🚨 Performing EMERGENCY authentication reset...");
  
  try {
    // 1. Sign out any current user
    await signOut(auth);
    
    // 2. Clear ALL browser storage that might contain auth data
    localStorage.clear();
    sessionStorage.clear();
    
    // 3. Apply most restrictive persistence to prevent storage issues
    await setPersistence(auth, inMemoryPersistence);
    
    // 4. Delete any indexedDB databases related to Firebase
    if (window.indexedDB) {
      try {
        const dbs = await window.indexedDB.databases();
        for (const db of dbs) {
          if (db.name?.includes('firebase')) {
            window.indexedDB.deleteDatabase(db.name);
            console.log(`Deleted indexedDB: ${db.name}`);
          }
        }
      } catch (error) {
        console.error("Error cleaning indexedDB:", error);
      }
    }
    
    // 5. Clear any service workers
    if (navigator.serviceWorker) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          registration.unregister();
          console.log("Unregistered service worker");
        }
      } catch (error) {
        console.error("Error clearing service workers:", error);
      }
    }
    
    console.log("✅ Emergency auth reset complete");
    return true;
  } catch (error) {
    console.error("❌ Emergency auth reset failed:", error);
    return false;
  }
};

// Emergency authentication function that bypasses normal auth flow
export const emergencyLogin = async (email: string, password: string): Promise<User | null> => {
  console.log("🚑 Attempting emergency authentication...");
  
  try {
    // 1. Reset everything first
    await forceAuthReset();
    
    // 2. Create a new auth instance to avoid any cached state
    const freshAuth = getAuth();
    await setPersistence(freshAuth, inMemoryPersistence);
    
    // 3. Attempt login with the fresh instance
    console.log("Attempting sign in with fresh auth instance...");
    const userCredential = await signInWithEmailAndPassword(freshAuth, email, password);
    console.log("✅ Firebase Auth successful with fresh instance");
    
    // 4. Retrieve user data directly from Firestore
    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
    
    if (!userDoc.exists()) {
      console.error("❌ User document not found in Firestore");
      return null;
    }
    
    const userData = userDoc.data() as User;
    console.log("✅ Emergency authentication successful");
    
    // 5. Return the user data
    return {
      ...userData,
      id: userCredential.user.uid,
    };
  } catch (error) {
    console.error("❌ Emergency authentication failed:", error);
    throw error;
  }
};

// Get user role directly from Firebase without relying on authentication state
export const getUserRoleByEmail = async (email: string): Promise<string | null> => {
  try {
    // This is a workaround that directly checks Firestore for the user role
    // without relying on authentication
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const usersQuery = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(usersQuery);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const userData = querySnapshot.docs[0].data();
    return userData.role || null;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
};
