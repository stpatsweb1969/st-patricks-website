/**
 * Now at St. Patrick — Main homepage content section combining news, Sunday preview, and events.
 */

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TodayCard } from "./now-sections/TodayCard";
import { SectionHeader } from "@/components/SectionHeader";
import { BookOpen } from "lucide-react";
import { ComingUpFiltered } from "./now-sections/ComingUpFiltered";
import { LatestNewsEditorial } from "./now-sections/LatestNewsEditorial";

const catColors: Record<string, { dot: string; bg: string }> = {
  ccd: { dot: "bg-green-500", bg: "bg-green-500/10" },
  cyo: { dot: "bg-orange-500", bg: "bg-orange-500/10" },
  sacrament: { dot: "bg-purple-500", bg: "bg-purple-500/10" },
  parish: { dot: "bg-primary", bg: "bg-primary/10" },
  teen_life: { dot: "bg-emerald-700", bg: "bg-emerald-700/10" },
  social: { dot: "bg-amber-500", bg: "bg-amber-500/10" },
};

export function NowAtStPatrick({ latestNews, newsItems, allImportantDates }: { latestNews: any; newsItems: any[] | undefined; allImportantDates: any[] | undefined }) {
  const upcomingEvents = useMemo(() => {
    return allImportantDates
      ?.filter((e) => new Date(e.eventDate as unknown as string) >= new Date())
      ?.slice(0, 12) || [];
  }, [allImportantDates]);

  return (
    <section className="reveal container mt-0 pt-4 sm:pt-6 relative z-20 mb-6 sm:mb-8">
      <LatestNewsEditorial newsItems={newsItems} />
      <div className="mt-6">
        <SectionHeader
          icon={BookOpen}
          label="WORSHIP"
          title="Today's Readings, Saint & Catholic News"
          size="sm"
        />
        <TodayCard />
      </div>
      {upcomingEvents.length > 0 && (
        <Card className="rounded-xl border border-border/60 shadow-sm overflow-hidden mt-4">
          <CardContent className="p-0">
            <ComingUpFiltered events={upcomingEvents} catColors={catColors} />
          </CardContent>
        </Card>
      )}
    </section>
  );
}
