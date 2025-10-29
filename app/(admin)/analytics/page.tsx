"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, Package, Users, DollarSign, Truck, RefreshCw, X, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    revenueChange: number;
    totalPickups: number;
    pickupsChange: number;
    totalOrders: number;
    ordersChange: number;
    activeUsers: number;
    usersChange: number;
  };
  wasteCollection: {
    totalWaste: number;
    organicWaste: number;
    plasticWaste: number;
    metalWaste: number;
    paperWaste: number;
    electronicWaste: number;
    chemicalWaste: number;
    mixedWaste: number;
  };
  topIndustries: Array<{
    name: string;
    pickups: number;
    waste: number;
  }>;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  period: string;
}

interface PerformanceMetrics {
  pickupSuccessRate: number;
  customerSatisfaction: number;
  orderFulfillmentRate: number;
  collectorUtilization: number;
  period: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLogin?: Date;
  createdAt?: Date;
  isActive: boolean;
}

export default function AdminAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30days');
  const [showUsersModal, setShowUsersModal] = useState(false);

  const fetchAnalyticsData = async (period: string = selectedPeriod) => {
    try {
      setLoading(true);
      setError(null);
      
      const [analyticsResponse, performanceResponse] = await Promise.all([
        fetch(`/api/admin/analytics?period=${period}`),
        fetch(`/api/admin/performance-metrics?period=${period}`)
      ]);
      
      if (!analyticsResponse.ok) {
        throw new Error(`Failed to fetch analytics data: ${analyticsResponse.status}`);
      }
      
      if (!performanceResponse.ok) {
        throw new Error(`Failed to fetch performance metrics: ${performanceResponse.status}`);
      }
      
      const [analyticsData, performanceData] = await Promise.all([
        analyticsResponse.json(),
        performanceResponse.json()
      ]);
      
      setAnalyticsData(analyticsData);
      setPerformanceMetrics(performanceData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Error fetching analytics data: ${errorMessage}`);
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersData = async () => {
    try {
      setUsersLoading(true);
      const response = await fetch('/api/admin/users');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users data: ${response.status}`);
      }
      
      const usersData = await response.json();
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users data:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    fetchAnalyticsData(period);
  };

  const refreshData = () => {
    fetchAnalyticsData(selectedPeriod);
  };

  const handleViewUsers = () => {
    setShowUsersModal(true);
    if (users.length === 0) {
      fetchUsersData();
    }
  };

  // Default data while loading or if there's an error
  const defaultData: AnalyticsData = {
    overview: {
      totalRevenue: 0,
      revenueChange: 0,
      totalPickups: 0,
      pickupsChange: 0,
      totalOrders: 0,
      ordersChange: 0,
      activeUsers: 0,
      usersChange: 0,
    },
    wasteCollection: {
      totalWaste: 0,
      organicWaste: 0,
      plasticWaste: 0,
      metalWaste: 0,
      paperWaste: 0,
      electronicWaste: 0,
      chemicalWaste: 0,
      mixedWaste: 0,
    },
    topIndustries: [],
    topProducts: [],
    period: selectedPeriod
  };

  const defaultPerformanceMetrics: PerformanceMetrics = {
    pickupSuccessRate: 0,
    customerSatisfaction: 0,
    orderFulfillmentRate: 0,
    collectorUtilization: 0,
    period: selectedPeriod
  };

  const currentData = analyticsData || defaultData;
  const currentPerformanceMetrics = performanceMetrics || defaultPerformanceMetrics;

  const getChangeIcon = (change: number) => {
    return change >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    )
  }

  const getChangeColor = (change: number) => {
    return change >= 0 ? "text-green-600" : "text-red-600"
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'collector':
        return 'default';
      case 'industry':
        return 'secondary';
      default:
        return 'outline';
    }
  }

  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Comprehensive insights into platform performance</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={refreshData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2">Loading analytics data...</span>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${currentData.overview.totalRevenue.toLocaleString()}</div>
            <div className={`flex items-center text-xs ${getChangeColor(currentData.overview.revenueChange)}`}>
              {getChangeIcon(currentData.overview.revenueChange)}
              <span className="ml-1">{Math.abs(currentData.overview.revenueChange)}% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pickups</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentData.overview.totalPickups.toLocaleString()}</div>
            <div className={`flex items-center text-xs ${getChangeColor(currentData.overview.pickupsChange)}`}>
              {getChangeIcon(currentData.overview.pickupsChange)}
              <span className="ml-1">{Math.abs(currentData.overview.pickupsChange)}% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentData.overview.totalOrders.toLocaleString()}</div>
            <div className={`flex items-center text-xs ${getChangeColor(currentData.overview.ordersChange)}`}>
              {getChangeIcon(currentData.overview.ordersChange)}
              <span className="ml-1">{Math.abs(currentData.overview.ordersChange)}% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleViewUsers}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <Eye className="h-3 w-3 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentData.overview.activeUsers.toLocaleString()}</div>
            <div className={`flex items-center text-xs ${getChangeColor(currentData.overview.usersChange)}`}>
              {getChangeIcon(currentData.overview.usersChange)}
              <span className="ml-1">{Math.abs(currentData.overview.usersChange)}% from last month</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Click to view all users</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Waste Collection Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Waste Collection Breakdown</CardTitle>
            <CardDescription>Total waste collected: {currentData.wasteCollection.totalWaste}kg</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Organic Waste</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: currentData.wasteCollection.totalWaste > 0 
                          ? `${(currentData.wasteCollection.organicWaste / currentData.wasteCollection.totalWaste) * 100}%`
                          : '0%',
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{currentData.wasteCollection.organicWaste}kg</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Plastic Waste</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: currentData.wasteCollection.totalWaste > 0 
                          ? `${(currentData.wasteCollection.plasticWaste / currentData.wasteCollection.totalWaste) * 100}%`
                          : '0%',
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{currentData.wasteCollection.plasticWaste}kg</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Metal Waste</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-600 h-2 rounded-full"
                      style={{
                        width: currentData.wasteCollection.totalWaste > 0 
                          ? `${(currentData.wasteCollection.metalWaste / currentData.wasteCollection.totalWaste) * 100}%`
                          : '0%',
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{currentData.wasteCollection.metalWaste}kg</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Paper Waste</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-600 h-2 rounded-full"
                      style={{
                        width: currentData.wasteCollection.totalWaste > 0 
                          ? `${(currentData.wasteCollection.paperWaste / currentData.wasteCollection.totalWaste) * 100}%`
                          : '0%',
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{currentData.wasteCollection.paperWaste}kg</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Electronic Waste</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{
                        width: currentData.wasteCollection.totalWaste > 0 
                          ? `${(currentData.wasteCollection.electronicWaste / currentData.wasteCollection.totalWaste) * 100}%`
                          : '0%',
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{currentData.wasteCollection.electronicWaste}kg</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Chemical Waste</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full"
                      style={{
                        width: currentData.wasteCollection.totalWaste > 0 
                          ? `${(currentData.wasteCollection.chemicalWaste / currentData.wasteCollection.totalWaste) * 100}%`
                          : '0%',
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{currentData.wasteCollection.chemicalWaste}kg</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Mixed Waste</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gray-600 h-2 rounded-full"
                      style={{
                        width: currentData.wasteCollection.totalWaste > 0 
                          ? `${(currentData.wasteCollection.mixedWaste / currentData.wasteCollection.totalWaste) * 100}%`
                          : '0%',
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{currentData.wasteCollection.mixedWaste}kg</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Industries */}
        <Card>
          <CardHeader>
            <CardTitle>Top Industries</CardTitle>
            <CardDescription>Most active waste generators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentData.topIndustries.length > 0 ? (
                currentData.topIndustries.map((industry, index) => (
                  <div key={industry.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium">{industry.name}</div>
                        <div className="text-sm text-gray-500">{industry.pickups} pickups</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{industry.waste}kg</div>
                      <div className="text-sm text-gray-500">waste collected</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No industry data available for the selected period
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>Best performing products in the marketplace</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentData.topProducts.length > 0 ? (
                currentData.topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-green-600">{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.sales} units sold</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${product.revenue}</div>
                      <div className="text-sm text-gray-500">revenue</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No product data available for the selected period
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Pickup Success Rate</span>
                  <span className="font-medium">{currentPerformanceMetrics.pickupSuccessRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${currentPerformanceMetrics.pickupSuccessRate}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Customer Satisfaction</span>
                  <span className="font-medium">{currentPerformanceMetrics.customerSatisfaction}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${currentPerformanceMetrics.customerSatisfaction}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Order Fulfillment Rate</span>
                  <span className="font-medium">{currentPerformanceMetrics.orderFulfillmentRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${currentPerformanceMetrics.orderFulfillmentRate}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Collector Utilization</span>
                  <span className="font-medium">{currentPerformanceMetrics.collectorUtilization}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${currentPerformanceMetrics.collectorUtilization}%` }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Modal */}
      <Dialog open={showUsersModal} onOpenChange={setShowUsersModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>All Users</DialogTitle>
            <DialogDescription>
              Complete list of users in the system with their activity status
            </DialogDescription>
          </DialogHeader>
          
          {usersLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-2">Loading users...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {users.filter(u => u.isActive).length}
                  </div>
                  <div className="text-sm text-gray-600">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {users.filter(u => u.role === 'customer').length}
                  </div>
                  <div className="text-sm text-gray-600">Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {users.filter(u => u.role === 'collector').length}
                  </div>
                  <div className="text-sm text-gray-600">Collectors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {users.filter(u => u.role === 'industry').length}
                  </div>
                  <div className="text-sm text-gray-600">Industries</div>
                </div>
              </div>

              {/* Users List */}
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-4 p-3 bg-gray-100 rounded font-medium text-sm">
                  <div className="col-span-3">Name</div>
                  <div className="col-span-3">Email</div>
                  <div className="col-span-2">Role</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2">Last Login</div>
                </div>
                
                {users.length > 0 ? (
                  users.map((user) => (
                    <div key={user.id} className="grid grid-cols-12 gap-4 p-3 border rounded hover:bg-gray-50">
                      <div className="col-span-3 font-medium">{user.name}</div>
                      <div className="col-span-3 text-sm text-gray-600">{user.email}</div>
                      <div className="col-span-2">
                        <Badge variant={getRoleColor(user.role)}>
                          {formatRole(user.role)}
                        </Badge>
                      </div>
                      <div className="col-span-2">
                        <Badge variant={user.isActive ? 'default' : 'secondary'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="col-span-2 text-sm text-gray-600">
                        {user.lastLogin ? 
                          user.lastLogin.toLocaleDateString() + ' ' + user.lastLogin.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
                          : 'Never'
                        }
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No users found
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
