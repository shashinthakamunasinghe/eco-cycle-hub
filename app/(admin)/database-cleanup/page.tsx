"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
// We're directly using Firebase API instead of the service layer for this specific cleanup task
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface DuplicateProduct {
  id: string;
  name: string;
  originalId: string;
  originalCreated?: string | Date;
  duplicateCreated?: string | Date;
}

export default function DatabaseCleanupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateProduct[]>([]);
  const { toast } = useToast();

  const findDuplicates = async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const products: Array<{
        id: string;
        name: string;
        description: string;
        createdAt?: string | Date;
      }> = [];
      const seenNames = new Map();
      const foundDuplicates: DuplicateProduct[] = [];

      querySnapshot.docs.forEach((doc) => {
        const data = doc.data();
        products.push({
          id: doc.id,
          name: data.name || "",
          description: data.description || "",
          createdAt: data.createdAt,
        });
      });

      products.forEach((product) => {
        const key = `${product.name}-${product.description}`;

        if (seenNames.has(key)) {
          const original = seenNames.get(key);
          foundDuplicates.push({
            id: product.id,
            name: product.name,
            originalId: original.id,
            originalCreated: original.createdAt,
            duplicateCreated: product.createdAt,
          });
        } else {
          seenNames.set(key, product);
        }
      });

      setDuplicates(foundDuplicates);
      toast({
        title: "Scan Complete",
        description: `Found ${foundDuplicates.length} duplicate products`,
      });
    } catch (error) {
      console.error("Error finding duplicates:", error);
      toast({
        title: "Error",
        description: "Failed to scan for duplicates",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cleanupDuplicates = async () => {
    if (duplicates.length === 0) {
      toast({
        title: "No Duplicates",
        description: "No duplicates found to clean up",
      });
      return;
    }

    setIsLoading(true);
    try {
      let deletedCount = 0;
      for (const duplicate of duplicates) {
        try {
          await deleteDoc(doc(db, "products", duplicate.id));
          deletedCount++;
        } catch (error) {
          console.error(`Failed to delete ${duplicate.name}:`, error);
        }
      }

      toast({
        title: "Cleanup Complete",
        description: `Successfully deleted ${deletedCount} duplicate products`,
      });

      // Clear the duplicates list
      setDuplicates([]);
    } catch (error) {
      console.error("Error during cleanup:", error);
      toast({
        title: "Error",
        description: "Failed to complete cleanup",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetMigrationFlags = () => {
    localStorage.removeItem("firebase-migrated");
    localStorage.removeItem("disable-auto-migration");
    toast({
      title: "Flags Reset",
      description: "Migration flags have been cleared from localStorage",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Database Cleanup</h1>
        <p className="text-gray-600 mt-2">
          Tools to manage and clean up your product database
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Duplicate Detection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Scan for duplicate products based on name and description
            </p>
            <Button
              onClick={findDuplicates}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Scanning..." : "Find Duplicates"}
            </Button>
            {duplicates.length > 0 && (
              <div>
                <p className="text-sm font-medium text-red-600">
                  Found {duplicates.length} duplicates:
                </p>
                <ul className="text-sm text-gray-600 mt-2 space-y-1">
                  {duplicates.map((dup) => (
                    <li key={dup.id}>
                      {dup.name} (ID: {dup.id.slice(0, 8)}...)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cleanup Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Remove duplicate products and reset migration flags
            </p>
            <Button
              onClick={cleanupDuplicates}
              disabled={isLoading || duplicates.length === 0}
              variant="destructive"
              className="w-full"
            >
              {isLoading ? "Cleaning..." : "Delete Duplicates"}
            </Button>
            <Button
              onClick={resetMigrationFlags}
              variant="outline"
              className="w-full"
            >
              Reset Migration Flags
            </Button>
          </CardContent>
        </Card>
      </div>

      {duplicates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Duplicate Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {duplicates.map((dup) => (
                <div key={dup.id} className="border rounded p-3">
                  <h4 className="font-medium">{dup.name}</h4>
                  <p className="text-sm text-gray-600">
                    Duplicate ID: {dup.id} | Original ID: {dup.originalId}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
