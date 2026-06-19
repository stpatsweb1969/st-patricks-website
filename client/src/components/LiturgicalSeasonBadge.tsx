import { getLiturgicalSeason, getSeasonTheme, getSeasonDescription } from "@/lib/liturgicalSeason";
import { useMemo } from "react";

/**
 * A subtle badge that shows the current liturgical season.
 * Displays in the Daily Readings section header and optionally elsewhere.
 */
export function LiturgicalSeasonBadge({ className = "", variant = "light" }: { className?: string; variant?: "light" | "dark" }) {
  const { season, theme, description } = useMemo(() => {
    const s = getLiturgicalSeason();
    const t = getSeasonTheme(s);
    const d = getSeasonDescription(s);
    return { season: s, theme: t, description: d };
  }, []);

  const darkClass = "bg-white/10 text-white/80 border-white/20";
  const badgeStyles = variant === "dark" ? darkClass : theme.badgeClass;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${badgeStyles} ${className}`}
      title={description}
    >
      <SeasonIcon season={season} />
      {description}
    </span>
  );
}

/** Small colored dot/icon for the season */
function SeasonIcon({ season }: { season: string }) {
  const colors: Record<string, string> = {
    ordinary: "bg-emerald-500",
    advent: "bg-purple-500",
    lent: "bg-purple-600",
    christmas: "bg-amber-400",
    easter: "bg-amber-500",
  };

  return <span className={`w-1.5 h-1.5 rounded-full ${colors[season] || colors.ordinary}`} />;
}

/**
 * Hook to get the current liturgical season accent color for use in components.
 * Returns Tailwind-compatible class names.
 */
export function useLiturgicalSeason() {
  return useMemo(() => {
    const season = getLiturgicalSeason();
    const theme = getSeasonTheme(season);
    const description = getSeasonDescription(season);
    return { season, theme, description };
  }, []);
}
