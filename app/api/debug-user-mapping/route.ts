import { NextResponse } from "next/server";
import { collectorService, pickupService } from "@/lib/firebase-services";
import type { PickupRequest } from "@/types";

export async function GET() {
  try {
    console.log("🔍 Debugging user ID to collector ID mapping");
    
    // Get all collector profiles
    const collectors = await collectorService.getAllCollectorProfiles();
    console.log("👥 All collectors:", collectors.map(c => ({ id: c.id, name: c.name, email: c.email })));
    
    // Specific user from the screenshot
    const hasithUserId = "CfNvUQ6AgzfqaozWW40HySR9wuv2";
    
    // Find collector profile by user ID (if it exists)
    const hasithByUserId = collectors.find(c => c.id === hasithUserId);
    console.log("🔍 Hasith by user ID:", hasithByUserId);
    
    // Find collector profile by email
    const hasithByEmail = collectors.find(c => c.email === "hasith@gmail.com");
    console.log("📧 Hasith by email:", hasithByEmail);
    
    // Check pickups for the collector profile ID (not user ID)
    let hasithPickups: PickupRequest[] = [];
    if (hasithByEmail) {
      hasithPickups = await pickupService.getPickupRequestsByCollector(hasithByEmail.id);
      console.log("📦 Pickups for Hasith's collector profile:", hasithPickups.length);
    }
    
    // Check pickups for the user ID directly
    let userIdPickups: PickupRequest[] = [];
    try {
      userIdPickups = await pickupService.getPickupRequestsByCollector(hasithUserId);
      console.log("📦 Pickups for user ID directly:", userIdPickups.length);
    } catch {
      console.log("❌ No pickups found for user ID directly");
    }
    
    return NextResponse.json({
      success: true,
      userIdFromScreenshot: hasithUserId,
      collectorProfiles: collectors.map(c => ({ 
        id: c.id, 
        name: c.name, 
        email: c.email,
        isAvailable: c.isAvailable 
      })),
      hasithByUserId,
      hasithByEmail,
      hasithPickupsCount: hasithPickups.length,
      userIdPickupsCount: userIdPickups.length,
      hasithPickups: hasithPickups.map(p => ({
        id: p.id,
        industryName: p.industryName,
        status: p.status,
        collectorId: p.collectorId,
        collectorName: p.collectorName
      }))
    });
    
  } catch (error) {
    console.error("❌ Error debugging user mapping:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to debug user mapping",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
