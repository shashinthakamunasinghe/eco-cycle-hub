"use client";

import { useEffect, useState } from "react";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { FirebaseMigration } from "@/lib/firebase-migration";

interface FirebaseProviderProps {
  children: React.ReactNode;
}

export function FirebaseProvider({ children }: FirebaseProviderProps) {
  const { loading } = useFirebaseAuth();
  const [migrationStatus, setMigrationStatus] = useState<
    "pending" | "completed" | "error"
  >("pending");

  useEffect(() => {
    // Auto-migrate data on first load (development only)
    if (process.env.NODE_ENV === "development") {
      const migrateData = async () => {
        try {
          // Check if we need to migrate (you can add logic to check if data exists)
          const shouldMigrate =
            localStorage.getItem("firebase-migrated") !== "true";

          if (shouldMigrate) {
            await FirebaseMigration.migrateAll();
            localStorage.setItem("firebase-migrated", "true");
          }

          setMigrationStatus("completed");
        } catch (error) {
          console.error("Migration failed:", error);
          setMigrationStatus("error");
        }
      };

      migrateData();
    } else {
      setMigrationStatus("completed");
    }
  }, []);

  if (loading || migrationStatus === "pending") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {loading ? "Loading..." : "Initializing Firebase..."}
          </p>
        </div>
      </div>
    );
  }

  if (migrationStatus === "error") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p>
            Firebase initialization failed. Please check your configuration.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Hook to manually trigger migration (for admin use)
export function useMigration() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runMigration = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await FirebaseMigration.migrateAll();
      localStorage.setItem("firebase-migrated", "true");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Migration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return { runMigration, isLoading, error };
}
