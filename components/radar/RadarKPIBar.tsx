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

  const avgMarketProb =
    total > 0
      ? items.reduce((sum, x) => sum + x.market_prob, 0) / total
      : null;

  const best = items.reduce<RadarOpportunity | null>((top, x) => {
    if (!top) return x;
    return x.market_prob > top.market_prob ? x : top;
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
        label="Prob. de Mercado Prom."
        value={avgMarketProb !== null ? `${avgMarketProb.toFixed(1)}%` : "--"}
        sub="prob. implícita del mercado"
        icon={TrendingUp}
        trend={avgMarketProb !== null && avgMarketProb > 0 ? "up" : "neutral"}
      />
      <KPICard
        label="Mejor Pick"
        value={best ? `${best.market_prob.toFixed(1)}%` : "--"}
        sub={bestLabel}
        icon={Zap}
        trend={best ? "up" : "neutral"}
      />
    </div>
  );
}
