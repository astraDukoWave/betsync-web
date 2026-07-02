"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RadarFilters } from "@/lib/types";

interface RadarFiltersProps {
  onFilterChange: (filters: RadarFilters) => void;
}

export function RadarFilters({ onFilterChange }: RadarFiltersProps) {
  const [minGrade, setMinGrade] = useState<RadarFilters["minGrade"]>(undefined);
  const [sortBy, setSortBy] = useState<RadarFilters["sortBy"]>(undefined);

  function handleGradeChange(value: string) {
    const next = value === "all" ? undefined : (value as RadarFilters["minGrade"]);
    setMinGrade(next);
    onFilterChange({ minGrade: next, sortBy });
  }

  function handleSortChange(value: string) {
    const next = value === "none" ? undefined : (value as RadarFilters["sortBy"]);
    setSortBy(next);
    onFilterChange({ minGrade, sortBy: next });
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          Grado mínimo
        </span>
        <Select onValueChange={handleGradeChange} defaultValue="all">
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="A">A</SelectItem>
            <SelectItem value="B">B o mejor</SelectItem>
            <SelectItem value="C">C o mejor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          Ordenar por
        </span>
        <Select onValueChange={handleSortChange} defaultValue="none">
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sin orden</SelectItem>
            <SelectItem value="market_prob">Prob. de Mercado %</SelectItem>
            <SelectItem value="game_date">Fecha</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
