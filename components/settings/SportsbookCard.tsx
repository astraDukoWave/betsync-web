"use client";

import { useToggleSportsbook } from "@/lib/queries";
import type { Sportsbook } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ExternalLink, Key } from "lucide-react";

export function SportsbookCard({ sportsbook }: { sportsbook: Sportsbook }) {
  const toggle = useToggleSportsbook();

  const handleToggle = () => {
    toggle.mutate({ id: sportsbook.id, is_active: !sportsbook.is_active });
  };

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-all",
        sportsbook.is_active
          ? "border-primary/30 bg-surface"
          : "border-border bg-surface opacity-60"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated text-xs font-bold">
            {sportsbook.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-sm text-foreground">{sportsbook.name}</p>
            <div className="flex items-center gap-1">
              <a
                href={sportsbook.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                {sportsbook.url} <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {sportsbook.api_key_set && (
            <Key className="h-3.5 w-3.5 text-emerald-400" />
          )}
          <button
            onClick={handleToggle}
            disabled={toggle.isPending}
            className={cn(
              "h-5 w-9 rounded-full transition-colors",
              sportsbook.is_active ? "bg-primary" : "bg-border"
            )}
          >
            <span
              className={cn(
                "block h-4 w-4 rounded-full bg-white shadow transition-transform",
                sportsbook.is_active ? "translate-x-4" : "translate-x-0.5"
              )}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
