import { trpc } from "@/lib/trpc";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

function DailyReadingsSkeleton() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-5 w-36 bg-white/10 rounded animate-pulse" />
            <div className="h-3 w-52 bg-white/10 rounded animate-pulse" />
          </div>
        </div>
        <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {["First Reading", "Responsorial Psalm", "Gospel"].map((label) => (
          <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2.5">
            <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
            <div className="h-3 w-36 bg-white/10 rounded animate-pulse" />
            <div className="space-y-1.5 pt-1">
              <div className="h-3 w-full bg-white/10 rounded animate-pulse" />
              <div className="h-3 w-full bg-white/10 rounded animate-pulse" />
              <div className="h-3 w-5/6 bg-white/10 rounded animate-pulse" />
              <div className="h-3 w-4/5 bg-white/10 rounded animate-pulse" />
              <div className="h-3 w-3/4 bg-white/10 rounded animate-pulse" />
              <div className="h-3 w-2/3 bg-white/10 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DailyReadings() {
  const { data: readings, isLoading } = trpc.dailyReadings.today.useQuery();
  const [expandedReading, setExpandedReading] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<string | null>(null);

  useEffect(() => {
    function getNextMassCountdown() {
      const now = new Date();
      const eastern = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
      const day = eastern.getDay();
      const h = eastern.getHours();
      const m = eastern.getMinutes();
      const nowMin = h * 60 + m;

      const massTimes: { day: number; hour: number; min: number }[] = [
        { day: 0, hour: 8, min: 30 }, { day: 0, hour: 10, min: 30 }, { day: 0, hour: 12, min: 30 },
        { day: 2, hour: 8, min: 30 }, { day: 3, hour: 8, min: 30 },
        { day: 4, hour: 8, min: 30 }, { day: 5, hour: 8, min: 30 },
        { day: 6, hour: 17, min: 30 },
      ];

      let minDiff = Infinity;
      for (const mt of massTimes) {
        let dayDiff = mt.day - day;
        if (dayDiff < 0) dayDiff += 7;
        const targetMin = dayDiff * 24 * 60 + mt.hour * 60 + mt.min;
        const diff = targetMin - nowMin;
        if (diff > 0 && diff < 24 * 60 && diff < minDiff) minDiff = diff;
      }

      if (minDiff < 24 * 60) {
        const hrs = Math.floor(minDiff / 60);
        const mins = minDiff % 60;
        return hrs > 0 ? `in ${hrs}h ${mins}m` : `in ${mins}m`;
      }
      return null;
    }

    setCountdown(getNextMassCountdown());
    const interval = setInterval(() => setCountdown(getNextMassCountdown()), 60000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return <DailyReadingsSkeleton />;
  }

  if (!readings) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
        <p className="text-sm text-white/70">Daily readings are temporarily unavailable.</p>
        <a
          href="https://bible.usccb.org/daily-bible-reading"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gold hover:text-gold/80 hover:underline mt-2 inline-block"
        >
          View on USCCB.org
        </a>
      </div>
    );
  }

  const readingItems = [
    { key: "first", label: "First Reading", title: readings.firstReading.title, text: readings.firstReading.text, color: "text-gold" },
    { key: "psalm", label: "Responsorial Psalm", title: readings.psalm.title, text: readings.psalm.text, color: "text-amber-300" },
    { key: "gospel", label: "Gospel", title: readings.gospel.title, text: readings.gospel.text, color: "text-red-300" },
  ];

  return (
    <div>
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-lg bg-gold/15 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white">Today's Readings</h2>
              {countdown && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold/20 text-gold text-xs font-bold animate-pulse">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Mass {countdown}
                </span>
              )}
            </div>
            <p className="text-sm text-white/70 leading-snug">{readings.liturgicTitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap mt-2">
          <a
            href="https://bible.usccb.org/daily-bible-reading"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-gold hover:text-gold/80 flex items-center gap-1 transition-colors ml-auto"
          >
            Full Readings <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </div>
      <div className="space-y-2">
        {readingItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setExpandedReading(expandedReading === item.key ? null : item.key)}
            className="w-full text-left rounded-xl border border-white/12 bg-white/[0.04] hover:bg-white/[0.08] transition-all duration-200 overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <span className={`text-xs font-bold uppercase tracking-wider ${item.color} block mb-1`}>{item.label}</span>
                <span className="text-sm sm:text-base text-white/85 leading-snug">{item.title}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-white/30 transition-transform duration-200 shrink-0 ${expandedReading === item.key ? "rotate-180" : ""}`} />
            </div>
            {expandedReading === item.key && (
              <div className="px-4 pb-4 pt-2 border-t border-white/12">
                <p className="text-sm sm:text-base text-white/85 leading-relaxed whitespace-pre-line">{item.text}</p>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
