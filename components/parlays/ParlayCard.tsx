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

function americanToDecimal(odds: number): number {
  if (odds > 0) return odds / 100 + 1;
  return 100 / Math.abs(odds) + 1;
}

export function ParlayCard({ parlay, onOpen }: ParlayCardProps) {
  const [expanded, setExpanded] = useState(false);

  const potentialPayout = parlay.payout ?? parlay.stake * americanToDecimal(parlay.odds);

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
              {parlay.name ?? `Parlay #${parlay.id.slice(0, 8)}`}
            </p>
            <p className="text-xs text-muted-foreground">
              {parlay.legs.length} legs · {formatDate(parlay.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <OddsChip odds={parlay.odds} />
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Stake</p>
            <p className="text-sm font-mono text-foreground">{parlay.stake}u</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Payout</p>
            <p className="text-sm font-mono text-foreground">{potentialPayout.toFixed(2)}u</p>
          </div>
          <StatusBadge status={parlay.status} />
        </div>
      </button>

      {/* Legs */}
      {expanded && (
        <div className="border-t border-border divide-y divide-border">
          {parlay.legs.map((leg) => (
            <div key={leg.id} className="flex items-center justify-between px-6 py-3 bg-surface-elevated/30">
              <div className="text-sm">
                <p className="text-foreground">{leg.selection}</p>
                <p className="text-xs text-muted-foreground">
                  {leg.away_team} @ {leg.home_team} · {leg.sport}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <OddsChip odds={leg.odds} />
                <StatusBadge status={leg.status} />
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
