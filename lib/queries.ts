import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDashboardSummary,
  getDashboardSegments,
  getPicks,
  getPick,
  createPick,
  resolvePick,
  deletePick,
  confirmPick,
  getParlays,
  getParlay,
  createParlay,
  triggerPipeline,
  getPipelineJob,
  getPipelineSuggestions,
  getSportsbooks,
  updateSportsbook,
  getConfig,
  updateConfig,
} from "./api";
import type { PickCreate, PickResolve, ParlayCreate, Sportsbook } from "./types";

const POLLING_INTERVAL =
  Number(process.env.NEXT_PUBLIC_POLLING_INTERVAL_MS) || 2000;

// ---- Query Keys ----
export const keys = {
  dashboard: ["dashboard"] as const,
  dashboardSegments: (params?: object) => ["dashboard", "segments", params] as const,
  picks: (params?: object) => ["picks", params] as const,
  pick: (id: string) => ["picks", id] as const,
  parlays: (params?: object) => ["parlays", params] as const,
  parlay: (id: string) => ["parlays", id] as const,
  pipeline: (jobId?: string) => ["pipeline", jobId] as const,
  pipelineSuggestions: ["pipeline", "suggestions"] as const,
  sportsbooks: ["sportsbooks"] as const,
  config: ["config"] as const,
};

// ---- Dashboard ----
export function useDashboard() {
  return useQuery({
    queryKey: keys.dashboard,
    queryFn: getDashboardSummary,
    select: (d) => ({ summary: d }),
    staleTime: 30_000,
  });
}

export function useDashboardSegments(params?: Parameters<typeof getDashboardSegments>[0]) {
  return useQuery({
    queryKey: keys.dashboardSegments(params),
    queryFn: () => getDashboardSegments(params),
    staleTime: 30_000,
  });
}

// ---- Picks ----
export function usePicks(params?: Parameters<typeof getPicks>[0]) {
  return useQuery({
    queryKey: keys.picks(params),
    queryFn: () => getPicks(params),
  });
}

export function usePick(id: string) {
  return useQuery({
    queryKey: keys.pick(id),
    queryFn: () => getPick(id),
    enabled: Boolean(id),
  });
}

export function useCreatePick() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PickCreate) => createPick(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["picks"] }),
  });
}

export function useResolvePick() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PickResolve }) =>
      resolvePick(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["picks"] });
      qc.invalidateQueries({ queryKey: keys.dashboard });
    },
  });
}

export function useDeletePick() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePick(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["picks"] }),
  });
}

export function useConfirmPick() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, confirmed }: { id: string; confirmed: boolean }) =>
      confirmPick(id, confirmed),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["picks"] }),
  });
}

// ---- Parlays ----
export function useParlays(params?: Parameters<typeof getParlays>[0]) {
  return useQuery({
    queryKey: keys.parlays(params),
    queryFn: () => getParlays(params),
  });
}

export function useParlay(id: string) {
  return useQuery({
    queryKey: keys.parlay(id),
    queryFn: () => getParlay(id),
    enabled: Boolean(id),
  });
}

export function useCreateParlay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ParlayCreate) => createParlay(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["parlays"] }),
  });
}

// ---- Pipeline ----
export function useTriggerPipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: triggerPipeline,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pipeline"] }),
  });
}

export function usePipelineJob(jobId: string | null) {
  return useQuery({
    queryKey: keys.pipeline(jobId ?? undefined),
    queryFn: () => getPipelineJob(jobId!),
    enabled: Boolean(jobId),
    refetchInterval: (query) => {
      const status = (query.state.data as { status?: string } | undefined)?.status;
      return status === "running" ? POLLING_INTERVAL : false;
    },
    retry: false,
  });
}

export function usePipelineSuggestions() {
  return useQuery({
    queryKey: keys.pipelineSuggestions,
    queryFn: getPipelineSuggestions,
  });
}

// ---- Sportsbooks ----
export function useSportsbooks() {
  return useQuery({
    queryKey: keys.sportsbooks,
    queryFn: getSportsbooks,
  });
}

export function useUpdateSportsbook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Sportsbook> }) =>
      updateSportsbook(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.sportsbooks }),
  });
}

// ---- Config ----
export function useConfig() {
  return useQuery({
    queryKey: keys.config,
    queryFn: getConfig,
  });
}

export function useUpdateConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      updateConfig(key, value),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.config }),
  });
}
