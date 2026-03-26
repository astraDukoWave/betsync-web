import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { LedgerTable } from "@/components/financial/LedgerTable";

export const metadata: Metadata = {
  title: "Ledger — BetSync",
};

export default function LedgerPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Ledger View</h1>
          <p className="text-sm text-muted-foreground">
            Every movement with transaction type and resulting balance.
          </p>
        </div>
        <LedgerTable />
      </div>
    </AppShell>
  );
}
