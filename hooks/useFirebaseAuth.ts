"use client";

import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
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
        const userData = userDoc.data();
        console.log("✅ Raw user data from Firestore:", userData);
        
        // Ensure userData has the correct structure
        const user: User = {
          id: userData.id || result.user.uid,
          email: userData.email || email,
          name: userData.name,
          role: userData.role,
          avatar: userData.avatar,
          phone: userData.phone,
          address: userData.address,
          location: userData.location,
          createdAt: userData.createdAt?.toDate?.() || userData.createdAt || new Date(),
        };
        
        console.log("✅ Processed user data:", user);
        console.log("🏠 User role for routing:", user.role);
        
        setUser(user);
        return user;
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

  return { user, loading, login, register, logout };
}
