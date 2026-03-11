import { AppShell } from "@/components/layout/AppShell";
import { PipelineButton } from "@/components/pipeline/PipelineButton";
import { RadarGrid } from "@/components/pipeline/RadarGrid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pipeline — BetSync",
};

export default function PipelinePage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Radar de Oportunidades</h1>
            <p className="text-sm text-muted-foreground">AI-powered betting opportunities scanner.</p>
          </div>
          <PipelineButton />
        </div>
        <RadarGrid />
      </div>
    </AppShell>
  );
}
