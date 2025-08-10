import { NextResponse } from "next/server";
import { collectorService, pickupService } from "@/lib/firebase-services";

export async function POST() {
  try {
    console.log("🎯 Testing assignment to Jayasuriya specifically");
    
    // Get Jayasuriya's collector ID
    const collectors = await collectorService.getAllCollectorProfiles();
    const jayasuriya = collectors.find(c => c.name === "Jayasuriya");
    
    if (!jayasuriya) {
      return NextResponse.json({
        success: false,
        error: "Jayasuriya collector not found"
      }, { status: 404 });
    }
    
    console.log("👤 Found Jayasuriya:", { id: jayasuriya.id, name: jayasuriya.name, email: jayasuriya.email });
    
    // Get a pending pickup to assign
    const allPickups = await pickupService.getAllPickupRequests();
    const pendingPickups = allPickups.filter(p => p.status === "pending");
    
    if (pendingPickups.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No pending pickups available"
      }, { status: 404 });
    }
    
    const targetPickup = pendingPickups[0];
    console.log("📦 Target pickup:", { id: targetPickup.id, industryName: targetPickup.industryName });
    
    // Assign the pickup to Jayasuriya
    console.log(`🔗 Assigning pickup ${targetPickup.id} to Jayasuriya (${jayasuriya.id})`);
    
    await pickupService.assignCollector(targetPickup.id, jayasuriya.id, jayasuriya.name);
    
    console.log("✅ Assignment successful!");
    
    return NextResponse.json({
      success: true,
      message: "Successfully assigned pickup to Jayasuriya",
      assignment: {
        pickupId: targetPickup.id,
        pickupName: targetPickup.industryName,
        collectorId: jayasuriya.id,
        collectorName: jayasuriya.name
      }
    });
    
  } catch (error) {
    console.error("❌ Error assigning to Jayasuriya:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to assign pickup to Jayasuriya",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
