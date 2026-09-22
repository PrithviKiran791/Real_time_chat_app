"use client";

export default function Loading() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-background/50 backdrop-blur-2xs">
      <div className="flex flex-col items-center gap-3">
        <div className="relative flex items-center justify-center">
          <div className="size-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        </div>
        <p className="text-xs font-medium text-muted-foreground animate-pulse">
          Loading ChatSphere...
        </p>
      </div>
    </div>
  );
}
