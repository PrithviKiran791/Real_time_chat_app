import { useEffect, useRef } from "react";
import { useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";

export const usePresence = () => {
  const { isAuthenticated } = useConvexAuth();
  const heartbeat = useMutation(api.presence.heartbeat);
  const setOffline = useMutation(api.presence.setOffline);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Initial heartbeat
    void heartbeat().catch(() => {});

    // Heartbeat every 25 seconds
    intervalRef.current = setInterval(() => {
      if (document.visibilityState === "visible") {
        void heartbeat().catch(() => {});
      }
    }, 25000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void heartbeat().catch(() => {});
      } else {
        void setOffline().catch(() => {});
      }
    };

    const handleBeforeUnload = () => {
      void setOffline().catch(() => {});
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      void setOffline().catch(() => {});
    };
  }, [isAuthenticated, heartbeat, setOffline]);
};
