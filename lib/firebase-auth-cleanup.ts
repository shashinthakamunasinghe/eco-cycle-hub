import { auth } from './firebase';
import { deleteApp } from 'firebase/app';
import { signOut, browserLocalPersistence, browserSessionPersistence, setPersistence } from 'firebase/auth';

/**
 * Utility to clean up Firebase authentication state.
 * This helps resolve persistent auth errors like invalid-credential
 */
export const cleanupFirebaseAuth = async () => {
  try {
    console.log("🧹 Cleaning up Firebase authentication state...");
    
    // Check if there's an existing user
    if (auth.currentUser) {
      console.log("Found existing user, signing out...");
      await signOut(auth);
    }
    
    // Clear any locally stored credentials
    localStorage.removeItem('firebase:authUser');
    localStorage.removeItem('firebase:previousUser');
    
    // Set auth persistence to session (more reliable than local)
    await setPersistence(auth, browserSessionPersistence);
    
    console.log("✅ Firebase auth state cleanup complete");
    return true;
  } catch (error) {
    console.error("❌ Firebase auth cleanup error:", error);
    return false;
  }
};

/**
 * Hard reset of Firebase auth - use only as a last resort
 */
export const hardResetAuth = async () => {
  try {
    console.log("🧨 Performing hard reset of Firebase authentication...");
    
    // Force sign out
    await signOut(auth);
    
    // Clear browser storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Remove indexedDB databases related to Firebase
    const dbs = await window.indexedDB.databases();
    for (const db of dbs) {
      if (db.name?.includes('firebase')) {
        window.indexedDB.deleteDatabase(db.name);
        console.log(`Deleted indexedDB: ${db.name}`);
      }
    }
    
    console.log("✅ Hard reset completed. Please refresh the page.");
    return true;
  } catch (error) {
    console.error("❌ Hard reset failed:", error);
    return false;
  }
};
