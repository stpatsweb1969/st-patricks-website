/**
 * LiturgicalSeasonContext — Injects CSS custom properties for the current
 * liturgical season accent color onto :root, so any component can use
 * var(--season-accent), var(--season-accent-light), var(--season-bg) etc.
 *
 * Also exposes a React context for components that need the season data directly.
 */
import { createContext, useContext, useEffect, useMemo } from "react";
import {
  getLiturgicalSeason,
  getSeasonTheme,
  type LiturgicalSeason,
  type SeasonTheme,
} from "@/lib/liturgicalSeason";

interface SeasonContextValue {
  season: LiturgicalSeason;
  theme: SeasonTheme;
}

const SeasonContext = createContext<SeasonContextValue>({
  season: "ordinary",
  theme: getSeasonTheme("ordinary"),
});

export function useLiturgicalSeason() {
  return useContext(SeasonContext);
}

/**
 * Season accent color map — OKLCH values for each season.
 * These are injected as CSS custom properties on <html>.
 */
const SEASON_CSS_VARS: Record<LiturgicalSeason, Record<string, string>> = {
  ordinary: {
    "--season-accent": "oklch(0.48 0.14 160)",       // Parish green
    "--season-accent-light": "oklch(0.92 0.04 160)", // Light green bg
    "--season-accent-muted": "oklch(0.72 0.08 160)", // Muted green
    "--season-accent-fg": "oklch(0.98 0.01 160)",    // White-on-green
    "--season-badge-bg": "oklch(0.92 0.04 160)",
    "--season-badge-text": "oklch(0.38 0.10 160)",
    "--season-badge-border": "oklch(0.85 0.06 160)",
  },
  advent: {
    "--season-accent": "oklch(0.44 0.18 300)",       // Royal purple
    "--season-accent-light": "oklch(0.94 0.04 300)", // Light purple bg
    "--season-accent-muted": "oklch(0.65 0.12 300)", // Muted purple
    "--season-accent-fg": "oklch(0.98 0.01 300)",    // White-on-purple
    "--season-badge-bg": "oklch(0.94 0.04 300)",
    "--season-badge-text": "oklch(0.38 0.14 300)",
    "--season-badge-border": "oklch(0.87 0.06 300)",
  },
  lent: {
    "--season-accent": "oklch(0.40 0.16 300)",       // Deep violet
    "--season-accent-light": "oklch(0.94 0.03 300)", // Light violet bg
    "--season-accent-muted": "oklch(0.60 0.10 300)", // Muted violet
    "--season-accent-fg": "oklch(0.98 0.01 300)",    // White-on-violet
    "--season-badge-bg": "oklch(0.94 0.03 300)",
    "--season-badge-text": "oklch(0.35 0.14 300)",
    "--season-badge-border": "oklch(0.87 0.05 300)",
  },
  christmas: {
    "--season-accent": "oklch(0.65 0.18 79)",        // Liturgical gold
    "--season-accent-light": "oklch(0.96 0.04 79)",  // Light gold bg
    "--season-accent-muted": "oklch(0.78 0.12 79)",  // Muted gold
    "--season-accent-fg": "oklch(0.18 0.06 79)",     // Dark-on-gold
    "--season-badge-bg": "oklch(0.96 0.04 79)",
    "--season-badge-text": "oklch(0.42 0.14 79)",
    "--season-badge-border": "oklch(0.88 0.08 79)",
  },
  easter: {
    "--season-accent": "oklch(0.68 0.16 79)",        // Bright gold/white
    "--season-accent-light": "oklch(0.97 0.03 79)",  // Light gold bg
    "--season-accent-muted": "oklch(0.80 0.10 79)",  // Muted gold
    "--season-accent-fg": "oklch(0.18 0.06 79)",     // Dark-on-gold
    "--season-badge-bg": "oklch(0.97 0.03 79)",
    "--season-badge-text": "oklch(0.42 0.14 79)",
    "--season-badge-border": "oklch(0.90 0.06 79)",
  },
};

export function LiturgicalSeasonProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo(() => {
    const season = getLiturgicalSeason();
    const theme = getSeasonTheme(season);
    return { season, theme };
  }, []);

  // Inject CSS custom properties on mount
  useEffect(() => {
    const vars = SEASON_CSS_VARS[value.season];
    const root = document.documentElement;
    Object.entries(vars).forEach(([prop, val]) => {
      root.style.setProperty(prop, val);
    });
    // Also set a data attribute for CSS selectors
    root.setAttribute("data-season", value.season);
    return () => {
      Object.keys(vars).forEach((prop) => {
        root.style.removeProperty(prop);
      });
      root.removeAttribute("data-season");
    };
  }, [value.season]);

  return (
    <SeasonContext.Provider value={value}>
      {children}
    </SeasonContext.Provider>
  );
}
