import { cn } from "@/lib/utils";
import { formatCLV } from "@/lib/formatters";

export function CLVBadge({ clv }: { clv: number | null }) {
  if (clv === null) {
    return <span className="text-xs text-muted-foreground">N/A</span>;
  }

  const positive = clv >= 0;
  return (
    <span
      className={cn(
        "font-mono text-xs font-medium",
        positive ? "text-emerald-400" : "text-red-400"
      )}
    >
      {formatCLV(clv)}
    </span>
  );
}
