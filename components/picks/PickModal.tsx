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
import type { Pick, PickCreate, PickResolve } from "@/lib/types";
import { isOddsInDeadZone } from "@/lib/utils";

// ---- Create Modal ----
interface CreatePickModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PickCreate) => Promise<void>;
}

export function CreatePickModal({
  open,
  onClose,
  onSubmit,
}: CreatePickModalProps) {
  const [loading, setLoading] = useState(false);
  const [oddsError, setOddsError] = useState<string | null>(null);
  const [form, setForm] = useState({
    run_date: new Date().toISOString().split("T")[0],
    market: "moneyline",
    selection: "",
    odds_american: "",
    stake: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const oddsNum = Number(form.odds_american);
    if (isOddsInDeadZone(oddsNum)) {
      setOddsError("Odds inválidos (zona muerta: -99 a +99)");
      return;
    }
    setOddsError(null);

    setLoading(true);
    try {
      await onSubmit({
        run_date: form.run_date,
        market: form.market,
        selection: form.selection,
        odds_american: oddsNum,
        stake: Number(form.stake),
        source: "manual",
      });
      onClose();
      setForm({
        run_date: new Date().toISOString().split("T")[0],
        market: "moneyline",
        selection: "",
        odds_american: "",
        stake: "",
      });
    } finally {
      setLoading(false);
    }
  };

  const set =
    (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-surface border-border max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo Pick</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="run_date">Fecha</Label>
              <Input
                id="run_date"
                type="date"
                value={form.run_date}
                onChange={set("run_date")}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="market">Mercado</Label>
              <select
                id="market"
                value={form.market}
                onChange={set("market")}
                className="w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground"
              >
                {["moneyline", "spread", "total", "1x2", "btts", "prop"].map(
                  (m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="selection">Selección</Label>
            <Input
              id="selection"
              value={form.selection}
              onChange={set("selection")}
              placeholder="e.g. Lakers -4.5"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="odds_american">Odds (American)</Label>
              <Input
                id="odds_american"
                type="number"
                value={form.odds_american}
                onChange={(e) => {
                  setOddsError(null);
                  set("odds_american")(e);
                }}
                placeholder="-110"
                required
                className={oddsError ? "border-rose-500" : ""}
              />
              {oddsError && (
                <p className="text-xs text-rose-500 mt-1">{oddsError}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="stake">Stake (USD)</Label>
              <Input
                id="stake"
                type="number"
                step="0.5"
                min="0.5"
                value={form.stake}
                onChange={set("stake")}
                placeholder="100"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Crear Pick"}
            </Button>
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

export function ResolvePickModal({
  pick,
  onClose,
  onSubmit,
}: ResolvePickModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    status: "won",
    closing_odds_decimal: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pick) return;
    setLoading(true);
    try {
      await onSubmit(pick.pick_id, {
        status: form.status as PickResolve["status"],
        closing_odds_decimal: form.closing_odds_decimal
          ? Number(form.closing_odds_decimal)
          : undefined,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const set =
    (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Dialog open={!!pick} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-surface border-border max-w-sm">
        <DialogHeader>
          <DialogTitle>Resolver Pick</DialogTitle>
        </DialogHeader>
        {pick && (
          <p className="text-sm text-muted-foreground mb-2">
            {pick.selection} — {pick.market} ({pick.run_date})
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Resultado</Label>
            <select
              value={form.status}
              onChange={set("status")}
              className="w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground"
            >
              {["won", "lost", "push", "void"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="closing_odds_decimal">
              Closing odds decimal (opcional)
            </Label>
            <Input
              id="closing_odds_decimal"
              type="number"
              step="0.001"
              value={form.closing_odds_decimal}
              onChange={set("closing_odds_decimal")}
              placeholder="1.909"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Resolver"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
