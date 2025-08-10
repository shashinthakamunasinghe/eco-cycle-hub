import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/firebase"
import { userService, collectorService } from "@/lib/firebase-services"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Debug: Checking current authentication state...")
    
    // Get current user from Firebase Auth
    const currentUser = auth.currentUser
    console.log("🔍 Firebase Auth current user:", currentUser?.uid, currentUser?.email)
    
    if (!currentUser) {
      return NextResponse.json({
        success: false,
        message: "No user currently logged in",
        authState: null
      })
    }

    // Get user from Firestore
    const userData = await userService.getUser(currentUser.uid)
    console.log("🔍 User data from Firestore:", userData)

    // Get collector profile
    const collectorProfile = await collectorService.getCollectorProfile(currentUser.uid)
    console.log("🔍 Collector profile:", collectorProfile)

    return NextResponse.json({
      success: true,
      authState: {
        uid: currentUser.uid,
        email: currentUser.email,
        emailVerified: currentUser.emailVerified
      },
      userData,
      collectorProfile,
      message: "Authentication state retrieved successfully"
    })

  } catch (error) {
    console.error("❌ Debug auth error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Failed to check authentication state"
    }, { status: 500 })
  }
}
