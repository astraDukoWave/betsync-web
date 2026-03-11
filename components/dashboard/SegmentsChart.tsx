"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { SegmentStat } from "@/lib/types";

interface SegmentsChartProps {
  data: SegmentStat[];
  title: string;
}

function getBarColor(roi: number): string {
  if (roi >= 10) return "#22c55e";
  if (roi >= 0) return "#3b82f6";
  return "#ef4444";
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload as SegmentStat;
    return (
      <div className="bg-surface-elevated border border-border rounded-lg p-3 text-sm space-y-1">
        <p className="font-semibold text-foreground">{label}</p>
        <p className="text-muted-foreground">
          Win Rate: <span className="text-foreground font-mono">{(d.win_rate * 100).toFixed(1)}%</span>
        </p>
        <p className="text-muted-foreground">
          ROI: <span className={`font-mono ${d.roi >= 0 ? "text-green-400" : "text-red-400"}`}>{d.roi >= 0 ? "+" : ""}{d.roi.toFixed(1)}%</span>
        </p>
        <p className="text-muted-foreground">
          Sample: <span className="text-foreground font-mono">{d.sample}</span>
        </p>
      </div>
    );
  }
  return null;
};

export function SegmentsChart({ data, title }: SegmentsChartProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#232738" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
          <Bar dataKey="roi" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={getBarColor(entry.roi)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
