"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Parlay } from "@/lib/types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { OddsChip } from "@/components/shared/OddsChip";
import { formatDate } from "@/lib/formatters";

interface ParlayModalProps {
  parlay: Parlay | null;
  onClose: () => void;
}

function americanToDecimal(odds: number): number {
  if (odds > 0) return odds / 100 + 1;
  return 100 / Math.abs(odds) + 1;
}

export function ParlayModal({ parlay, onClose }: ParlayModalProps) {
  if (!parlay) return null;

  const potentialPayout = parlay.payout ?? parlay.stake * americanToDecimal(parlay.odds);

  return (
    <Dialog open={!!parlay} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-surface border-border max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {parlay.name ?? `Parlay #${parlay.id.slice(0, 8)}`}
          </DialogTitle>
        </DialogHeader>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-md bg-surface-elevated p-3 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
            <StatusBadge status={parlay.status} />
          </div>
          <div className="rounded-md bg-surface-elevated p-3 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Odds</p>
            <OddsChip odds={parlay.odds} />
          </div>
          <div className="rounded-md bg-surface-elevated p-3 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Stake / Payout</p>
            <p className="font-mono text-foreground">{parlay.stake}u / {potentialPayout.toFixed(2)}u</p>
          </div>
        </div>

        {/* Dates */}
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>Created: {formatDate(parlay.created_at)}</span>
          <span>Updated: {formatDate(parlay.updated_at)}</span>
        </div>

        {/* Legs */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Legs ({parlay.legs.length})
          </h3>
          <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
            {parlay.legs.map((leg, i) => (
              <div key={leg.id} className="flex items-center justify-between px-4 py-3 bg-surface-elevated/30">
                <div>
                  <p className="text-sm text-foreground">
                    <span className="text-muted-foreground mr-2">{i + 1}.</span>
                    {leg.selection}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {leg.away_team} @ {leg.home_team} · {leg.sport} · {formatDate(leg.game_date)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <OddsChip odds={leg.odds} />
                  <StatusBadge status={leg.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
