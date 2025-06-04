"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Calendar, Clock, Package } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewRequestPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    wasteType: "",
    amount: "",
    notes: "",
  });

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      router.push("/auth/login");
      return;
    }
    setUser(JSON.parse(currentUser));
  }, [router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create new request
      const newRequest = {
        id: Date.now().toString(),
        wasteType: formData.wasteType,
        amount: Number.parseInt(formData.amount),
        status: "Pending" as const,
        requestDate: new Date().toISOString().split("T")[0],
        notes: formData.notes,
      };

      // Get existing requests
      const existingRequests = localStorage.getItem(
        `pickupRequests_${user.id}`
      );
      const requests = existingRequests ? JSON.parse(existingRequests) : [];

      // Add new request
      requests.push(newRequest);
      localStorage.setItem(
        `pickupRequests_${user.id}`,
        JSON.stringify(requests)
      );

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      alert("Pickup request submitted successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Request submission error:", error);
      alert("Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  // Get tomorrow's date as minimum date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-green-600 hover:text-green-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            New Pickup Request
          </h1>
          <p className="text-gray-600 mt-2">
            Request waste pickup for {user.industryName}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2 text-green-600" />
              Waste Pickup Details
            </CardTitle>
            <CardDescription>
              Fill in the details for your waste pickup request
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Waste Type */}
              <div>
                <Label htmlFor="wasteType">Waste Type *</Label>
                <Select
                  value={formData.wasteType}
                  onValueChange={(value) =>
                    handleInputChange("wasteType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select waste type" />
                  </SelectTrigger>
                  <SelectContent>
                    {user.wasteTypes?.map((type: string) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount */}
              <div>
                <Label htmlFor="amount">Amount (kg) *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  value={formData.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  placeholder="Enter amount in kilograms"
                  required
                />
              </div>

              {/* Additional Notes */}
              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Any special instructions or additional information..."
                  rows={3}
                />
              </div>

              {/* Location Info */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">
                  Pickup Location
                </h3>
                <p className="text-green-800 text-sm">{user.address}</p>
                <p className="text-green-700 text-xs mt-1">
                  This is your registered industry address. Contact support if
                  you need to change it.
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading || !formData.wasteType || !formData.amount}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting Request...
                  </>
                ) : (
                  "Submit Pickup Request"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
