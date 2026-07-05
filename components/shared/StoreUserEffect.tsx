"use client";

import { useStoreUser } from "@/convex/hooks/useStoreUser";

/**
 * Client component that stores the authenticated user in Convex.
 * Place this once in your app layout.
 */
export const StoreUserEffect = () => {
  useStoreUser();
  return null;
};
