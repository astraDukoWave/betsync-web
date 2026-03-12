function safeNum(v: number | null | undefined): number | null {
  if (v == null || Number.isNaN(v)) return null;
  return v;
}

/**
 * formatOdds: converts American odds to display string
 * e.g. -110 -> "-110" | +220 -> "+220"
 */
export function formatOdds(odds: number | null | undefined): string {
  const n = safeNum(odds);
  if (n === null) return "-";
  return n > 0 ? `+${n}` : String(n);
}

/**
 * formatROI: formats ROI percentage
 * e.g. 12.5 -> "+12.50%" | -3.2 -> "-3.20%"
 */
export function formatROI(roi: number | null | undefined): string {
  const n = safeNum(roi);
  if (n === null) return "+0.00%";
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

/**
 * formatCLV: formats Closing Line Value
 * e.g. 2.5 -> "+2.50%" | -1.3 -> "-1.30%"
 */
export function formatCLV(clv: number | null | undefined): string {
  const n = safeNum(clv);
  if (n === null) return "-";
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

/**
 * formatWinRate: 0-1 -> "63.5%"
 */
export function formatWinRate(rate: number | null | undefined): string {
  const n = safeNum(rate);
  if (n === null) return "0.0%";
  return `${(n * 100).toFixed(1)}%`;
}

/**
 * formatUnits: formats unit P&L
 * e.g. 3.45 -> "+3.45u" | -1.2 -> "-1.20u"
 */
export function formatUnits(units: number | null | undefined): string {
  const n = safeNum(units);
  if (n === null) return "+0.00u";
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}u`;
}

/**
 * formatDate: ISO string -> "Mar 10, 2026"
 */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * formatDateTime: ISO string -> "Mar 10, 2026, 2:30 PM"
 */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * impliedProbability: American odds -> implied probability %
 * e.g. -110 -> 52.38
 */
export function impliedProbability(odds: number): number {
  if (odds < 0) {
    return (-odds / (-odds + 100)) * 100;
  } else {
    return (100 / (odds + 100)) * 100;
  }
}

/**
 * formatStreak: +3 -> "W3" | -2 -> "L2" | 0 -> "-"
 */
export function formatStreak(streak: number | null | undefined): string {
  const n = safeNum(streak);
  if (n === null || n === 0) return "-";
  return n > 0 ? `W${n}` : `L${Math.abs(n)}`;
}
