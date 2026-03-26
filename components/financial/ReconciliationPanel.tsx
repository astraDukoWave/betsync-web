"use client";

import { useReconciliationSummary, useRunReconciliationFix } from "@/lib/financialQueries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState, formatCurrency, StatusPill } from "./FinancialUI";

export function ReconciliationPanel() {
  const { data, isLoading, isError } = useReconciliationSummary();
  const fixMutation = useRunReconciliationFix();

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading reconciliation status...</p>;
  if (isError || !data) return <ErrorState message="Could not load reconciliation data." />;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Reconciliation Status</CardTitle>
        <StatusPill status={data.status} />
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">{data.message}</p>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          <div>Expected: <strong>{formatCurrency(data.expected_balance)}</strong></div>
          <div>Ledger: <strong>{formatCurrency(data.ledger_balance)}</strong></div>
          <div>Drift: <strong>{formatCurrency(data.drift_amount)}</strong></div>
        </div>
        <Button
          onClick={() => fixMutation.mutate()}
          disabled={fixMutation.isPending}
          variant="outline"
        >
          {fixMutation.isPending ? "Running fix..." : "Run simulated fix"}
        </Button>
        {fixMutation.data?.message && (
          <p className="text-xs text-muted-foreground">{fixMutation.data.message}</p>
        )}
      </CardContent>
    </Card>
  );
}
