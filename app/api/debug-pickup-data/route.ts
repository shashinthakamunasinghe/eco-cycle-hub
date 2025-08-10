import { NextResponse } from "next/server";
import { pickupService } from "@/lib/firebase-services";

export async function GET() {
  try {
    console.log("🔍 Debug: Checking exact pickup data loading");
    
    // Get all pickup requests from Firebase
    const allPickups = await pickupService.getAllPickupRequests();
    
    console.log("📦 Raw pickup data from Firebase:");
    console.log("Total pickups:", allPickups.length);
    
    // Check for any ID "1" pickups
    const id1Pickups = allPickups.filter(p => p.id === "1");
    console.log("Pickups with ID '1':", id1Pickups.length);
    
    if (id1Pickups.length > 0) {
      console.log("ID '1' pickup details:", id1Pickups);
    }
    
    // Get sample of pickup IDs
    const pickupIds = allPickups.slice(0, 10).map(p => ({ id: p.id, industryName: p.industryName, status: p.status }));
    console.log("Sample pickup IDs:", pickupIds);
    
    return NextResponse.json({
      success: true,
      totalPickups: allPickups.length,
      id1Pickups: id1Pickups.length,
      samplePickups: pickupIds,
      id1Details: id1Pickups
    });
  } catch (error) {
    console.error("❌ Error debugging pickup data:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
