"use client";

import { useRadarOpportunities } from "@/lib/queries";
import type { RadarOpportunity } from "@/lib/types";
import { GradeBadge } from "@/components/shared/GradeBadge";
import { OddsChip } from "@/components/shared/OddsChip";
import { ErrorState } from "@/components/shared/ErrorState";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { formatDate } from "@/lib/formatters";

function RadarCard({ opp }: { opp: RadarOpportunity }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 transition-transform will-change-transform hover:scale-[1.01]">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-muted-foreground">{opp.sport} · {formatDate(opp.game_date)}</p>
          <p className="font-medium text-foreground">{opp.away_team} @ {opp.home_team}</p>
        </div>
        <GradeBadge grade={opp.grade} />
      </div>
      <p className="text-sm text-muted-foreground">{opp.selection}</p>
      <div className="flex items-center justify-between">
        <OddsChip odds={opp.odds} />
        <span className="text-xs text-emerald-400 font-medium">
          +{opp.edge_pct.toFixed(1)}% edge
        </span>
      </div>
    </div>
  );
}

export function RadarGrid() {
  const { data, isLoading, isError, refetch } = useRadarOpportunities();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} className="h-36" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center">
        <p className="text-muted-foreground">No opportunities found. Run the radar to scan for picks.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((opp) => (
        <RadarCard key={opp.id} opp={opp} />
      ))}
    </div>
  );
}
