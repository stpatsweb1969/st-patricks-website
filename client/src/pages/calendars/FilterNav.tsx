/**
 * Filter Navigation — Sticky filter tabs for calendar source selection.
 */

import { Calendar, Star, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { sourceConfig, type SourceFilter } from "./calendarData";

interface FilterNavProps {
  activeSource: SourceFilter;
  setActiveSource: (source: SourceFilter) => void;
  counts: Record<string, number>;
  keyDatesCount: number;
}

export function FilterNav({ activeSource, setActiveSource, counts, keyDatesCount }: FilterNavProps) {
  return (
    <div className="bg-background/95 backdrop-blur-md border-b border-border/60 sticky top-[var(--nav-height,5.5rem)] z-30">
      <div className="container max-w-4xl">
        <div className="flex items-center gap-2 py-2.5">
          {/* Back to Home button */}
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors pr-3 border-r border-border/50 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>

          {/* Source Filter Tabs */}
          <nav className="flex flex-wrap items-center gap-1 ml-1">
            {/* All events tab */}
            <button
              onClick={() => setActiveSource("all")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                activeSource === "all"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              All
              {counts.all > 0 && <span className="text-xs opacity-70">{counts.all}</span>}
            </button>

            {/* Key Dates tab */}
            <button
              onClick={() => setActiveSource("key-dates")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                activeSource === "key-dates"
                  ? "bg-gold/15 text-gold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              Key Dates
              {keyDatesCount > 0 && <span className="text-xs opacity-70">{keyDatesCount}</span>}
            </button>

            {/* Source-specific tabs */}
            {(Object.entries(sourceConfig) as [keyof typeof sourceConfig, typeof sourceConfig.parish][]).map(
              ([key, config]) => {
                const count = counts[key] || 0;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveSource(key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                      activeSource === key
                        ? config.color
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <config.icon className="w-3.5 h-3.5" />
                    {config.label}
                    {count > 0 && <span className="text-xs opacity-70">{count}</span>}
                  </button>
                );
              }
            )}
          </nav>
        </div>
      </div>
    </div>
  );
}
