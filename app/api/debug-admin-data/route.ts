import { NextResponse } from "next/server";
import { pickupService, collectorService } from "@/lib/firebase-services";

export async function GET() {
  try {
    console.log("🔍 Debug: Checking admin pickup data");
    
    // Get all pickup requests
    const allPickups = await pickupService.getAllPickupRequests();
    console.log("📦 All pickup requests:", allPickups.length);
    
    // Get all collectors
    const allCollectors = await collectorService.getAllCollectorProfiles();
    console.log("👥 All collectors:", allCollectors.length);
    
    // Group pickups by status
    const pickupsByStatus = allPickups.reduce((acc, pickup) => {
      acc[pickup.status] = (acc[pickup.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log("📊 Pickups by status:", pickupsByStatus);
    
    return NextResponse.json({
      success: true,
      totalPickups: allPickups.length,
      totalCollectors: allCollectors.length,
      pickupsByStatus,
      recentPickups: allPickups.slice(0, 5).map(p => ({
        id: p.id,
        industryName: p.industryName,
        status: p.status,
        collectorName: p.collectorName || 'Unassigned',
        wasteType: p.wasteType,
        weight: p.weight
      }))
    });
    
  } catch (error) {
    console.error("❌ Error debugging admin data:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to debug admin data",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
