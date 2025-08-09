import { NextResponse } from "next/server";
import { pickupService } from "@/lib/firebase-services";

export async function POST() {
  try {
    console.log("🔄 Creating test pickup requests...");
    
    // Test pickup requests
    const testPickups = [
      {
        industryId: "test-industry-1",
        industryName: "Green Industries Ltd",
        wasteType: "Organic Waste",
        weight: 150,
        location: {
          lat: 6.9271,
          lng: 79.8612,
          address: "123 Industrial Ave, Colombo 03, Sri Lanka"
        },
        status: "pending" as const,
        priority: "high" as const,
        requestedAt: new Date(),
        notes: "Handle with care - organic waste"
      },
      {
        industryId: "test-industry-2",
        industryName: "Eco Manufacturing",
        wasteType: "Plastic Waste", 
        weight: 200,
        location: {
          lat: 6.9344,
          lng: 79.8428,
          address: "456 Factory St, Mount Lavinia, Sri Lanka"
        },
        status: "pending" as const,
        priority: "medium" as const,
        requestedAt: new Date(),
        notes: "Plastic bottles and containers"
      },
      {
        industryId: "test-industry-3",
        industryName: "Tech Solutions Corp",
        wasteType: "Electronic Waste",
        weight: 75,
        location: {
          lat: 6.9147,
          lng: 79.8731,
          address: "789 Tech Park, Nugegoda, Sri Lanka"
        },
        status: "pending" as const,
        priority: "low" as const,
        requestedAt: new Date(),
        notes: "Old computers and electronic components"
      }
    ];

    const createdPickups = [];
    
    for (const pickup of testPickups) {
      const pickupId = await pickupService.createPickupRequest(pickup);
      createdPickups.push({ id: pickupId, ...pickup });
      console.log(`✅ Created pickup request: ${pickupId} - ${pickup.industryName}`);
    }

    console.log("🎉 Test pickup requests created successfully!");
    
    return NextResponse.json({
      success: true,
      message: "Test pickup requests created successfully",
      pickups: createdPickups
    });
    
  } catch (error) {
    console.error("❌ Error creating test pickup requests:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to create test pickup requests",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
