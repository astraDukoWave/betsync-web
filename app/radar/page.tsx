"use client";

import { useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PipelineButton } from "@/components/pipeline/PipelineButton";
import { RadarKPIBar } from "@/components/radar/RadarKPIBar";
import { RadarFilters } from "@/components/radar/RadarFilters";
import { GradeBadge } from "@/components/shared/GradeBadge";
import { OddsChip } from "@/components/shared/OddsChip";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { ErrorState } from "@/components/shared/ErrorState";
import { useRadarOpportunities } from "@/lib/queries";
import { formatDate } from "@/lib/formatters";
import type { RadarFilters as TRadarFilters, RadarOpportunity } from "@/lib/types";

// Grade hierarchy for minGrade filter: "B" means A and B are included.
const GRADE_ORDER: Record<string, number> = { A: 5, B: 4, C: 3, D: 2, F: 1 };

function applyFilters(
  items: RadarOpportunity[],
  filters: TRadarFilters
): RadarOpportunity[] {
  let result = items;

  if (filters.minGrade) {
    const threshold = GRADE_ORDER[filters.minGrade] ?? 0;
    result = result.filter((x) => (GRADE_ORDER[x.grade] ?? 0) >= threshold);
  }

  if (filters.sortBy) {
    result = [...result].sort((a, b) => {
      if (filters.sortBy === "edge_pct") return b.edge_pct - a.edge_pct;
      if (filters.sortBy === "confidence") return b.confidence - a.confidence;
      if (filters.sortBy === "game_date")
        return a.game_date.localeCompare(b.game_date);
      return 0;
    });
  }

  return result;
}

// Filtered grid rendered from pre-processed data — avoids touching RadarGrid's
// internal hook call (which cannot accept external data without modification).
function FilteredRadarGrid({
  items,
  isLoading,
  isError,
  onRetry,
}: {
  items: RadarOpportunity[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
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
    return <ErrorState onRetry={onRetry} />;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center">
        <p className="text-muted-foreground">
          No se encontraron oportunidades con los filtros actuales.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((opp) => (
        <div
          key={opp.id}
          className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 transition-transform will-change-transform hover:scale-[1.01]"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs text-muted-foreground">
                {opp.sport} · {formatDate(opp.game_date)}
              </p>
              <p className="font-medium text-foreground">
                {opp.away_team} @ {opp.home_team}
              </p>
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
          {opp.notes && (
            <p className="text-xs text-muted-foreground border-t border-border pt-2">
              {opp.notes}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// Next.js 16 App Router: this file has "use client" so metadata must be
// declared in a separate server-only file. Metadata is set in layout or via a
// server wrapper; here we just render the page.
export default function RadarPage() {
  const [filters, setFilters] = useState<TRadarFilters>({});
  const { data, isLoading, isError, refetch } = useRadarOpportunities();

  const filteredData = useMemo(
    () => applyFilters(data ?? [], filters),
    [data, filters]
  );

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Radar de Predicciones
          </h1>
          <p className="text-sm text-muted-foreground">
            Mundial 2026 — Oportunidades de valor detectadas por el pipeline
          </p>
        </div>

        {/* KPI Bar */}
        <RadarKPIBar data={filteredData} isLoading={isLoading} />

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <RadarFilters onFilterChange={setFilters} />
          <PipelineButton />
        </div>

        {/* Filtered Grid */}
        <FilteredRadarGrid
          items={filteredData}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
        />
      </div>
    </AppShell>
  );
}
