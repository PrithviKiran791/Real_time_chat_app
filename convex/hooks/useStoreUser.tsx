"use client";

import { useEffect } from "react";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "../_generated/api";

/**
 * Ensures the authenticated user has a record in the Convex users table.
 * Call this once in your app after Clerk authentication is ready.
 */
export const useStoreUser = () => {
  const { isAuthenticated } = useConvexAuth();
  const storeUser = useMutation(api.user.store);

  useEffect(() => {
    if (isAuthenticated) {
      storeUser().catch((error) => {
        console.error("Failed to store user:", error);
      });
    }
  }, [isAuthenticated, storeUser]);
};
