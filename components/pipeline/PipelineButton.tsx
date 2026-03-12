"use client";

import { useState, useEffect, useRef } from "react";
import { useTriggerPipeline, usePipelineJob } from "@/lib/queries";
import type { PipelineStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Radar, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_PIPELINE_TIMEOUT_MS) || 60_000;

export function PipelineButton() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined); 

  const trigger = useTriggerPipeline();
  const job = usePipelineJob(jobId);

  const status: PipelineStatus =
    timedOut ? "error" :
    job.data?.status ?? (trigger.isPending ? "running" : "idle");

  const handleClick = async () => {
    if (status === "running") return;
    setTimedOut(false);
    const result = await trigger.mutateAsync();
    setJobId(result.job_id);
    timeoutRef.current = setTimeout(() => setTimedOut(true), TIMEOUT_MS);
  };

  useEffect(() => {
    if (job.data?.status === "done" || job.data?.status === "error") {
      clearTimeout(timeoutRef.current);
    }
  }, [job.data?.status]);

  const STATES = {
    idle: {
      icon: Radar,
      label: "Run Radar",
      className: "bg-primary text-primary-foreground hover:bg-primary/90",
    },
    running: {
      icon: Loader2,
      label: "Scanning...",
      className: "bg-yellow-600 text-white cursor-not-allowed",
    },
    done: {
      icon: CheckCircle2,
      label: "Done!",
      className: "bg-emerald-600 text-white",
    },
    error: {
      icon: AlertCircle,
      label: "Error — Retry",
      className: "bg-red-600 text-white hover:bg-red-500",
    },
    rate_limited: {
      icon: AlertCircle,
      label: "Rate Limited",
      className: "bg-orange-600 text-white",
    },
  };

  const state = STATES[status] ?? STATES.idle;
  const Icon = state.icon;

  return (
    <button
      onClick={handleClick}
      disabled={status === "running"}
      className={cn(
        "flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all",
        state.className
      )}
    >
      <Icon
        className={cn("h-4 w-4", status === "running" && "animate-spin")}
      />
      {state.label}
    </button>
  );
}
