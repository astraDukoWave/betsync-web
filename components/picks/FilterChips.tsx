"use client";

import { clsx } from "clsx";
import type { PickStatus, Sport, BetType, Grade } from "@/lib/types";

interface FilterChipsProps<T extends string> {
  label: string;
  options: T[];
  selected: T[];
  onChange: (values: T[]) => void;
  renderLabel?: (value: T) => string;
}

export function FilterChips<T extends string>({
  label,
  options,
  selected,
  onChange,
  renderLabel,
}: FilterChipsProps<T>) {
  const toggle = (value: T) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const isAll = selected.length === 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground uppercase tracking-wider shrink-0">{label}:</span>
      <button
        type="button"
        onClick={() => onChange([])}
        className={clsx(
          "rounded-full px-3 py-1 text-xs font-medium transition-colors",
          isAll
            ? "bg-primary text-primary-foreground"
            : "bg-surface-elevated text-muted-foreground hover:text-foreground"
        )}
      >
        All
      </button>
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={clsx(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "bg-surface-elevated text-muted-foreground hover:text-foreground"
            )}
          >
            {renderLabel ? renderLabel(opt) : opt}
          </button>
        );
      })}
    </div>
  );
}

// ---- Pre-built filter sets ----

export const STATUS_OPTIONS: PickStatus[] = ["pending", "won", "lost", "push", "void"];
export const SPORT_OPTIONS: Sport[] = ["NFL", "NBA", "MLB", "NHL", "NCAAF", "NCAAB", "Soccer", "Tennis", "MMA", "Other"];
export const BET_TYPE_OPTIONS: BetType[] = ["straight", "parlay", "teaser", "prop"];
export const GRADE_OPTIONS: Grade[] = ["A", "B", "C", "D", "F"];
