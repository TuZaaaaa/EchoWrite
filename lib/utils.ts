import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: Date | string) {
  return format(new Date(value), "yyyy-MM-dd HH:mm");
}

export function sentenceCount(value: string) {
  return value
    .split(/[.!?]+/)
    .map((item) => item.trim())
    .filter(Boolean).length;
}

export function normalizeEnglish(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenizeEnglish(value: string) {
  return normalizeEnglish(value).split(" ").filter(Boolean);
}

export function dedupe<T>(items: T[]) {
  return [...new Set(items)];
}

export function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function parseTags(input: string | string[] | null | undefined) {
  if (Array.isArray(input)) {
    return input;
  }

  if (!input) {
    return [];
  }

  return dedupe(
    input
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
  );
}

export function parseStoredStringArray(value: unknown) {
  try {
    const parsed = JSON.parse(typeof value === "string" ? value : "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function parseStoredJson<T>(value: unknown, fallback: T) {
  try {
    if (typeof value !== "string") {
      return fallback;
    }

    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
