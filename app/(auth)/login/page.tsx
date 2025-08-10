"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useToast } from "@/hooks/use-toast";
import { Recycle, Users, ShoppingBag } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useFirebaseAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(email, password);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name}!`,
      });

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
      console.error("❌ Login failed:", error);
      let errorMessage = "Invalid email or password";
      if (error instanceof Error) {
        console.log("❌ Error message:", error.message);
        if (error.message.includes("user-not-found") || error.message.includes("auth/user-not-found")) {
          errorMessage = "No account found with this email address";
        } else if (error.message.includes("wrong-password") || error.message.includes("auth/wrong-password")) {
          errorMessage = "Incorrect password";
        } else if (error.message.includes("invalid-email") || error.message.includes("auth/invalid-email")) {
          errorMessage = "Invalid email format";
        } else if (error.message.includes("User data not found")) {
          errorMessage =
            "Account exists but user profile is incomplete. Please contact support.";
        } else if (error.message.includes("auth/invalid-credential")) {
          errorMessage = "Invalid email or password. Please check your credentials.";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-300 via-emerald-400 to-teal-600 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/login-bg.svg')] bg-cover bg-no-repeat opacity-10"></div>
      <div className="relative z-10 w-full max-w-md p-6 sm:p-8">
        <Card className="backdrop-blur-lg bg-white/80 shadow-2xl border-2 border-green-700 rounded-2xl p-6 transition-transform hover:scale-[1.01] duration-300">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-green-700">
              <Recycle className="h-7 w-7 text-green-600 " />
            </div>
            <CardTitle className="text-3xl font-semibold text-gray-800">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">
              Sign in to your <span className="font-medium">EcoCycle Hub</span> account
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                  className="bg-white/90 backdrop-blur-sm"
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
                  className="bg-white/90 backdrop-blur-sm"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold tracking-wide"
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-2">Don’t have an account?</p>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link href="/register?type=customer">
                    <ShoppingBag className="h-4 w-4 mr-1" />
                    Customer
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link href="/register?type=industry">
                    <Users className="h-4 w-4 mr-1" />
                    Industry
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

