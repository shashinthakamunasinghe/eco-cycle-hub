"use client";

import { useEffect } from "react";
import { cleanupOrders } from "@/lib/cleanup-utils";

export default function InitCleanup() {
  useEffect(() => {
    // Run the cleanup when the app loads
    cleanupOrders();
  }, []);
  
  // This component doesn't render anything
  return null;
}
