"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PicksTable } from "@/components/picks/PicksTable";
import { useCreatePick } from "@/lib/queries";
import { DUMMY_MATCH_ID, DUMMY_SPORTSBOOK_ID } from "@/lib/picksApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";

export default function PicksPage() {
  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState("");
  const [odds, setOdds] = useState("-110");
  const [stake, setStake] = useState("");

  const create = useCreatePick();

  const resetForm = () => {
    setSelection("");
    setOdds("-110");
    setStake("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const oddsNum = Number(odds);
    const stakeNum = Number(stake);

    if (!selection.trim() || !stakeNum) {
      toast.error("Campos requeridos", {
        description: "Selección y Stake son obligatorios",
      });
      return;
    }

    if (oddsNum > -100 && oddsNum < 100) {
      toast.error("Momio inválido", {
        description: "No se permiten odds entre -99 y +99",
      });
      return;
    }

    create.mutate(
      {
        match_id: DUMMY_MATCH_ID,
        sportsbook_id: DUMMY_SPORTSBOOK_ID,
        run_date: new Date().toISOString().split("T")[0],
        market: "moneyline",
        selection: selection.trim(),
        odds_american: oddsNum,
        stake: stakeNum,
        source: "manual",
      },
      {
        onSuccess: () => {
          toast.success("Pick registrado");
          setOpen(false);
          resetForm();
        },
        onError: (err) => {
          const apiErr = err as { code?: string; message?: string };
          toast.error(apiErr.code ?? "Error", {
            description: apiErr.message ?? "No se pudo crear el pick",
          });
        },
      }
    );
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Libreta de Apuestas
            </h1>
            <p className="text-sm text-muted-foreground">
              All your picks and parlays in one place.
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-500">
                <Plus className="h-4 w-4 mr-1.5" />
                Nuevo Pick
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Pick Rápido</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pick-selection">Selección</Label>
                  <Input
                    id="pick-selection"
                    placeholder="Lakers ML, Over 220.5..."
                    value={selection}
                    onChange={(e) => setSelection(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="pick-odds">Momio</Label>
                    <Input
                      id="pick-odds"
                      type="number"
                      placeholder="-110"
                      value={odds}
                      onChange={(e) => setOdds(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pick-stake">Stake</Label>
                    <Input
                      id="pick-stake"
                      type="number"
                      placeholder="200"
                      value={stake}
                      onChange={(e) => setStake(e.target.value)}
                      className="font-mono tabular-nums"
                      min="1"
                      step="any"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Defaults: market=moneyline, source=manual, run_date=hoy
                </p>
                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500"
                  disabled={create.isPending}
                >
                  {create.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  ) : (
                    <Plus className="h-4 w-4 mr-1.5" />
                  )}
                  Registrar Pick
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <PicksTable />
      </div>
    </AppShell>
  );
}
