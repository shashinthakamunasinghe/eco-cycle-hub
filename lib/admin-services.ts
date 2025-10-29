import { db } from "./firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export interface AdminStats {
  totalUsers: number;
  activeCollectors: number;
  pendingPickups: number;
  totalOrders: number;
  monthlyRevenue: number;
  wasteCollected: number;
}

export async function fetchAdminStats(): Promise<AdminStats> {
  try {
    // Get users count
    const usersSnapshot = await getDocs(collection(db, "users"));
    const totalUsers = usersSnapshot.size;

    // Get active collectors
    const collectorsQuery = query(
      collection(db, "collectors"),
      where("status", "==", "active")
    );
    const collectorsSnapshot = await getDocs(collectorsQuery);
    const activeCollectors = collectorsSnapshot.size;

    // Get pending pickups
    const pickupsQuery = query(
      collection(db, "pickups"),
      where("status", "==", "pending")
    );
    const pickupsSnapshot = await getDocs(pickupsQuery);
    const pendingPickups = pickupsSnapshot.size;

    // Get total orders and calculate revenue
    const ordersSnapshot = await getDocs(collection(db, "orders"));
    const totalOrders = ordersSnapshot.size;
    const monthlyRevenue = ordersSnapshot.docs.reduce((acc, doc) => {
      const data = doc.data();
      const orderDate = data.createdAt?.toDate();
      const isCurrentMonth =
        orderDate &&
        orderDate.getMonth() === new Date().getMonth() &&
        orderDate.getFullYear() === new Date().getFullYear();
      return acc + (isCurrentMonth ? data.amount || 0 : 0);
    }, 0);

    // Calculate total waste collected
    const wasteCollected = ordersSnapshot.docs.reduce((acc, doc) => {
      const data = doc.data();
      return acc + (data.wasteAmount || 0);
    }, 0);

    return {
      totalUsers,
      activeCollectors,
      pendingPickups,
      totalOrders,
      monthlyRevenue,
      wasteCollected,
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    throw new Error("Failed to fetch statistics");
  }
}
