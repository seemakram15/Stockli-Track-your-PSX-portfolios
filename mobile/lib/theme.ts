import { useColorScheme } from "nativewind";

/* ── Dark palette (matches web .dark vars) ──────────────────── */
const dark = {
  canvas:   "#162228",
  card:     "#1c2c36",
  card2:    "#213440",
  border:   "rgba(255,255,255,0.09)",
  fg:       "#eef3f2",
  muted:    "#7a9098",
  primary:  "#34d399",
  gain:     "#4ade80",
  gainDim:  "#0d3020",
  loss:     "#f87171",
  lossDim:  "#3b1212",
  warn:     "#fbbf24",
  warnDim:  "#3b2800",
  sky:      "#38bdf8",
  skyDim:   "#0b2a3b",
  emerald:  "#34d399",
  orange:   "#fb923c",
  amber:    "#fbbf24",
  rose:     "#fb7185",
  violet:   "#a78bfa",
  hero:     "#04100d",
} as const;

/* ── Light palette (matches web :root vars) ─────────────────── */
const light = {
  canvas:   "#f4f9f6",
  card:     "#ffffff",
  card2:    "#edf4f0",
  border:   "#d8eae3",
  fg:       "#0f2520",
  muted:    "#617a72",
  primary:  "#0d9488",
  gain:     "#059669",
  gainDim:  "#d1fae5",
  loss:     "#dc2626",
  lossDim:  "#fee2e2",
  warn:     "#d97706",
  warnDim:  "#fef3c7",
  sky:      "#0284c7",
  skyDim:   "#e0f2fe",
  emerald:  "#059669",
  orange:   "#ea580c",
  amber:    "#d97706",
  rose:     "#e11d48",
  violet:   "#7c3aed",
  hero:     "#04100d",
} as const;

export type Colors = {
  canvas: string; card: string; card2: string; border: string;
  fg: string; muted: string; primary: string;
  gain: string; gainDim: string; loss: string; lossDim: string;
  warn: string; warnDim: string; sky: string; skyDim: string;
  emerald: string; orange: string; amber: string; rose: string; violet: string;
  hero: string;
};

export function useColors(): Colors {
  const { colorScheme } = useColorScheme();
  return colorScheme === "dark" ? dark : light;
}

export const colors = { ...dark, text: dark.fg };

export const spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, "2xl": 24, "3xl": 32,
} as const;

export const radius = {
  sm: 8, md: 12, lg: 16, xl: 20, "2xl": 24, full: 9999,
} as const;

export const fontSize = {
  xs: 11, sm: 13, base: 15, md: 17, lg: 20, xl: 24, "2xl": 28, "3xl": 34,
} as const;
