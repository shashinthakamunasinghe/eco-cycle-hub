import { NextResponse } from "next/server";
import { pickupService, collectorService } from "@/lib/firebase-services";

export async function POST() {
  try {
    console.log("🔄 Assigning test pickup to collector...");
    
    // Get all collectors to find one to assign to
    const collectors = await collectorService.getAllCollectorProfiles();
    console.log("👥 Available collectors:", collectors.map(c => ({ id: c.id, name: c.name, email: c.email })));
    
    if (collectors.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No collectors found in database"
      }, { status: 400 });
    }
    
    // Get all pending pickup requests
    const pickups = await pickupService.getAllPickupRequests();
    const pendingPickups = pickups.filter(p => p.status === "pending");
    console.log("📦 Pending pickups:", pendingPickups.map(p => ({ id: p.id, industryName: p.industryName, status: p.status })));
    
    if (pendingPickups.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No pending pickup requests found"
      }, { status: 400 });
    }
    
    // Assign the first pending pickup to the first collector
    const pickup = pendingPickups[0];
    const collector = collectors[0];
    
    console.log(`🔗 Assigning pickup ${pickup.id} (${pickup.industryName}) to collector ${collector.id} (${collector.name})`);
    
    await pickupService.assignCollector(pickup.id, collector.id, collector.name);
    
    console.log("✅ Pickup assigned successfully!");
    
    return NextResponse.json({
      success: true,
      message: "Pickup assigned successfully",
      assignment: {
        pickupId: pickup.id,
        pickupName: pickup.industryName,
        collectorId: collector.id,
        collectorName: collector.name
      }
    });
    
  } catch (error) {
    console.error("❌ Error assigning pickup:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to assign pickup",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
