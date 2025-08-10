import { NextResponse } from "next/server";
import { pickupService } from "@/lib/firebase-services";

export async function GET() {
  try {
    console.log("🔍 Debug: Checking pickups for collector SU7w4UU8nnlgjZZB9fVg (Hasith)");
    
    const collectorId = "SU7w4UU8nnlgjZZB9fVg"; // Hasith's ID from the assignment
    
    // Get all pickup requests for this collector
    const pickups = await pickupService.getPickupRequestsByCollector(collectorId);
    console.log("📦 All pickups for collector:", pickups);
    
    // Filter active pickups
    const activePickups = pickups.filter(
      (p) => p.status !== "completed" && p.status !== "cancelled"
    );
    console.log("📦 Active pickups for collector:", activePickups);
    
    // Get all pickup requests to check the assignment
    const allPickups = await pickupService.getAllPickupRequests();
    const assignedToCollector = allPickups.filter(p => p.collectorId === collectorId);
    console.log("📦 All pickups assigned to this collector:", assignedToCollector);
    
    return NextResponse.json({
      success: true,
      collectorId,
      totalPickups: pickups.length,
      activePickups: activePickups.length,
      pickups: activePickups,
      allAssignedPickups: assignedToCollector
    });
    
  } catch (error) {
    console.error("❌ Error debugging pickups:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to debug pickups",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
