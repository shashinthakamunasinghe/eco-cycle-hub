import { NextResponse } from "next/server"
import { signInWithEmailAndPassword, signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { collectorService } from "@/lib/firebase-services"

export async function GET() {
  try {
    console.log("🔍 Getting all collector emails and testing passwords...")
    
    // Get all collector profiles
    const collectors = await collectorService.getAllCollectorProfiles()
    console.log(`📄 Found ${collectors.length} collectors`)
    
    // Common passwords to test
    const commonPasswords = [
      "123456",
      "password",
      "123123",
      "hasith123",
      "sanda123",
      "nadun123",
      "jaya123",
      "collector123",
      "admin123"
    ]
    
    const results = []
    
    for (const collector of collectors) {
      console.log(`🧪 Testing collector: ${collector.name} (${collector.email})`)
      
      let workingPassword = null
      
      for (const password of commonPasswords) {
        try {
          console.log(`  Testing password: ${password}`)
          const authResult = await signInWithEmailAndPassword(auth, collector.email, password)
          
          if (authResult.user) {
            workingPassword = password
            console.log(`  ✅ SUCCESS: ${collector.email} / ${password}`)
            
            // Sign out immediately
            await signOut(auth)
            break
          }
        } catch (error) {
          // Password didn't work, continue to next
          console.log(`  ❌ Failed: ${password}`)
        }
      }
      
      results.push({
        name: collector.name,
        email: collector.email,
        id: collector.id,
        status: collector.status,
        workingPassword: workingPassword,
        loginWorking: !!workingPassword
      })
    }
    
    // Summary
    const workingLogins = results.filter(r => r.loginWorking)
    const failedLogins = results.filter(r => !r.loginWorking)
    
    console.log(`✅ Working logins: ${workingLogins.length}`)
    console.log(`❌ Failed logins: ${failedLogins.length}`)
    
    return NextResponse.json({
      success: true,
      summary: {
        totalCollectors: collectors.length,
        workingLogins: workingLogins.length,
        failedLogins: failedLogins.length
      },
      collectors: results,
      workingCredentials: workingLogins.map(c => ({
        name: c.name,
        email: c.email,
        password: c.workingPassword
      })),
      failedCredentials: failedLogins.map(c => ({
        name: c.name,
        email: c.email,
        needsPasswordReset: true
      }))
    })
    
  } catch (error) {
    console.error("❌ Error getting collector credentials:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
