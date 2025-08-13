"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Truck, Package, ShoppingCart, TrendingUp, AlertTriangle, Clock, MapPin } from "lucide-react"
import Link from "next/link"

interface AdminStats {
  totalUsers: number;
  usersByRole: {
    admin: number;
    industry: number;
    collector: number;
    customer: number;
  };
  availableCollectors?: number;
  pendingPickups?: number;
}

// Animated Counter Component
interface AnimatedCounterProps {
  end: number;
  duration?: number;
  isLoading?: boolean;
  prefix?: string;
  suffix?: string;
  className?: string;
  delay?: number;
}

function AnimatedCounter({ end, duration = 2000, isLoading, prefix = "", suffix = "", className = "text-2xl font-bold", delay = 0 }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      // Show a pulsing animation while loading
      setCount(0);
      return;
    }

    const startAnimation = () => {
      const animate = (timestamp: number) => {
        if (!startTimeRef.current) {
          startTimeRef.current = timestamp;
        }

        const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentCount = Math.floor(easeOutQuart * end);

        setCount(currentCount);
        countRef.current = currentCount;

        if (progress < 1) {
          requestRef.current = requestAnimationFrame(animate);
        }
      };

      // Reset animation
      startTimeRef.current = null;
      requestRef.current = requestAnimationFrame(animate);
    };

    // Add delay before starting animation
    const timeoutId = setTimeout(startAnimation, delay);

    return () => {
      clearTimeout(timeoutId);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [end, duration, isLoading, delay]);

  if (isLoading) {
    return (
      <div className={className}>
        <span className="inline-block animate-pulse">{prefix}</span>
        <span className="inline-block">-</span>
        <span className="inline-block animate-bounce delay-75">-</span>
        <span className="inline-block animate-bounce delay-150">-</span>
        <span className="inline-block animate-pulse">{suffix}</span>
      </div>
    );
  }

  return (
    <div className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </div>
  );
}

export default function AdminDashboard() {
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Key to trigger re-animation

  // Fetch admin statistics from the database
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const [statsResponse, availableCollectorsResponse, pendingPickupsResponse] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/collectors/available'),
          fetch('/api/admin/pickup-requests/pending/count')
        ]);
        
        if (statsResponse.ok && availableCollectorsResponse.ok && pendingPickupsResponse.ok) {
          const [statsData, availableCollectorsData, pendingPickupsData] = await Promise.all([
            statsResponse.json(),
            availableCollectorsResponse.json(),
            pendingPickupsResponse.json()
          ]);
          
          setAdminStats({
            ...statsData,
            availableCollectors: availableCollectorsData.availableCollectors,
            pendingPickups: pendingPickupsData.pendingPickups
          });
        } else {
          const failedResponse = !statsResponse.ok ? statsResponse : 
                                !availableCollectorsResponse.ok ? availableCollectorsResponse : 
                                pendingPickupsResponse;
          const errorText = await failedResponse.text();
          setError(`Failed to fetch admin stats: ${failedResponse.status} ${errorText}`);
          console.error('Failed to fetch admin stats:', failedResponse.status, errorText);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setError(`Error fetching admin stats: ${errorMessage}`);
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [refreshKey]);

  const refreshStats = () => {
    setRefreshKey(prev => prev + 1); // Increment key to trigger useEffect and re-animation
  };

  // Mock data for other stats (you can expand the API later)
  const stats = {
    totalUsers: adminStats?.totalUsers || 0,
    activeCollectors: adminStats?.availableCollectors || 0,
    pendingPickups: adminStats?.pendingPickups || 0,
    totalOrders: 156,
    monthlyRevenue: 12450,
    wasteCollected: 15600, // kg
  }

  const recentActivity = [
    {
      id: "1",
      type: "pickup",
      message: "New pickup request from Green Industries Ltd",
      time: "5 minutes ago",
      status: "pending",
    },
    {
      id: "2",
      type: "order",
      message: "Order #1234 completed and shipped",
      time: "15 minutes ago",
      status: "completed",
    },
    {
      id: "3",
      type: "collector",
      message: "Collector John Smith went offline",
      time: "30 minutes ago",
      status: "warning",
    },
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "pickup":
        return <Truck className="h-4 w-4" />
      case "order":
        return <ShoppingCart className="h-4 w-4" />
      case "collector":
        return <Users className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "warning":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={refreshStats} disabled={loading}>
            {loading ? "Loading..." : "Refresh Stats"}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin-map">View Map</Link>
          </Button>
          <Button asChild>
            <Link href="/industry-pickups">Manage Pickups</Link>
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <AnimatedCounter 
              key={`total-users-${refreshKey}`}
              end={stats.totalUsers} 
              duration={2000} 
              delay={100}
              isLoading={loading}
              className="text-2xl font-bold"
            />
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              {loading ? (
                <span className="animate-pulse">Loading user details...</span>
              ) : adminStats ? (
                `${adminStats.usersByRole.customer} customers, ${adminStats.usersByRole.industry} industries, ${adminStats.usersByRole.collector} collectors`
              ) : (
                "Real-time count from database"
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Collectors</CardTitle>
            <Truck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <AnimatedCounter 
              key={`active-collectors-${refreshKey}`}
              end={stats.activeCollectors} 
              duration={1500} 
              delay={200}
              isLoading={loading}
              className="text-2xl font-bold text-green-600"
            />
            <p className="text-xs text-muted-foreground">Ready for pickup assignments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Pickups</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <AnimatedCounter 
              key={`pending-pickups-${refreshKey}`}
              end={stats.pendingPickups} 
              duration={1000} 
              delay={300}
              isLoading={loading}
              className="text-2xl font-bold text-yellow-600"
            />
            <p className="text-xs text-muted-foreground">Awaiting assignment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <AnimatedCounter 
              key={`total-orders-${refreshKey}`}
              end={stats.totalOrders} 
              duration={1800} 
              delay={400}
              isLoading={loading}
              className="text-2xl font-bold text-blue-600"
            />
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <AnimatedCounter 
              key={`revenue-${refreshKey}`}
              end={stats.monthlyRevenue} 
              duration={2200} 
              delay={500}
              isLoading={loading}
              prefix="$"
              className="text-2xl font-bold text-purple-600"
            />
            <p className="text-xs text-muted-foreground">Monthly revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waste Collected</CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <AnimatedCounter 
              key={`waste-collected-${refreshKey}`}
              end={stats.wasteCollected} 
              duration={2500} 
              delay={600}
              isLoading={loading}
              suffix=" kg"
              className="text-2xl font-bold text-orange-600"
            />
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system activities and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{activity.message}</p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                  <Badge className={getStatusColor(activity.status)}>{activity.status}</Badge>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin-notifications">View All Activity</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" asChild>
              <Link href="/industry-pickups">
                <Truck className="mr-2 h-4 w-4" />
                Assign Pickup Requests
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/add-products">
                <Package className="mr-2 h-4 w-4" />
                Manage Products
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/collectors">
                <Users className="mr-2 h-4 w-4" />
                Manage Collectors
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin-map">
                <MapPin className="mr-2 h-4 w-4" />
                View Live Map
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <span>System Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="text-sm font-medium">{stats.pendingPickups} pickup requests pending assignment</p>
                <p className="text-xs text-gray-600">
                  {stats.pendingPickups > 0 ? 'Some requests may need immediate attention' : 'All pickup requests are assigned'}
                </p>
              </div>
              <Button size="sm" asChild>
                <Link href="/industry-pickups">Assign Now</Link>
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm font-medium">3 collectors offline for extended period</p>
                <p className="text-xs text-gray-600">May need to contact these collectors</p>
              </div>
              <Button size="sm" variant="outline" asChild>
                <Link href="/collectors">View Details</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
