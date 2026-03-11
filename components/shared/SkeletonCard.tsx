import { cn } from "@/lib/utils";

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-surface-elevated",
        className
      )}
    />
  );
}

export function SkeletonLine({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-4 animate-pulse rounded bg-surface-elevated",
        className
      )}
    />
  );
}
