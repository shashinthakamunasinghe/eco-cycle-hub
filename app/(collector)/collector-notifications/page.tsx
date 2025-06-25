"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, CheckCircle, AlertTriangle, Info, X, Eye, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  createdAt: Date
  category: "pickup" | "system" | "payment" | "general"
  actionRequired?: boolean
}

export default function CollectorNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    // Load notifications from localStorage or generate mock data
    const savedNotifications = localStorage.getItem("collectorNotifications")
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications))
    } else {
      // Generate mock notifications
      const mockNotifications: Notification[] = [
        {
          id: "1",
          title: "New Pickup Assignment",
          message:
            "You have been assigned a new pickup request from Green Industries Ltd. Please review the details and accept the assignment.",
          type: "info",
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          category: "pickup",
          actionRequired: true,
        },
        {
          id: "2",
          title: "Pickup Completed Successfully",
          message:
            "Your pickup from Eco Manufacturing has been marked as completed. Payment of Rs. 2,500 has been processed.",
          type: "success",
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          category: "pickup",
        },
        {
          id: "3",
          title: "Vehicle Maintenance Reminder",
          message:
            "Your vehicle is due for maintenance. Please schedule a service appointment to ensure optimal performance.",
          type: "warning",
          read: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          category: "system",
          actionRequired: true,
        },
        {
          id: "4",
          title: "Profile Update Required",
          message: "Please update your emergency contact information in your profile settings.",
          type: "warning",
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          category: "system",
        },
        {
          id: "5",
          title: "Weekly Performance Report",
          message: "Great job this week! You completed 12 pickups with a 4.9-star rating. Keep up the excellent work!",
          type: "success",
          read: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
          category: "general",
        },
      ]
      setNotifications(mockNotifications)
      localStorage.setItem("collectorNotifications", JSON.stringify(mockNotifications))
    }
  }, [])

  const markAsRead = (id: string) => {
    const updatedNotifications = notifications.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    setNotifications(updatedNotifications)
    localStorage.setItem("collectorNotifications", JSON.stringify(updatedNotifications))
    toast({
      title: "Notification marked as read",
      description: "The notification has been marked as read.",
    })
  }

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map((notif) => ({ ...notif, read: true }))
    setNotifications(updatedNotifications)
    localStorage.setItem("collectorNotifications", JSON.stringify(updatedNotifications))
    toast({
      title: "All notifications marked as read",
      description: "All notifications have been marked as read.",
    })
  }

  const deleteNotification = (id: string) => {
    const updatedNotifications = notifications.filter((notif) => notif.id !== id)
    setNotifications(updatedNotifications)
    localStorage.setItem("collectorNotifications", JSON.stringify(updatedNotifications))
    toast({
      title: "Notification deleted",
      description: "The notification has been deleted.",
    })
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case "error":
        return <X className="h-5 w-5 text-red-600" />
      default:
        return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "all") return true
    if (filter === "unread") return !notif.read
    if (filter === "read") return notif.read
    return notif.category === filter
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-2">
            Stay updated with your pickup assignments and system updates
            {unreadCount > 0 && (
              <Badge className="ml-2" variant="destructive">
                {unreadCount} unread
              </Badge>
            )}
          </p>
        </div>
        <div className="flex space-x-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter notifications" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Notifications</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="pickup">Pickup Related</SelectItem>
              <SelectItem value="system">System Updates</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              Mark All as Read
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center">No notifications found for the selected filter.</p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-all hover:shadow-md ${!notification.read ? "border-l-4 border-l-blue-500 bg-blue-50/30" : ""}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getIcon(notification.type)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className={`font-semibold ${!notification.read ? "text-gray-900" : "text-gray-700"}`}>
                          {notification.title}
                        </h3>
                        <Badge className={getTypeColor(notification.type)}>{notification.type}</Badge>
                        {notification.actionRequired && (
                          <Badge variant="outline" className="text-orange-600 border-orange-600">
                            Action Required
                          </Badge>
                        )}
                        {!notification.read && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                      </div>
                      <p className="text-gray-600 mb-2">{notification.message}</p>
                      <p className="text-sm text-gray-400">{notification.createdAt.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {!notification.read && (
                      <Button size="sm" variant="ghost" onClick={() => markAsRead(notification.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteNotification(notification.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
