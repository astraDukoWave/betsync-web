import { cn } from "@/lib/utils";
import { formatCLV } from "@/lib/formatters";

export function CLVBadge({ clv }: { clv: number | null }) {
  if (clv == null) {
    return <span className="font-mono text-xs text-slate-400">-</span>;
  }

  return (
    <span
      className={cn(
        "font-mono text-xs font-medium",
        clv > 0 && "text-emerald-400",
        clv < 0 && "text-red-400",
        clv === 0 && "text-slate-400"
      )}
    >
      {formatCLV(clv)}
    </span>
  );
}
