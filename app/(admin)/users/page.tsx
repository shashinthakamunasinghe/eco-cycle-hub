"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mockUsers } from "@/lib/mock-data";
import {
  User,
  Mail,
  Calendar,
  Search,
  UserPlus,
  Eye,
  Ban,
  MapPin,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { userService } from "@/lib/firebase-services";
import type { User as UserType } from "@/types";

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const { toast } = useToast();
  const { register } = useFirebaseAuth();

  // State variables
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isConfirmSuspendOpen, setIsConfirmSuspendOpen] = useState(false);
  const [userToSuspend, setUserToSuspend] = useState<UserType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(true);

  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    role: "customer" as "admin" | "industry" | "collector" | "customer",
    password: "",
    phone: "",
    address: "",
  });

  // State for users list - fetch from Firestore
  const [usersList, setUsersList] = useState<UserType[]>([]);

  // Fetch users from Firestore on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setFetchingUsers(true);
        console.log("🔄 Fetching users from Firestore...");
        const users = await userService.getAllUsers();
        console.log("✅ Users fetched successfully:", users.length);
        setUsersList(users);
      } catch (error) {
        console.error("❌ Error fetching users:", error);
        toast({
          title: "Error fetching users",
          description: "Failed to load users from database. Please try again.",
          variant: "destructive",
        });
        // Fallback to mock data if Firestore fails
        setUsersList(mockUsers);
      } finally {
        setFetchingUsers(false);
      }
    };

    fetchUsers();
  }, [toast]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "industry":
        return "bg-blue-100 text-blue-800";
      case "collector":
        return "bg-green-100 text-green-800";
      case "customer":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const suspendUser = (user: UserType) => {
    setUserToSuspend(user);
    setIsConfirmSuspendOpen(true);
  };

  const confirmSuspendUser = async () => {
    if (!userToSuspend) return;

    try {
      setLoading(true);
      const isCurrentlySuspended = userToSuspend.isAvailable === false;
      const action = isCurrentlySuspended ? "reactivating" : "suspending";
      
      console.log(`🔄 ${action} user:`, userToSuspend.id);
      
      // Update user status in Firestore
      const updateData: Partial<UserType> = isCurrentlySuspended 
        ? { isAvailable: true }
        : { isAvailable: false, suspendedAt: new Date() };
      
      await userService.updateUser(userToSuspend.id, updateData);
      
      // Update local state to reflect the change
      setUsersList(usersList.map(user => 
        user.id === userToSuspend.id 
          ? { ...user, ...updateData }
          : user
      ));
      
      setIsConfirmSuspendOpen(false);
      setUserToSuspend(null);

      toast({
        title: isCurrentlySuspended ? "User reactivated" : "User suspended",
        description: isCurrentlySuspended 
          ? `${userToSuspend.name} has been reactivated and can now access the system.`
          : `${userToSuspend.name} has been suspended. Their account is now inactive.`,
        variant: isCurrentlySuspended ? "default" : "destructive",
      });
    } catch (error) {
      console.error(`❌ Error ${userToSuspend.isAvailable === false ? "reactivating" : "suspending"} user:`, error);
      toast({
        title: `Error ${userToSuspend.isAvailable === false ? "reactivating" : "suspending"} user`,
        description: `Failed to ${userToSuspend.isAvailable === false ? "reactivate" : "suspend"} user. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (user: UserType) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setLoading(true);
      console.log("🗑️ Deleting user:", userToDelete.id);
      
      // Delete from Firestore
      await userService.deleteUser(userToDelete.id);
      
      // Update local state
      setUsersList(usersList.filter((u) => u.id !== userToDelete.id));
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      
      toast({
        title: "User deleted",
        description: `${userToDelete.name} has been permanently deleted from the system.`,
        variant: "destructive",
      });
    } catch (error) {
      console.error("❌ Error deleting user:", error);
      toast({
        title: "Error deleting user",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addUser = async () => {
    if (!newUserData.name || !newUserData.email || !newUserData.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create user with Firebase Authentication
      console.log("🔄 Creating new user...", newUserData);

      const newUser = await register(newUserData.email, newUserData.password, {
        name: newUserData.name,
        email: newUserData.email,
        role: newUserData.role,
        phone: newUserData.phone,
        address: newUserData.address,
        createdAt: new Date(),
      });

      // Update local state
      setUsersList([...usersList, newUser]);
      setIsAddUserDialogOpen(false);
      setNewUserData({
        name: "",
        email: "",
        role: "customer",
        password: "",
        phone: "",
        address: "",
      });

      toast({
        title: "User added successfully",
        description: `${newUserData.name} has been created with role: ${newUserData.role}`,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error creating user",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const viewUserDetails = (user: UserType) => {
    setCurrentUser(user);
    setIsViewDialogOpen(true);
  };

  const filteredUsers = usersList.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const userStats = {
    total: usersList.length,
    admin: usersList.filter((u) => u.role === "admin").length,
    industry: usersList.filter((u) => u.role === "industry").length,
    collector: usersList.filter((u) => u.role === "collector").length,
    customer: usersList.filter((u) => u.role === "customer").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">
            Manage platform users and their roles
          </p>
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
            <div className="text-2xl font-bold">
              {fetchingUsers ? "..." : userStats.total}
            </div>
            <div className="text-sm text-gray-600">Total Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {fetchingUsers ? "..." : userStats.admin}
            </div>
            <div className="text-sm text-gray-600">Admins</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {fetchingUsers ? "..." : userStats.industry}
            </div>
            <div className="text-sm text-gray-600">Industries</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {fetchingUsers ? "..." : userStats.collector}
            </div>
            <div className="text-sm text-gray-600">Collectors</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {fetchingUsers ? "..." : userStats.customer}
            </div>
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
        {fetchingUsers ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading users...</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={user.avatar || "/placeholder.svg"}
                      alt={user.name}
                    />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold">{user.name}</h3>
                      <Badge className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                      {user.isAvailable === false && (
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          Suspended
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Joined {user.createdAt instanceof Date ? user.createdAt.toLocaleDateString() : 'Unknown'}
                        </span>
                      </div>
                      {user.location && (
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>
                            Location: {user.location.lat.toFixed(4)},{" "}
                            {user.location.lng.toFixed(4)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => viewUserDetails(user)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant={user.isAvailable === false ? "default" : "destructive"}
                    onClick={() => suspendUser(user)}
                  >
                    <Ban className="h-4 w-4 mr-1" />
                    {user.isAvailable === false ? "Reactivate" : "Suspend"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteUser(user)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          ))
        )}
      </div>

      {!fetchingUsers && filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            No users found matching your criteria.
          </p>
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
                  <AvatarImage
                    src={currentUser.avatar || "/placeholder.svg"}
                    alt={currentUser.name}
                  />
                  <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{currentUser.name}</h3>
                  <Badge className={getRoleColor(currentUser.role)}>
                    {currentUser.role}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Contact Information
                  </h4>
                  <div className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">{currentUser.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">
                        Joined {currentUser.createdAt instanceof Date ? currentUser.createdAt.toLocaleDateString() : 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Account Information
                  </h4>
                  <div className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span className="text-sm">Role: {currentUser.role}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">
                        Status: {currentUser.isAvailable === false ? "Suspended" : "Active"}
                      </span>
                    </div>
                    {currentUser.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">
                          Location: {currentUser.location.lat.toFixed(4)},{" "}
                          {currentUser.location.lng.toFixed(4)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Activity Summary
                </h4>
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
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Close
                </Button>
                <Button
                  variant={currentUser.isAvailable === false ? "default" : "destructive"}
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    suspendUser(currentUser);
                  }}
                >
                  {currentUser.isAvailable === false ? "Reactivate User" : "Suspend User"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Suspend Dialog */}
      <Dialog
        open={isConfirmSuspendOpen}
        onOpenChange={setIsConfirmSuspendOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {userToSuspend?.isAvailable === false ? "Confirm Reactivate User" : "Confirm Suspend User"}
            </DialogTitle>
          </DialogHeader>
          {userToSuspend && (
            <div className="py-4">
              <p className="mb-4">
                {userToSuspend.isAvailable === false ? (
                  <>
                    Are you sure you want to reactivate{" "}
                    <span className="font-semibold">{userToSuspend.name}</span>?
                    This will restore their access to the system.
                  </>
                ) : (
                  <>
                    Are you sure you want to suspend{" "}
                    <span className="font-semibold">{userToSuspend.name}</span>?
                    This will deactivate their account and prevent them from accessing the system.
                  </>
                )}
              </p>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsConfirmSuspendOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  variant={userToSuspend.isAvailable === false ? "default" : "destructive"} 
                  onClick={confirmSuspendUser} 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {userToSuspend.isAvailable === false ? "Reactivating..." : "Suspending..."}
                    </>
                  ) : (
                    userToSuspend.isAvailable === false ? "Reactivate User" : "Suspend User"
                  )}
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
                onChange={(e) =>
                  setNewUserData({ ...newUserData, name: e.target.value })
                }
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={newUserData.email}
                onChange={(e) =>
                  setNewUserData({ ...newUserData, email: e.target.value })
                }
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select
                value={newUserData.role}
                onValueChange={(
                  value: "admin" | "industry" | "collector"
                ) => setNewUserData({ ...newUserData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="industry">Industry</SelectItem>
                  <SelectItem value="collector">Collector</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={newUserData.password}
                onChange={(e) =>
                  setNewUserData({ ...newUserData, password: e.target.value })
                }
                placeholder="Enter password (min. 6 characters)"
                minLength={6}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={newUserData.phone}
                onChange={(e) =>
                  setNewUserData({ ...newUserData, phone: e.target.value })
                }
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <Label htmlFor="address">Address (Optional)</Label>
              <Input
                id="address"
                value={newUserData.address}
                onChange={(e) =>
                  setNewUserData({ ...newUserData, address: e.target.value })
                }
                placeholder="Enter address"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddUserDialogOpen(false);
                  setNewUserData({
                    name: "",
                    email: "",
                    role: "customer",
                    password: "",
                    phone: "",
                    address: "",
                  });
                }}
              >
                Cancel
              </Button>
              <Button onClick={addUser} disabled={loading}>
                {loading ? "Creating..." : "Add User"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Delete User</DialogTitle>
          </DialogHeader>
          {userToDelete && (
            <div className="py-4">
              <div className="flex items-center space-x-3 mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                <Trash2 className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-800">Permanent Deletion</p>
                  <p className="text-sm text-red-600">This action cannot be undone</p>
                </div>
              </div>
              <p className="mb-4">
                Are you sure you want to permanently delete{" "}
                <span className="font-semibold">{userToDelete.name}</span>? All associated data will be removed
                from the system.
              </p>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDeleteUser} disabled={loading}>
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Permanently
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
