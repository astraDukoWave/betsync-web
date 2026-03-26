"use client";

import { AlertTriangle, Lock, PiggyBank, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinancialDashboard } from "@/lib/financialQueries";
import { ErrorState, formatCurrency, LoadingCards } from "./FinancialUI";

export function DashboardFinancePanel() {
  const { data, isLoading, isError } = useFinancialDashboard();

  if (isLoading) return <LoadingCards />;
  if (isError || !data) return <ErrorState message="Could not load financial dashboard." />;

  const cards = [
    {
      title: "Available Balance",
      value: formatCurrency(data.available_balance, data.currency),
      icon: Wallet,
    },
    {
      title: "Locked Balance",
      value: formatCurrency(data.locked_balance, data.currency),
      icon: Lock,
    },
    {
      title: "Profit / Loss",
      value: formatCurrency(data.profit_loss, data.currency),
      icon: PiggyBank,
    },
    {
      title: "Drift Alert",
      value: data.drift_detected
        ? `${formatCurrency(data.drift_amount, data.currency)} drift`
        : "No drift",
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Last updated: {new Date(data.updated_at).toLocaleString("en-US")}
      </p>
    </div>
  );
}
