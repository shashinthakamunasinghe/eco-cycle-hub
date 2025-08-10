// This is a manual cleanup script that you can run in the browser console
// to remove any invalid orders (those with 0 items or just shipping charges)

function cleanupInvalidOrders() {
  // Get all orders from localStorage
  const orders = JSON.parse(localStorage.getItem("customerOrders") || "[]");
  console.log(`Found ${orders.length} orders in total`);
  
  // Filter to keep only valid orders (with items and valid total)
  const validOrders = orders.filter(order => 
    order && 
    order.items && 
    Array.isArray(order.items) && 
    order.items.length > 0 && 
    order.total && 
    order.total > 0
  );
  
  console.log(`Found ${orders.length - validOrders.length} invalid orders to remove`);
  
  // Save the valid orders back to localStorage
  localStorage.setItem("customerOrders", JSON.stringify(validOrders));
  console.log("Cleanup complete. Refresh the page to see the results.");
  
  // Return details of removed orders for inspection
  return orders.filter(order => 
    !order || 
    !order.items || 
    !Array.isArray(order.items) || 
    order.items.length === 0 || 
    !order.total || 
    order.total <= 0
  );
}

// Run the cleanup function
cleanupInvalidOrders();
