"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Bell, AlertTriangle, CheckCircle, Info, X, Send, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "System Maintenance Scheduled",
      message: "Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM EST.",
      type: "info",
      recipients: "all",
      createdAt: "2024-01-15T10:30:00Z",
      status: "sent",
    },
    {
      id: "2",
      title: "New Pickup Request Alert",
      message: "8 pickup requests are pending assignment for more than 2 hours.",
      type: "warning",
      recipients: "admins",
      createdAt: "2024-01-15T09:45:00Z",
      status: "sent",
    },
    {
      id: "3",
      title: "Monthly Report Available",
      message: "Your monthly waste management report is now available for download.",
      type: "success",
      recipients: "industries",
      createdAt: "2024-01-14T16:20:00Z",
      status: "sent",
    },
    {
      id: "4",
      title: "Payment Processing Issue",
      message: "Some payment transactions are experiencing delays. We're working to resolve this.",
      type: "error",
      recipients: "customers",
      createdAt: "2024-01-14T14:15:00Z",
      status: "draft",
    },
  ])

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    type: "info",
    recipients: "all",
  })
  const { toast } = useToast()

  const getNotificationIcon = (type: string) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleCreateNotification = () => {
    const notification = {
      id: Date.now().toString(),
      ...newNotification,
      createdAt: new Date().toISOString(),
      status: "sent",
    }
    setNotifications((prev) => [notification, ...prev])
    setIsCreateDialogOpen(false)
    setNewNotification({ title: "", message: "", type: "info", recipients: "all" })
    toast({
      title: "Notification sent",
      description: `Notification has been sent to ${newNotification.recipients}.`,
    })
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    toast({
      title: "Notification deleted",
      description: "The notification has been removed.",
    })
  }

  const resendNotification = (id: string) => {
    // Find the notification to get its details for the toast message
    const notification = notifications.find(n => n.id === id)
    toast({
      title: "Notification resent",
      description: `The notification "${notification?.title}" has been sent again.`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notification Center</h1>
          <p className="text-gray-600 mt-2">Manage system-wide notifications and alerts</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Notification</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter notification title"
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select onValueChange={(value) => setNewNotification((prev) => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select notification type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="recipients">Recipients</Label>
                <Select onValueChange={(value) => setNewNotification((prev) => ({ ...prev, recipients: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="admins">Admins Only</SelectItem>
                    <SelectItem value="industries">Industries</SelectItem>
                    <SelectItem value="collectors">Collectors</SelectItem>
                    <SelectItem value="customers">Customers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={newNotification.message}
                  onChange={(e) => setNewNotification((prev) => ({ ...prev, message: e.target.value }))}
                  placeholder="Enter notification message"
                  rows={4}
                />
              </div>
              <Button onClick={handleCreateNotification} className="w-full">
                <Send className="mr-2 h-4 w-4" />
                Send Notification
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.filter((n) => n.status === "sent").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Bell className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.filter((n) => n.status === "draft").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Bell className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                notifications.filter((n) => {
                  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  return new Date(n.createdAt) > weekAgo
                }).length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notifications.filter((n) => n.type === "warning" || n.type === "error").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            className={`border-l-4 transition-all hover:shadow-md ${getNotificationColor(notification.type)}`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold">{notification.title}</h3>
                      <Badge className={getStatusColor(notification.status)}>{notification.status}</Badge>
                      <Badge variant="outline">{notification.recipients}</Badge>
                    </div>
                    <p className="text-gray-700 mb-3">{notification.message}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Created: {new Date(notification.createdAt).toLocaleString()}</span>
                      <span>Type: {notification.type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {notification.status === "sent" && (
                    <Button size="sm" variant="outline" onClick={() => resendNotification(notification.id)}>
                      Resend
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
