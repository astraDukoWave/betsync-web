import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { ReconciliationPanel } from "@/components/financial/ReconciliationPanel";

export const metadata: Metadata = {
  title: "Reconciliation — BetSync",
};

export default function ReconciliationPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Reconciliation Panel</h1>
          <p className="text-sm text-muted-foreground">
            Compare expected vs ledger balance and run a simulated fix.
          </p>
        </div>
        <ReconciliationPanel />
      </div>
    </AppShell>
  );
}
