"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, AlertTriangle, LogIn } from "lucide-react";
import { hardResetAuth } from "@/lib/firebase-auth-cleanup";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function FixAuthPage() {
  const [isResetting, setIsResetting] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const router = useRouter();
  
  const handleAuthReset = async () => {
    setIsResetting(true);
    try {
      await hardResetAuth();
      setResetComplete(true);
    } catch (error) {
      console.error("Authentication reset failed:", error);
    } finally {
      setIsResetting(false);
    }
  };
  
  // Auto-run reset on page load
  useEffect(() => {
    handleAuthReset();
  }, []);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-300 via-emerald-400 to-teal-600 p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="text-amber-500" />
            Authentication Reset
          </CardTitle>
          <CardDescription>
            Fixing login issues by resetting authentication state
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isResetting ? (
            <div className="flex flex-col items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 text-green-600 animate-spin mb-4" />
              <p>Resetting authentication state...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
            </div>
          ) : resetComplete ? (
            <div className="space-y-6">
              <div className="rounded-lg bg-green-50 p-4 border border-green-200">
                <p className="text-green-800 font-medium">Authentication state has been reset successfully!</p>
                <p className="text-green-600 text-sm mt-1">
                  You can now try logging in again with your credentials.
                </p>
              </div>
              
              <div className="flex flex-col space-y-3">
                <Button asChild>
                  <Link href="/login" className="flex items-center justify-center">
                    <LogIn className="mr-2 h-4 w-4" />
                    Return to Login
                  </Link>
                </Button>
                
                <Button variant="outline" onClick={handleAuthReset}>
                  Reset Again
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-lg bg-amber-50 p-4 border border-amber-200">
                <p className="text-amber-800 font-medium">Authentication reset failed</p>
                <p className="text-amber-600 text-sm mt-1">
                  Please try again or clear your browser cookies and cache manually.
                </p>
              </div>
              
              <Button onClick={handleAuthReset} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          )}
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="font-medium mb-2">Other troubleshooting steps:</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
              <li>Clear your browser cookies and cache</li>
              <li>Try using a different browser</li>
              <li>Check if you're using the correct email address</li>
              <li>Try resetting your password</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
