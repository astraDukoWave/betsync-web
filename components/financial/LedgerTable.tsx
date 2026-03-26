"use client";

import { useLedgerEntries } from "@/lib/financialQueries";
import { EmptyState, ErrorState, formatCurrency } from "./FinancialUI";

export function LedgerTable() {
  const { data, isLoading, isError } = useLedgerEntries(25);

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading ledger...</p>;
  if (isError) return <ErrorState message="Could not load ledger entries." />;
  if (!data || data.length === 0) return <EmptyState message="No transactions yet." />;

  return (
    <div className="rounded-md border border-border overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-left">Date</th>
            <th className="px-3 py-2 text-left">Type</th>
            <th className="px-3 py-2 text-left">Reference</th>
            <th className="px-3 py-2 text-right">Amount</th>
            <th className="px-3 py-2 text-right">Balance After</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry) => (
            <tr key={entry.id} className="border-t border-border/70">
              <td className="px-3 py-2">{new Date(entry.timestamp).toLocaleString("en-US")}</td>
              <td className="px-3 py-2 uppercase">{entry.type}</td>
              <td className="px-3 py-2">{entry.reference}</td>
              <td className="px-3 py-2 text-right">{formatCurrency(entry.amount)}</td>
              <td className="px-3 py-2 text-right">{formatCurrency(entry.balance_after)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
