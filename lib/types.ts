// ============================================
// BetSync API Types — aligned with real backend responses
// ============================================

export type PickStatus = "pending" | "won" | "lost" | "push" | "void";
export type Grade = "A" | "B" | "C" | "D" | "F";
export type BetType = "straight" | "parlay" | "teaser" | "prop";
export type Sport =
  | "NFL" | "NBA" | "MLB" | "NHL" | "NCAAF" | "NCAAB"
  | "Soccer" | "Tennis" | "MMA" | "Other";

// ---- Pick (matches /api/v1/picks/ response) ----
export interface Pick {
  pick_id: string;
  match_id: string;
  sportsbook_id: string | null;
  run_date: string;          // ISO date
  market: string;            // e.g. "moneyline", "1x2", "btts", "total"
  selection: string;         // e.g. "Warriors", "Man City", "Yes"
  odds_american: number;     // e.g. -150, +110
  odds_decimal: number;      // e.g. 1.667, 2.100
  implied_prob: number;      // 0-1
  grade: Grade | null;
  stake: number;             // in USD
  status: PickStatus;
  source: string;            // "manual" | "pipeline"
  closing_odds_decimal: number | null;
  clv: number | null;        // closing_odds_decimal value used as CLV proxy
  confirmed_at: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PickCreate {
  match_id?: string;
  sportsbook_id?: string | null;
  run_date: string;
  market: string;
  selection: string;
  odds_american: number;
  stake: number;
  source?: string;
}

export interface PickResolve {
  status: Exclude<PickStatus, "pending">;
  closing_odds_decimal?: number | null;
}

// ---- Parlay (matches /api/v1/parlays/ response) ----
export interface Parlay {
  parlay_id: string;
  sportsbook_id: string | null;
  run_date: string;
  type: string;             // "regular"
  stake: number;
  odds_total: number;       // decimal odds
  potential_return: number;
  actual_return: number | null;
  status: PickStatus;
  picks: Pick[];
  created_at: string;
  updated_at: string;
}

export interface ParlayCreate {
  sportsbook_id?: string | null;
  run_date: string;
  stake: number;
  pick_ids: string[];
}

// ---- Dashboard (matches /api/v1/dashboard/summary response) ----
export interface CurrentStreak {
  type: "won" | "lost";
  count: number;
}

export interface KPISummary {
  total_picks: number;
  resolved_picks: number;
  won: number;
  lost: number;
  push: number;
  hit_rate: number | null;        // 0-1  (was win_rate)
  total_stake: number | null;     // in USD (was units_wagered)
  total_return: number | null;    // in USD (was units_won)
  roi: number | null;             // e.g. -0.0994
  current_streak: CurrentStreak | null;  // {type, count} (was streak: number)
  avg_odds_decimal: number | null;       // (was avg_odds)
  avg_clv: number | null;
  cache_hit?: boolean;
}

// Alias used by api.ts imports
export type DashboardSummary = KPISummary;

export interface SegmentStat {
  label: string;
  win_rate: number;
  roi: number;
  sample: number;
}

export interface DashboardSegments {
  group_by: string;
  segments: SegmentStat[];
}

// ---- Pipeline ----
export type PipelineStatus = "idle" | "running" | "done" | "error" | "rate_limited";

export interface PipelineJob {
  job_id: string;
  status: PipelineStatus;
  created_at: string;
  completed_at: string | null;
  results_count: number | null;
  error: string | null;
}

export interface RadarOpportunity {
  id: string;
  sport: Sport;
  game_date: string;
  home_team: string;
  away_team: string;
  selection: string;
  odds: number;
  grade: Grade;
  edge_pct: number;
  confidence: number;
  notes: string | null;
}

// Alias
export type PipelineSuggestion = RadarOpportunity;

// ---- Sportsbook (matches /api/v1/sportsbooks/ response) ----
export interface Sportsbook {
  sportsbook_id: string;     // (was id)
  name: string;
  currency: string;          // e.g. "USD"
  odds_format_default: string; // e.g. "american"
  is_active: boolean;
  created_at: string;
  // Fields NOT in backend (kept as optional for forward compat):
  url?: string;
  logo_url?: string | null;
  api_key_set?: boolean;
}

export interface SportsbookUpdate {
  is_active?: boolean;
  name?: string;
  url?: string;
}

// ---- Config ----
export interface ConfigEntry {
  key: string;
  value: string;
  description: string | null;
}

// ---- Settings (legacy shape — used by useSettings hook) ----
export interface AIConfig {
  model: string;
  temperature: number;
  min_grade: Grade;
  min_edge_pct: number;
  max_picks_per_day: number;
}

export interface UserSettings {
  sportsbooks: Sportsbook[];
  ai_config: AIConfig;
  unit_size_usd: number;
  timezone: string;
}

// ---- API Response wrappers ----
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface APIError {
  detail: string;
  status_code: number;
}


// ---- Fiscal (matches /api/v1/fiscal/ responses) ----
export interface FiscalSummaryResponse {
  tax_year: number;
  jurisdiction: string;           // e.g. "MX_SAT"
  gross_winnings_mxn: number;     // profit from won picks (stake*odds - stake)
  gross_losses_mxn: number;       // stake sum of lost picks
  net_gambling_income_mxn: number; // gross_winnings - gross_losses
  total_picks_won: number;
  total_picks_lost: number;
  total_deposits_mxn: number;     // deposit + bonus txns * exchange_rate
  total_withdrawals_mxn: number;  // withdrawal txns * exchange_rate
  net_cashflow_mxn: number;       // total_deposits - total_withdrawals
  taxable_base_estimate_mxn: number; // max(net_gambling_income, 0)
  currency: string;               // "MXN"
}
