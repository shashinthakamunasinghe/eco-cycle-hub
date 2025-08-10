"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Recycle, ArrowLeft } from "lucide-react";
import { useEmergencyAuth } from "@/hooks/useEmergencyAuth";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function EmergencyLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useEmergencyAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      // Attempt emergency authentication using our hook
      const user = await login(email, password);
      
      // The hook handles navigation, but we'll add a toast message
      toast({
        title: "Emergency Login Successful",
        description: "You've been logged in using our emergency authentication system",
      });

      // Redirect based on role
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
      console.error("Emergency login error:", error);
      setErrorMessage(
        error instanceof Error 
          ? error.message 
          : "An unexpected error occurred during emergency login."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-100 via-amber-200 to-yellow-300 relative overflow-hidden">
      <div className="absolute inset-0 bg-pattern bg-repeat opacity-10"></div>
      <div className="relative z-10 w-full max-w-md p-6 sm:p-8">
        <Card className="backdrop-blur-lg bg-white/80 shadow-2xl border-2 border-amber-600 rounded-2xl p-6">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center shadow-lg border-2 border-amber-500">
              <AlertCircle className="h-7 w-7 text-amber-600" />
            </div>
            <CardTitle className="text-3xl font-semibold text-gray-800">
              Emergency Login
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">
              Use this method if standard login is not working
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Login Failed</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-amber-800">
                This emergency login bypasses Firebase Authentication directly. 
                Use only if you're experiencing persistent login issues.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="example@ecocycle.com"
                  className="bg-white/90"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="bg-white/90"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold tracking-wide"
              >
                {loading ? "Authenticating..." : "Emergency Login"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="ghost" size="sm" asChild className="text-gray-600">
              <Link href="/login">
                <ArrowLeft className="h-3 w-3 mr-1" />
                Return to Standard Login
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
