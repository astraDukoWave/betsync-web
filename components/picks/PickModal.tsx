"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Pick, PickResolve } from "@/lib/types";

// ---- Create Modal ----
interface CreatePickModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Pick, "id" | "created_at" | "updated_at" | "status" | "grade" | "clv" | "result_margin" | "parlay_id">) => Promise<void>;
}

export function CreatePickModal({ open, onClose, onSubmit }: CreatePickModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    sport: "NBA",
    league: "NBA",
    game_date: "",
    home_team: "",
    away_team: "",
    bet_type: "straight",
    selection: "",
    odds: "",
    stake: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        sport: form.sport as any,
        league: form.league,
        game_date: form.game_date,
        home_team: form.home_team,
        away_team: form.away_team,
        bet_type: form.bet_type as any,
        selection: form.selection,
        odds: Number(form.odds),
        stake: Number(form.stake),
        notes: form.notes || undefined,
        sportsbook_id: undefined,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-surface border-border max-w-lg">
        <DialogHeader>
          <DialogTitle>New Pick</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="sport">Sport</Label>
              <select id="sport" value={form.sport} onChange={set("sport")}
                className="w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground">
                {["NFL","NBA","MLB","NHL","NCAAF","NCAAB","Soccer","Tennis","MMA","Other"].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="bet_type">Bet Type</Label>
              <select id="bet_type" value={form.bet_type} onChange={set("bet_type")}
                className="w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground">
                {["straight","parlay","teaser","prop"].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="home_team">Home Team</Label>
              <Input id="home_team" value={form.home_team} onChange={set("home_team")} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="away_team">Away Team</Label>
              <Input id="away_team" value={form.away_team} onChange={set("away_team")} required />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="selection">Selection</Label>
            <Input id="selection" value={form.selection} onChange={set("selection")} placeholder="e.g. Lakers -4.5" required />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="game_date">Game Date</Label>
              <Input id="game_date" type="date" value={form.game_date} onChange={set("game_date")} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="odds">Odds (American)</Label>
              <Input id="odds" type="number" value={form.odds} onChange={set("odds")} placeholder="-110" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="stake">Stake (units)</Label>
              <Input id="stake" type="number" step="0.5" value={form.stake} onChange={set("stake")} placeholder="1" required />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input id="notes" value={form.notes} onChange={set("notes")} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Create Pick"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---- Resolve Modal ----
interface ResolvePickModalProps {
  pick: Pick | null;
  onClose: () => void;
  onSubmit: (id: string, data: PickResolve) => Promise<void>;
}

export function ResolvePickModal({ pick, onClose, onSubmit }: ResolvePickModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ status: "won", clv: "", result_margin: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pick) return;
    setLoading(true);
    try {
      await onSubmit(pick.id, {
        status: form.status as any,
        clv: form.clv ? Number(form.clv) : undefined,
        result_margin: form.result_margin ? Number(form.result_margin) : undefined,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Dialog open={!!pick} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-surface border-border max-w-sm">
        <DialogHeader>
          <DialogTitle>Resolve Pick</DialogTitle>
        </DialogHeader>
        {pick && (
          <div className="text-sm text-muted-foreground mb-2">
            {pick.away_team} @ {pick.home_team} — {pick.selection}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Result</Label>
            <select value={form.status} onChange={set("status")}
              className="w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground">
              {["won","lost","push","void"].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="clv">CLV % (optional)</Label>
              <Input id="clv" type="number" step="0.1" value={form.clv} onChange={set("clv")} placeholder="+2.5" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="result_margin">Margin (optional)</Label>
              <Input id="result_margin" type="number" step="0.5" value={form.result_margin} onChange={set("result_margin")} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Resolve"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
