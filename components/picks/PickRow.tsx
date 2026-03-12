"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { Pick } from "@/lib/types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { GradeBadge } from "@/components/shared/GradeBadge";
import { CLVBadge } from "@/components/shared/CLVBadge";
import { OddsChip } from "@/components/shared/OddsChip";
import { formatDate } from "@/lib/formatters";

interface PickRowProps {
  pick: Pick;
  onResolve?: (pick: Pick) => void;
}

export function PickRow({ pick, onResolve }: PickRowProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className="border-b border-border hover:bg-surface-elevated/50 cursor-pointer transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
            <span className="text-sm font-medium text-foreground">
              {pick.selection} en {pick.market}
            </span>
          </div>
        </td>
        <td className="py-3 px-4 text-sm text-muted-foreground">{pick.source}</td>
        <td className="py-3 px-4 text-sm text-muted-foreground">{formatDate(pick.run_date)}</td>
        <td className="py-3 px-4">
          <OddsChip odds={pick.odds_american} />
        </td>
        <td className="py-3 px-4 text-sm font-mono text-foreground">{pick.stake}u</td>
        <td className="py-3 px-4">
          {pick.grade ? <GradeBadge grade={pick.grade} /> : <span className="text-muted-foreground text-xs">—</span>}
        </td>
        <td className="py-3 px-4">
          {pick.clv != null ? <CLVBadge clv={pick.clv} /> : <span className="text-muted-foreground text-xs">—</span>}
        </td>
        <td className="py-3 px-4">
          <StatusBadge status={pick.status} />
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-border bg-surface-elevated/30">
          <td colSpan={8} className="py-4 px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Market</p>
                <p className="font-medium text-foreground">{pick.market}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Stake</p>
                <p className="font-medium text-foreground font-mono tabular-nums">{pick.stake}u</p>
              </div>
              {pick.sportsbook_id && (
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Sportsbook</p>
                  <p className="font-medium text-foreground">{pick.sportsbook_id}</p>
                </div>
              )}
            </div>
            {pick.status === "pending" && onResolve && (
              <div className="mt-3 pt-3 border-t border-border">
                <button
                  onClick={(e) => { e.stopPropagation(); onResolve(pick); }}
                  className="text-xs text-primary hover:underline"
                >
                  Resolve pick
                </button>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
