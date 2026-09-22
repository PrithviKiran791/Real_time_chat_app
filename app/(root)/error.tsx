"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("ChatSphere application error:", error);
  }, [error]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="size-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center shadow-xs">
        <AlertTriangle className="size-8" />
      </div>

      <div className="max-w-md space-y-2">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Something went wrong
        </h2>
        <p className="text-sm text-muted-foreground">
          We encountered an unexpected error while communicating with the server. Your data is safe.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => reset()} className="flex items-center gap-2">
          <RefreshCw className="size-4" />
          Try Again
        </Button>
        <Button asChild variant="outline">
          <Link href="/conversations" className="flex items-center gap-2">
            <MessageSquare className="size-4" />
            Back to Conversations
          </Link>
        </Button>
      </div>
    </div>
  );
}
