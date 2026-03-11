import { AppShell } from "@/components/layout/AppShell";
import { DashboardSummary } from "@/components/dashboard/DashboardSummary";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — BetSync",
};

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Your betting performance at a glance.</p>
        </div>
        <DashboardSummary />
      </div>
    </AppShell>
  );
}
