import { cn } from "@/lib/utils";
import type { PickStatus } from "@/lib/types";

const STATUS_CONFIG: Record<
  PickStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  },
  won: {
    label: "Won",
    className: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
  lost: {
    label: "Lost",
    className: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  },
  push: {
    label: "Push",
    className: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  },
  void: {
    label: "Void",
    className: "bg-zinc-700/30 text-zinc-500 border-zinc-600/30",
  },
};

export function StatusBadge({ status }: { status: PickStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
