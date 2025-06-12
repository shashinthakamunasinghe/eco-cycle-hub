"use client"

import type React from "react"

import { useAuth } from "@/hooks/useAuth"
import { Navbar } from "@/components/common/navbar"
import { AdminSidebar } from "@/components/admin/sidebar"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6 ml-64 mt-16">{children}</main>
      </div>
    </div>
  )
}
