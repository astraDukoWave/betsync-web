import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const SAFE_URL_RE = /^https?:\/\//i;

export function getSafeUrl(url: string): string {
  return SAFE_URL_RE.test(url) ? url : "#";
}

export function isOddsInDeadZone(odds: number): boolean {
  return odds > -100 && odds < 100;
}
