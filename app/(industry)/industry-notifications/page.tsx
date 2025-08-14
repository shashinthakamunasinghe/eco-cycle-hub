"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, CheckCircle, AlertTriangle, X, Package, Truck, Clock, Info } from "lucide-react"
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth"
import { useToast } from "@/hooks/use-toast"
import { notificationService, pickupService } from "@/lib/firebase-services"
import type { Notification } from "@/types"

export default function IndustryNotificationsPage() {
  const { user } = useFirebaseAuth()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Load notifications from Firebase and sync with pickup history
  const loadNotifications = useCallback(async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      
      // First sync with pickup history to ensure all pickup changes have notifications
      await pickupService.syncPickupNotifications(user.id)
      
      // Then load notifications
      const userNotifications = await notificationService.getUserNotifications(user.id)
      setNotifications(userNotifications.sort((a: Notification, b: Notification) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ))
    } catch (error) {
      console.error("Error loading notifications:", error)
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [user?.id, toast])

  // Real-time updates
  useEffect(() => {
    if (user?.id) {
      loadNotifications()
      
      // Set up polling for real-time updates every 30 seconds
      const interval = setInterval(() => {
        loadNotifications()
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [user?.id, loadNotifications])

  // Refresh when window gains focus
  useEffect(() => {
    const handleFocus = () => {
      if (user?.id) {
        loadNotifications()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [user?.id, loadNotifications])

  // Test function to create pickup-related notifications based on real pickup history
  const createTestNotifications = async () => {
    if (!user?.id) return

    try {
      setActionLoading("test")
      
      // Get real pickup history first
      const pickupRequests = await pickupService.getPickupRequestsByIndustry(user.id)
      
      if (pickupRequests.length === 0) {
        // Create sample notifications if no pickup history exists
        const testNotifications = [
          {
            userId: user.id,
            title: "Pickup Request Sent",
            message: "Your pickup request for Mixed Waste (150kg) has been submitted successfully. Request ID: abc12345. Awaiting assignment.",
            type: "pending" as const,
            read: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
          },
          {
            userId: user.id,
            title: "Pickup Request Collected",
            message: "Your pickup request for Paper Waste (200kg) has been assigned to Dinithi. Request ID: def67890.",
            type: "pickup" as const,
            read: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          },
          {
            userId: user.id,
            title: "Pickup Completed",
            message: "Your waste pickup has been completed successfully. 180kg of Organic Waste collected. Request ID: ghi12345.",
            type: "success" as const,
            read: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
          }
        ]

        for (const notification of testNotifications) {
          await notificationService.createNotification(notification)
        }
      } else {
        // Create notifications based on actual pickup history
        for (const pickup of pickupRequests.slice(0, 3)) { // Take first 3 requests
          await pickupService.createPickupNotification(pickup, pickup.status)
        }
      }

      await loadNotifications()
      
      toast({
        title: "Success",
        description: pickupRequests.length > 0 
          ? "Notifications created from your pickup history" 
          : "Sample pickup notifications created successfully",
      })
    } catch (error) {
      console.error("Error creating test notifications:", error)
      toast({
        title: "Error",
        description: "Failed to create test notifications",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success": // Pickup Completed
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error": // Pickup Rejected
        return <X className="h-5 w-5 text-red-600" />
      case "pickup": // Pickup Collected (Assigned)
        return <Truck className="h-5 w-5 text-blue-600" />
      case "pending": // Pickup Request Sent
        return <Clock className="h-5 w-5 text-orange-600" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      default:
        return <Package className="h-5 w-5 text-gray-600" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success": // Pickup Completed
        return "border-l-green-500 bg-green-50"
      case "error": // Pickup Rejected
        return "border-l-red-500 bg-red-50"
      case "pickup": // Pickup Collected (Assigned)
        return "border-l-blue-500 bg-blue-50"
      case "pending": // Pickup Request Sent
        return "border-l-orange-500 bg-orange-50"
      case "warning":
        return "border-l-yellow-500 bg-yellow-50"
      default:
        return "border-l-gray-500 bg-gray-50"
    }
  }

  const markAsRead = async (id: string) => {
    if (actionLoading) return

    try {
      setActionLoading(id)
      await notificationService.markAsRead(id)
      setNotifications((prev) =>
        prev.map((notification) => 
          notification.id === id ? { ...notification, read: true } : notification
        )
      )
      toast({
        title: "Success",
        description: "Notification marked as read",
      })
    } catch (error) {
      console.error("Error marking notification as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const markAllAsRead = async () => {
    if (!user?.id || actionLoading) return

    try {
      setActionLoading("all")
      await notificationService.markAllAsRead(user.id)
      setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
      toast({
        title: "Success",
        description: "All notifications marked as read",
      })
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const deleteNotification = async (id: string) => {
    if (actionLoading) return

    try {
      setActionLoading(id)
      await notificationService.deleteNotification(id)
      setNotifications((prev) => prev.filter((notification) => notification.id !== id))
      toast({
        title: "Success",
        description: "Notification deleted",
      })
    } catch (error) {
      console.error("Error deleting notification:", error)
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length
  const unreadNotifications = notifications.filter((n) => !n.read)
  const readNotifications = notifications.filter((n) => n.read)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pickup Notifications</h1>
          <p className="text-gray-600 mt-2">Track your pickup requests: Sent, Collected, Completed, and Rejected status updates</p>
        </div>
        <div className="flex items-center space-x-4">
          {unreadCount > 0 && <Badge variant="secondary">{unreadCount} unread</Badge>}
          <Button 
            variant="outline" 
            onClick={markAllAsRead}
            disabled={actionLoading === "all" || unreadCount === 0}
          >
            {actionLoading === "all" ? "Marking..." : "Mark All as Read"}
          </Button>
          <Button variant="outline" onClick={loadNotifications} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
          {/* Sync with pickup history button */}
          <Button 
            variant="outline" 
            onClick={() => pickupService.syncPickupNotifications(user?.id || "").then(() => {
              loadNotifications()
              toast({ title: "Synced", description: "Notifications synced with pickup history" })
            })}
            disabled={loading}
            size="sm"
          >
            Sync with History
          </Button>
          {/* Temporary test button for development */}
          <Button 
            variant="secondary" 
            onClick={createTestNotifications}
            disabled={actionLoading === "test"}
            size="sm"
          >
            {actionLoading === "test" ? "Creating..." : "Create from History"}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <span className="ml-2 text-gray-600">Loading notifications...</span>
        </div>
      ) : (
        <>
          {/* Unread Notifications Section */}
          {unreadNotifications.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-semibold text-gray-900">Unread Notifications</h2>
                <Badge variant="default" className="bg-red-500">{unreadNotifications.length}</Badge>
              </div>
              {unreadNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`border-l-4 transition-all hover:shadow-md ${getNotificationColor(notification.type)} ring-2 ring-blue-100`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {notification.title}
                            </h3>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          </div>
                          <p className="text-sm text-gray-700">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => markAsRead(notification.id)}
                          disabled={actionLoading === notification.id}
                        >
                          {actionLoading === notification.id ? "Marking..." : "Mark as Read"}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => deleteNotification(notification.id)}
                          disabled={actionLoading === notification.id}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Read Notifications Section */}
          {readNotifications.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-semibold text-gray-700">Read Notifications</h2>
                <Badge variant="outline">{readNotifications.length}</Badge>
              </div>
              {readNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`border-l-4 transition-all hover:shadow-md ${getNotificationColor(notification.type)} opacity-75`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="mt-1 opacity-60">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium text-gray-700">
                              {notification.title}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => deleteNotification(notification.id)}
                          disabled={actionLoading === notification.id}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {notifications.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No pickup notifications yet.</p>
              <p className="text-sm text-gray-400 mt-2">
                You'll receive notifications when you send pickup requests and when their status changes:
              </p>
              <div className="mt-4 text-sm text-gray-500 space-y-1">
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span>Pickup Request Sent</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Truck className="h-4 w-4 text-blue-500" />
                  <span>Pickup Request Collected</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Pickup Completed</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <X className="h-4 w-4 text-red-500" />
                  <span>Pickup Request Rejected</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
