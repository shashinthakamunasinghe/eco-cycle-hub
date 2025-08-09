"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, Database } from "lucide-react"
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth"
import { db } from "@/lib/firebase"
import { doc, setDoc, getDoc } from "firebase/firestore"

interface FirebaseStatus {
  config: boolean
  auth: boolean
  firestore: boolean
  connection: boolean
}

export function FirebaseDebug() {
  const [status, setStatus] = useState<FirebaseStatus>({
    config: false,
    auth: false,
    firestore: false,
    connection: false,
  })
  const [testing, setTesting] = useState(false)
  const { user } = useFirebaseAuth()

  const testFirebaseConnection = async () => {
    setTesting(true)
    const newStatus: FirebaseStatus = {
      config: false,
      auth: false,
      firestore: false,
      connection: false,
    }

    try {
      // Test 1: Configuration
      const hasConfig = !!(
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      )
      newStatus.config = hasConfig

      // Test 2: Authentication
      newStatus.auth = !!user

      // Test 3: Firestore Connection
      try {
        const testRef = doc(db, "test", "connection")
        await setDoc(testRef, { timestamp: new Date(), test: true })
        const testDoc = await getDoc(testRef)
        newStatus.firestore = testDoc.exists()
        newStatus.connection = true
      } catch (error) {
        console.error("Firestore test failed:", error)
        newStatus.firestore = false
        newStatus.connection = false
      }
    } catch (error) {
      console.error("Firebase test failed:", error)
    }

    setStatus(newStatus)
    setTesting(false)
  }

  useEffect(() => {
    const testConnection = async () => {
      setTesting(true)
      const newStatus: FirebaseStatus = {
        config: false,
        auth: false,
        firestore: false,
        connection: false,
      }

      try {
        // Test 1: Configuration
        const hasConfig = !!(
          process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
          process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
          process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
        )
        newStatus.config = hasConfig

        // Test 2: Authentication
        newStatus.auth = !!user

        // Test 3: Firestore Connection
        try {
          const testRef = doc(db, "test", "connection")
          await setDoc(testRef, { timestamp: new Date(), test: true })
          const testDoc = await getDoc(testRef)
          newStatus.firestore = testDoc.exists()
          newStatus.connection = true
        } catch (error) {
          console.error("Firestore test failed:", error)
          newStatus.firestore = false
          newStatus.connection = false
        }
      } catch (error) {
        console.error("Firebase test failed:", error)
      }

      setStatus(newStatus)
      setTesting(false)
    }

    if (user !== undefined) { // Only run when auth state is determined
      testConnection()
    }
  }, [user])

  const getStatusIcon = (isSuccess: boolean) => {
    return isSuccess ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    )
  }

  const getStatusBadge = (isSuccess: boolean) => {
    return (
      <Badge variant={isSuccess ? "default" : "destructive"}>
        {isSuccess ? "Connected" : "Failed"}
      </Badge>
    )
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-5 w-5" />
          <span>Firebase Connection Status</span>
        </CardTitle>
        <CardDescription>
          Check the status of Firebase services and configuration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {/* Configuration */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              {getStatusIcon(status.config)}
              <div>
                <h3 className="font-medium">Firebase Configuration</h3>
                <p className="text-sm text-gray-600">Environment variables loaded</p>
              </div>
            </div>
            {getStatusBadge(status.config)}
          </div>

          {/* Authentication */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              {getStatusIcon(status.auth)}
              <div>
                <h3 className="font-medium">Authentication</h3>
                <p className="text-sm text-gray-600">
                  {user ? `Logged in as ${user.email}` : "Not authenticated"}
                </p>
              </div>
            </div>
            {getStatusBadge(status.auth)}
          </div>

          {/* Firestore */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              {getStatusIcon(status.firestore)}
              <div>
                <h3 className="font-medium">Firestore Database</h3>
                <p className="text-sm text-gray-600">Read/write operations</p>
              </div>
            </div>
            {getStatusBadge(status.firestore)}
          </div>

          {/* Network Connection */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              {getStatusIcon(status.connection)}
              <div>
                <h3 className="font-medium">Network Connection</h3>
                <p className="text-sm text-gray-600">Internet connectivity to Firebase</p>
              </div>
            </div>
            {getStatusBadge(status.connection)}
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex items-center space-x-2">
            {Object.values(status).every(Boolean) ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  All systems operational
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-600">
                  Some issues detected
                </span>
              </>
            )}
          </div>
          <Button onClick={testFirebaseConnection} disabled={testing} size="sm">
            {testing ? "Testing..." : "Test Again"}
          </Button>
        </div>

        {!status.config && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Configuration Issue:</strong> Make sure you have a `.env.local` file
              with your Firebase configuration. See FIREBASE_SETUP.md for details.
            </p>
          </div>
        )}

        {!status.auth && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Authentication:</strong> You need to log in to test the full functionality.
              Go to <a href="/login" className="underline">Login Page</a>.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
