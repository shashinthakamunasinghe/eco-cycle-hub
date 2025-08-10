import { NextResponse } from "next/server"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "@/lib/firebase"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    console.log(`📧 Sending password reset email to: ${email}`)
    
    // Send password reset email
    await sendPasswordResetEmail(auth, email)
    
    console.log("✅ Password reset email sent successfully")
    
    return NextResponse.json({
      success: true,
      message: `Password reset email sent to ${email}. Check your inbox and spam folder.`,
      instructions: [
        "1. Check your email inbox for a password reset link",
        "2. Click the link in the email to reset your password", 
        "3. Set a new password you'll remember",
        "4. Return to the login page and use your new password"
      ]
    })
    
  } catch (error: any) {
    console.error("❌ Error sending password reset:", error)
    
    let errorMessage = "Failed to send password reset email"
    if (error.code === "auth/user-not-found") {
      errorMessage = "No account found with this email address"
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Invalid email address format"
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        code: error.code
      },
      { status: 500 }
    )
  }
}
