export type LedgerEntryType = "bet" | "win" | "deposit" | "withdrawal";
export type ReconciliationStatus = "OK" | "WARNING" | "CRITICAL";

export interface FinancialDashboard {
  available_balance: number;
  locked_balance: number;
  profit_loss: number;
  drift_amount: number;
  drift_detected: boolean;
  currency: string;
  updated_at: string;
}

export interface LedgerEntry {
  id: string;
  timestamp: string;
  type: LedgerEntryType;
  amount: number;
  balance_after: number;
  reference: string;
}

export interface ReconciliationSummary {
  status: ReconciliationStatus;
  expected_balance: number;
  ledger_balance: number;
  drift_amount: number;
  message: string;
  last_checked_at: string;
}

export interface FiscalSummary {
  tax_year: number;
  taxable_base: number;
  deductible_losses: number;
  net_taxable: number;
  currency: string;
}
