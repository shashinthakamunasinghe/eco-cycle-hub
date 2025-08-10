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
      console.log("🔄 Starting login process...", { email });

      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ Firebase Auth login successful:", result.user.uid);

      const userDoc = await getDoc(doc(db, "users", result.user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        console.log("✅ User data retrieved from Firestore:", userData);
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
      throw new Error("Invalid credentials");
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
      console.error("❌ Registration error:", error);
      
      // Preserve the original Firebase error message for better debugging
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("Registration failed - Unknown error");
      }
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
