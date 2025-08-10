// Test file for debugging collector functionality
"use client"

import { useState, useEffect } from "react"
import { collectorService } from "@/lib/firebase-services"
import type { User } from "@/types"

export default function TestCollectorsPage() {
  const [collectors, setCollectors] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testCollectors = async () => {
      try {
        console.log("Testing collector service...")
        const availableCollectors = await collectorService.getAvailableCollectors()
        console.log("Available collectors:", availableCollectors)
        setCollectors(availableCollectors)
      } catch (err) {
        console.error("Error testing collectors:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    testCollectors()
  }, [])

  if (loading) {
    return <div>Loading collectors...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Test Collectors</h1>
      <div>
        <h2 className="text-lg font-semibold mb-4">Available Collectors ({collectors.length})</h2>
        {collectors.length === 0 ? (
          <p className="text-gray-500">No available collectors found. You may need to create some test data using the script in /scripts/create-sample-collectors.js</p>
        ) : (
          <div className="grid gap-4">
            {collectors.map((collector) => (
              <div key={collector.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{collector.name}</h3>
                    <p className="text-sm text-gray-600">{collector.email}</p>
                    <p className="text-sm text-gray-600">{collector.phone}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">Available</span>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    {collector.truckCapacity && (
                      <p className="text-sm text-gray-600">
                        Capacity: {collector.currentLoad || 0}/{collector.truckCapacity}kg
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
