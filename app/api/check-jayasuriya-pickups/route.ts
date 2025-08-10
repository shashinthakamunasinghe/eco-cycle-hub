import { NextResponse } from "next/server";
import { pickupService } from "@/lib/firebase-services";

export async function GET() {
  try {
    const jayasuriyaCollectorId = "xWGNtCSHf7danNeaXBjna9LfnzV2";
    
    console.log("🔍 Checking Jayasuriya's assigned pickups");
    console.log("Collector ID:", jayasuriyaCollectorId);
    
    // Get all pickups assigned to Jayasuriya
    const assignedPickups = await pickupService.getPickupRequestsByCollector(jayasuriyaCollectorId);
    
    console.log("📦 Pickups assigned to Jayasuriya:", assignedPickups.length);
    
    const activePickups = assignedPickups.filter(p => 
      p.status === "assigned" || p.status === "on-way"
    );
    
    console.log("📦 Active pickups for Jayasuriya:", activePickups.length);
    
    return NextResponse.json({
      success: true,
      collectorId: jayasuriyaCollectorId,
      collectorName: "Jayasuriya",
      totalPickups: assignedPickups.length,
      activePickups: activePickups.length,
      pickups: assignedPickups.map(p => ({
        id: p.id,
        industryName: p.industryName,
        status: p.status,
        wasteType: p.wasteType,
        weight: p.weight,
        assignedAt: p.scheduledAt,
        location: p.location
      }))
    });
    
  } catch (error) {
    console.error("❌ Error checking Jayasuriya's pickups:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to check Jayasuriya's pickups",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
