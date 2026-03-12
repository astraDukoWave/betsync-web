import type {
  DashboardSummary,
  DashboardSegments,
  PaginatedResponse,
  Pick,
  PickCreate,
  PickResolve,
  Parlay,
  ParlayCreate,
  PipelineJob,
  PipelineSuggestion,
  Sportsbook,
  ConfigEntry,
} from "./types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

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

// ---- Dashboard ----
export const getDashboardSummary = () =>
  request<DashboardSummary>("/dashboard/summary");

export const getDashboardSegments = (params?: {
  group_by?: string;
}) => {
  const qs = new URLSearchParams();
  if (params?.group_by) qs.set("group_by", params.group_by);
  return request<DashboardSegments>(`/dashboard/segments?${qs.toString()}`);
};

// ---- Picks ----
export const getPicks = (params?: {
  page?: number;
  page_size?: number;
  status?: string;
  sport?: string;
}) => {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.page_size) qs.set("page_size", String(params.page_size));
  if (params?.status) qs.set("status", params.status);
  if (params?.sport) qs.set("sport", params.sport);
  return request<PaginatedResponse<Pick>>(`/picks?${qs.toString()}`);
};

export const getPick = (id: string) => request<Pick>(`/picks/${id}`);

export const createPick = (data: PickCreate) =>
  request<Pick>("/picks", { method: "POST", body: JSON.stringify(data) });

export const resolvePick = (id: string, data: PickResolve) =>
  request<Pick>(`/picks/${id}/result`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deletePick = (id: string) =>
  request<void>(`/picks/${id}`, { method: "DELETE" });

export const confirmPick = (id: string, confirmed: boolean) =>
  request<Pick>(`/picks/${id}/confirm`, {
    method: "PATCH",
    body: JSON.stringify({ confirmed }),
  });

// ---- Parlays ----
export const getParlays = (params?: { page?: number; page_size?: number }) => {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.page_size) qs.set("page_size", String(params.page_size));
  return request<PaginatedResponse<Parlay>>(`/parlays?${qs.toString()}`);
};

export const getParlay = (id: string) => request<Parlay>(`/parlays/${id}`);

export const createParlay = (data: ParlayCreate) =>
  request<Parlay>("/parlays", { method: "POST", body: JSON.stringify(data) });

// ---- Pipeline ----
export const triggerPipeline = () =>
  request<PipelineJob>("/pipeline/run", { method: "POST" });

export const getPipelineJob = (jobId: string) =>
  request<PipelineJob>(`/pipeline/jobs/${jobId}`);

export const getPipelineSuggestions = () =>
  request<PipelineSuggestion[]>("/pipeline/suggestions");

// ---- Sportsbooks ----
export const getSportsbooks = () =>
  request<Sportsbook[]>("/sportsbooks/");

export interface SportsbookUpdate {
  name?: string;
  url?: string;
  is_active?: boolean;
}

export const updateSportsbook = (id: string, data: SportsbookUpdate) =>
  request<Sportsbook>(`/sportsbooks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

// ---- Config ----
export const getConfig = () => request<ConfigEntry[]>("/config/");

export const updateConfig = (key: string, value: string) =>
  request<ConfigEntry>(`/config/${key}`, {
    method: "PATCH",
    body: JSON.stringify({ value }),
  });
