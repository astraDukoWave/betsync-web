"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Pick, ParlayCreate } from "@/lib/types";
import { OddsChip } from "@/components/shared/OddsChip";

function americanToDecimal(odds: number): number {
  if (odds > 0) return odds / 100 + 1;
  return 100 / Math.abs(odds) + 1;
}

// Compute approximate combined American odds from a list of picks.
function parlayOdds(legs: Pick[]): number {
  const decimal = legs.reduce(
    (acc, pick) => acc * americanToDecimal(pick.odds_american),
    1
  );
  return Math.round((decimal - 1) * 100);
}

interface ParlayBuilderProps {
  availablePicks: Pick[];
  onSubmit: (data: ParlayCreate) => Promise<void>;
}

export function ParlayBuilder({ availablePicks, onSubmit }: ParlayBuilderProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [stake, setStake] = useState("");
  const [loading, setLoading] = useState(false);

  // Filter using the real PK field: pick_id
  const selectedPicks = availablePicks.filter((p) =>
    selectedIds.includes(p.pick_id)
  );
  const combinedOdds =
    selectedPicks.length >= 2 ? parlayOdds(selectedPicks) : null;

  const toggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length < 2 || !stake) return;
    setLoading(true);
    try {
      await onSubmit({
        stake: Number(stake),
        pick_ids: selectedIds,
      });
      setSelectedIds([]);
      setStake("");
    } finally {
      setLoading(false);
    }
  };

  const pendingPicks = availablePicks.filter((p) => p.status === "pending");

  return (
    <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Parlay Builder
      </h2>

      {/* Leg selector */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          Select legs (pending picks only)
        </p>
        <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
          {pendingPicks.length === 0 && (
            <p className="text-sm text-muted-foreground py-2">
              No pending picks available.
            </p>
          )}
          {pendingPicks.map((pick) => {
            const selected = selectedIds.includes(pick.pick_id);
            return (
              <button
                key={pick.pick_id}
                type="button"
                onClick={() => toggle(pick.pick_id)}
                className={`w-full flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                  selected
                    ? "bg-primary/20 border border-primary/40 text-foreground"
                    : "bg-surface-elevated hover:bg-surface-elevated/80 text-muted-foreground"
                }`}
              >
                <span className="truncate">
                  {pick.selection} ({pick.market})
                </span>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <OddsChip odds={pick.odds_american} />
                  {selected && <X className="h-3 w-3 text-primary" />}
                  {!selected && <Plus className="h-3 w-3" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      {selectedPicks.length > 0 && (
        <div className="rounded-md bg-surface-elevated p-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Legs</span>
            <span className="font-mono text-foreground">
              {selectedPicks.length}
            </span>
          </div>
          {combinedOdds !== null && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Combined odds</span>
              <OddsChip odds={combinedOdds} />
            </div>
          )}
        </div>
      )}

      {/* Submit form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="parlay-stake">Stake (units)</Label>
          <Input
            id="parlay-stake"
            type="number"
            step="0.5"
            min="0.5"
            value={stake}
            onChange={(e) => setStake(e.target.value)}
            placeholder="1"
            required
          />
        </div>
        <Button
          type="submit"
          disabled={loading || selectedIds.length < 2 || !stake}
          className="w-full"
        >
          {loading
            ? "Building..."
            : `Build Parlay (${selectedIds.length} legs)`}
        </Button>
      </form>
    </div>
  );
}
