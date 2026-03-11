import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KPICardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function KPICard({
  label,
  value,
  sub,
  icon: Icon,
  trend = "neutral",
  className,
}: KPICardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface p-5 flex flex-col gap-3",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="text-2xl font-bold tabular-nums text-foreground">
          {value}
        </span>
        {sub && (
          <span
            className={cn(
              "text-sm font-medium",
              trend === "up" && "text-emerald-400",
              trend === "down" && "text-red-400",
              trend === "neutral" && "text-muted-foreground"
            )}
          >
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}
