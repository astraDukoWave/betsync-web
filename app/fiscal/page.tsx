import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { FiscalSummaryPanel } from "@/components/financial/FiscalSummaryPanel";

export const metadata: Metadata = {
  title: "Fiscal Summary — BetSync",
};

export default function FiscalPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Fiscal Summary</h1>
          <p className="text-sm text-muted-foreground">
            Taxable base estimate and accountant-ready CSV export.
          </p>
        </div>
        <FiscalSummaryPanel />
      </div>
    </AppShell>
  );
}
