import type {
  DashboardData,
  PaginatedResponse,
  Pick,
  PickCreate,
  PickResolve,
  Parlay,
  ParlayCreate,
  PipelineJob,
  RadarOpportunity,
  UserSettings,
  AIConfig,
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
export const getDashboard = () =>
  request<DashboardData>("/dashboard");

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
  request<Pick>(`/picks/${id}/resolve`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deletePick = (id: string) =>
  request<void>(`/picks/${id}`, { method: "DELETE" });

// ---- Parlays ----
export const getParlays = (params?: { page?: number; page_size?: number }) => {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.page_size) qs.set("page_size", String(params.page_size));
  return request<PaginatedResponse<Parlay>>(`/parlays?${qs.toString()}`);
};

export const createParlay = (data: ParlayCreate) =>
  request<Parlay>("/parlays", { method: "POST", body: JSON.stringify(data) });

export const deleteParlay = (id: string) =>
  request<void>(`/parlays/${id}`, { method: "DELETE" });

// ---- Pipeline ----
export const triggerPipeline = () =>
  request<PipelineJob>("/pipeline/run", { method: "POST" });

export const getPipelineJob = (jobId: string) =>
  request<PipelineJob>(`/pipeline/jobs/${jobId}`);

export const getRadarOpportunities = () =>
  request<RadarOpportunity[]>("/pipeline/opportunities");

// ---- Settings ----
export const getSettings = () => request<UserSettings>("/settings");

export const updateAIConfig = (data: Partial<AIConfig>) =>
  request<UserSettings>("/settings/ai", {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const updateUnitSize = (unit_size_usd: number) =>
  request<UserSettings>("/settings/unit-size", {
    method: "PATCH",
    body: JSON.stringify({ unit_size_usd }),
  });

export const toggleSportsbook = (id: string, is_active: boolean) =>
  request<UserSettings>(`/settings/sportsbooks/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ is_active }),
  });
