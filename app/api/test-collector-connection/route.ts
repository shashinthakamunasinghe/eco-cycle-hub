import { NextRequest, NextResponse } from "next/server"
import { collectorService } from "@/lib/firebase-services"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Testing collector profile connection...")
    
    // Test getting all collector profiles
    const collectors = await collectorService.getAllCollectorProfiles()
    console.log("✅ Successfully fetched collector profiles:", collectors.length)
    
    // Look for Hasith's profile
    const hasithProfile = collectors.find(c => c.email === "hasith@gmail.com")
    console.log("🔍 Hasith's profile:", hasithProfile ? "Found" : "Not found")
    
    if (hasithProfile) {
      console.log("📄 Hasith's profile details:", {
        id: hasithProfile.id,
        name: hasithProfile.name,
        email: hasithProfile.email,
        status: hasithProfile.status
      })
    }
    
    return NextResponse.json({
      success: true,
      totalCollectors: collectors.length,
      hasithFound: !!hasithProfile,
      hasithProfile: hasithProfile || null,
      allCollectors: collectors.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        status: c.status
      }))
    })
    
  } catch (error) {
    console.error("❌ Error testing collector connection:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
