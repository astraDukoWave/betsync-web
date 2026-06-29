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

export function ParlayModal({ parlay, onClose }: ParlayModalProps) {
  if (!parlay) return null;

  // potential_return is the pre-computed payout from the backend.
  // odds_total is decimal odds. parlay_id is the PK.
  const potentialPayout = parlay.potential_return;

  return (
    <Dialog open={!!parlay} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-surface border-border max-w-xl">
        <DialogHeader>
          <DialogTitle>
            Parlay #{parlay.parlay_id.slice(0, 8)}
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
            <OddsChip odds={parlay.odds_total} />
          </div>
          <div className="rounded-md bg-surface-elevated p-3 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Stake / Payout</p>
            <p className="font-mono text-foreground">
              {parlay.stake}u / {potentialPayout.toFixed(2)}u
            </p>
          </div>
        </div>

        {/* Dates */}
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>Created: {formatDate(parlay.created_at)}</span>
          <span>Updated: {formatDate(parlay.updated_at)}</span>
        </div>

        {/* Legs (picks) */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Legs ({parlay.picks.length})
          </h3>
          <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
            {parlay.picks.map((pick, i) => (
              <div
                key={pick.pick_id}
                className="flex items-center justify-between px-4 py-3 bg-surface-elevated/30"
              >
                <div>
                  <p className="text-sm text-foreground">
                    <span className="text-muted-foreground mr-2">{i + 1}.</span>
                    {pick.selection}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {pick.market} · {formatDate(pick.run_date)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <OddsChip odds={pick.odds_american} />
                  <StatusBadge status={pick.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
