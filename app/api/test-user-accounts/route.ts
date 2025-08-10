import { NextResponse } from "next/server"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET() {
  try {
    console.log("🔍 Checking user accounts...")
    
    // Check all users in the users collection
    const usersSnapshot = await getDocs(collection(db, "users"))
    const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    
    console.log(`📄 Found ${users.length} users in users collection`)
    
    // Look for Hasith's user account
    const hasithUser = users.find((u: any) => u.email === "hasith@gmail.com")
    console.log("🔍 Hasith's user account:", hasithUser ? "Found" : "Not found")
    
    if (hasithUser) {
      console.log("📄 Hasith's user details:", {
        id: hasithUser.id,
        email: hasithUser.email,
        role: hasithUser.role,
        name: hasithUser.name
      })
    }
    
    return NextResponse.json({
      success: true,
      totalUsers: users.length,
      hasithUserFound: !!hasithUser,
      hasithUser: hasithUser || null,
      allUsers: users.map((u: any) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        name: u.name
      }))
    })
    
  } catch (error) {
    console.error("❌ Error checking user accounts:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
