import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardFinancePanel } from "@/components/financial/DashboardFinancePanel";

export const metadata: Metadata = {
  title: "Financial Dashboard — BetSync",
};

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Financial Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Ledger-based bankroll control for daily operations.
          </p>
        </div>
        <DashboardFinancePanel />
      </div>
    </AppShell>
  );
}
