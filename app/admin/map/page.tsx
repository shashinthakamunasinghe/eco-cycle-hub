"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Truck, Package, Navigation, RefreshCw, Users, Target } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminMapPage() {
  const { toast } = useToast()
  const [isTrackingDialogOpen, setIsTrackingDialogOpen] = useState(false)
  const [trackedCollector, setTrackedCollector] = useState<any>(null)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedPickup, setSelectedPickup] = useState<any>(null)
  const [mapCenter, setMapCenter] = useState({ lat: 6.9271, lng: 79.8612 })
  const [mapZoom, setMapZoom] = useState(12)

  const [liveData, setLiveData] = useState({
    activeCollectors: [
      {
        id: "3",
        name: "John Collector",
        location: { lat: 6.9271, lng: 79.8612 },
        status: "on-way",
        assignedPickup: "Green Industries Ltd",
        truckCapacity: 1000,
        currentLoad: 450,
      },
      {
        id: "4",
        name: "Jane Smith",
        location: { lat: 6.9344, lng: 79.8428 },
        status: "available",
        assignedPickup: null,
        truckCapacity: 1500,
        currentLoad: 0,
      },
      {
        id: "5",
        name: "Mike Johnson",
        location: { lat: 6.9147, lng: 79.8731 },
        status: "available",
        assignedPickup: null,
        truckCapacity: 800,
        currentLoad: 200,
      },
    ],
    pendingPickups: [
      {
        id: "1",
        industryName: "Tech Manufacturing",
        location: { lat: 6.9147, lng: 79.8731 },
        wasteType: "Electronic Waste",
        priority: "high",
        weight: 150,
        address: "123 Tech Park, Colombo",
      },
      {
        id: "2",
        industryName: "Eco Solutions",
        location: { lat: 6.92, lng: 79.85 },
        wasteType: "Plastic Waste",
        priority: "medium",
        weight: 200,
        address: "456 Eco Street, Colombo",
      },
      {
        id: "3",
        industryName: "Green Manufacturing",
        location: { lat: 6.9344, lng: 79.8428 },
        wasteType: "Organic Waste",
        priority: "low",
        weight: 300,
        address: "789 Green Ave, Colombo",
      },
    ],
  })

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData((prevData) => ({
        ...prevData,
        activeCollectors: prevData.activeCollectors.map((collector) => ({
          ...collector,
          location: {
            lat: collector.location.lat + (Math.random() - 0.5) * 0.001,
            lng: collector.location.lng + (Math.random() - 0.5) * 0.001,
          },
        })),
      }))
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const trackCollector = (collector: any) => {
    setTrackedCollector(collector)
    setMapCenter(collector.location)
    setMapZoom(15)
    setIsTrackingDialogOpen(true)

    toast({
      title: "Tracking collector",
      description: `Now tracking ${collector.name} on the map.`,
    })
  }

  const assignCollectorToPickup = (pickupId: string, collectorId: string) => {
    const collector = liveData.activeCollectors.find((c) => c.id === collectorId)
    const pickup = liveData.pendingPickups.find((p) => p.id === pickupId)

    if (!collector || !pickup) return

    // Update collector status
    setLiveData((prevData) => ({
      ...prevData,
      activeCollectors: prevData.activeCollectors.map((c) =>
        c.id === collectorId ? { ...c, status: "on-way", assignedPickup: pickup.industryName } : c,
      ),
      pendingPickups: prevData.pendingPickups.filter((p) => p.id !== pickupId),
    }))

    setIsAssignDialogOpen(false)

    toast({
      title: "Collector assigned",
      description: `${collector.name} has been assigned to ${pickup.industryName}.`,
    })
  }

  const openAssignDialog = (pickup: any) => {
    setSelectedPickup(pickup)
    setIsAssignDialogOpen(true)
  }

  const centerOnCollectors = () => {
    if (liveData.activeCollectors.length === 0) return

    const avgLat =
      liveData.activeCollectors.reduce((sum, c) => sum + c.location.lat, 0) / liveData.activeCollectors.length
    const avgLng =
      liveData.activeCollectors.reduce((sum, c) => sum + c.location.lng, 0) / liveData.activeCollectors.length

    setMapCenter({ lat: avgLat, lng: avgLng })
    setMapZoom(13)

    toast({
      title: "Map centered",
      description: "Map centered on all active collectors.",
    })
  }

  const showAllPickups = () => {
    if (liveData.pendingPickups.length === 0) return

    const avgLat = liveData.pendingPickups.reduce((sum, p) => sum + p.location.lat, 0) / liveData.pendingPickups.length
    const avgLng = liveData.pendingPickups.reduce((sum, p) => sum + p.location.lng, 0) / liveData.pendingPickups.length

    setMapCenter({ lat: avgLat, lng: avgLng })
    setMapZoom(12)

    toast({
      title: "Showing all pickups",
      description: "Map updated to show all pending pickup locations.",
    })
  }

  const refreshData = () => {
    // Simulate data refresh
    toast({
      title: "Data refreshed",
      description: "Live tracking data has been updated.",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Live Map View</h1>
        <p className="text-gray-600 mt-2">Real-time tracking of collectors and pickup locations</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Live Tracking Map</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{liveData.activeCollectors.length} Collectors</Badge>
                  <Badge variant="outline">{liveData.pendingPickups.length} Pending</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gray-100 rounded-lg relative overflow-hidden">
                {/* Simulated Google Maps Interface */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
                  {/* Map Controls */}
                  <div className="absolute top-4 right-4 space-y-2">
                    <Button size="sm" variant="outline" className="bg-white">
                      +
                    </Button>
                    <Button size="sm" variant="outline" className="bg-white">
                      -
                    </Button>
                  </div>

                  {/* Collector Markers */}
                  {liveData.activeCollectors.map((collector, index) => (
                    <div
                      key={collector.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                      style={{
                        left: `${20 + index * 25}%`,
                        top: `${30 + index * 15}%`,
                      }}
                      onClick={() => trackCollector(collector)}
                    >
                      <div className="relative">
                        <div
                          className={`w-4 h-4 rounded-full border-2 border-white shadow-lg ${
                            collector.status === "available" ? "bg-green-500" : "bg-blue-500"
                          }`}
                        ></div>
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow text-xs whitespace-nowrap">
                          {collector.name}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Pickup Markers */}
                  {liveData.pendingPickups.map((pickup, index) => (
                    <div
                      key={pickup.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                      style={{
                        left: `${60 + index * 15}%`,
                        top: `${40 + index * 20}%`,
                      }}
                      onClick={() => openAssignDialog(pickup)}
                    >
                      <div className="relative">
                        <div
                          className={`w-4 h-4 rounded-full border-2 border-white shadow-lg ${
                            pickup.priority === "high"
                              ? "bg-red-500"
                              : pickup.priority === "medium"
                                ? "bg-yellow-500"
                                : "bg-orange-500"
                          }`}
                        ></div>
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow text-xs whitespace-nowrap">
                          {pickup.industryName}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Center indicator */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  </div>

                  {/* Map info overlay */}
                  <div className="absolute bottom-4 left-4 bg-white p-2 rounded shadow">
                    <p className="text-xs text-gray-600">
                      Center: {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
                    </p>
                    <p className="text-xs text-gray-600">Zoom: {mapZoom}</p>
                  </div>
                </div>

                {/* Legend */}
                <div className="absolute bottom-4 right-4 bg-white p-3 rounded shadow">
                  <h4 className="text-xs font-medium mb-2">Legend</h4>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-xs">Available Collector</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-xs">Busy Collector</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-xs">High Priority Pickup</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-xs">Medium Priority</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Active Collectors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Truck className="h-5 w-5" />
                <span>Active Collectors</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {liveData.activeCollectors.map((collector) => (
                <div key={collector.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{collector.name}</h4>
                    <Badge variant={collector.status === "on-way" ? "default" : "secondary"}>
                      {collector.status.replace("-", " ")}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>
                        {collector.location.lat.toFixed(4)}, {collector.location.lng.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Truck className="h-3 w-3" />
                      <span>
                        {collector.currentLoad}kg / {collector.truckCapacity}kg
                      </span>
                    </div>
                    {collector.assignedPickup && (
                      <div className="flex items-center space-x-1">
                        <Package className="h-3 w-3" />
                        <span>En route to {collector.assignedPickup}</span>
                      </div>
                    )}
                  </div>

                  {/* Capacity bar */}
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: `${(collector.currentLoad / collector.truckCapacity) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <Button size="sm" variant="outline" className="w-full mt-2" onClick={() => trackCollector(collector)}>
                    <Navigation className="h-3 w-3 mr-1" />
                    Track
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pending Pickups */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Pending Pickups</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {liveData.pendingPickups.map((pickup) => (
                <div key={pickup.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{pickup.industryName}</h4>
                    <Badge variant={pickup.priority === "high" ? "destructive" : "secondary"}>{pickup.priority}</Badge>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center space-x-1">
                      <Package className="h-3 w-3" />
                      <span>
                        {pickup.wasteType} - {pickup.weight}kg
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>
                        {pickup.location.lat.toFixed(4)}, {pickup.location.lng.toFixed(4)}
                      </span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full mt-2" onClick={() => openAssignDialog(pickup)}>
                    Assign Collector
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Map Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Map Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full" onClick={centerOnCollectors}>
                <Users className="h-4 w-4 mr-2" />
                Center on Collectors
              </Button>
              <Button variant="outline" className="w-full" onClick={showAllPickups}>
                <Target className="h-4 w-4 mr-2" />
                Show All Pickups
              </Button>
              <Button variant="outline" className="w-full" onClick={refreshData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tracking Dialog */}
      <Dialog open={isTrackingDialogOpen} onOpenChange={setIsTrackingDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tracking {trackedCollector?.name}</DialogTitle>
          </DialogHeader>
          {trackedCollector && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Current Status</h4>
                  <div className="p-3 border rounded-lg">
                    <Badge variant={trackedCollector.status === "on-way" ? "default" : "secondary"}>
                      {trackedCollector.status.replace("-", " ")}
                    </Badge>
                    {trackedCollector.assignedPickup && (
                      <p className="text-sm mt-2">En route to: {trackedCollector.assignedPickup}</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Vehicle Info</h4>
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm">Capacity: {trackedCollector.truckCapacity}kg</p>
                    <p className="text-sm">Current Load: {trackedCollector.currentLoad}kg</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(trackedCollector.currentLoad / trackedCollector.truckCapacity) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Live Location</h4>
                <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm font-medium">{trackedCollector.name}</p>
                    <p className="text-xs text-gray-500">Lat: {trackedCollector.location.lat.toFixed(6)}</p>
                    <p className="text-xs text-gray-500">Lng: {trackedCollector.location.lng.toFixed(6)}</p>
                    <p className="text-xs text-gray-400 mt-2">Real-time tracking active</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsTrackingDialogOpen(false)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setMapCenter(trackedCollector.location)
                    setMapZoom(16)
                    setIsTrackingDialogOpen(false)
                  }}
                >
                  Center on Map
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Collector Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Collector</DialogTitle>
          </DialogHeader>
          {selectedPickup && (
            <div className="space-y-4 py-4">
              <div>
                <h4 className="font-medium">{selectedPickup.industryName}</h4>
                <p className="text-sm text-gray-600">
                  {selectedPickup.wasteType} - {selectedPickup.weight}kg
                </p>
                <p className="text-sm text-gray-600">{selectedPickup.address}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Select Collector:</label>
                <Select onValueChange={(value) => assignCollectorToPickup(selectedPickup.id, value)}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Choose available collector" />
                  </SelectTrigger>
                  <SelectContent>
                    {liveData.activeCollectors
                      .filter((c) => c.status === "available")
                      .map((collector) => (
                        <SelectItem key={collector.id} value={collector.id}>
                          {collector.name} - {collector.currentLoad}kg/{collector.truckCapacity}kg
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
