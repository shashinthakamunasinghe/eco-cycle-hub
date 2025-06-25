"use client";

import type React from "react";

import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/common/navbar";
import { Sidebar } from "@/components/Industry/Industrysidebar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function IndustryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== "industry")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user || user.role !== "industry") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 ml-64 p-6 min-h-screen">{children}</main>
      </div>
    </div>
  );
}
