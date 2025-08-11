"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Package, ShoppingCart, Trash2, Check } from "lucide-react"

interface Notification {
  id: string
  title: string
  message: string
  type: "order" | "promotion" | "general"
  read: boolean
  createdAt: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Load notifications from localStorage
  useEffect(() => {
    // Mock notifications
    const mockNotifications: Notification[] = [
      {
        id: "1",
        title: "Order Shipped",
        message: "Your order #ORD-1234 has been shipped and is on its way!",
        type: "order",
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "2",
        title: "Special Offer",
        message: "Get 20% off on all eco-friendly home items this week!",
        type: "promotion",
        read: false,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "3",
        title: "Product Back in Stock",
        message: "Organic Compost Mix is now back in stock!",
        type: "general",
        read: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "4",
        title: "Order Delivered",
        message: "Your order #ORD-1230 has been delivered successfully.",
        type: "order",
        read: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]
    setNotifications(mockNotifications)
  }, [])

  const markAsRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
      localStorage.setItem("shopNotifications", JSON.stringify(updated))
      return updated
    })
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.filter((notif) => notif.id !== id)
      localStorage.setItem("shopNotifications", JSON.stringify(updated))
      return updated
    })
  }

  const markAllAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((notif) => ({ ...notif, read: true }))
      localStorage.setItem("shopNotifications", JSON.stringify(updated))
      return updated
    })
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "order":
        return <Package className="h-5 w-5 text-blue-600" />
      case "promotion":
        return <ShoppingCart className="h-5 w-5 text-green-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          {unreadCount > 0 && <p className="text-gray-600 mt-2">{unreadCount} unread notifications</p>}
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            <Check className="h-4 w-4 mr-2" />
            Mark All as Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No notifications</h2>
          <p className="text-gray-600">You are all caught up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`${!notification.read ? "border-l-4 border-l-green-500 bg-green-50/30" : ""}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">{getIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                        <p className="text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.read && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            New
                          </Badge>
                        )}
                        <div className="flex space-x-1">
                          {!notification.read && (
                            <Button size="sm" variant="ghost" onClick={() => markAsRead(notification.id)}>
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteNotification(notification.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
