"use client";

import { AppShell } from "@/components/layout/AppShell";
import { SportsbookCard } from "@/components/settings/SportsbookCard";
import { useSportsbooks, useConfig } from "@/lib/queries";
import { ErrorState } from "@/components/shared/ErrorState";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
export default function SettingsPage() {
  const sportsbooks = useSportsbooks();
  const config = useConfig();

  const isLoading = sportsbooks.isLoading || config.isLoading;
  const isError = sportsbooks.isError || config.isError;

  // Reshape flat config entries into a display-friendly object
  const cfg = config.data
    ? Object.fromEntries(config.data.map((c) => [c.key, c.value]))
    : null;

  const aiConfig = cfg
    ? {
        model: cfg["ai_model"] ?? "—",
        min_grade: cfg["min_grade"] ?? "—",
        min_edge_pct: cfg["min_edge_pct"] ?? "—",
        max_picks_per_day: cfg["max_picks_per_day"] ?? "—",
      }
    : null;

  const unitSizeUsd = cfg?.["unit_size_usd"] ?? null;

  const refetch = () => {
    sportsbooks.refetch();
    config.refetch();
  };

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-xl font-bold text-foreground">Configuración</h1>
          <p className="text-sm text-muted-foreground">
            Manage your sportsbooks and AI engine settings.
          </p>
        </div>

        {/* Sportsbooks */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Sportsbooks
          </h2>
          {isLoading && (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} className="h-16" />
              ))}
            </div>
          )}
          {isError && <ErrorState onRetry={() => refetch()} />}
          {sportsbooks.data && (
            <div className="grid gap-3 sm:grid-cols-2">
              {sportsbooks.data.map((sb) => (
                <SportsbookCard key={sb.sportsbook_id} sportsbook={sb} />
              ))}
            </div>
          )}
        </section>

        {/* AI Config */}
        {aiConfig && (
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Motor IA
            </h2>
            <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Model</span>
                <span className="font-mono text-sm">{aiConfig.model}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Min Grade</span>
                <span className="font-mono text-sm">{aiConfig.min_grade}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Min Edge</span>
                <span className="font-mono text-sm">{aiConfig.min_edge_pct}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Max Picks/Day</span>
                <span className="font-mono text-sm">{aiConfig.max_picks_per_day}</span>
              </div>
              {unitSizeUsd && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Unit Size</span>
                  <span className="font-mono text-sm">${unitSizeUsd}</span>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
