import { NextRequest, NextResponse } from "next/server"
import { signInWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import type { User } from "@/types"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    console.log("🔄 API Login attempt for:", email)
    
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: "Email and password are required"
      }, { status: 400 })
    }

    // Authenticate with Firebase
    const result = await signInWithEmailAndPassword(auth, email, password)
    console.log("✅ Firebase Auth successful:", result.user.uid)

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, "users", result.user.uid))
    
    if (!userDoc.exists()) {
      return NextResponse.json({
        success: false,
        message: "User data not found in database"
      }, { status: 404 })
    }

    const userData = userDoc.data() as User
    console.log("✅ User data retrieved:", userData.email, userData.role)

    return NextResponse.json({
      success: true,
      user: userData,
      message: "Login successful"
    })

  } catch (error) {
    console.error("❌ API Login error:", error)
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "Login failed"
    }, { status: 401 })
  }
}
