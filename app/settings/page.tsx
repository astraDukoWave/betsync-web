"use client";

import { AppShell } from "@/components/layout/AppShell";
import { SportsbookCard } from "@/components/settings/SportsbookCard";
import { useSettings } from "@/lib/queries";
import { ErrorState } from "@/components/shared/ErrorState";
import { SkeletonCard } from "@/components/shared/SkeletonCard";

export default function SettingsPage() {
  const { data, isLoading, isError, refetch } = useSettings();

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-xl font-bold text-foreground">Configuración</h1>
          <p className="text-sm text-muted-foreground">Manage your sportsbooks and AI engine settings.</p>
        </div>

        {/* Sportsbooks */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Sportsbooks</h2>
          {isLoading && (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} className="h-16" />
              ))}
            </div>
          )}
          {isError && <ErrorState onRetry={() => refetch()} />}
          {data && (
            <div className="grid gap-3 sm:grid-cols-2">
              {data.sportsbooks.map((sb) => (
                <SportsbookCard key={sb.id} sportsbook={sb} />
              ))}
            </div>
          )}
        </section>

        {/* AI Config */}
        {data?.ai_config && (
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Motor IA</h2>
            <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Model</span>
                <span className="font-mono text-sm">{data.ai_config.model}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Min Grade</span>
                <span className="font-mono text-sm">{data.ai_config.min_grade}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Min Edge</span>
                <span className="font-mono text-sm">{data.ai_config.min_edge_pct}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Max Picks/Day</span>
                <span className="font-mono text-sm">{data.ai_config.max_picks_per_day}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Unit Size</span>
                <span className="font-mono text-sm">${data.unit_size_usd}</span>
              </div>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
