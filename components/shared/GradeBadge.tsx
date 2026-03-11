import { cn } from "@/lib/utils";
import type { Grade } from "@/lib/types";

const GRADE_CONFIG: Record<Grade, { className: string }> = {
  A: { className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  B: { className: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  C: { className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  D: { className: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
  F: { className: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30" },
};

export function GradeBadge({ grade }: { grade: Grade | null }) {
  if (!grade) return null;
  const config = GRADE_CONFIG[grade];
  return (
    <span
      className={cn(
        "inline-flex h-6 w-6 items-center justify-center rounded border text-xs font-bold font-mono",
        config.className
      )}
    >
      {grade}
    </span>
  );
}
