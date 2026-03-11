// ============================================
// BetSync API Types
// ============================================

export type PickStatus = "pending" | "won" | "lost" | "push" | "void";
export type Grade = "A" | "B" | "C" | "D" | "F";
export type BetType = "straight" | "parlay" | "teaser" | "prop";
export type Sport = "NFL" | "NBA" | "MLB" | "NHL" | "NCAAF" | "NCAAB" | "Soccer" | "Tennis" | "MMA" | "Other";

// ---- Pick ----
export interface Pick {
  id: string;
  created_at: string;
  updated_at: string;
  sport: Sport;
  league: string;
  game_date: string;
  home_team: string;
  away_team: string;
  bet_type: BetType;
  selection: string;
  odds: number;              // American odds e.g. -110, +220
  stake: number;             // Units or $
  grade: Grade | null;
  status: PickStatus;
  clv: number | null;        // Closing Line Value %
  result_margin: number | null;
  notes: string | null;
  sportsbook_id: string | null;
  parlay_id: string | null;
}

export interface PickCreate {
  sport: Sport;
  league: string;
  game_date: string;
  home_team: string;
  away_team: string;
  bet_type: BetType;
  selection: string;
  odds: number;
  stake: number;
  notes?: string;
  sportsbook_id?: string;
}

export interface PickResolve {
  status: Exclude<PickStatus, "pending">;
  clv?: number;
  result_margin?: number;
}

// ---- Parlay ----
export interface Parlay {
  id: string;
  created_at: string;
  updated_at: string;
  name: string | null;
  odds: number;
  stake: number;
  status: PickStatus;
  legs: Pick[];
  payout: number | null;
}

export interface ParlayCreate {
  name?: string;
  stake: number;
  pick_ids: string[];
}

// ---- Dashboard ----
export interface KPISummary {
  total_picks: number;
  won: number;
  lost: number;
  push: number;
  pending: number;
  win_rate: number;          // 0-1
  roi: number;               // % e.g. 12.5
  units_won: number;
  units_wagered: number;
  avg_odds: number;
  avg_clv: number | null;
  streak: number;            // positive=win streak, negative=loss streak
}

export interface SegmentStat {
  label: string;
  win_rate: number;
  roi: number;
  sample: number;
}

export interface DashboardData {
  summary: KPISummary;
  by_sport: SegmentStat[];
  by_bet_type: SegmentStat[];
  by_grade: SegmentStat[];
  recent_picks: Pick[];
  recent_parlays: Parlay[];
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
  edge_pct: number;    // Model edge %
  confidence: number;  // 0-1
  notes: string | null;
}

// ---- Sportsbook ----
export interface Sportsbook {
  id: string;
  name: string;
  url: string;
  logo_url: string | null;
  is_active: boolean;
  api_key_set: boolean;
}

// ---- Settings ----
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
  page: number;
  page_size: number;
  pages: number;
}

export interface APIError {
  detail: string;
  status_code: number;
}

// ---- API type aliases (for api.ts compatibility) ----

/** Alias: summary stats returned by /dashboard/summary */
export type DashboardSummary = KPISummary;

/** Segment breakdown returned by /dashboard/segments */
export interface DashboardSegments {
  group_by: string;
  segments: SegmentStat[];
}

/** Alias: pipeline suggestion = radar opportunity */
export type PipelineSuggestion = RadarOpportunity;

/** Single config key/value entry from /config/ */
export interface ConfigEntry {
  key: string;
  value: string;
  description: string | null;
}
