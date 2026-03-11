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
              {pick.away_team} @ {pick.home_team}
            </span>
          </div>
        </td>
        <td className="py-3 px-4 text-sm text-muted-foreground">{pick.sport}</td>
        <td className="py-3 px-4 text-sm text-muted-foreground">{formatDate(pick.game_date)}</td>
        <td className="py-3 px-4">
          <OddsChip odds={pick.odds} />
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
                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Selection</p>
                <p className="font-medium text-foreground">{pick.selection}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Bet Type</p>
                <p className="font-medium text-foreground capitalize">{pick.bet_type}</p>
              </div>
              {pick.sportsbook_id && (
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Sportsbook</p>
                  <p className="font-medium text-foreground">{pick.sportsbook_id}</p>
                </div>
              )}
              {pick.result_margin != null && (
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Margin</p>
                  <p className={`font-mono font-medium ${pick.result_margin >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {pick.result_margin > 0 ? "+" : ""}{pick.result_margin}
                  </p>
                </div>
              )}
              {pick.notes && (
                <div className="col-span-2 md:col-span-4">
                  <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-foreground">{pick.notes}</p>
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
