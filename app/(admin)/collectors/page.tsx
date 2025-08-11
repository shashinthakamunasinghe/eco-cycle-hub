"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { collection, onSnapshot, query } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { collectorService } from "@/lib/firebase-services"
import type { CollectorProfile, PickupRequest } from "@/types"
import { MapPin, Phone, Mail, Clock, FileText, Truck, Package, User, Edit, AlertCircle, UserX, Power, MoreVertical, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function CollectorsPage() {
  const [collectors, setCollectors] = useState<CollectorProfile[]>([])
  const [pickups, setPickups] = useState<PickupRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCollector, setEditingCollector] = useState<CollectorProfile | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    // Set up real-time listeners for collectors and pickups
    setLoading(true)
    
    // Real-time listener for collector profiles
    const collectorsQuery = query(collection(db, "collectorProfiles"))
    const unsubscribeCollectors = onSnapshot(collectorsQuery, (snapshot) => {
      const collectorData: CollectorProfile[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        collectorData.push({
          id: doc.id,
          name: data.name || "Unknown",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          licenseNumber: data.licenseNumber || "",
          vehicleType: data.vehicleType || "",
          vehicleModel: data.vehicleModel || "",
          vehicleCapacity: data.vehicleCapacity || 0,
          experience: data.experience || "",
          status: data.status || "inactive",
          rating: data.rating || 0,
          completedPickups: data.completedPickups || 0,
          joinedDate: data.joinedDate || "",
          emergencyContact: data.emergencyContact || "",
          workingHours: data.workingHours || "",
          specializations: data.specializations || [],
          isAvailable: data.isAvailable || false,
          currentLoad: data.currentLoad || 0,
          currentLocation: data.currentLocation || null,
          lastActivity: data.lastActivity || null,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as CollectorProfile)
      })
      setCollectors(collectorData)
      setLoading(false)
    }, (error) => {
      console.error("Error fetching collectors:", error)
      setLoading(false)
    })
    
    // Real-time listener for all pickup requests
    const pickupsQuery = query(collection(db, "pickupRequests"))
    const unsubscribePickups = onSnapshot(pickupsQuery, (snapshot) => {
      const pickupData: PickupRequest[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        pickupData.push({
          id: doc.id,
          industryId: data.industryId || "",
          industryName: data.industryName || "",
          wasteType: data.wasteType || "",
          weight: data.weight || 0,
          location: data.location || { lat: 0, lng: 0, address: "" },
          status: data.status || "pending",
          collectorId: data.collectorId || "",
          collectorName: data.collectorName || "",
          priority: data.priority || "medium",
          requestedAt: data.requestedAt?.toDate() || new Date(),
          scheduledAt: data.scheduledAt?.toDate() || undefined,
          completedAt: data.completedAt?.toDate() || undefined,
          cancelledAt: data.cancelledAt?.toDate() || undefined,
          notes: data.notes || "",
        } as PickupRequest)
      })
      setPickups(pickupData)
    }, (error) => {
      console.error("Error fetching pickups:", error)
    })
    
    return () => {
      unsubscribeCollectors()
      unsubscribePickups()
    }
  }, [])

  // Calculate current load for each collector based on assigned pickups
  const getCollectorWithLoad = (collector: CollectorProfile) => {
    // Get all assigned pickups for this collector that are not completed or cancelled
    const collectorPickups = pickups.filter(
      pickup => 
        pickup.collectorId === collector.id && 
        !['completed', 'cancelled'].includes(pickup.status)
    )
    
    // Calculate total weight of assigned pickups
    const assignedLoad = collectorPickups.reduce((sum, pickup) => sum + pickup.weight, 0)
    
    // Get vehicle capacity as a number
    const vehicleCapacity = typeof collector.vehicleCapacity === 'string' 
      ? parseFloat(collector.vehicleCapacity) 
      : collector.vehicleCapacity || 0
    
    // Calculate capacity percentage
    const capacityPercentage = vehicleCapacity > 0 
      ? (assignedLoad / vehicleCapacity) * 100 
      : 0
    
    return {
      ...collector,
      currentLoad: assignedLoad,
      capacityPercentage: Math.min(capacityPercentage, 100), // Cap at 100%
      assignedPickups: collectorPickups,
    }
  }
  
  // Apply load calculations to all collectors
  const collectorsWithLoad = collectors.map(getCollectorWithLoad)

  // Calculate total completed pickups from actual pickup data
  const totalCompletedPickups = pickups.filter(pickup => pickup.status === 'completed').length
  
  // Alternative: Calculate by collector profile data
  const totalCompletedFromProfiles = collectors.reduce((sum, c) => sum + (c.completedPickups || 0), 0)
  
  // Debug logging
  useEffect(() => {
    if (collectors.length > 0 && pickups.length > 0) {
      console.log("📊 Pickup Statistics:")
      console.log("- Total pickups in database:", pickups.length)
      console.log("- Completed pickups:", totalCompletedPickups)
      console.log("- Profile completed totals:", totalCompletedFromProfiles)
      console.log("- Collectors with completedPickups:", collectors.map(c => ({
        name: c.name,
        completedPickups: c.completedPickups || 0,
        isAvailable: c.isAvailable
      })))
      console.log("- Available collectors:", collectors.filter(c => c.isAvailable).length)
      console.log("- Pickup statuses:", [...new Set(pickups.map(p => p.status))])
    }
  }, [collectors, pickups, totalCompletedPickups, totalCompletedFromProfiles])

  // Handler functions
  const handleEditCollector = (collector: CollectorProfile) => {
    setEditingCollector(collector)
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingCollector) return
    
    setIsUpdating(true)
    try {
      await collectorService.updateCollectorProfile(editingCollector.id, editingCollector)
      setIsEditDialogOpen(false)
      setEditingCollector(null)
      console.log("✅ Collector profile updated successfully")
    } catch (error) {
      console.error("❌ Error updating collector profile:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSuspendCollector = async (collector: CollectorProfile) => {
    if (!confirm(`Are you sure you want to suspend ${collector.name}?`)) return
    
    try {
      await collectorService.updateCollectorProfile(collector.id, {
        status: "suspended",
        isAvailable: false
      })
      console.log("✅ Collector suspended successfully")
    } catch (error) {
      console.error("❌ Error suspending collector:", error)
    }
  }

  const handleToggleOffline = async (collector: CollectorProfile) => {
    const newStatus = collector.status === "offline" ? "active" : "offline"
    const action = newStatus === "offline" ? "set offline" : "bring online"
    
    if (!confirm(`Are you sure you want to ${action} ${collector.name}?`)) return
    
    try {
      await collectorService.updateCollectorProfile(collector.id, {
        status: newStatus,
        isAvailable: newStatus === "active"
      })
      console.log(`✅ Collector ${action} successfully`)
    } catch (error) {
      console.error(`❌ Error changing collector status:`, error)
    }
  }

  const handleSyncCompletedPickups = async () => {
    if (!confirm("This will update all collector profiles with their actual completed pickup counts from the database. Continue?")) return
    
    setIsUpdating(true)
    try {
      console.log("🔄 Syncing completed pickups for all collectors...")
      
      for (const collector of collectors) {
        // Count completed pickups for this collector
        const collectorCompletedPickups = pickups.filter(
          pickup => pickup.collectorId === collector.id && pickup.status === 'completed'
        ).length
        
        // Update profile if the count is different
        if (collectorCompletedPickups !== (collector.completedPickups || 0)) {
          await collectorService.updateCollectorProfile(collector.id, {
            completedPickups: collectorCompletedPickups
          })
          console.log(`✅ Updated ${collector.name}: ${collectorCompletedPickups} completed pickups`)
        }
      }
      
      console.log("✅ Completed pickup sync finished")
      alert("Completed pickup counts have been synchronized!")
    } catch (error) {
      console.error("❌ Error syncing completed pickups:", error)
      alert("Error occurred during sync. Check console for details.")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteCollector = async (collector: CollectorProfile) => {
    // Check if collector has active assignments
    const activeAssignments = pickups.filter(
      pickup => 
        pickup.collectorId === collector.id && 
        !['completed', 'cancelled'].includes(pickup.status)
    )

    if (activeAssignments.length > 0) {
      alert(`Cannot delete ${collector.name}. They have ${activeAssignments.length} active pickup assignments. Please reassign or complete these pickups first.`)
      return
    }

    const confirmMessage = `⚠️ WARNING: This action cannot be undone!\n\nAre you sure you want to permanently delete collector "${collector.name}"?\n\nThis will remove:\n- All profile information\n- Historical data\n- Access to the system\n\nType "DELETE" to confirm:`
    
    const userInput = prompt(confirmMessage)
    if (userInput !== "DELETE") {
      console.log("Delete operation cancelled")
      return
    }

    try {
      // Delete from collector profiles collection
      await collectorService.deleteCollectorProfile(collector.id)
      console.log("✅ Collector deleted successfully")
      
      // Optional: You might also want to delete from users collection if they exist there
      // This depends on your data structure
    } catch (error) {
      console.error("❌ Error deleting collector:", error)
      alert("Failed to delete collector. Please try again.")
    }
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "on-duty":
        return "bg-blue-100 text-blue-800"
      case "off-duty":
        return "bg-yellow-100 text-yellow-800"
      case "offline":
        return "bg-orange-100 text-orange-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }
  
  // Get capacity fill color
  const getCapacityColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500"
    if (percentage >= 70) return "bg-yellow-500"
    return "bg-green-500"
  }
  
  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown"
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Format last activity time
  const formatLastActivity = (lastActivity: string | null | undefined) => {
    if (!lastActivity) return "Never"
    const date = new Date(lastActivity)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading collector data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Collectors Management</h1>
        <div className="flex space-x-2">
          <Button variant="outline">
            Export Data
          </Button>
          {totalCompletedFromProfiles !== totalCompletedPickups && (
            <Button 
              variant="outline" 
              onClick={handleSyncCompletedPickups}
              disabled={isUpdating}
              className="text-orange-600 border-orange-600 hover:bg-orange-50"
            >
              {isUpdating ? "Syncing..." : "Sync Pickup Counts"}
            </Button>
          )}
          <Button>
            Add New Collector
          </Button>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Collectors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{collectors.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Available Online</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {collectors.filter(c => c.isAvailable === true).length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Ready for new pickups
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Pickups Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              {totalCompletedPickups}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Completed status in database
            </p>
            {totalCompletedFromProfiles !== totalCompletedPickups && (
              <p className="text-xs text-orange-600 mt-1">
                Profile totals: {totalCompletedFromProfiles} (may need sync)
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Collectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collectorsWithLoad.map(collector => (
          <Card key={collector.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center">
                    <span className={`w-3 h-3 rounded-full mr-2 ${collector.isAvailable ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    {collector.name}
                  </CardTitle>
                  <CardDescription className="flex items-center mt-1 space-x-2">
                    <Badge className={getStatusColor(collector.status)}>
                      {collector.status || "Unknown Status"}
                    </Badge>
                    <Badge 
                      variant={collector.isAvailable ? "default" : "secondary"}
                      className={collector.isAvailable ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                    >
                      {collector.isAvailable ? "Online" : "Offline"}
                    </Badge>
                    <span className="text-sm">ID: {collector.id.substring(0, 6)}...</span>
                  </CardDescription>
                </div>
                <div className="flex space-x-1">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => handleEditCollector(collector)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditCollector(collector)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleToggleOffline(collector)}
                        className={collector.status === "offline" ? "text-green-600" : "text-yellow-600"}
                      >
                        <Power className="h-4 w-4 mr-2" />
                        {collector.status === "offline" ? "Bring Online" : "Set Offline"}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleSuspendCollector(collector)}
                        className="text-red-600"
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        Suspend Collector
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteCollector(collector)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Collector
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{collector.email}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{collector.phone || "No phone"}</span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="truncate">{collector.address || "No address"}</span>
                </div>
              </div>
              
              {/* Vehicle Info */}
              <div className="bg-gray-50 p-3 rounded-md">
                <h4 className="font-medium text-sm flex items-center">
                  <Truck className="h-4 w-4 mr-2" />
                  Vehicle Details
                </h4>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  <div>
                    <p className="text-gray-600">Type:</p>
                    <p>{collector.vehicleType || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Model:</p>
                    <p>{collector.vehicleModel || "Not specified"}</p>
                  </div>
                </div>
              </div>
              
              {/* Capacity Gauge */}
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span>Truck Capacity</span>
                  <span className="font-medium">
                    {collector.currentLoad || 0}kg / {collector.vehicleCapacity || 0}kg
                  </span>
                </div>
                <Progress 
                  value={collector.capacityPercentage || 0} 
                  className={`h-2 ${getCapacityColor(collector.capacityPercentage || 0)}`} 
                />
                
                {/* Warning for high capacity */}
                {collector.capacityPercentage > 90 && (
                  <div className="flex items-center mt-2 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>Near maximum capacity!</span>
                  </div>
                )}
              </div>
              
              {/* Current Assignment */}
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Current Assignments
                </h4>
                {collector.assignedPickups?.length > 0 ? (
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                    {collector.assignedPickups.map(pickup => (
                      <div key={pickup.id} className="bg-blue-50 p-2 rounded text-xs">
                        <div className="flex justify-between">
                          <span className="font-medium">{pickup.wasteType}</span>
                          <Badge variant="outline">{pickup.status}</Badge>
                        </div>
                        <div className="mt-1 text-gray-600">
                          {pickup.weight}kg from {pickup.industryName}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No current assignments</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t px-6 py-3">
              <div className="flex justify-between w-full">
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  Joined {formatDate(collector.joinedDate)}
                </div>
                <div className="flex items-center text-xs">
                  <FileText className="h-3 w-3 mr-1" />
                  {collector.completedPickups || 0} pickups completed
                </div>
              </div>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <span className={`w-2 h-2 rounded-full mr-1 ${collector.isAvailable ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                Last activity: {formatLastActivity(collector.lastActivity)}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {collectors.length === 0 && (
        <div className="text-center p-12 border rounded-lg bg-gray-50">
          <User className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">No Collectors Found</h3>
          <p className="mt-2 text-gray-600">
            There are no registered collectors in the system.
          </p>
          <Button className="mt-4">Add Your First Collector</Button>
        </div>
      )}
      
      {/* Edit Collector Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Collector Profile</DialogTitle>
            <DialogDescription>
              Update collector information and vehicle details.
            </DialogDescription>
          </DialogHeader>
          
          {editingCollector && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editingCollector.name}
                    onChange={(e) => setEditingCollector({
                      ...editingCollector,
                      name: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editingCollector.email}
                    onChange={(e) => setEditingCollector({
                      ...editingCollector,
                      email: e.target.value
                    })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={editingCollector.phone}
                    onChange={(e) => setEditingCollector({
                      ...editingCollector,
                      phone: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={editingCollector.status}
                    onValueChange={(value) => setEditingCollector({
                      ...editingCollector,
                      status: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="on-duty">On Duty</SelectItem>
                      <SelectItem value="off-duty">Off Duty</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={editingCollector.address}
                  onChange={(e) => setEditingCollector({
                    ...editingCollector,
                    address: e.target.value
                  })}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicleType">Vehicle Type</Label>
                  <Input
                    id="vehicleType"
                    value={editingCollector.vehicleType}
                    onChange={(e) => setEditingCollector({
                      ...editingCollector,
                      vehicleType: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleModel">Vehicle Model</Label>
                  <Input
                    id="vehicleModel"
                    value={editingCollector.vehicleModel}
                    onChange={(e) => setEditingCollector({
                      ...editingCollector,
                      vehicleModel: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleCapacity">Vehicle Capacity (kg)</Label>
                  <Input
                    id="vehicleCapacity"
                    type="number"
                    value={editingCollector.vehicleCapacity}
                    onChange={(e) => setEditingCollector({
                      ...editingCollector,
                      vehicleCapacity: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input
                    id="licenseNumber"
                    value={editingCollector.licenseNumber}
                    onChange={(e) => setEditingCollector({
                      ...editingCollector,
                      licenseNumber: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    value={editingCollector.emergencyContact}
                    onChange={(e) => setEditingCollector({
                      ...editingCollector,
                      emergencyContact: e.target.value
                    })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="workingHours">Working Hours</Label>
                <Input
                  id="workingHours"
                  value={editingCollector.workingHours}
                  onChange={(e) => setEditingCollector({
                    ...editingCollector,
                    workingHours: e.target.value
                  })}
                  placeholder="e.g., 9:00 AM - 5:00 PM"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}