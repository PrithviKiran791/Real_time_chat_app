"use client";

import { useStoreUser } from "@/convex/hooks/useStoreUser";
import { usePresence } from "@/hooks/usePresence";

/**
 * Client component that stores the authenticated user in Convex
 * and maintains real-time online/offline presence heartbeats.
 */
export const StoreUserEffect = () => {
  useStoreUser();
  usePresence();
  return null;
};
