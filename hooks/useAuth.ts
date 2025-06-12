"use client"

import { useState, useEffect } from "react"
import type { User } from "@/types"
import { mockUsers } from "@/lib/mock-data"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate auth check
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // Mock login
    const foundUser = mockUsers.find((u) => u.email === email)
    if (foundUser) {
      setUser(foundUser)
      localStorage.setItem("currentUser", JSON.stringify(foundUser))
      return foundUser
    }
    throw new Error("Invalid credentials")
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("currentUser")
  }

  return { user, loading, login, logout }
}
