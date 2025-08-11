"use client";

import { useState, useEffect, useCallback } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  browserLocalPersistence,
  setPersistence,
} from "firebase/auth";
import { cleanupFirebaseAuth } from "@/lib/firebase-auth-cleanup";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { User } from "@/types";

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  // Set persistence to local to maintain login across browser sessions
  setPersistence(auth, browserLocalPersistence).catch(console.error);
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("🔄 Auth state changed:", firebaseUser?.uid, firebaseUser?.email);
      
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            console.log("✅ User data loaded:", userData.email, userData.role);
            setUser(userData);
          } else {
            console.warn("⚠️ User document not found for:", firebaseUser.uid);
            setUser(null);
          }
        } catch (error) {
          console.error("❌ Error loading user data:", error);
          setUser(null);
        }
      } else {
        console.log("🚪 User logged out or not authenticated");
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log("🔄 Starting login process...", { 
        email, 
        password: password ? "***provided***" : "***missing***",
        authInstance: !!auth,
        dbInstance: !!db 
      });

      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      console.log("📡 Attempting Firebase authentication...");
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ Firebase Auth login successful:", { 
        uid: result.user.uid,
        email: result.user.email,
        emailVerified: result.user.emailVerified 
      });

      console.log("📄 Fetching user document from Firestore...");
      const userDoc = await getDoc(doc(db, "users", result.user.uid));
      console.log("📄 User document exists:", userDoc.exists());

      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        console.log("✅ User data retrieved from Firestore");
        setUser(userData);
        return userData;
      } else {
        console.error("❌ User document not found in Firestore for UID:", result.user.uid);
        console.log("🔍 Available collections and documents might be different");
        throw new Error("User data not found in database. Please contact support.");
      }
    } catch (error: unknown) {
      console.error("❌ Login error details:", {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorCode: (error as { code?: string })?.code,
        errorName: (error as { name?: string })?.name
      });
      
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Authentication failed. Please try again.");
    }
  };

  const register = async (
    email: string,
    password: string,
    userData: Omit<User, "id">
  ) => {
    try {
      console.log("🔄 Starting registration process...", { email, userData });

      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      console.log("✅ Firebase Auth user created:", result.user.uid);

      const newUser: User = {
        ...userData,
        id: result.user.uid,
        email: email,
      };

      console.log("📝 Saving user data to Firestore:", newUser);

      // Save user data to Firestore
      await setDoc(doc(db, "users", result.user.uid), newUser);

      console.log("✅ User data saved to Firestore successfully");

      setUser(newUser);
      return newUser;
    } catch (error: unknown) {
      console.error("Registration error:", error);
      
      // Handle Firebase specific errors for registration
      if (error instanceof Error) {
        const errorCode = (error as any).code;
        
        if (errorCode === "auth/email-already-in-use") {
          throw new Error("An account already exists with this email address");
        } else if (errorCode === "auth/invalid-email") {
          throw new Error("Invalid email format");
        } else if (errorCode === "auth/weak-password") {
          throw new Error("Password is too weak. Please use a stronger password");
        } else if (errorCode === "auth/network-request-failed") {
          throw new Error("Network error. Please check your connection");
        } else {
          throw new Error("Registration failed: " + (error.message || "Unknown error"));
        }
      }
      
      throw new Error("Registration failed");
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error: unknown) {
      console.error("Logout error:", error);
      throw new Error("Logout failed");
    }
  };
  
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error: unknown) {
      console.error("Password reset error:", error);
      const errorCode = (error as any)?.code;
      if (errorCode === "auth/user-not-found") {
        throw new Error("No account found with this email address");
      } else if (errorCode === "auth/invalid-email") {
        throw new Error("Invalid email format");
      } else {
        throw new Error("Failed to send password reset email");
      }
    }
  };

  return { user, loading, login, register, logout, resetPassword };
}
