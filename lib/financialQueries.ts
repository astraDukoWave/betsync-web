import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getFinancialDashboard,
  getFinancialFiscalSummary,
  getLedgerEntries,
  getReconciliationSummary,
  runReconciliationFix,
} from "./financialApi";

export const financialKeys = {
  dashboard: ["financial", "dashboard"] as const,
  ledger: (limit: number) => ["financial", "ledger", limit] as const,
  reconciliation: ["financial", "reconciliation"] as const,
  fiscal: (taxYear: number) => ["financial", "fiscal", taxYear] as const,
};

export function useFinancialDashboard() {
  return useQuery({
    queryKey: financialKeys.dashboard,
    queryFn: getFinancialDashboard,
  });
}

export function useLedgerEntries(limit = 20) {
  return useQuery({
    queryKey: financialKeys.ledger(limit),
    queryFn: () => getLedgerEntries(limit),
  });
}

export function useReconciliationSummary() {
  return useQuery({
    queryKey: financialKeys.reconciliation,
    queryFn: getReconciliationSummary,
  });
}

export function useRunReconciliationFix() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: runReconciliationFix,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financialKeys.reconciliation });
      queryClient.invalidateQueries({ queryKey: financialKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: ["financial", "ledger"] });
    },
  });
}

export function useFinancialFiscalSummary(taxYear: number) {
  return useQuery({
    queryKey: financialKeys.fiscal(taxYear),
    queryFn: () => getFinancialFiscalSummary(taxYear),
  });
}
