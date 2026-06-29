"use client";

import { KPICard } from "@/components/dashboard/KPICard";
import { KPICardSkeleton } from "@/components/dashboard/KPICardSkeleton";
import type { RadarOpportunity } from "@/lib/types";
import { Target, TrendingUp, Award, Zap } from "lucide-react";

interface RadarKPIBarProps {
  data: RadarOpportunity[] | undefined;
  isLoading: boolean;
}

const GRADE_ORDER: Record<string, number> = { A: 5, B: 4, C: 3, D: 2, F: 1 };

export function RadarKPIBar({ data, isLoading }: RadarKPIBarProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KPICardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const items = data ?? [];

  const total = items.length;

  const gradeA = items.filter((x) => x.grade === "A").length;

  const avgEdge =
    total > 0
      ? items.reduce((sum, x) => sum + x.edge_pct, 0) / total
      : null;

  const best = items.reduce<RadarOpportunity | null>((top, x) => {
    if (!top) return x;
    return x.edge_pct > top.edge_pct ? x : top;
  }, null);

  const bestLabel = best
    ? `${best.away_team} @ ${best.home_team}`
    : "--";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        label="Oportunidades"
        value={total === 0 ? "--" : total}
        sub="picks detectados"
        icon={Target}
      />
      <KPICard
        label="Grado A"
        value={total === 0 ? "--" : gradeA}
        sub={total > 0 ? `${((gradeA / total) * 100).toFixed(0)}% del total` : undefined}
        icon={Award}
        trend={gradeA > 0 ? "up" : "neutral"}
      />
      <KPICard
        label="Edge Promedio"
        value={avgEdge !== null ? `+${avgEdge.toFixed(1)}%` : "--"}
        sub="vs línea de cierre"
        icon={TrendingUp}
        trend={avgEdge !== null && avgEdge > 0 ? "up" : "neutral"}
      />
      <KPICard
        label="Mejor Pick"
        value={best ? `+${best.edge_pct.toFixed(1)}%` : "--"}
        sub={bestLabel}
        icon={Zap}
        trend={best ? "up" : "neutral"}
      />
    </div>
  );
}
