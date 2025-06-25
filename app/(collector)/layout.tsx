"use client";

import type React from "react";

import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Common/Navbar";
import { CollectorSidebar } from "@/components/Collector/Collectorsidebar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CollectorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== "collector")) {
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

  if (!user || user.role !== "collector") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex pt-16">
        <CollectorSidebar />
        <main className="flex-1 ml-64 p-6 min-h-screen lg:ml-64 md:ml-0">
          {children}
        </main>
      </div>
    </div>
  );
}
