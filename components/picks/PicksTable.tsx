"use client";

import { useState } from "react";
import { usePicks, useResolvePick } from "@/lib/queries";
import type { Pick, PickStatus } from "@/lib/types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { GradeBadge } from "@/components/shared/GradeBadge";
import { OddsChip } from "@/components/shared/OddsChip";
import { CLVBadge } from "@/components/shared/CLVBadge";
import { ErrorState } from "@/components/shared/ErrorState";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { formatDate } from "@/lib/formatters";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

function ResolveButtons({ pick }: { pick: Pick }) {
  const resolve = useResolvePick();

  if (pick.status !== "pending") return null;

  const vars = resolve.variables as
    | { id: string; data: { status: string } }
    | undefined;
  const isResolving = resolve.isPending && vars?.id === pick.pick_id;
  const resolvingStatus = isResolving ? vars?.data?.status : null;

  const handleResolve = (
    e: React.MouseEvent,
    status: Exclude<PickStatus, "pending">
  ) => {
    e.stopPropagation();
    resolve.mutate(
      { id: pick.pick_id, data: { status } },
      {
        onError: (err) => {
          const apiErr = err as { code?: string; message?: string };
          toast.error(apiErr.code ?? "Error de resolución", {
            description: apiErr.message ?? "No se pudo resolver el pick",
          });
        },
      }
    );
  };

  const btnBase =
    "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors disabled:opacity-50";

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={(e) => handleResolve(e, "won")}
        disabled={isResolving}
        className={`${btnBase} bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/20`}
        title="Won"
      >
        {resolvingStatus === "won" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          "W"
        )}
      </button>
      <button
        onClick={(e) => handleResolve(e, "lost")}
        disabled={isResolving}
        className={`${btnBase} bg-rose-500/10 text-rose-500 border border-rose-500/30 hover:bg-rose-500/20`}
        title="Lost"
      >
        {resolvingStatus === "lost" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          "L"
        )}
      </button>
      <button
        onClick={(e) => handleResolve(e, "void")}
        disabled={isResolving}
        className={`${btnBase} bg-slate-400/10 text-slate-400 border border-slate-400/30 hover:bg-slate-400/20`}
        title="Void"
      >
        {resolvingStatus === "void" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          "V"
        )}
      </button>
    </div>
  );
}

function PickRow({ pick }: { pick: Pick }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className="border-b border-border cursor-pointer hover:bg-surface-elevated/50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            )}
            <span className="text-sm font-medium">
              {pick.selection} en {pick.market}
            </span>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-muted-foreground">
          {pick.source}
        </td>
        <td className="px-4 py-3 text-sm text-muted-foreground">
          {formatDate(pick.run_date)}
        </td>
        <td className="px-4 py-3">
          <OddsChip odds={pick.odds_american} />
        </td>
        <td className="px-4 py-3 text-sm font-mono tabular-nums">
          {pick.stake}u
        </td>
        <td className="px-4 py-3">
          <GradeBadge grade={pick.grade} />
        </td>
        <td className="px-4 py-3">
          <CLVBadge clv={pick.clv} />
        </td>
        <td className="px-4 py-3">
          <StatusBadge status={pick.status} />
        </td>
        <td className="px-4 py-3">
          <ResolveButtons pick={pick} />
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-border bg-surface-elevated/30">
          <td colSpan={9} className="px-6 py-3">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Market</p>
                <p className="font-medium">{pick.market}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Stake</p>
                <p className="font-medium">{pick.stake}u</p>
              </div>
              {pick.sportsbook_id && (
                <div>
                  <p className="text-xs text-muted-foreground">Sportsbook</p>
                  <p className="text-muted-foreground">
                    {pick.sportsbook_id}
                  </p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export function PicksTable() {
  const { data, isLoading, isError, refetch } = usePicks({ limit: 50 });

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
        <p className="text-muted-foreground">
          No picks yet. Add your first pick to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface">
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Selection
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Source
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Odds
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Stake
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Grade
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              CLV
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-surface">
          {picks.map((pick) => (
            <PickRow key={pick.pick_id} pick={pick} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
