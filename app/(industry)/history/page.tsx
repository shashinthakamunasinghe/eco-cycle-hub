"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Search, Calendar, MapPin, Truck, X, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function PickupHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { toast } = useToast()

  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [currentPickup, setCurrentPickup] = useState<any>(null)
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false)
  const [pickupToCancel, setPickupToCancel] = useState<any>(null)
  const [pickupHistory, setPickupHistory] = useState<any[]>([])

  // Load requests from localStorage
  const loadRequests = () => {
    const savedRequests = JSON.parse(localStorage.getItem("industryRequests") || "[]")
    setPickupHistory(savedRequests)
  }

  useEffect(() => {
    loadRequests()

    // Listen for storage changes
    const handleStorageChange = () => {
      loadRequests()
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "assigned":
        return "bg-blue-100 text-blue-800"
      case "on-way":
        return "bg-purple-100 text-purple-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "on-way":
        return <Truck className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <X className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const filteredHistory = pickupHistory.filter((item) => {
    const matchesSearch =
      item.wasteType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const viewPickupDetails = (pickup: any) => {
    setCurrentPickup(pickup)
    setIsViewDialogOpen(true)
  }

  const confirmCancelPickup = (pickup: any) => {
    setPickupToCancel(pickup)
    setIsConfirmCancelOpen(true)
  }

  const cancelPickupConfirmed = () => {
    if (!pickupToCancel) return

    // Update the request status to cancelled
    const updatedRequests = pickupHistory.map((request) =>
      request.id === pickupToCancel.id
        ? { ...request, status: "cancelled", cancelledAt: new Date().toISOString() }
        : request,
    )

    // Save back to localStorage
    localStorage.setItem("industryRequests", JSON.stringify(updatedRequests))
    setPickupHistory(updatedRequests)

    // Trigger storage event for other components
    window.dispatchEvent(new Event("storage"))

    setIsConfirmCancelOpen(false)
    setPickupToCancel(null)

    toast({
      title: "Pickup cancelled",
      description: `Request ${pickupToCancel.id} has been cancelled successfully.`,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pickup History</h1>
        <p className="text-gray-600 mt-2">View and manage your waste pickup requests</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by waste type, address, or request ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="on-way">On The Way</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {filteredHistory.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    {getStatusIcon(item.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold">{item.wasteType}</h3>
                      <Badge className={getStatusColor(item.status)}>{item.status.replace("-", " ")}</Badge>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4" />
                        <span>
                          {item.weight} kg • {item.id}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>{item.address}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Requested: {new Date(item.requestedAt).toLocaleString()}</span>
                      </div>
                      {item.completedAt && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Completed: {new Date(item.completedAt).toLocaleString()}</span>
                        </div>
                      )}
                      {item.cancelledAt && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Cancelled: {new Date(item.cancelledAt).toLocaleString()}</span>
                        </div>
                      )}
                      {item.collectorName && (
                        <div className="flex items-center space-x-2">
                          <Truck className="h-4 w-4" />
                          <span>Collector: {item.collectorName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  {item.status === "pending" && (
                    <Button size="sm" variant="destructive" onClick={() => confirmCancelPickup(item)}>
                      Cancel
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => viewPickupDetails(item)}>
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredHistory.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {pickupHistory.length === 0
              ? "No pickup requests found. Create your first request to get started."
              : "No pickup requests found matching your criteria."}
          </p>
        </div>
      )}

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pickup Request Details</DialogTitle>
          </DialogHeader>
          {currentPickup && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Request Information</h4>
                  <div className="p-3 border rounded-lg space-y-2">
                    <p>
                      <strong>Request ID:</strong> {currentPickup.id}
                    </p>
                    <p>
                      <strong>Waste Type:</strong> {currentPickup.wasteType}
                    </p>
                    <p>
                      <strong>Weight:</strong> {currentPickup.weight} kg
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <Badge className={getStatusColor(currentPickup.status)}>{currentPickup.status}</Badge>
                    </p>
                    <p>
                      <strong>Requested:</strong> {new Date(currentPickup.requestedAt).toLocaleString()}
                    </p>
                    {currentPickup.completedAt && (
                      <p>
                        <strong>Completed:</strong> {new Date(currentPickup.completedAt).toLocaleString()}
                      </p>
                    )}
                    {currentPickup.cancelledAt && (
                      <p>
                        <strong>Cancelled:</strong> {new Date(currentPickup.cancelledAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Location & Collector</h4>
                  <div className="p-3 border rounded-lg space-y-2">
                    <p>
                      <strong>Address:</strong> {currentPickup.address}
                    </p>
                    {currentPickup.collectorName && (
                      <p>
                        <strong>Collector:</strong> {currentPickup.collectorName}
                      </p>
                    )}
                    {currentPickup.notes && (
                      <p>
                        <strong>Notes:</strong> {currentPickup.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Cancel Dialog */}
      <Dialog open={isConfirmCancelOpen} onOpenChange={setIsConfirmCancelOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Pickup Request</DialogTitle>
          </DialogHeader>
          {pickupToCancel && (
            <div className="py-4">
              <p className="mb-4">
                Are you sure you want to cancel the pickup request <strong>{pickupToCancel.id}</strong> for{" "}
                <strong>{pickupToCancel.wasteType}</strong>?
              </p>
              <p className="text-sm text-gray-600 mb-4">
                The request will be marked as cancelled but will remain in your history.
              </p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsConfirmCancelOpen(false)}>
                  No, Keep Request
                </Button>
                <Button variant="destructive" onClick={cancelPickupConfirmed}>
                  Yes, Cancel Request
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
