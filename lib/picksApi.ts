import type {
  Pick,
  PickCreate,
  PickResolve,
  PickStatus,
  PaginatedResponse,
} from "./types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

const REQUEST_TIMEOUT_MS = 15_000;

export const DEFAULT_USER_ID = "00000000-0000-4000-8000-000000000001";
export const DUMMY_MATCH_ID = "a1b2c3d4-0000-4000-8000-000000000001";
export const DUMMY_SPORTSBOOK_ID = "e5f6a7b8-0000-4000-8000-000000000001";

// ---------------------------------------------------------------------------
// Structured API error — preserves error.code for UI toast mapping
// ---------------------------------------------------------------------------

export class BetSyncApiError extends Error {
  status: number;
  code: string;
  meta?: Record<string, unknown>;

  constructor(
    status: number,
    code: string,
    message: string,
    meta?: Record<string, unknown>
  ) {
    super(message);
    this.name = "BetSyncApiError";
    this.status = status;
    this.code = code;
    this.meta = meta;
  }
}

// ---------------------------------------------------------------------------
// Decimal parsing — backend serializes Decimal fields as strings
// ---------------------------------------------------------------------------

function parseDecimal(v: unknown): number {
  if (v == null) return 0;
  const n = typeof v === "number" ? v : Number.parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}

function parseNullableDecimal(v: unknown): number | null {
  if (v == null) return null;
  const n = typeof v === "number" ? v : Number.parseFloat(String(v));
  return Number.isFinite(n) ? n : null;
}

// ---------------------------------------------------------------------------
// Response mapper — raw API JSON → typed Pick
// ---------------------------------------------------------------------------

function mapPick(raw: Record<string, unknown>): Pick {
  return {
    pick_id: String(raw.pick_id),
    match_id: String(raw.match_id),
    sportsbook_id:
      raw.sportsbook_id != null ? String(raw.sportsbook_id) : null,
    run_date: String(raw.run_date),
    market: String(raw.market),
    selection: String(raw.selection),
    odds_american: Number(raw.odds_american),
    odds_decimal: parseDecimal(raw.odds_decimal),
    implied_prob: parseDecimal(raw.implied_prob),
    grade: (raw.grade as Pick["grade"]) ?? null,
    stake: parseDecimal(raw.stake),
    status: String(raw.status) as PickStatus,
    source: String(raw.source),
    closing_odds_decimal: parseNullableDecimal(raw.closing_odds_decimal),
    clv: parseNullableDecimal(raw.clv),
    confirmed_at: raw.confirmed_at != null ? String(raw.confirmed_at) : null,
    resolved_at: raw.resolved_at != null ? String(raw.resolved_at) : null,
    created_at: String(raw.created_at),
    updated_at: String(raw.updated_at),
  };
}

// ---------------------------------------------------------------------------
// HTTP with timeout + structured error parsing
// ---------------------------------------------------------------------------

async function requestReal<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      if (body?.error?.code) {
        throw new BetSyncApiError(
          res.status,
          body.error.code,
          body.error.message ?? `HTTP ${res.status}`,
          body.error.meta
        );
      }
      throw new BetSyncApiError(
        res.status,
        "UNKNOWN_ERROR",
        body?.detail ?? res.statusText
      );
    }

    return res.json() as Promise<T>;
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Dual-mode wrapper: re-throws business errors, catches network failures
// ---------------------------------------------------------------------------

async function withFallback<T>(
  operation: string,
  fetcher: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await fetcher();
  } catch (err) {
    if (err instanceof BetSyncApiError) throw err;
    console.warn(
      `[picksApi] ${operation} failed (network), using mock fallback:`,
      err instanceof Error ? err.message : err
    );
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// Mock data — fallback when backend is unreachable
// ---------------------------------------------------------------------------

const today = () => new Date().toISOString().split("T")[0];
const now = () => new Date().toISOString();

const MOCK_PICKS: Pick[] = [
  {
    pick_id: "mock-pick-001",
    match_id: DUMMY_MATCH_ID,
    sportsbook_id: DUMMY_SPORTSBOOK_ID,
    run_date: today(),
    market: "moneyline",
    selection: "Lakers ML",
    odds_american: -110,
    odds_decimal: 1.9091,
    implied_prob: 0.5238,
    grade: "A",
    stake: 200,
    status: "pending",
    source: "manual",
    closing_odds_decimal: null,
    clv: null,
    confirmed_at: null,
    resolved_at: null,
    created_at: now(),
    updated_at: now(),
  },
  {
    pick_id: "mock-pick-002",
    match_id: DUMMY_MATCH_ID,
    sportsbook_id: DUMMY_SPORTSBOOK_ID,
    run_date: today(),
    market: "spread",
    selection: "Warriors -5.5",
    odds_american: -105,
    odds_decimal: 1.9524,
    implied_prob: 0.5122,
    grade: "B",
    stake: 150,
    status: "won",
    source: "pipeline",
    closing_odds_decimal: 1.88,
    clv: 0.038,
    confirmed_at: now(),
    resolved_at: now(),
    created_at: now(),
    updated_at: now(),
  },
  {
    pick_id: "mock-pick-003",
    match_id: DUMMY_MATCH_ID,
    sportsbook_id: DUMMY_SPORTSBOOK_ID,
    run_date: today(),
    market: "total",
    selection: "Over 220.5",
    odds_american: 120,
    odds_decimal: 2.2,
    implied_prob: 0.4545,
    grade: "C",
    stake: 100,
    status: "pending",
    source: "manual",
    closing_odds_decimal: null,
    clv: null,
    confirmed_at: null,
    resolved_at: null,
    created_at: now(),
    updated_at: now(),
  },
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface ListPicksParams {
  pick_status?: PickStatus;
  limit?: number;
  offset?: number;
  source?: string;
  market?: string;
  grade?: string;
}

export async function listPicks(
  params?: ListPicksParams
): Promise<PaginatedResponse<Pick>> {
  const mockResponse: PaginatedResponse<Pick> = {
    items: MOCK_PICKS,
    total: MOCK_PICKS.length,
    limit: params?.limit ?? 50,
    offset: params?.offset ?? 0,
  };

  return withFallback("listPicks → GET /picks/", async () => {
    const qs = new URLSearchParams();
    if (params?.pick_status) qs.set("pick_status", params.pick_status);
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.offset) qs.set("offset", String(params.offset));
    if (params?.source) qs.set("source", params.source);
    if (params?.market) qs.set("market", params.market);
    if (params?.grade) qs.set("grade", params.grade);

    const raw = await requestReal<{
      items: Record<string, unknown>[];
      total: number;
      limit: number;
      offset: number;
    }>(`/picks/?${qs.toString()}`);

    return {
      items: raw.items.map(mapPick),
      total: raw.total,
      limit: raw.limit,
      offset: raw.offset,
    };
  }, mockResponse);
}

export async function createPickRequest(data: PickCreate): Promise<Pick> {
  const oddsAbs = Math.abs(data.odds_american);
  const mockPick: Pick = {
    pick_id: `mock-${crypto.randomUUID().slice(0, 8)}`,
    match_id: data.match_id ?? DUMMY_MATCH_ID,
    sportsbook_id: data.sportsbook_id ?? DUMMY_SPORTSBOOK_ID,
    run_date: data.run_date,
    market: data.market,
    selection: data.selection,
    odds_american: data.odds_american,
    odds_decimal:
      data.odds_american < 0 ? 1 + 100 / oddsAbs : 1 + oddsAbs / 100,
    implied_prob:
      data.odds_american < 0
        ? oddsAbs / (oddsAbs + 100)
        : 100 / (data.odds_american + 100),
    grade: null,
    stake: data.stake,
    status: "pending",
    source: data.source ?? "manual",
    closing_odds_decimal: null,
    clv: null,
    confirmed_at: null,
    resolved_at: null,
    created_at: now(),
    updated_at: now(),
  };

  return withFallback("createPickRequest → POST /picks/", async () => {
    const raw = await requestReal<Record<string, unknown>>("/picks/", {
      method: "POST",
      headers: { "Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify(data),
    });
    return mapPick(raw);
  }, mockPick);
}

export async function resolvePickRequest(
  pickId: string,
  data: PickResolve
): Promise<Pick> {
  const fallback: Pick = {
    ...MOCK_PICKS[0],
    pick_id: pickId,
    status: data.status,
    closing_odds_decimal: data.closing_odds_decimal ?? null,
    resolved_at: now(),
    updated_at: now(),
  };

  return withFallback(
    `resolvePickRequest → PATCH /picks/${pickId}/result`,
    async () => {
      const raw = await requestReal<Record<string, unknown>>(
        `/picks/${pickId}/result`,
        {
          method: "PATCH",
          body: JSON.stringify(data),
        }
      );
      return mapPick(raw);
    },
    fallback
  );
}
