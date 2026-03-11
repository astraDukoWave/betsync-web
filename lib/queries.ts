import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDashboard,
  getPicks,
  getPick,
  createPick,
  resolvePick,
  deletePick,
  getParlays,
  createParlay,
  deleteParlay,
  triggerPipeline,
  getPipelineJob,
  getRadarOpportunities,
  getSettings,
  updateAIConfig,
  updateUnitSize,
  toggleSportsbook,
} from "./api";
import type { PickCreate, PickResolve, ParlayCreate, AIConfig } from "./types";

const POLLING_INTERVAL =
  Number(process.env.NEXT_PUBLIC_POLLING_INTERVAL_MS) || 2000;

// ---- Query Keys ----
export const keys = {
  dashboard: ["dashboard"] as const,
  picks: (params?: object) => ["picks", params] as const,
  pick: (id: string) => ["picks", id] as const,
  parlays: (params?: object) => ["parlays", params] as const,
  pipeline: (jobId?: string) => ["pipeline", jobId] as const,
  radar: ["radar"] as const,
  settings: ["settings"] as const,
};

// ---- Dashboard ----
export function useDashboard() {
  return useQuery({
    queryKey: keys.dashboard,
    queryFn: getDashboard,
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

// ---- Parlays ----
export function useParlays(params?: Parameters<typeof getParlays>[0]) {
  return useQuery({
    queryKey: keys.parlays(params),
    queryFn: () => getParlays(params),
  });
}

export function useCreateParlay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ParlayCreate) => createParlay(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["parlays"] }),
  });
}

export function useDeleteParlay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteParlay(id),
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
      const status = query.state.data?.status;
      return status === "running" ? POLLING_INTERVAL : false;
    },
    retry: false,
  });
}

export function useRadarOpportunities() {
  return useQuery({
    queryKey: keys.radar,
    queryFn: getRadarOpportunities,
  });
}

// ---- Settings ----
export function useSettings() {
  return useQuery({
    queryKey: keys.settings,
    queryFn: getSettings,
  });
}

export function useUpdateAIConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AIConfig>) => updateAIConfig(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.settings }),
  });
}

export function useUpdateUnitSize() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (usd: number) => updateUnitSize(usd),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.settings }),
  });
}

export function useToggleSportsbook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      toggleSportsbook(id, is_active),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.settings }),
  });
}
