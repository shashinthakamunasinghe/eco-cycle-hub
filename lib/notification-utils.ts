// Utility functions for creating sample notifications for testing

import { notificationService } from "@/lib/firebase-services";
import type { Notification } from "@/types";

/**
 * Create sample notifications for testing the notification system
 */
export async function createSampleNotifications(userId: string): Promise<void> {
  const sampleNotifications: Omit<Notification, "id">[] = [
    {
      userId,
      title: "Pickup Request Approved",
      message: "Your pickup request for Organic Waste (150kg) has been approved and assigned to John Collector.",
      type: "success",
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    },
    {
      userId,
      title: "Collector En Route",
      message: "John Collector is on the way to your location for waste pickup. ETA: 30 minutes.",
      type: "collector",
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    },
    {
      userId,
      title: "Pickup Request Pending",
      message: "Your pickup request for Plastic Waste (200kg) is pending assignment. We'll notify you once a collector is assigned.",
      type: "pending",
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    },
    {
      userId,
      title: "Pickup Completed",
      message: "Your waste pickup has been completed successfully. 180kg of Electronic Waste collected.",
      type: "success",
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
    {
      userId,
      title: "Profile Updated",
      message: "Your company profile has been updated successfully.",
      type: "info",
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    },
  ];

  try {
    for (const notification of sampleNotifications) {
      await notificationService.createNotification(notification);
    }
    console.log("Sample notifications created successfully");
  } catch (error) {
    console.error("Error creating sample notifications:", error);
    throw error;
  }
}

/**
 * Create a notification when a pickup request is created
 */
export async function createPickupRequestNotification(
  userId: string,
  wasteType: string,
  weight: number
): Promise<void> {
  await notificationService.createNotification({
    userId,
    title: "New Pickup Request Created",
    message: `Your pickup request for ${wasteType} (${weight}kg) has been submitted and is pending assignment.`,
    type: "pending",
    read: false,
    createdAt: new Date(),
  });
}

/**
 * Create a notification when pickup status changes
 */
export async function createPickupStatusNotification(
  userId: string,
  status: string,
  wasteType: string,
  weight: number,
  collectorName?: string
): Promise<void> {
  let title = "";
  let message = "";
  let type: "info" | "success" | "warning" | "error" | "pickup" | "collector" | "pending" = "info";

  switch (status) {
    case "assigned":
      title = "Pickup Request Assigned";
      message = `Your pickup request for ${wasteType} (${weight}kg) has been assigned to ${collectorName || "a collector"}.`;
      type = "pickup";
      break;
    case "on-way":
      title = "Collector En Route";
      message = `${collectorName || "The collector"} is on the way to your location for waste pickup.`;
      type = "collector";
      break;
    case "completed":
      title = "Pickup Completed";
      message = `Your waste pickup has been completed successfully. ${weight}kg of ${wasteType} collected.`;
      type = "success";
      break;
    case "cancelled":
      title = "Pickup Cancelled";
      message = `Your pickup request for ${wasteType} has been cancelled.`;
      type = "error";
      break;
    default:
      return;
  }

  await notificationService.createNotification({
    userId,
    title,
    message,
    type,
    read: false,
    createdAt: new Date(),
  });
}
