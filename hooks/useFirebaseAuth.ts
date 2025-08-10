"use client";

import { useState, useEffect, useCallback } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  browserSessionPersistence,
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setUser(userData);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log("🔄 Starting login process...");
      
      // Clean up any existing authentication state first
      await cleanupFirebaseAuth();
      
      // Set persistence to session for this login
      await setPersistence(auth, browserSessionPersistence);
      
      console.log("🔐 Attempting authentication...");
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ Firebase Auth login successful:", result.user.uid);

      const userDoc = await getDoc(doc(db, "users", result.user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        console.log("✅ User data retrieved from Firestore");
        setUser(userData);
        return userData;
      } else {
        console.error(
          "❌ User document not found in Firestore for UID:",
          result.user.uid
        );
        throw new Error("User data not found");
      }
    } catch (error: unknown) {
      console.error("❌ Login error:", error);
      
      // Handle Firebase specific errors
      if (error instanceof Error) {
        const errorMessage = error.message || "";
        const errorCode = (error as any).code;
        
        if (errorCode === "auth/too-many-requests") {
          throw new Error("Too many login attempts. Please try again later or reset your password.");
        } else if (errorCode === "auth/user-not-found") {
          throw new Error("No account found with this email address");
        } else if (errorCode === "auth/wrong-password") {
          throw new Error("Incorrect password");
        } else if (errorCode === "auth/invalid-email") {
          throw new Error("Invalid email format");
        } else if (errorCode === "auth/invalid-credential") {
          throw new Error("Invalid login credentials. Please check your email and password.");
        } else if (errorCode === "auth/user-disabled") {
          throw new Error("This account has been disabled. Please contact support.");
        } else if (errorCode === "auth/network-request-failed") {
          throw new Error("Network error. Please check your connection.");
        } else {
          throw new Error(errorMessage || "Invalid credentials");
        }
      }
      
      throw new Error("Authentication failed. Please try again later.");
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
