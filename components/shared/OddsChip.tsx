import { formatOdds } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export function OddsChip({ odds, className }: { odds: number; className?: string }) {
  const positive = odds > 0;
  return (
    <span
      className={cn(
        "font-mono text-sm font-medium tabular-nums",
        positive ? "text-emerald-400" : "text-foreground",
        className
      )}
    >
      {formatOdds(odds)}
    </span>
  );
}
