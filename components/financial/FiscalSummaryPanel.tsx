"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { downloadTaxCSV } from "@/lib/financialApi";
import { useFinancialFiscalSummary } from "@/lib/financialQueries";
import { ErrorState, formatCurrency } from "./FinancialUI";

const currentYear = new Date().getFullYear();

export function FiscalSummaryPanel() {
  const [taxYear, setTaxYear] = useState(currentYear);
  const { data, isLoading, isError } = useFinancialFiscalSummary(taxYear);

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading fiscal summary...</p>;
  if (isError || !data) return <ErrorState message="Could not load fiscal summary." />;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>Fiscal Summary</CardTitle>
        <input
          type="number"
          value={taxYear}
          onChange={(event) => setTaxYear(Number(event.target.value))}
          className="h-9 w-24 rounded border border-input bg-background px-2 text-sm"
        />
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          <div>Taxable base: <strong>{formatCurrency(data.taxable_base, data.currency)}</strong></div>
          <div>Deductible losses: <strong>{formatCurrency(data.deductible_losses, data.currency)}</strong></div>
          <div>Net taxable: <strong>{formatCurrency(data.net_taxable, data.currency)}</strong></div>
        </div>
        <Button onClick={() => downloadTaxCSV(taxYear)}>Export CSV</Button>
      </CardContent>
    </Card>
  );
}
