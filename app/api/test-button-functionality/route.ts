import { NextRequest, NextResponse } from "next/server"
import { pickupService } from "@/lib/firebase-services"

export async function POST(request: NextRequest) {
  try {
    const { action, pickupId } = await request.json()
    
    console.log(`🧪 Testing ${action} action for pickup ${pickupId}`)
    
    if (action === "accept") {
      // Accept action: move from "assigned" to "on-way"
      await pickupService.updateStatus(pickupId, "on-way")
      console.log("✅ Accept action completed - status updated to on-way")
      
      return NextResponse.json({
        success: true,
        message: `Pickup ${pickupId} accepted and marked as on-way`,
        newStatus: "on-way"
      })
      
    } else if (action === "reject") {
      // Reject action: move back to "pending" and remove collector assignment
      await pickupService.updatePickupRequest(pickupId, {
        status: "pending",
        collectorId: "",
        collectorName: "",
      })
      console.log("✅ Reject action completed - pickup returned to pending pool")
      
      return NextResponse.json({
        success: true,
        message: `Pickup ${pickupId} rejected and returned to pending pool`,
        newStatus: "pending"
      })
      
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid action. Use 'accept' or 'reject'" },
        { status: 400 }
      )
    }
    
  } catch (error) {
    console.error("❌ Error testing button functionality:", error)
    return NextResponse.json(
      { success: false, message: "Failed to test button functionality", error },
      { status: 500 }
    )
  }
}
