// Debug utility to help troubleshoot Firebase Authentication issues
// Add this to your login page temporarily to debug
import { Auth } from "firebase/auth";
import { Firestore } from "firebase/firestore";

// Helper functions to ensure we have valid Firebase instances
function getAuth(auth: Auth | null): Auth {
  if (!auth) {
    throw new Error(
      "Firebase Auth is not initialized. Check your Firebase configuration."
    );
  }
  return auth;
}

function getDb(db: Firestore | null): Firestore {
  if (!db) {
    throw new Error(
      "Firestore is not initialized. Check your Firebase configuration."
    );
  }
  return db;
}

export const debugFirebaseAuth = {
  async checkFirebaseConnection() {
    try {
      console.log("Firebase Debug - Checking connection...");
      console.log("Firebase config:", {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "Set" : "Missing",
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
          ? "Set"
          : "Missing",
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
          ? "Set"
          : "Missing",
      });
    } catch (error) {
      console.error("Firebase connection error:", error);
      if (error && typeof error === "object") {
        const firebaseError = error as { code?: string; message?: string };
        console.error(
          "Error details:",
          firebaseError.message || "Unknown error"
        );
      }
    }
  },

  async checkUserInFirestore(uid: string) {
    try {
      console.log(`Checking Firestore for user: ${uid}`);
      const { doc, getDoc } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase");

      // Use the getDb helper function with the imported db
      const firestore = getDb(db);
      const userDoc = await getDoc(doc(firestore, "users", uid));

      if (userDoc.exists()) {
        console.log("User found in Firestore:", userDoc.data());
        return userDoc.data();
      } else {
        console.log("User not found in Firestore");
        return null;
      }
    } catch (error) {
      console.error("Firestore check error:", error);
      if (error && typeof error === "object") {
        const firestoreError = error as { code?: string; message?: string };
        console.error(
          "Error details:",
          firestoreError.message || "Unknown error"
        );
      }
      return null;
    }
  },

  async listAllUsers() {
    try {
      console.log("Listing all users in Firestore...");
      const { collection, getDocs } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase");

      // Use the getDb helper function with the imported db
      const firestore = getDb(db);
      const querySnapshot = await getDocs(collection(firestore, "users"));
      const users = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("All users:", users);
      return users;
    } catch (error) {
      console.error("Error listing users:", error);
      if (error && typeof error === "object") {
        const firestoreError = error as { code?: string; message?: string };
        console.error(
          "Error details:",
          firestoreError.message || "Unknown error"
        );
      }
      return [];
    }
  },

  async debugLogin(email: string, password: string) {
    try {
      console.log("Debug Login Process Starting...");
      console.log("Email:", email);

      // Check Firebase Auth
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      const { auth } = await import("@/lib/firebase");

      // Use the getAuth helper function with the imported auth
      const authInstance = getAuth(auth);
      const result = await signInWithEmailAndPassword(
        authInstance,
        email,
        password
      );
      console.log("Firebase Auth successful:", result.user.uid);

      // Check Firestore
      const userData = await this.checkUserInFirestore(result.user.uid);

      if (userData) {
        console.log("Complete login successful");
        return userData;
      } else {
        console.log("Auth successful but user data missing in Firestore");
        return null;
      }
    } catch (error) {
      console.error("Debug login error:", error);
      // Handle Firebase AuthError which typically has code and message properties
      if (error && typeof error === "object") {
        const firebaseError = error as { code?: string; message?: string };
        console.error("Error code:", firebaseError.code || "No error code");
        console.error(
          "Error message:",
          firebaseError.message || "No error message"
        );
      }
      throw error;
    }
  },
};

// Usage in console:
// debugFirebaseAuth.checkFirebaseConnection()
// debugFirebaseAuth.listAllUsers()
// debugFirebaseAuth.debugLogin("test@example.com", "password123")
