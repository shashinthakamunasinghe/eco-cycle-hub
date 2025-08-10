import { NextResponse } from "next/server"
import { collection, getDocs, doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { collectorService } from "@/lib/firebase-services"

export async function POST() {
  try {
    console.log("🔧 Creating missing user account for collector...")
    
    // Get all collector profiles
    const collectors = await collectorService.getAllCollectorProfiles()
    console.log(`📄 Found ${collectors.length} collector profiles`)
    
    // Get all existing users
    const usersSnapshot = await getDocs(collection(db, "users"))
    const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    console.log(`📄 Found ${users.length} existing users`)
    
    const results = []
    
    // For each collector, check if there's a corresponding user account
    for (const collector of collectors) {
      const existingUser = users.find((u: any) => u.email === collector.email)
      
      if (!existingUser) {
        console.log(`🔧 Creating user account for collector: ${collector.name} (${collector.email})`)
        
        // Create a new user account linked to the collector profile
        const newUser = {
          id: collector.id, // Use the same ID as the collector profile
          email: collector.email,
          name: collector.name,
          role: "collector",
          phone: collector.phone || "",
          address: collector.address || "",
          isAvailable: collector.isAvailable || true,
          truckCapacity: collector.vehicleCapacity || 0,
          currentLoad: collector.currentLoad || 0,
          assignedRequests: collector.assignedRequests || [],
          currentLocation: collector.currentLocation || { lat: 6.9271, lng: 79.8612 },
          createdAt: collector.createdAt || new Date(),
          updatedAt: new Date(),
        }
        
        // Save to users collection
        await setDoc(doc(db, "users", collector.id), newUser)
        
        results.push({
          action: "created",
          collector: {
            id: collector.id,
            name: collector.name,
            email: collector.email
          }
        })
        
        console.log(`✅ Created user account for ${collector.name}`)
      } else {
        results.push({
          action: "exists",
          collector: {
            id: collector.id,
            name: collector.name,
            email: collector.email
          }
        })
        console.log(`✅ User account already exists for ${collector.name}`)
      }
    }
    
    return NextResponse.json({
      success: true,
      message: "User account creation completed",
      results
    })
    
  } catch (error) {
    console.error("❌ Error creating user accounts:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
