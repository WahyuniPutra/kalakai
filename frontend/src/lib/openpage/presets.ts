import type { OpenPageTheme } from "./schema";

export interface ThemePresetOption {
  id: string;
  name: string;
  description: string;
  previewColors: string[];
  theme: OpenPageTheme;
}

export const OPENPAGE_THEME_PRESETS: ThemePresetOption[] = [
  {
    id: "rose-romance",
    name: "Rose Romance",
    description: "Nuansa romantis mawar merah dengan latar gelap eksklusif",
    previewColors: ["#e11d48", "#f43f5e", "#09090b"],
    theme: {
      preset: "rose-romance",
      primaryColor: "#e11d48",
      accentColor: "#f43f5e",
      bgColor: "#09090b",
      cardBgColor: "#18181b",
      textColor: "#fafafa",
      textMutedColor: "#a1a1aa",
      borderColor: "#27272a",
      fontDisplay: "serif",
      fontBody: "sans",
      borderRadius: "3xl",
    },
  },
  {
    id: "emerald-palace",
    name: "Emerald Palace",
    description: "Kombinasi hijau zamrud mewah dan sentuhan emas kerajaan",
    previewColors: ["#059669", "#d97706", "#022c22"],
    theme: {
      preset: "emerald-palace",
      primaryColor: "#d97706",
      accentColor: "#10b981",
      bgColor: "#022c22",
      cardBgColor: "#064e3b",
      textColor: "#f0fdf4",
      textMutedColor: "#a7f3d0",
      borderColor: "#047857",
      fontDisplay: "serif",
      fontBody: "sans",
      borderRadius: "2xl",
    },
  },
  {
    id: "midnight-velvet",
    name: "Midnight Velvet",
    description: "Nuansa malam megah dengan emas tembaga kontras tinggi",
    previewColors: ["#f59e0b", "#d97706", "#0f172a"],
    theme: {
      preset: "midnight-velvet",
      primaryColor: "#f59e0b",
      accentColor: "#fbbf24",
      bgColor: "#090d16",
      cardBgColor: "#0f172a",
      textColor: "#f8fafc",
      textMutedColor: "#94a3b8",
      borderColor: "#1e293b",
      fontDisplay: "serif",
      fontBody: "sans",
      borderRadius: "3xl",
    },
  },
  {
    id: "ivory-sand",
    name: "Ivory Minimal",
    description: "Palet champagne hangat, lembut, dan elegan ala Eropa",
    previewColors: ["#b45309", "#d97706", "#1c1917"],
    theme: {
      preset: "ivory-sand",
      primaryColor: "#b45309",
      accentColor: "#d97706",
      bgColor: "#141210",
      cardBgColor: "#1f1b18",
      textColor: "#fafaf9",
      textMutedColor: "#a8a29e",
      borderColor: "#292524",
      fontDisplay: "serif",
      fontBody: "sans",
      borderRadius: "3xl",
    },
  },
  {
    id: "bohemian-terracotta",
    name: "Bohemian Terracotta",
    description: "Warna terakota hangat dan earth-tone natural kekinian",
    previewColors: ["#c2410c", "#ea580c", "#181311"],
    theme: {
      preset: "bohemian-terracotta",
      primaryColor: "#ea580c",
      accentColor: "#f97316",
      bgColor: "#14100e",
      cardBgColor: "#1c1613",
      textColor: "#fff7ed",
      textMutedColor: "#fdba74",
      borderColor: "#2c221d",
      fontDisplay: "serif",
      fontBody: "sans",
      borderRadius: "2xl",
    },
  },
];
