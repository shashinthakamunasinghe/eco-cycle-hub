// Utility to add a notification to localStorage for the shop
interface ShopNotificationInput {
  title: string;
  message: string;
  type?: "order" | "promotion" | "general";
}

export function addShopNotification({ title, message, type = "order" }: ShopNotificationInput) {
  if (typeof window === "undefined") return;
  const notifications = JSON.parse(localStorage.getItem("shopNotifications") || "[]");
  const newNotification = {
    id: Date.now().toString(),
    title,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString(),
  };
  notifications.unshift(newNotification);
  localStorage.setItem("shopNotifications", JSON.stringify(notifications));
  // Dispatch a storage event for cross-tab update
  window.dispatchEvent(new Event("storage"));
}
