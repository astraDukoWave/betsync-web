"use client";

import { AppShell } from "@/components/layout/AppShell";
import { SportsbookCard } from "@/components/settings/SportsbookCard";
import { ConfigRow } from "@/components/settings/ConfigRow";
import { useSportsbooks, useConfig, useUpdateConfig } from "@/lib/queries";
import { ErrorState } from "@/components/shared/ErrorState";
import { SkeletonCard } from "@/components/shared/SkeletonCard";

const AI_CONFIG_ENTRIES: {
  key: string;
  label: string;
  type?: "text" | "number" | "select";
  options?: string[];
  suffix?: string;
}[] = [
  { key: "ai_model", label: "Model" },
  { key: "min_grade", label: "Min Grade", type: "select", options: ["A", "B", "C", "D", "F"] },
  { key: "min_edge_pct", label: "Min Edge", type: "number", suffix: "%" },
  { key: "max_picks_per_day", label: "Max Picks/Day", type: "number" },
  { key: "unit_size_usd", label: "Unit Size", type: "number", suffix: "$" },
];

export default function SettingsPage() {
  const sportsbooks = useSportsbooks();
  const config = useConfig();
  const updateConfig = useUpdateConfig();

  const isLoading = sportsbooks.isLoading || config.isLoading;
  const isError = sportsbooks.isError || config.isError;

  const cfg = config.data
    ? Object.fromEntries(config.data.map((c) => [c.key, c.value]))
    : null;

  const handleConfigSave = async (key: string, value: string | number) => {
    await updateConfig.mutateAsync({ key, value: String(value) });
  };

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
        {cfg && (
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Motor IA
            </h2>
            <div className="rounded-xl border border-border bg-surface p-4">
              {AI_CONFIG_ENTRIES.map(({ key, label, type, options, suffix }) => (
                <ConfigRow
                  key={key}
                  label={label}
                  value={cfg[key] ?? "—"}
                  type={type}
                  options={options}
                  suffix={suffix}
                  onSave={(v) => handleConfigSave(key, v)}
                  disabled={!(key in cfg)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
