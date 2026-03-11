import { AppShell } from "@/components/layout/AppShell";
import { PicksTable } from "@/components/picks/PicksTable";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Picks & Parlays — BetSync",
};

export default function PicksPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Libreta de Apuestas</h1>
          <p className="text-sm text-muted-foreground">All your picks and parlays in one place.</p>
        </div>
        <PicksTable />
      </div>
    </AppShell>
  );
}
