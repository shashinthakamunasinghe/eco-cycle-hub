"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Loader2 } from "lucide-react";
import { emergencyLogin, forceAuthReset } from "@/lib/emergency-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function EmergencyLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetCompleted, setResetCompleted] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  
  const handleEmergencyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // First attempt to reset authentication state
      await forceAuthReset();
      setResetCompleted(true);
      
      // Then try emergency login
      const user = await emergencyLogin(email, password);
      
      if (!user) {
        toast({
          title: "Login Failed",
          description: "Could not retrieve user data. Please contact support.",
          variant: "destructive",
        });
        return;
      }
      
      // Login successful, redirect based on user role
      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.name}! You've been logged in using emergency mode.`,
      });
      
      // Store user info in session storage as a temporary measure
      sessionStorage.setItem("eco_user", JSON.stringify(user));
      
      // Redirect based on user role
      switch (user.role) {
        case "admin":
          router.push("/admindash");
          break;
        case "industry":
          router.push("/industrydash");
          break;
        case "collector":
          router.push("/collectordash");
          break;
        case "customer":
          router.push("/products");
          break;
        default:
          router.push("/");
      }
      
    } catch (error) {
      console.error("Emergency login failed:", error);
      let errorMessage = "Login failed. Please try again or contact support.";
      
      if (error instanceof Error) {
        if (error.message.includes("auth/invalid-credential")) {
          errorMessage = "Invalid email or password. Please check your credentials.";
        } else if (error.message.includes("auth/user-not-found")) {
          errorMessage = "No account found with this email address.";
        } else if (error.message.includes("auth/wrong-password")) {
          errorMessage = "Incorrect password. Please try again.";
        }
      }
      
      toast({
        title: "Emergency Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 via-amber-100 to-yellow-100 p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="text-amber-500 h-6 w-6" />
            <CardTitle>Emergency Login</CardTitle>
          </div>
          <CardDescription>
            Use this page when normal login isn't working
          </CardDescription>
        </CardHeader>
        <CardContent>
          {resetCompleted && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm">
              Authentication state has been reset successfully
            </div>
          )}
          
          <form onSubmit={handleEmergencyLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>
            
            <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : "Emergency Login"}
            </Button>
            
            <div className="text-center text-sm text-gray-500 mt-2">
              <p>If login fails, please contact support with the error details.</p>
              <Button 
                variant="link" 
                className="text-amber-600 hover:text-amber-800 p-0 h-auto mt-1"
                onClick={() => router.push("/login")}
              >
                Return to normal login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
