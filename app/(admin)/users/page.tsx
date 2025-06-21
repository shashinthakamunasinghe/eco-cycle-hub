"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { mockUsers } from "@/lib/mock-data"
import { User, Mail, Calendar, Search, UserPlus, Eye, Ban, MapPin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const { toast } = useToast()

  // Add these state variables after the existing useState declarations
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isConfirmSuspendOpen, setIsConfirmSuspendOpen] = useState(false)
  const [userToSuspend, setUserToSuspend] = useState<any>(null)

  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false)
  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    role: "customer",
    password: "",
  })

  // Add state for users list
  const [usersList, setUsersList] = useState([
    ...mockUsers,
    {
      id: "6",
      email: "customer2@example.com",
      name: "Alice Brown",
      role: "customer" as const,
      createdAt: new Date(Date.now() - 604800000),
    },
    {
      id: "7",
      email: "industry2@example.com",
      name: "Tech Manufacturing Ltd",
      role: "industry" as const,
      location: { lat: 6.9147, lng: 79.8731 },
      createdAt: new Date(Date.now() - 1209600000),
    },
  ])

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800"
      case "industry":
        return "bg-blue-100 text-blue-800"
      case "collector":
        return "bg-green-100 text-green-800"
      case "customer":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const suspendUser = (user: any) => {
    setUserToSuspend(user)
    setIsConfirmSuspendOpen(true)
  }

  const confirmSuspendUser = () => {
    if (!userToSuspend) return

    setUsersList(usersList.filter((u) => u.id !== userToSuspend.id))
    setIsConfirmSuspendOpen(false)

    toast({
      title: "User suspended",
      description: `${userToSuspend.name} has been suspended and removed from the system.`,
      variant: "destructive",
    })
  }

  const addUser = () => {
    if (!newUserData.name || !newUserData.email || !newUserData.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const newUser = {
      id: (usersList.length + 1).toString(),
      name: newUserData.name,
      email: newUserData.email,
      role: newUserData.role as any,
      createdAt: new Date(),
      avatar: "/placeholder.svg",
    }

    setUsersList([...usersList, newUser])
    setIsAddUserDialogOpen(false)
    setNewUserData({ name: "", email: "", role: "customer", password: "" })

    toast({
      title: "User added",
      description: `${newUserData.name} has been added successfully.`,
    })
  }

  const viewUserDetails = (user: any) => {
    setCurrentUser(user)
    setIsViewDialogOpen(true)
  }

  const filteredUsers = usersList.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const userStats = {
    total: usersList.length,
    admin: usersList.filter((u) => u.role === "admin").length,
    industry: usersList.filter((u) => u.role === "industry").length,
    collector: usersList.filter((u) => u.role === "collector").length,
    customer: usersList.filter((u) => u.role === "customer").length,
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage platform users and their roles</p>
        </div>
        <Button onClick={() => setIsAddUserDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{userStats.total}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{userStats.admin}</div>
            <div className="text-sm text-gray-600">Admins</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{userStats.industry}</div>
            <div className="text-sm text-gray-600">Industries</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{userStats.collector}</div>
            <div className="text-sm text-gray-600">Collectors</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{userStats.customer}</div>
            <div className="text-sm text-gray-600">Customers</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="industry">Industry</SelectItem>
            <SelectItem value="collector">Collector</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold">{user.name}</h3>
                      <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Joined {user.createdAt.toLocaleDateString()}</span>
                      </div>
                      {user.location && (
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>
                            Location: {user.location.lat.toFixed(4)}, {user.location.lng.toFixed(4)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => viewUserDetails(user)}>
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => suspendUser(user)}>
                    <Ban className="h-4 w-4 mr-1" />
                    Suspend
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No users found matching your criteria.</p>
        </div>
      )}

      {/* View User Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {currentUser && (
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                  <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{currentUser.name}</h3>
                  <Badge className={getRoleColor(currentUser.role)}>{currentUser.role}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Contact Information</h4>
                  <div className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">{currentUser.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Joined {currentUser.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Account Information</h4>
                  <div className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span className="text-sm">Role: {currentUser.role}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">Status: Active</span>
                    </div>
                    {currentUser.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">
                          Location: {currentUser.location.lat.toFixed(4)}, {currentUser.location.lng.toFixed(4)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Activity Summary</h4>
                <div className="p-3 border rounded-lg">
                  {currentUser.role === "customer" && (
                    <div className="space-y-1">
                      <p className="text-sm">Total Orders: 12</p>
                      <p className="text-sm">Total Spent: $456.78</p>
                      <p className="text-sm">Last Order: 3 days ago</p>
                    </div>
                  )}
                  {currentUser.role === "industry" && (
                    <div className="space-y-1">
                      <p className="text-sm">Total Pickup Requests: 25</p>
                      <p className="text-sm">Total Waste Collected: 2,450kg</p>
                      <p className="text-sm">Last Request: 1 day ago</p>
                    </div>
                  )}
                  {currentUser.role === "collector" && (
                    <div className="space-y-1">
                      <p className="text-sm">Total Pickups: 45</p>
                      <p className="text-sm">Total Waste Collected: 5,200kg</p>
                      <p className="text-sm">Current Status: Available</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setIsViewDialogOpen(false)
                    suspendUser(currentUser)
                  }}
                >
                  Suspend User
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Suspend Dialog */}
      <Dialog open={isConfirmSuspendOpen} onOpenChange={setIsConfirmSuspendOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Suspend User</DialogTitle>
          </DialogHeader>
          {userToSuspend && (
            <div className="py-4">
              <p className="mb-4">
                Are you sure you want to suspend <span className="font-semibold">{userToSuspend.name}</span>? This
                action will remove them from the system.
              </p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsConfirmSuspendOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmSuspendUser}>
                  Suspend User
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={newUserData.name}
                onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={newUserData.email}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select
                value={newUserData.role}
                onValueChange={(value) => setNewUserData({ ...newUserData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="industry">Industry</SelectItem>
                  <SelectItem value="collector">Collector</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={newUserData.password}
                onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                placeholder="Enter password"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addUser}>Add User</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
