"use client";

import { useState } from "react";
import { usePicks } from "@/lib/queries";
import type { Pick } from "@/lib/types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { GradeBadge } from "@/components/shared/GradeBadge";
import { OddsChip } from "@/components/shared/OddsChip";
import { CLVBadge } from "@/components/shared/CLVBadge";
import { ErrorState } from "@/components/shared/ErrorState";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { formatDate } from "@/lib/formatters";
import { ChevronDown, ChevronRight } from "lucide-react";

function PickRow({ pick }: { pick: Pick }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className="border-b border-border cursor-pointer hover:bg-surface-elevated/50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="px-4 py-3">
          {expanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </td>
        <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(pick.game_date)}</td>
        <td className="px-4 py-3 text-sm font-medium">{pick.selection}</td>
        <td className="px-4 py-3">
          <OddsChip odds={pick.odds} />
        </td>
        <td className="px-4 py-3">
          <GradeBadge grade={pick.grade} />
        </td>
        <td className="px-4 py-3">
          <StatusBadge status={pick.status} />
        </td>
        <td className="px-4 py-3">
          <CLVBadge clv={pick.clv} />
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-border bg-surface-elevated/30">
          <td colSpan={7} className="px-6 py-3">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Match</p>
                <p className="font-medium">{pick.away_team} @ {pick.home_team}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Stake</p>
                <p className="font-medium">{pick.stake}u</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Notes</p>
                <p className="text-muted-foreground">{pick.notes ?? "-"}</p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export function PicksTable() {
  const { data, isLoading, isError, refetch } = usePicks({ page_size: 50 });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} className="h-12" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  const picks = data?.items ?? [];

  if (picks.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center">
        <p className="text-muted-foreground">No picks yet. Add your first pick to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface">
            <th className="w-8 px-4 py-3" />
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Date</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Selection</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Odds</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Grade</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">CLV</th>
          </tr>
        </thead>
        <tbody className="bg-surface">
          {picks.map((pick) => (
            <PickRow key={pick.id} pick={pick} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
