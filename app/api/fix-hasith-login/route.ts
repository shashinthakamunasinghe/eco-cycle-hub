import { NextResponse } from "next/server"
import { sendPasswordResetEmail } from "firebase/auth"
import { collection, getDocs } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

export async function POST(request: Request) {
  try {
    const { action, email } = await request.json()
    
    if (action === "reset-password") {
      console.log(`📧 Sending password reset to: ${email}`)
      await sendPasswordResetEmail(auth, email)
      return NextResponse.json({
        success: true,
        message: `Password reset sent to ${email}`,
        instructions: [
          "1. Check your email for the reset link",
          "2. Set password to: hasith123",
          "3. Try logging in with: hasith@gmail.com / hasith123"
        ]
      })
    }
    
    if (action === "check-users") {
      console.log("📊 Checking all user documents...")
      const usersSnapshot = await getDocs(collection(db, "users"))
      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      const hasithUser = users.find((u: any) => u.email === "hasith@gmail.com")
      
      return NextResponse.json({
        success: true,
        totalUsers: users.length,
        hasithUser: hasithUser || null,
        allEmails: users.map((u: any) => ({ id: u.id, email: u.email, role: u.role }))
      })
    }
    
    return NextResponse.json({
      success: false,
      message: "Invalid action. Use 'reset-password' or 'check-users'"
    })
    
  } catch (error: any) {
    console.error("❌ Error:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        code: error.code
      },
      { status: 500 }
    )
  }
}
