/**
 * TodayCard — A rich, visually prominent card linking to /worship/today.
 * Shows today's date, liturgical day, a one-line reading teaser, and the Saint of the Day.
 */
import { Link } from "wouter";
import { ArrowRight, BookOpen, Cross, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLiturgicalSeason } from "@/contexts/LiturgicalSeasonContext";
import { getSeasonDescription } from "@/lib/liturgicalSeason";
import { Card, CardContent } from "@/components/ui/card";

export function TodayCard() {
  const { season, theme } = useLiturgicalSeason();
  const { data: readings } = trpc.dailyReadings.today.useQuery(undefined, { staleTime: 5 * 60 * 1000 });
  const { data: saint } = trpc.saintOfDay.today.useQuery(undefined, { staleTime: 5 * 60 * 1000 });

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const seasonDesc = getSeasonDescription(season);

  return (
    <Link href="/worship/today">
      <Card className="group relative overflow-hidden rounded-xl border border-border/60 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
        {/* Season accent top border */}
        <div className="absolute top-0 inset-x-0 h-1" style={{ backgroundColor: theme.accentHex }} />

        <CardContent className="p-4 sm:p-5">
          {/* Header: date + liturgical badge */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{dateStr}</p>
              <p className="text-base sm:text-lg font-bold text-foreground mt-0.5 leading-tight">
                {readings?.liturgicTitle || seasonDesc}
              </p>
            </div>
            <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${theme.badgeClass}`}>
              <Cross className="w-2.5 h-2.5" />
              {theme.label}
            </span>
          </div>

          {/* Teaser rows */}
          <div className="space-y-2">
            {/* Reading teaser */}
            {readings && (
              <div className="flex items-start gap-2">
                <BookOpen className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground leading-snug line-clamp-1">
                  <span className="font-medium text-foreground">Gospel:</span>{" "}
                  {readings.gospel.title}
                </p>
              </div>
            )}

            {/* Saint teaser */}
            {saint && (saint.featuredSaint || saint.saints.length > 0) && (
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground leading-snug line-clamp-1">
                  <span className="font-medium text-foreground">Saint:</span>{" "}
                  {saint.featuredSaint?.name || saint.saints[0]}
                </p>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between">
            <span className="text-sm font-semibold text-primary group-hover:underline">
              Today's Readings, Saint & Catholic News
            </span>
            <ArrowRight className="w-4 h-4 text-primary transition-transform group-hover:translate-x-0.5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
