"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, CheckCircle, AlertTriangle, X } from "lucide-react"

export default function IndustryNotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "Pickup Request Approved",
      message: "Your pickup request for Organic Waste (150kg) has been approved and assigned to John Collector.",
      type: "success",
      read: false,
      createdAt: "2024-01-15T10:30:00Z",
    },
    {
      id: "2",
      title: "Collector En Route",
      message: "John Collector is on the way to your location for waste pickup. ETA: 30 minutes.",
      type: "info",
      read: false,
      createdAt: "2024-01-15T09:45:00Z",
    },
    {
      id: "3",
      title: "Pickup Completed",
      message: "Your waste pickup has been completed successfully. 200kg of Plastic Waste collected.",
      type: "success",
      read: true,
      createdAt: "2024-01-14T16:45:00Z",
    },
    {
      id: "4",
      title: "Pickup Request Pending",
      message: "Your pickup request is pending assignment. We'll notify you once a collector is assigned.",
      type: "warning",
      read: true,
      createdAt: "2024-01-14T14:20:00Z",
    },
    {
      id: "5",
      title: "Profile Updated",
      message: "Your company profile has been updated successfully.",
      type: "info",
      read: true,
      createdAt: "2024-01-13T11:15:00Z",
    },
  ])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case "error":
        return <X className="h-5 w-5 text-red-600" />
      default:
        return <Bell className="h-5 w-5 text-blue-600" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "border-l-green-500 bg-green-50"
      case "warning":
        return "border-l-yellow-500 bg-yellow-50"
      case "error":
        return "border-l-red-500 bg-red-50"
      default:
        return "border-l-blue-500 bg-blue-50"
    }
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-2">Stay updated with your pickup requests and account activities</p>
        </div>
        <div className="flex items-center space-x-4">
          {unreadCount > 0 && <Badge variant="secondary">{unreadCount} unread</Badge>}
          <Button variant="outline" onClick={markAllAsRead}>
            Mark All as Read
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            className={`border-l-4 transition-all hover:shadow-md ${getNotificationColor(notification.type)} ${
              !notification.read ? "ring-2 ring-blue-100" : ""
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className={`font-semibold ${!notification.read ? "text-gray-900" : "text-gray-700"}`}>
                        {notification.title}
                      </h3>
                      {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                    </div>
                    <p className={`text-sm ${!notification.read ? "text-gray-700" : "text-gray-600"}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">{new Date(notification.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!notification.read && (
                    <Button size="sm" variant="ghost" onClick={() => markAsRead(notification.id)}>
                      Mark as Read
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => deleteNotification(notification.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {notifications.length === 0 && (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No notifications yet.</p>
        </div>
      )}
    </div>
  )
}
