"use client";

import { useState } from "react";
import { Download, Landmark, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFiscalSummary } from "@/lib/queries";
import { downloadFiscalCSV } from "@/lib/api";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatMXN(value: number | null | undefined): string {
  if (value == null) return "$ 0.00 MXN";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(Number(value)) + " MXN";
}

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

// ---------------------------------------------------------------------------
// KPI Card
// ---------------------------------------------------------------------------
interface KpiCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  highlighted?: boolean;
  negative?: boolean;
  subtitle?: string;
}

function KpiCard({ title, value, icon: Icon, highlighted, negative, subtitle }: KpiCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden",
        highlighted && "border-primary shadow-md shadow-primary/20",
        negative && "border-destructive/50"
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon
          className={cn(
            "h-4 w-4",
            highlighted ? "text-primary" : negative ? "text-destructive" : "text-muted-foreground"
          )}
        />
      </CardHeader>
      <CardContent>
        <p
          className={cn(
            "text-2xl font-bold tracking-tight",
            highlighted ? "text-primary" : negative ? "text-destructive" : "text-foreground"
          )}
        >
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function FiscalPage() {
  const [taxYear, setTaxYear] = useState<number>(CURRENT_YEAR);
  const { data, isLoading, isError } = useFiscalSummary(taxYear);

  const handleDownload = () => {
    downloadFiscalCSV(taxYear);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Reporte Tributario y Flujo de Caja
          </h1>
          <p className="text-sm text-muted-foreground">
            Estimaci\u00f3n de base imponible SAT (M\u00e9xico). Consulta a tu contador.
          </p>
        </div>

        <div className="flex items-center gap-3 mt-3 sm:mt-0">
          {/* Year selector */}
          <Select
            value={String(taxYear)}
            onValueChange={(v) => setTaxYear(Number(v))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="A\u00f1o" />
            </SelectTrigger>
            <SelectContent>
              {YEAR_OPTIONS.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* CSV Download */}
          <Button onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            Descargar Reporte CSV (Contador)
          </Button>
        </div>
      </div>

      {/* Loading / Error states */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 w-32 rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-24 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          No se pudo cargar el resumen fiscal. Verifica que la API est\u00e9 en l\u00ednea.
        </div>
      )}

      {/* KPI Cards */}
      {data && !isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Base Imponible (SAT)"
            value={formatMXN(data.taxable_base_estimate_mxn)}
            icon={Landmark}
            highlighted
            subtitle={`Jurisdicci\u00f3n: ${data.jurisdiction}`}
          />
          <KpiCard
            title="Utilidad Neta Apuestas"
            value={formatMXN(data.net_gambling_income_mxn)}
            icon={data.net_gambling_income_mxn < 0 ? TrendingDown : TrendingUp}
            negative={data.net_gambling_income_mxn < 0}
            subtitle={`${data.total_picks_won}W / ${data.total_picks_lost}L`}
          />
          <KpiCard
            title="Flujo de Caja (Bancos)"
            value={formatMXN(data.net_cashflow_mxn)}
            icon={Wallet}
            negative={data.net_cashflow_mxn < 0}
          />
          <KpiCard
            title="Total Dep\u00f3sitos"
            value={formatMXN(data.total_deposits_mxn)}
            icon={TrendingUp}
          />
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground border-t border-border pt-4">
        \u26a0\ufe0f Los valores mostrados son estimaciones calculadas autom\u00e1ticamente.
        No constituyen asesor\u00eda fiscal. Consulta a un contador certificado antes de presentar tu declaraci\u00f3n.
      </p>
    </div>
  );
}
