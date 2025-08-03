"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pickupService } from "@/lib/firebase-services";
import type { PickupRequest } from "@/types";

export default function TestPickupPage() {
  const [testResult, setTestResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const testCreatePickup = async () => {
    setLoading(true);
    try {
      const testRequest: Omit<PickupRequest, "id"> = {
        industryId: "test-industry-123",
        industryName: "Test Industry Ltd",
        wasteType: "Plastic Waste",
        weight: 100,
        status: "pending",
        location: {
          lat: 6.9271,
          lng: 79.8612,
          address: "123 Test Street, Colombo, Sri Lanka",
        },
        notes: "Test pickup request",
        requestedAt: new Date(),
      };

      const id = await pickupService.createPickupRequest(testRequest);
      setTestResult(`✅ Success! Created pickup request with ID: ${id}`);
    } catch (error) {
      console.error("Test failed:", error);
      setTestResult(
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const testLoadPickups = async () => {
    setLoading(true);
    try {
      const requests = await pickupService.getAllPickupRequests();
      setTestResult(`✅ Success! Loaded ${requests.length} pickup requests`);
    } catch (error) {
      console.error("Test failed:", error);
      setTestResult(
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Pickup Service Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <Button onClick={testCreatePickup} disabled={loading}>
              Test Create Pickup
            </Button>
            <Button onClick={testLoadPickups} disabled={loading}>
              Test Load Pickups
            </Button>
          </div>

          {testResult && (
            <div className="p-4 bg-gray-100 rounded-lg">
              <p className="text-sm">{testResult}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
