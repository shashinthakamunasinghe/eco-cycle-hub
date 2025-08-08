import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseProvider } from "@/components/firebase-provider";
import { CartProvider } from "@/contexts/CartContext";
import InitCleanup from "@/components/common/init-cleanup";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EcoCycle Hub - Smart Waste Management",
  description:
    "Efficient industrial waste management and eco-friendly product marketplace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FirebaseProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </FirebaseProvider>
        <InitCleanup />
        <Toaster />
      </body>
    </html>
  );
}
