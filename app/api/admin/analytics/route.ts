import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, Timestamp, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  try {
    // Get time period from query params (default to 30 days)
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30days';
    
    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    let previousPeriodStart: Date;
    
    switch (period) {
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousPeriodStart = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        previousPeriodStart = new Date(startDate.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        previousPeriodStart = new Date(startDate.getFullYear() - 1, startDate.getMonth(), startDate.getDate());
        break;
      default: // 30days
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousPeriodStart = new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Fetch current period data
    const [
      ordersSnapshot,
      pickupsSnapshot,
      usersSnapshot,
      previousOrdersSnapshot,
      previousPickupsSnapshot,
      previousUsersSnapshot
    ] = await Promise.all([
      // Current period orders
      getDocs(query(
        collection(db, 'orders'),
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        where('createdAt', '<=', Timestamp.fromDate(now))
      )),
      // Current period pickups
      getDocs(query(
        collection(db, 'pickupRequests'),
        where('requestedAt', '>=', Timestamp.fromDate(startDate)),
        where('requestedAt', '<=', Timestamp.fromDate(now))
      )),
      // Current period users
      getDocs(query(
        collection(db, 'users'),
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        where('createdAt', '<=', Timestamp.fromDate(now))
      )),
      // Previous period orders for comparison
      getDocs(query(
        collection(db, 'orders'),
        where('createdAt', '>=', Timestamp.fromDate(previousPeriodStart)),
        where('createdAt', '<', Timestamp.fromDate(startDate))
      )),
      // Previous period pickups for comparison
      getDocs(query(
        collection(db, 'pickupRequests'),
        where('requestedAt', '>=', Timestamp.fromDate(previousPeriodStart)),
        where('requestedAt', '<', Timestamp.fromDate(startDate))
      )),
      // Previous period users for comparison
      getDocs(query(
        collection(db, 'users'),
        where('createdAt', '>=', Timestamp.fromDate(previousPeriodStart)),
        where('createdAt', '<', Timestamp.fromDate(startDate))
      ))
    ]);

    // Calculate overview stats
    let totalRevenue = 0;
    let totalOrders = ordersSnapshot.size;
    
    ordersSnapshot.forEach((doc) => {
      const data = doc.data();
      totalRevenue += data.total || 0;
    });

    let previousRevenue = 0;
    let previousOrders = previousOrdersSnapshot.size;
    
    previousOrdersSnapshot.forEach((doc) => {
      const data = doc.data();
      previousRevenue += data.total || 0;
    });

    // Calculate pickup stats
    let totalPickups = pickupsSnapshot.size;
    let previousPickups = previousPickupsSnapshot.size;

    // Calculate user stats (get total active users, not just new ones)
    const totalUsersSnapshot = await getDocs(collection(db, 'users'));
    let activeUsers = 0;
    totalUsersSnapshot.forEach((doc) => {
      const data = doc.data();
      // Consider users active if they logged in within the last 30 days
      const lastLogin = data.lastLogin?.toDate();
      if (lastLogin && (now.getTime() - lastLogin.getTime()) <= 30 * 24 * 60 * 60 * 1000) {
        activeUsers++;
      }
    });

    // For previous period, calculate active users then
    let previousActiveUsers = 0;
    totalUsersSnapshot.forEach((doc) => {
      const data = doc.data();
      const lastLogin = data.lastLogin?.toDate();
      if (lastLogin && 
          lastLogin >= previousPeriodStart && 
          lastLogin < startDate) {
        previousActiveUsers++;
      }
    });

    // Calculate percentage changes
    const revenueChange = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    const pickupsChange = previousPickups > 0 ? ((totalPickups - previousPickups) / previousPickups) * 100 : 0;
    const ordersChange = previousOrders > 0 ? ((totalOrders - previousOrders) / previousOrders) * 100 : 0;
    const usersChange = previousActiveUsers > 0 ? ((activeUsers - previousActiveUsers) / previousActiveUsers) * 100 : 0;

    // Calculate waste collection breakdown
    const wasteTypes = {
      organicWaste: 0,
      plasticWaste: 0,
      metalWaste: 0,
      paperWaste: 0,
      electronicWaste: 0,
      chemicalWaste: 0,
      mixedWaste: 0
    };
    
    let totalWaste = 0;
    
    pickupsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.status === 'completed' && data.weight) {
        totalWaste += data.weight;
        
        // Categorize waste based on waste type
        const wasteType = data.wasteType?.toLowerCase() || 'mixed';
        
        if (wasteType.includes('organic') || wasteType.includes('food') || wasteType.includes('compost')) {
          wasteTypes.organicWaste += data.weight;
        } else if (wasteType.includes('plastic') || wasteType.includes('packaging')) {
          wasteTypes.plasticWaste += data.weight;
        } else if (wasteType.includes('metal') || wasteType.includes('aluminum') || wasteType.includes('steel')) {
          wasteTypes.metalWaste += data.weight;
        } else if (wasteType.includes('paper') || wasteType.includes('cardboard') || wasteType.includes('document')) {
          wasteTypes.paperWaste += data.weight;
        } else if (wasteType.includes('electronic') || wasteType.includes('e-waste') || wasteType.includes('electronics')) {
          wasteTypes.electronicWaste += data.weight;
        } else if (wasteType.includes('chemical') || wasteType.includes('hazardous') || wasteType.includes('toxic')) {
          wasteTypes.chemicalWaste += data.weight;
        } else {
          wasteTypes.mixedWaste += data.weight;
        }
      }
    });

    // Get top industries by pickup count and waste collected
    const industryStats = new Map();
    
    pickupsSnapshot.forEach((doc) => {
      const data = doc.data();
      const industryName = data.industryName || 'Unknown Industry';
      
      if (!industryStats.has(industryName)) {
        industryStats.set(industryName, { pickups: 0, waste: 0 });
      }
      
      const current = industryStats.get(industryName);
      current.pickups += 1;
      if (data.status === 'completed' && data.weight) {
        current.waste += data.weight;
      }
    });

    const topIndustries = Array.from(industryStats.entries())
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.pickups - a.pickups)
      .slice(0, 4);

    // Get top products by sales and revenue
    const productStats = new Map();
    
    ordersSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.items && Array.isArray(data.items)) {
        data.items.forEach((item: any) => {
          const productName = item.name || 'Unknown Product';
          
          if (!productStats.has(productName)) {
            productStats.set(productName, { sales: 0, revenue: 0 });
          }
          
          const current = productStats.get(productName);
          current.sales += item.quantity || 1;
          current.revenue += (item.price || 0) * (item.quantity || 1);
        });
      }
    });

    const topProducts = Array.from(productStats.entries())
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 4);

    const analyticsData = {
      overview: {
        totalRevenue: Math.round(totalRevenue),
        revenueChange: Math.round(revenueChange * 10) / 10,
        totalPickups,
        pickupsChange: Math.round(pickupsChange * 10) / 10,
        totalOrders,
        ordersChange: Math.round(ordersChange * 10) / 10,
        activeUsers,
        usersChange: Math.round(usersChange * 10) / 10,
      },
      wasteCollection: {
        totalWaste: Math.round(totalWaste),
        ...wasteTypes
      },
      topIndustries,
      topProducts,
      period
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
