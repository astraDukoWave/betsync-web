import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReconciliationStatus } from "@/lib/financialTypes";

export function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

export function StatusPill({ status }: { status: ReconciliationStatus }) {
  const variant =
    status === "OK" ? "default" : status === "WARNING" ? "secondary" : "destructive";

  return <Badge variant={variant}>{status}</Badge>;
}

export function EmptyState({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="py-8 text-sm text-muted-foreground">{message}</CardContent>
    </Card>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="text-destructive">Error</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-destructive">{message}</CardContent>
    </Card>
  );
}

export function LoadingCards() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, idx) => (
        <Card key={idx} className="animate-pulse">
          <CardHeader>
            <div className="h-4 w-28 rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="h-7 w-36 rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
