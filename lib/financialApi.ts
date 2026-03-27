import type {
  FinancialDashboard,
  FiscalSummary,
  LedgerEntry,
  LedgerEntryType,
  ReconciliationStatus,
  ReconciliationSummary,
} from "./financialTypes";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

/** When `true`, skip network and return fallback mock data only. */
const USE_FINANCIAL_MOCKS_ONLY =
  process.env.NEXT_PUBLIC_USE_FINANCIAL_MOCKS !== "false";

const DEFAULT_USER_ID = "00000000-0000-4000-8000-000000000001";

const RECONCILIATION_SECRET =
  process.env.NEXT_PUBLIC_RECONCILIATION_SECRET ?? "supersecret_gameday6";

const REQUEST_TIMEOUT_MS = 15_000;

// ---------------------------------------------------------------------------
// API response shapes (subset; map into app types)
// ---------------------------------------------------------------------------

interface WalletBalanceApiResponse {
  user_id: string;
  available_balance: string;
  locked_balance: string;
  updated_at: string;
}

interface LedgerItemApiResponse {
  ledger_entry_id: string;
  amount: string;
  type: string;
  reference_id: string | null;
  balance_after: string;
  locked_after: string;
  created_at: string;
}

interface LedgerHistoryApiResponse {
  items: LedgerItemApiResponse[];
  total: number;
}

interface FinancialHealthApiResponse {
  total_users: number;
  ok_users: number;
  warning_users: number;
  critical_users: number;
}

interface FiscalSummaryApiResponse {
  tax_year: number;
  jurisdiction: string;
  gross_winnings_mxn: string;
  gross_losses_mxn: string;
  net_gambling_income_mxn: string;
  total_picks_won: number;
  total_picks_lost: number;
  total_deposits_mxn: string;
  total_withdrawals_mxn: string;
  net_cashflow_mxn: string;
  taxable_base_estimate_mxn: string;
  currency: string;
}

// ---------------------------------------------------------------------------
// Fallback mock data (respaldo — no eliminado, renombrado a constantes)
// ---------------------------------------------------------------------------

const MOCK_FINANCIAL_DASHBOARD_FALLBACK: FinancialDashboard = {
  available_balance: 12350.42,
  locked_balance: 1240.1,
  profit_loss: 1850.74,
  drift_amount: -35.5,
  drift_detected: true,
  currency: "USD",
  updated_at: new Date().toISOString(),
};

const MOCK_LEDGER_ENTRIES_FALLBACK: LedgerEntry[] = [
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

const MOCK_RECONCILIATION_SUMMARY_FALLBACK: ReconciliationSummary = {
  status: "WARNING",
  expected_balance: 12829.5,
  ledger_balance: 12794,
  drift_amount: -35.5,
  message: "Minor drift detected between settlement feed and ledger snapshot.",
  last_checked_at: new Date().toISOString(),
};

const MOCK_FISCAL_SUMMARY_FALLBACK: FiscalSummary = {
  tax_year: 2026,
  taxable_base: 5820,
  deductible_losses: 1940,
  net_taxable: 3880,
  currency: "USD",
};

// ---------------------------------------------------------------------------
// HTTP + resiliencia
// ---------------------------------------------------------------------------

function parseDecimal(s: string): number {
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

async function requestReal<T>(
  path: string,
  init?: RequestInit & { timeoutMs?: number }
): Promise<T> {
  const timeoutMs = init?.timeoutMs ?? REQUEST_TIMEOUT_MS;
  const { timeoutMs: _omit, ...restInit } = init ?? {};
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...restInit,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...restInit.headers,
      },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const code =
        body && typeof body === "object" && "error" in body
          ? String((body as { error?: { code?: string } }).error?.code ?? "")
          : "";
      const detail =
        body && typeof body === "object" && "detail" in body
          ? String((body as { detail?: string }).detail)
          : res.statusText;
      const err = new Error(detail || `HTTP ${res.status}${code ? ` (${code})` : ""}`);
      Object.assign(err, { status: res.status, code });
      throw err;
    }

    return res.json() as Promise<T>;
  } finally {
    clearTimeout(timer);
  }
}

async function withApiFallback<T>(
  operation: string,
  fetcher: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await fetcher();
  } catch (err) {
    const detail =
      err instanceof Error
        ? {
            name: err.name,
            message: err.message,
            cause: (err as Error & { cause?: unknown }).cause,
          }
        : { value: String(err) };
    console.warn(
      `[financialApi] Real API failed for "${operation}"; serving mock fallback. Reason:`,
      detail
    );
    return fallback;
  }
}

function mapLedgerApiType(apiType: string): LedgerEntryType {
  switch (apiType) {
    case "PICK_STAKE_LOCK":
      return "bet";
    case "PICK_PAYOUT":
      return "win";
    case "PICK_LOSS":
      return "bet";
    case "PICK_REFUND":
      return "deposit";
    default:
      return "bet";
  }
}

function mapLedgerItems(items: LedgerItemApiResponse[]): LedgerEntry[] {
  return items.map((row) => ({
    id: row.ledger_entry_id,
    timestamp: row.created_at,
    type: mapLedgerApiType(row.type),
    amount: parseDecimal(row.amount),
    balance_after: parseDecimal(row.balance_after),
    reference: row.reference_id ?? row.type,
  }));
}

function mapFinancialHealthToReconciliation(
  h: FinancialHealthApiResponse
): ReconciliationSummary {
  let status: ReconciliationStatus = "OK";
  if (h.critical_users > 0) status = "CRITICAL";
  else if (h.warning_users > 0) status = "WARNING";

  return {
    status,
    expected_balance: 0,
    ledger_balance: 0,
    drift_amount: 0,
    message: `Global financial health: ${h.ok_users}/${h.total_users} OK, ${h.warning_users} warning(s), ${h.critical_users} critical.`,
    last_checked_at: new Date().toISOString(),
  };
}

function mapFiscalApiToSummary(api: FiscalSummaryApiResponse): FiscalSummary {
  return {
    tax_year: api.tax_year,
    taxable_base: parseDecimal(api.taxable_base_estimate_mxn),
    deductible_losses: parseDecimal(api.gross_losses_mxn),
    net_taxable: parseDecimal(api.net_gambling_income_mxn),
    currency: api.currency,
  };
}

function walletToDashboard(
  w: WalletBalanceApiResponse,
  template: FinancialDashboard
): FinancialDashboard {
  return {
    ...template,
    available_balance: parseDecimal(w.available_balance),
    locked_balance: parseDecimal(w.locked_balance),
    profit_loss: 0,
    drift_amount: 0,
    drift_detected: false,
    currency: "MXN",
    updated_at: w.updated_at,
  };
}

// ---------------------------------------------------------------------------
// Público — endpoints reales (API_CONTRACTS_FOR_FRONTEND.md)
// ---------------------------------------------------------------------------

export type WalletBalance = {
  user_id: string;
  available_balance: number;
  locked_balance: number;
  updated_at: string;
};

/**
 * GET /wallet/balance — saldo disponible y bloqueado (user_id semilla por defecto).
 */
export async function getBalances(): Promise<WalletBalance> {
  const fallback: WalletBalance = {
    user_id: DEFAULT_USER_ID,
    available_balance: MOCK_FINANCIAL_DASHBOARD_FALLBACK.available_balance,
    locked_balance: MOCK_FINANCIAL_DASHBOARD_FALLBACK.locked_balance,
    updated_at: MOCK_FINANCIAL_DASHBOARD_FALLBACK.updated_at,
  };

  if (USE_FINANCIAL_MOCKS_ONLY) return fallback;

  return withApiFallback(
    "getBalances → GET /wallet/balance",
    async () => {
      const q = new URLSearchParams({ user_id: DEFAULT_USER_ID });
      const raw = await requestReal<WalletBalanceApiResponse>(
        `/wallet/balance?${q.toString()}`
      );
      return {
        user_id: raw.user_id,
        available_balance: parseDecimal(raw.available_balance),
        locked_balance: parseDecimal(raw.locked_balance),
        updated_at: raw.updated_at,
      };
    },
    fallback
  );
}

/**
 * GET /admin/financial-health — requiere X-Reconciliation-Secret.
 */
export async function getFinancialHealth(): Promise<FinancialHealthApiResponse> {
  const s = MOCK_RECONCILIATION_SUMMARY_FALLBACK.status;
  const fallback: FinancialHealthApiResponse = {
    total_users: 1,
    ok_users: s === "OK" ? 1 : 0,
    warning_users: s === "WARNING" ? 1 : 0,
    critical_users: s === "CRITICAL" ? 1 : 0,
  };

  if (USE_FINANCIAL_MOCKS_ONLY) return fallback;

  return withApiFallback(
    "getFinancialHealth → GET /admin/financial-health",
    () =>
      requestReal<FinancialHealthApiResponse>("/admin/financial-health", {
        headers: {
          "X-Reconciliation-Secret": RECONCILIATION_SECRET,
        },
      }),
    fallback
  );
}

/**
 * GET /fiscal/summary?tax_year=…
 */
export async function getFiscalSummary(taxYear: number): Promise<FiscalSummary> {
  const fallback: FiscalSummary = {
    ...MOCK_FISCAL_SUMMARY_FALLBACK,
    tax_year: taxYear,
  };

  if (USE_FINANCIAL_MOCKS_ONLY) return fallback;

  return withApiFallback(
    `getFiscalSummary → GET /fiscal/summary (tax_year=${taxYear})`,
    async () => {
      const q = new URLSearchParams({ tax_year: String(taxYear) });
      const raw = await requestReal<FiscalSummaryApiResponse>(
        `/fiscal/summary?${q.toString()}`
      );
      return mapFiscalApiToSummary(raw);
    },
    fallback
  );
}

// ---------------------------------------------------------------------------
// Compatibilidad con el módulo financiero existente (queries / UI)
// ---------------------------------------------------------------------------

export async function getFinancialDashboard(): Promise<FinancialDashboard> {
  if (USE_FINANCIAL_MOCKS_ONLY) {
    return { ...MOCK_FINANCIAL_DASHBOARD_FALLBACK };
  }

  return withApiFallback(
    "getFinancialDashboard (wallet/balance)",
    async () => {
      const q = new URLSearchParams({ user_id: DEFAULT_USER_ID });
      const raw = await requestReal<WalletBalanceApiResponse>(
        `/wallet/balance?${q.toString()}`
      );
      return walletToDashboard(raw, MOCK_FINANCIAL_DASHBOARD_FALLBACK);
    },
    { ...MOCK_FINANCIAL_DASHBOARD_FALLBACK }
  );
}

export async function getLedgerEntries(limit = 20): Promise<LedgerEntry[]> {
  const sliced = MOCK_LEDGER_ENTRIES_FALLBACK.slice(0, limit);

  if (USE_FINANCIAL_MOCKS_ONLY) return sliced;

  return withApiFallback(
    `getLedgerEntries → GET /wallet/ledger (limit=${limit})`,
    async () => {
      const q = new URLSearchParams({
        user_id: DEFAULT_USER_ID,
        limit: String(limit),
      });
      const raw = await requestReal<LedgerHistoryApiResponse>(
        `/wallet/ledger?${q.toString()}`
      );
      return mapLedgerItems(raw.items ?? []);
    },
    sliced
  );
}

export async function getReconciliationSummary(): Promise<ReconciliationSummary> {
  if (USE_FINANCIAL_MOCKS_ONLY) {
    return { ...MOCK_RECONCILIATION_SUMMARY_FALLBACK };
  }

  return withApiFallback(
    "getReconciliationSummary (admin/financial-health)",
    async () => {
      const h = await requestReal<FinancialHealthApiResponse>(
        "/admin/financial-health",
        {
          headers: {
            "X-Reconciliation-Secret": RECONCILIATION_SECRET,
          },
        }
      );
      return mapFinancialHealthToReconciliation(h);
    },
    { ...MOCK_RECONCILIATION_SUMMARY_FALLBACK }
  );
}

export async function runReconciliationFix(): Promise<{ message: string }> {
  const mockMsg = {
    message: "Demo fix executed. Real run would trigger reconciliation job.",
  };

  if (USE_FINANCIAL_MOCKS_ONLY) return mockMsg;

  return withApiFallback(
    `runReconciliationFix → POST /admin/reconciliation/${DEFAULT_USER_ID}/fix`,
    async () => {
      const res = await requestReal<{ repaired?: boolean; user_id?: string }>(
        `/admin/reconciliation/${DEFAULT_USER_ID}/fix`,
        {
          method: "POST",
          headers: {
            "X-Reconciliation-Secret": RECONCILIATION_SECRET,
          },
        }
      );
      return {
        message: `Reconciliation fix completed for user ${res.user_id ?? DEFAULT_USER_ID}.`,
      };
    },
    mockMsg
  );
}

export async function getFinancialFiscalSummary(
  taxYear: number
): Promise<FiscalSummary> {
  return getFiscalSummary(taxYear);
}

export function downloadTaxCSV(taxYear: number): void {
  const url = `${BASE_URL}/fiscal/export/csv?tax_year=${taxYear}`;
  const a = document.createElement("a");
  a.href = url;
  a.download = `betsync_tax_${taxYear}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
