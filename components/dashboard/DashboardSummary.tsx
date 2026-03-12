"use client";

import { useDashboard } from "@/lib/queries";
import { KPICard } from "./KPICard";
import { ErrorState } from "@/components/shared/ErrorState";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import {
  TrendingUp,
  TrendingDown,
  Target,
  BarChart2,
  Zap,
  Clock,
} from "lucide-react";
import {
  formatROI,
  formatWinRate,
  formatUnits,
  formatOdds,
  formatCLV,
  formatStreak,
} from "@/lib/formatters";

export function DashboardSummary() {
  const { data, isLoading, isError, refetch } = useDashboard();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} className="h-28" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <ErrorState
        title="Failed to load dashboard"
        message="Could not fetch summary stats."
        onRetry={() => refetch()}
      />
    );
  }

  // data.summary is the KPISummary returned directly by /dashboard/summary
  const s = data.summary;

  // Real backend field names:
  // hit_rate (0-1), total_stake (USD), total_return (USD),
  // roi (decimal e.g. -0.0994), avg_odds_decimal, avg_clv,
  // current_streak: { type: 'won'|'lost', count: number }
  const roi = (s.roi ?? 0) * 100; // backend returns -0.0994, display as %
  const avgClv = s.avg_clv ?? 0;
  const pnl = (s.total_return ?? 0) - (s.total_stake ?? 0);
  const streakNum =
    s.current_streak
      ? (s.current_streak.type === "won" ? 1 : -1) * s.current_streak.count
      : 0;
  const winRate = s.hit_rate ?? 0;

  function numTrend(v: number): "up" | "down" | "neutral" {
    if (v > 0) return "up";
    if (v < 0) return "down";
    return "neutral";
  }

  const streakLabel = s.current_streak
    ? `${s.current_streak.type === "won" ? "W" : "L"}${s.current_streak.count}`
    : "-";

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Hit Rate */}
      <KPICard
        title="Hit Rate"
        value={formatWinRate(winRate)}
        icon={Target}
        trend={winRate > 0.52 ? "up" : "neutral"}
      />

      {/* ROI */}
      <KPICard
        title="ROI"
        value={formatROI(roi)}
        icon={roi >= 0 ? TrendingUp : TrendingDown}
        trend={numTrend(roi)}
      />

      {/* P&L */}
      <KPICard
        title="P&L"
        value={`$${pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}`}
        icon={pnl >= 0 ? TrendingUp : TrendingDown}
        trend={numTrend(pnl)}
      />

      {/* Avg Odds */}
      <KPICard
        title="Avg Odds"
        value={formatOdds(s.avg_odds_decimal ?? null)}
        icon={BarChart2}
        trend="neutral"
      />

      {/* Avg CLV */}
      <KPICard
        title="Avg CLV"
        value={formatCLV(avgClv)}
        icon={Zap}
        trend={numTrend(avgClv)}
      />

      {/* Streak */}
      <KPICard
        title="Streak"
        value={streakLabel}
        subtitle={s.total_picks > 0 ? `${s.total_picks} total picks` : undefined}
        icon={Clock}
        trend={numTrend(streakNum)}
      />
    </div>
  );
}
