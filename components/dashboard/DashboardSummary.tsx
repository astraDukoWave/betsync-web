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

  const s = data.summary;
  const roiTrend = s.roi >= 0 ? "up" : "down";
  const clvTrend = (s.avg_clv ?? 0) >= 0 ? "up" : "down";

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <KPICard
        label="Win Rate"
        value={formatWinRate(s.win_rate)}
        sub={`${s.won}W / ${s.lost}L`}
        icon={Target}
        trend={s.win_rate >= 0.52 ? "up" : "neutral"}
      />
      <KPICard
        label="ROI"
        value={formatROI(s.roi)}
        icon={s.roi >= 0 ? TrendingUp : TrendingDown}
        trend={roiTrend}
      />
      <KPICard
        label="Units P&L"
        value={formatUnits(s.units_won)}
        sub={`${s.total_picks} picks`}
        icon={BarChart2}
        trend={s.units_won >= 0 ? "up" : "down"}
      />
      <KPICard
        label="Avg Odds"
        value={formatOdds(Math.round(s.avg_odds))}
        icon={Zap}
      />
      <KPICard
        label="Avg CLV"
        value={formatCLV(s.avg_clv)}
        icon={TrendingUp}
        trend={clvTrend}
      />
      <KPICard
        label="Streak"
        value={formatStreak(s.streak)}
        sub={s.pending > 0 ? `${s.pending} pending` : undefined}
        icon={Clock}
        trend={
          s.streak > 0 ? "up" : s.streak < 0 ? "down" : "neutral"
        }
      />
    </div>
  );
}
