"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { Parlay } from "@/lib/types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { OddsChip } from "@/components/shared/OddsChip";
import { formatDate } from "@/lib/formatters";

interface ParlayCardProps {
  parlay: Parlay;
  onOpen?: (parlay: Parlay) => void;
}

export function ParlayCard({ parlay, onOpen }: ParlayCardProps) {
  const [expanded, setExpanded] = useState(false);

  // potential_return is the pre-computed payout from the backend (Parlay type).
  // odds_total is decimal odds. parlay_id is the PK.
  const potentialPayout = parlay.potential_return;

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      {/* Header */}
      <button
        type="button"
        className="w-full flex items-center justify-between p-4 hover:bg-surface-elevated/50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">
              Parlay #{parlay.parlay_id.slice(0, 8)}
            </p>
            <p className="text-xs text-muted-foreground">
              {parlay.picks.length} legs · {formatDate(parlay.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <OddsChip odds={parlay.odds_total} />
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Stake</p>
            <p className="text-sm font-mono text-foreground">{parlay.stake}u</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Payout</p>
            <p className="text-sm font-mono text-foreground">
              {potentialPayout.toFixed(2)}u
            </p>
          </div>
          <StatusBadge status={parlay.status} />
        </div>
      </button>

      {/* Legs (picks) */}
      {expanded && (
        <div className="border-t border-border divide-y divide-border">
          {parlay.picks.map((pick) => (
            <div
              key={pick.pick_id}
              className="flex items-center justify-between px-6 py-3 bg-surface-elevated/30"
            >
              <div className="text-sm">
                <p className="text-foreground">{pick.selection}</p>
                <p className="text-xs text-muted-foreground">
                  {pick.market} · {pick.run_date}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <OddsChip odds={pick.odds_american} />
                <StatusBadge status={pick.status} />
              </div>
            </div>
          ))}
          {onOpen && (
            <div className="px-6 py-3 bg-surface-elevated/20">
              <button
                onClick={() => onOpen(parlay)}
                className="text-xs text-primary hover:underline"
              >
                View details
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
