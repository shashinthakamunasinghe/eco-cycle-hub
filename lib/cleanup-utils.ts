"use client";

/**
 * Cleans up any invalid orders in localStorage
 * This will remove orders with:
 * - No items
 * - Empty items array
 * - Zero total value
 */
export function cleanupOrders() {
  if (typeof window === 'undefined') return; // Skip on server-side
  
  try {
    // Clean up customer orders
    const customerOrders = JSON.parse(localStorage.getItem("customerOrders") || "[]");
    
    // Filter out invalid orders
    const validOrders = customerOrders.filter((order: any) => 
      order && 
      order.items && 
      Array.isArray(order.items) && 
      order.items.length > 0 && 
      order.total && 
      order.total > 0
    );
    
    // Only update if we actually removed something
    if (validOrders.length !== customerOrders.length) {
      localStorage.setItem("customerOrders", JSON.stringify(validOrders));
      console.log(`[Cleanup] Removed ${customerOrders.length - validOrders.length} invalid orders`);
    }
  } catch (error) {
    console.error("Error cleaning up orders:", error);
  }
}
