"use client";

import type React from "react";

import { Navbar } from "@/components/Common/Navbar";
import { ShopSlideshow } from "@/components/Shop/Shopslideshow";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-16">
        <ShopSlideshow />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
