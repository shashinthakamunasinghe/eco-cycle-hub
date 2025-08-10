"use client";

import { auth, db } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  deleteUser,
  getAuth,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

// Firebase auth diagnostics tool
export const authDiagnostics = {
  // Check Firebase configuration and connection
  async checkConfig() {
    try {
      console.log("🔍 Checking Firebase configuration...");
      console.log("- Auth initialized:", !!auth);
      console.log("- Firestore initialized:", !!db);
      
      const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      console.log("- API Key configured:", !!apiKey && apiKey.length > 0 ? "✅" : "❌");
      
      const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
      console.log("- Auth Domain configured:", !!authDomain && authDomain.length > 0 ? "✅" : "❌");
      
      return true;
    } catch (error) {
      console.error("❌ Firebase configuration check failed:", error);
      return false;
    }
  },
  
  // Check if user is currently authenticated
  async checkAuthState() {
    try {
      console.log("🔍 Checking authentication state...");
      const user = auth.currentUser;
      
      if (user) {
        console.log("✅ User is authenticated:");
        console.log("- User ID:", user.uid);
        console.log("- Email:", user.email);
        console.log("- Email verified:", user.emailVerified);
        return user;
      } else {
        console.log("❌ No authenticated user found");
        return null;
      }
    } catch (error) {
      console.error("❌ Auth state check failed:", error);
      return null;
    }
  },
  
  // Test login with provided credentials
  async testLogin(email: string, password: string) {
    try {
      console.log("🔍 Testing login with provided credentials...");
      
      // Sign out first to ensure clean state
      await signOut(auth);
      
      // Try to sign in
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ Authentication successful:");
      console.log("- User ID:", result.user.uid);
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, "users", result.user.uid));
      
      if (userDoc.exists()) {
        console.log("✅ User data found in Firestore");
        return { success: true, userData: userDoc.data(), authUser: result.user };
      } else {
        console.log("❌ No user data found in Firestore");
        return { success: true, userData: null, authUser: result.user };
      }
    } catch (error: any) {
      console.error("❌ Login test failed:", error);
      
      // Provide helpful information based on error code
      let suggestion = "";
      if (error.code === "auth/invalid-credential") {
        suggestion = "The email or password is incorrect";
      } else if (error.code === "auth/user-disabled") {
        suggestion = "This account has been disabled";
      } else if (error.code === "auth/too-many-requests") {
        suggestion = "Too many login attempts. Try resetting your password";
      }
      
      return { 
        success: false, 
        error: error, 
        code: error.code,
        message: error.message,
        suggestion
      };
    }
  },
  
  // Fix common authentication issues
  async fixAuthIssues() {
    try {
      console.log("🔧 Attempting to fix common auth issues...");
      
      // Clear any persistent auth state
      await signOut(auth);
      console.log("✅ Signed out any existing user");
      
      // Set persistence to session (more reliable than local)
      await setPersistence(auth, browserSessionPersistence);
      console.log("✅ Set auth persistence to session");
      
      return true;
    } catch (error) {
      console.error("❌ Fix attempt failed:", error);
      return false;
    }
  },
  
  // Reset password
  async sendPasswordReset(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log("✅ Password reset email sent to:", email);
      return true;
    } catch (error: any) {
      console.error("❌ Password reset failed:", error);
      return {
        success: false,
        code: error.code,
        message: error.message
      };
    }
  }
};

// Usage instructions:
// Open developer console and run:
// import { authDiagnostics } from '@/lib/firebase-auth-diagnostics'
// await authDiagnostics.checkConfig()
// await authDiagnostics.checkAuthState()
// await authDiagnostics.fixAuthIssues()
// await authDiagnostics.testLogin('user@example.com', 'password')
