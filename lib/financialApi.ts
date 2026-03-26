import type {
  FinancialDashboard,
  FiscalSummary,
  LedgerEntry,
  ReconciliationSummary,
} from "./financialTypes";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";
const USE_MOCKS = process.env.NEXT_PUBLIC_USE_FINANCIAL_MOCKS !== "false";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw Object.assign(new Error(error.detail ?? "API error"), {
      status: res.status,
    });
  }

  return res.json() as Promise<T>;
}

const mockDashboard: FinancialDashboard = {
  available_balance: 12350.42,
  locked_balance: 1240.1,
  profit_loss: 1850.74,
  drift_amount: -35.5,
  drift_detected: true,
  currency: "USD",
  updated_at: new Date().toISOString(),
};

const mockLedger: LedgerEntry[] = [
  {
    id: "tx_1001",
    timestamp: "2026-03-25T15:21:00Z",
    type: "deposit",
    amount: 2000,
    balance_after: 13200,
    reference: "Bank transfer",
  },
  {
    id: "tx_1002",
    timestamp: "2026-03-25T17:05:00Z",
    type: "bet",
    amount: -120,
    balance_after: 13080,
    reference: "NBA: BOS vs MIA",
  },
  {
    id: "tx_1003",
    timestamp: "2026-03-25T20:32:00Z",
    type: "win",
    amount: 214,
    balance_after: 13294,
    reference: "NBA ML settled",
  },
  {
    id: "tx_1004",
    timestamp: "2026-03-26T08:10:00Z",
    type: "withdrawal",
    amount: -500,
    balance_after: 12794,
    reference: "Wallet transfer",
  },
];

const mockReconciliation: ReconciliationSummary = {
  status: "WARNING",
  expected_balance: 12829.5,
  ledger_balance: 12794,
  drift_amount: -35.5,
  message: "Minor drift detected between settlement feed and ledger snapshot.",
  last_checked_at: new Date().toISOString(),
};

const mockFiscalSummary: FiscalSummary = {
  tax_year: 2026,
  taxable_base: 5820,
  deductible_losses: 1940,
  net_taxable: 3880,
  currency: "USD",
};

export async function getFinancialDashboard(): Promise<FinancialDashboard> {
  if (USE_MOCKS) return mockDashboard;
  return request<FinancialDashboard>("/finance/dashboard");
}

export async function getLedgerEntries(limit = 20): Promise<LedgerEntry[]> {
  if (USE_MOCKS) return mockLedger.slice(0, limit);
  return request<LedgerEntry[]>(`/finance/ledger?limit=${limit}`);
}

export async function getReconciliationSummary(): Promise<ReconciliationSummary> {
  if (USE_MOCKS) return mockReconciliation;
  return request<ReconciliationSummary>("/finance/reconciliation");
}

export async function runReconciliationFix(): Promise<{ message: string }> {
  if (USE_MOCKS) {
    return { message: "Demo fix executed. Real run would trigger reconciliation job." };
  }

  return request<{ message: string }>("/finance/reconciliation/fix", {
    method: "POST",
  });
}

export async function getFinancialFiscalSummary(taxYear: number): Promise<FiscalSummary> {
  if (USE_MOCKS) return { ...mockFiscalSummary, tax_year: taxYear };
  return request<FiscalSummary>(`/finance/fiscal-summary?tax_year=${taxYear}`);
}

export function downloadTaxCSV(taxYear: number): void {
  const url = `${BASE_URL}/finance/fiscal-export.csv?tax_year=${taxYear}`;
  const a = document.createElement("a");
  a.href = url;
  a.download = `betsync_tax_${taxYear}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
