"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Package, ExternalLink } from "lucide-react";
import { pickupService, notificationService } from "@/lib/firebase-services";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { PickupRequest } from "@/types";

export default function RequestPickupPage() {
  const [formData, setFormData] = useState({
    wasteType: "",
    weight: "",
    notes: "",
    address: "",
    location: {
      lat: 0,
      lng: 0,
    },
  });
  const [loading, setLoading] = useState(false);
  const [usingProfileLocation, setUsingProfileLocation] = useState(false);
  const [profileLocation, setProfileLocation] = useState({
    address: "Not set",
    coordinates: null as { lat: number; lng: number } | null,
    hasLocation: false
  });
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useFirebaseAuth();

  const wasteTypes = [
    "Organic Waste",
    "Plastic Waste",
    "Metal Waste",
    "Paper Waste",
    "Electronic Waste",
    "Chemical Waste",
    "Mixed Waste",
  ];

  // Load company profile location
  useEffect(() => {
    const loadProfileLocation = async () => {
      if (!user?.id) return;

      try {
        const industryDoc = await getDoc(doc(db, "industryProfiles", user.id));
        if (industryDoc.exists()) {
          const data = industryDoc.data();
          if (data.location && data.locationAddress) {
            const profileLocationData = {
              address: data.locationAddress,
              coordinates: data.location,
              hasLocation: true
            };
            
            setProfileLocation(profileLocationData);
            
            // Automatically populate pickup address with profile location
            setFormData(prev => ({
              ...prev,
              address: data.locationAddress,
              location: data.location
            }));
            setUsingProfileLocation(true);
          }
        }
      } catch (error) {
        console.error("Error loading profile location:", error);
      }
    };

    loadProfileLocation();
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.id) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a request",
        variant: "destructive",
      });
      return;
    }

    // Use profile location if form location is not set but profile location exists
    let finalLocation = formData.location;
    if ((!formData.location.lat || !formData.location.lng) && profileLocation.coordinates) {
      finalLocation = profileLocation.coordinates;
    }

    try {
      setLoading(true);
      const requestData: Omit<PickupRequest, "id"> = {
        industryId: user.id,
        industryName: user.name || "",
        wasteType: formData.wasteType,
        weight: Number.parseInt(formData.weight),
        status: "pending",
        location: {
          lat: finalLocation.lat,
          lng: finalLocation.lng,
          address: formData.address,
        },
        priority: "medium", // Default priority
        notes: formData.notes,
        requestedAt: new Date(),
      };

      await pickupService.createPickupRequest(requestData);

      // Create notification for admin
      await notificationService.createNotification({
        userId: "admin", // You might want to get all admin users
        title: "New Pickup Request",
        message: `${user.name} has requested pickup for ${formData.wasteType} (${formData.weight}kg)`,
        type: "info",
        read: false,
        createdAt: new Date(),
      });

      toast({
        title: "Success",
        description: "Your pickup request has been submitted",
      });

      router.push("/industrydash");
    } catch (error) {
      console.error("Error submitting request:", error);
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear the profile location flag if user manually changes address
    if (field === "address") {
      setUsingProfileLocation(false);
    }
  };

  const useProfileLocation = () => {
    if (profileLocation.hasLocation && profileLocation.coordinates) {
      setFormData(prev => ({
        ...prev,
        address: profileLocation.address,
        location: profileLocation.coordinates!
      }));
      setUsingProfileLocation(true);
      toast({
        title: "Profile location used",
        description: "Your company profile location has been applied.",
      });
    } else {
      toast({
        title: "No profile location",
        description: "Please set your location in the company profile first.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Request Pickup</h1>
        <p className="text-gray-600 mt-2">
          Submit a new waste pickup request. Our system will automatically
          assign an available collector.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Pickup Details</span>
          </CardTitle>
          <CardDescription>
            Provide details about the waste you need collected
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
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
                    {wasteTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="weight">Estimated Weight (kg) *</Label>
                <Input
                  id="weight"
                  type="number"
                  min="1"
                  value={formData.weight}
                  onChange={(e) => handleInputChange("weight", e.target.value)}
                  placeholder="Enter weight in kg"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Pickup Address *</Label>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Enter pickup address"
                    required
                    className={usingProfileLocation ? "border-green-500 bg-green-50" : ""}
                  />
                  {usingProfileLocation && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <span className="text-xs text-green-600 font-medium">Profile</span>
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={useProfileLocation}
                  title="Use profile location"
                  disabled={!profileLocation.hasLocation}
                  className={usingProfileLocation ? "border-green-500 text-green-600" : ""}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {profileLocation.hasLocation ? (
                  usingProfileLocation ? (
                    <span className="text-green-600 font-medium">
                      ✓ Using your profile location.
                    </span>
                  ) : (
                    "Use profile location (link icon) or enter address manually"
                  )
                ) : (
                  "Set your location in company profile first, then use link icon"
                )}
              </p>
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Any special instructions or additional information"
                rows={3}
              />
            </div>

            <div className="flex space-x-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Submitting..." : "Submit Request"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Location Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Location Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Auto-location detection:
              </span>
              <span className="text-sm font-medium text-green-600">
                Enabled
              </span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-sm text-gray-600">Profile location:</span>
              <div className="text-right">
                <span className="text-sm">
                  {profileLocation.hasLocation ? profileLocation.address : "Not set"}
                </span>
                {profileLocation.coordinates && (
                  <div className="text-xs text-gray-500 mt-1">
                    {profileLocation.coordinates.lat.toFixed(6)}, {profileLocation.coordinates.lng.toFixed(6)}
                  </div>
                )}
                {profileLocation.hasLocation && (
                  <div className="text-xs text-green-600 mt-1 font-medium">
                    {usingProfileLocation ? "✓ Used in pickup address" : "Available for pickup"}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-xs text-gray-500">
                {profileLocation.hasLocation 
                  ? "Your profile location is automatically used as pickup address."
                  : "Set your profile location to auto-fill pickup address."
                }
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/industry-profile')}
                className="text-xs"
              >
                {profileLocation.hasLocation ? "Update Profile" : "Set Location"}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Your location helps assign the nearest available collector.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
