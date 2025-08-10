import { NextResponse } from "next/server"
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { collectorService } from "@/lib/firebase-services"

export async function GET() {
  try {
    console.log("🔍 Comprehensive Firebase connectivity check...")
    
    // 1. Check collectorProfiles collection
    console.log("📊 Checking collectorProfiles collection...")
    const collectorProfiles = await collectorService.getAllCollectorProfiles()
    console.log(`✅ Found ${collectorProfiles.length} collector profiles`)
    
    // 2. Check users collection
    console.log("📊 Checking users collection...")
    const usersSnapshot = await getDocs(collection(db, "users"))
    const users = usersSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }))
    console.log(`✅ Found ${users.length} users`)
    
    // 3. Check specific Hasith data
    const hasithProfile = collectorProfiles.find(c => c.email === "hasith@gmail.com")
    const hasithUser = users.find((u: any) => u.email === "hasith@gmail.com")
    
    console.log("🔍 Hasith profile found:", !!hasithProfile)
    console.log("🔍 Hasith user found:", !!hasithUser)
    
    if (hasithProfile) {
      console.log("📄 Hasith profile ID:", hasithProfile.id)
      console.log("📄 Hasith profile data:", {
        id: hasithProfile.id,
        name: hasithProfile.name,
        email: hasithProfile.email,
        status: hasithProfile.status,
        isAvailable: hasithProfile.isAvailable
      })
    }
    
    if (hasithUser) {
      console.log("📄 Hasith user ID:", hasithUser.id)
      console.log("📄 Hasith user data:", {
        id: hasithUser.id,
        email: hasithUser.email,
        name: hasithUser.name,
        role: hasithUser.role
      })
    }
    
    // 4. Check ID matching
    const idMatch = hasithProfile && hasithUser && hasithProfile.id === hasithUser.id
    console.log("🔗 ID matching:", idMatch)
    
    // 5. Check all collectors vs users mapping
    const mappingResults = []
    for (const profile of collectorProfiles) {
      const matchingUser = users.find((u: any) => u.email === profile.email)
      mappingResults.push({
        email: profile.email,
        profileId: profile.id,
        userId: matchingUser?.id || "NOT_FOUND",
        userRole: matchingUser?.role || "NOT_FOUND",
        idMatch: matchingUser?.id === profile.id
      })
    }
    
    // 6. Test Firebase services directly
    console.log("🧪 Testing Firebase services...")
    const testProfile = await collectorService.getCollectorProfile("SU7w4UU8nnlgjZZB9fVg")
    console.log("✅ Direct profile lookup:", !!testProfile)
    
    // 7. Check specific document by ID
    const directDoc = await getDoc(doc(db, "users", "SU7w4UU8nnlgjZZB9fVg"))
    console.log("📄 Direct user document exists:", directDoc.exists())
    if (directDoc.exists()) {
      console.log("📄 Direct user data:", directDoc.data())
    }
    
    return NextResponse.json({
      success: true,
      summary: {
        totalCollectorProfiles: collectorProfiles.length,
        totalUsers: users.length,
        hasithProfileFound: !!hasithProfile,
        hasithUserFound: !!hasithUser,
        hasithIdMatch: idMatch
      },
      hasithData: {
        profile: hasithProfile || null,
        user: hasithUser || null,
        directUserDoc: directDoc.exists() ? directDoc.data() : null
      },
      allMappings: mappingResults,
      issues: mappingResults.filter(m => !m.idMatch || m.userId === "NOT_FOUND")
    })
    
  } catch (error) {
    console.error("❌ Error in connectivity check:", error)
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
