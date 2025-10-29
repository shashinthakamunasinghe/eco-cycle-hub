"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, Package, Users, DollarSign, Truck } from "lucide-react"

export default function AdminAnalyticsPage() {
  const analyticsData = {
    overview: {
      totalRevenue: 45670,
      revenueChange: 12.5,
      totalPickups: 1247,
      pickupsChange: 8.3,
      totalOrders: 892,
      ordersChange: -2.1,
      activeUsers: 2341,
      usersChange: 15.7,
    },
    wasteCollection: {
      totalWaste: 15600, // kg
      organicWaste: 6240,
      plasticWaste: 4680,
      metalWaste: 2340,
      electronicWaste: 1560,
      otherWaste: 780,
    },
    topIndustries: [
      { name: "Green Industries Ltd", pickups: 45, waste: 2340 },
      { name: "Eco Manufacturing", pickups: 38, waste: 1980 },
      { name: "Tech Solutions", pickups: 32, waste: 1560 },
      { name: "Clean Corp", pickups: 28, waste: 1340 },
    ],
    topProducts: [
      { name: "Organic Compost Fertilizer", sales: 234, revenue: 6084 },
      { name: "Bio-Degradable Plant Pots", sales: 189, revenue: 2454 },
      { name: "Recycled Paper Mulch", sales: 156, revenue: 2962 },
      { name: "Garden Tools Set", sales: 98, revenue: 2940 },
    ],
  }

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Comprehensive insights into platform performance</p>
        </div>
        <Select defaultValue="30days">
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

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analyticsData.overview.totalRevenue.toLocaleString()}</div>
            <div className={`flex items-center text-xs ${getChangeColor(analyticsData.overview.revenueChange)}`}>
              {getChangeIcon(analyticsData.overview.revenueChange)}
              <span className="ml-1">{Math.abs(analyticsData.overview.revenueChange)}% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pickups</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalPickups.toLocaleString()}</div>
            <div className={`flex items-center text-xs ${getChangeColor(analyticsData.overview.pickupsChange)}`}>
              {getChangeIcon(analyticsData.overview.pickupsChange)}
              <span className="ml-1">{Math.abs(analyticsData.overview.pickupsChange)}% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalOrders.toLocaleString()}</div>
            <div className={`flex items-center text-xs ${getChangeColor(analyticsData.overview.ordersChange)}`}>
              {getChangeIcon(analyticsData.overview.ordersChange)}
              <span className="ml-1">{Math.abs(analyticsData.overview.ordersChange)}% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.activeUsers.toLocaleString()}</div>
            <div className={`flex items-center text-xs ${getChangeColor(analyticsData.overview.usersChange)}`}>
              {getChangeIcon(analyticsData.overview.usersChange)}
              <span className="ml-1">{Math.abs(analyticsData.overview.usersChange)}% from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Waste Collection Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Waste Collection Breakdown</CardTitle>
            <CardDescription>Total waste collected: {analyticsData.wasteCollection.totalWaste}kg</CardDescription>
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
                        width: `${(analyticsData.wasteCollection.organicWaste / analyticsData.wasteCollection.totalWaste) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{analyticsData.wasteCollection.organicWaste}kg</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Plastic Waste</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(analyticsData.wasteCollection.plasticWaste / analyticsData.wasteCollection.totalWaste) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{analyticsData.wasteCollection.plasticWaste}kg</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Metal Waste</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-600 h-2 rounded-full"
                      style={{
                        width: `${(analyticsData.wasteCollection.metalWaste / analyticsData.wasteCollection.totalWaste) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{analyticsData.wasteCollection.metalWaste}kg</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Electronic Waste</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{
                        width: `${(analyticsData.wasteCollection.electronicWaste / analyticsData.wasteCollection.totalWaste) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{analyticsData.wasteCollection.electronicWaste}kg</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Other Waste</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gray-600 h-2 rounded-full"
                      style={{
                        width: `${(analyticsData.wasteCollection.otherWaste / analyticsData.wasteCollection.totalWaste) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{analyticsData.wasteCollection.otherWaste}kg</span>
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
              {analyticsData.topIndustries.map((industry, index) => (
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
              ))}
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
              {analyticsData.topProducts.map((product, index) => (
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
              ))}
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
                  <span className="font-medium">94.2%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: "94.2%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Customer Satisfaction</span>
                  <span className="font-medium">4.8/5.0</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: "96%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Order Fulfillment Rate</span>
                  <span className="font-medium">98.7%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: "98.7%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Collector Utilization</span>
                  <span className="font-medium">87.3%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{ width: "87.3%" }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
