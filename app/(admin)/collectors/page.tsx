"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { mockCollectors } from "@/lib/mock-data"
import { Truck, MapPin, Phone, Mail, Search, UserPlus, Eye, Ban } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminCollectorsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [viewCollector, setViewCollector] = useState<any>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [collectorToBlock, setCollectorToBlock] = useState<any>(null)

  const [newCollector, setNewCollector] = useState({
    name: "",
    email: "",
    phone: "",
    truckCapacity: "",
    password: "",
    confirmPassword: "",
  })

  // Extended mock collectors
  const [collectors, setCollectors] = useState([
    ...mockCollectors,
    {
      id: "4",
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+94771234568",
      isAvailable: false,
      currentLocation: { lat: 6.9344, lng: 79.8428 },
      truckCapacity: 1500,
      currentLoad: 800,
      assignedRequests: ["2", "3"],
    },
    {
      id: "5",
      name: "Mike Johnson",
      email: "mike@example.com",
      phone: "+94771234569",
      isAvailable: true,
      currentLocation: { lat: 6.9147, lng: 79.8731 },
      truckCapacity: 800,
      currentLoad: 0,
      assignedRequests: [],
    },
  ])

  const toggleAvailability = (collectorId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus
    setCollectors(
      collectors.map((collector) =>
        collector.id === collectorId ? { ...collector, isAvailable: newStatus } : collector,
      ),
    )
    toast({
      title: "Availability updated",
      description: `Collector is now ${newStatus ? "available" : "offline"}.`,
    })
  }

  const handleAddCollector = () => {
    if (newCollector.password !== newCollector.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      })
      return
    }

    if (!newCollector.name || !newCollector.email || !newCollector.phone || !newCollector.truckCapacity) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const newCollectorObj = {
      id: (collectors.length + 1).toString(),
      name: newCollector.name,
      email: newCollector.email,
      phone: newCollector.phone,
      isAvailable: true,
      currentLocation: { lat: 6.9271, lng: 79.8612 },
      truckCapacity: Number.parseInt(newCollector.truckCapacity),
      currentLoad: 0,
      assignedRequests: [],
    }

    setCollectors([...collectors, newCollectorObj])
    setIsAddDialogOpen(false)
    setNewCollector({
      name: "",
      email: "",
      phone: "",
      truckCapacity: "",
      password: "",
      confirmPassword: "",
    })

    toast({
      title: "Collector added",
      description: `${newCollector.name} has been registered as a collector.`,
    })
  }

  const handleViewCollector = (collector: any) => {
    setViewCollector(collector)
    setIsViewDialogOpen(true)
  }

  const handleBlockCollector = (collector: any) => {
    setCollectorToBlock(collector)
    setIsConfirmDialogOpen(true)
  }

  const confirmBlockCollector = () => {
    setCollectors(collectors.filter((c) => c.id !== collectorToBlock.id))
    setIsConfirmDialogOpen(false)
    toast({
      title: "Collector blocked",
      description: `${collectorToBlock.name} has been blocked and removed from the system.`,
      variant: "destructive",
    })
  }

  const filteredCollectors = collectors.filter(
    (collector) =>
      collector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collector.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Collector Management</h1>
          <p className="text-gray-600 mt-2">Manage waste collectors and their assignments</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Collector
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Register New Collector</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newCollector.name}
                  onChange={(e) => setNewCollector((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter collector's full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newCollector.email}
                  onChange={(e) => setNewCollector((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={newCollector.phone}
                  onChange={(e) => setNewCollector((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="truckCapacity">Truck Capacity (kg)</Label>
                <Input
                  id="truckCapacity"
                  type="number"
                  value={newCollector.truckCapacity}
                  onChange={(e) => setNewCollector((prev) => ({ ...prev, truckCapacity: e.target.value }))}
                  placeholder="Enter truck capacity in kg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newCollector.password}
                  onChange={(e) => setNewCollector((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Create password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={newCollector.confirmPassword}
                  onChange={(e) => setNewCollector((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm password"
                />
              </div>
              <Button onClick={handleAddCollector} className="w-full mt-4">
                Register Collector
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search collectors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collectors</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collectors.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Truck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{collectors.filter((c) => c.isAvailable).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline</CardTitle>
            <Truck className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{collectors.filter((c) => !c.isAvailable).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
            <MapPin className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {collectors.reduce((sum, c) => sum + c.assignedRequests.length, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCollectors.map((collector) => (
          <Card key={collector.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="/placeholder.svg" alt={collector.name} />
                  <AvatarFallback>
                    {collector.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold truncate">{collector.name}</h3>
                    <Badge variant={collector.isAvailable ? "default" : "secondary"}>
                      {collector.isAvailable ? "Available" : "Offline"}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{collector.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>{collector.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Truck className="h-4 w-4" />
                      <span>
                        {collector.currentLoad}kg / {collector.truckCapacity}kg
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{collector.assignedRequests.length} active pickup(s)</span>
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Truck Capacity</span>
                      <span>{Math.round((collector.currentLoad / collector.truckCapacity) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${(collector.currentLoad / collector.truckCapacity) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex space-x-2 mt-4">
                    <Button
                      size="sm"
                      variant={collector.isAvailable ? "destructive" : "default"}
                      onClick={() => toggleAvailability(collector.id, collector.isAvailable)}
                      className="flex-1"
                    >
                      {collector.isAvailable ? "Set Offline" : "Set Available"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleViewCollector(collector)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleBlockCollector(collector)}>
                      <Ban className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCollectors.length === 0 && (
        <div className="text-center py-12">
          <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No collectors found matching your search.</p>
        </div>
      )}

      {/* View Collector Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Collector Details</DialogTitle>
          </DialogHeader>
          {viewCollector && (
            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="assignments">Assignments</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="space-y-4 py-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="/placeholder.svg" alt={viewCollector.name} />
                    <AvatarFallback>
                      {viewCollector.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{viewCollector.name}</h3>
                    <Badge variant={viewCollector.isAvailable ? "default" : "secondary"}>
                      {viewCollector.isAvailable ? "Available" : "Offline"}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Contact Information</h4>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{viewCollector.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{viewCollector.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Vehicle Information</h4>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Truck className="h-4 w-4 text-gray-500" />
                        <span>Capacity: {viewCollector.truckCapacity}kg</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>
                          Current Load: {viewCollector.currentLoad}kg (
                          {Math.round((viewCollector.currentLoad / viewCollector.truckCapacity) * 100)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Current Location</h4>
                  <div className="mt-2 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        Lat: {viewCollector.currentLocation.lat}, Lng: {viewCollector.currentLocation.lng}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                    Close
                  </Button>
                  <Button
                    variant={viewCollector.isAvailable ? "destructive" : "default"}
                    onClick={() => {
                      toggleAvailability(viewCollector.id, viewCollector.isAvailable)
                      setViewCollector({
                        ...viewCollector,
                        isAvailable: !viewCollector.isAvailable,
                      })
                    }}
                  >
                    {viewCollector.isAvailable ? "Set Offline" : "Set Available"}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="assignments">
                <div className="py-4">
                  <h3 className="text-lg font-medium mb-4">Current Assignments</h3>
                  {viewCollector.assignedRequests.length > 0 ? (
                    <div className="space-y-4">
                      {viewCollector.assignedRequests.map((requestId: string) => (
                        <Card key={requestId}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium">Pickup #{requestId}</h4>
                                <p className="text-sm text-gray-500">Assigned on: Today</p>
                              </div>
                              <Button size="sm" variant="outline">
                                View Details
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No active assignments</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="history">
                <div className="py-4">
                  <h3 className="text-lg font-medium mb-4">Pickup History</h3>
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">Pickup #2</h4>
                            <p className="text-sm text-gray-500">Completed: Yesterday</p>
                            <Badge className="mt-2 bg-green-100 text-green-800">Completed</Badge>
                          </div>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Block Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Block Collector</DialogTitle>
          </DialogHeader>
          {collectorToBlock && (
            <div className="py-4">
              <p className="mb-4">
                Are you sure you want to block <span className="font-semibold">{collectorToBlock.name}</span>? This
                action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmBlockCollector}>
                  Block Collector
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
