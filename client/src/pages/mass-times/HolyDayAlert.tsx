/**
 * Holy Day Alert — Shows upcoming Holy Days from the database (admin-managed).
 * Falls back to schedule engine defaults if no DB entries exist.
 */

import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { getUpcomingHolyDays as getStaticHolyDays } from "./scheduleData";

export function HolyDayAlert() {
  const { data: dbHolyDays } = trpc.holyDays.upcoming.useQuery({ limit: 5 });

  // Use DB holy days if available, otherwise fall back to static schedule engine
  const upcomingHolyDays = useMemo(() => {
    if (dbHolyDays && dbHolyDays.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return dbHolyDays
        .map(hd => {
          const [y, m, d] = hd.date.split("-").map(Number);
          const date = new Date(y, m - 1, d);
          const daysUntil = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return {
            name: hd.name,
            date,
            massTimes: hd.massTimes as string[],
            daysUntil,
            category: hd.category,
          };
        })
        .filter(hd => hd.daysUntil >= 0 && hd.daysUntil <= 14);
    }
    // Fallback to static schedule engine defaults (within 7 days)
    return getStaticHolyDays().map(hd => ({ ...hd, category: "holy_day" }));
  }, [dbHolyDays]);

  if (upcomingHolyDays.length === 0) return null;

  return (
    <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-500/12 flex items-center justify-center shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">
            {upcomingHolyDays.length === 1 && upcomingHolyDays[0].category === "holy_day"
              ? "Holy Day of Obligation"
              : "Upcoming Special Masses"}
          </p>
          {upcomingHolyDays.map((hd, i) => (
            <div key={i} className={i > 0 ? "mt-2 pt-2 border-t border-amber-200/50" : ""}>
              <p className="font-semibold text-sm text-amber-900">{hd.name}</p>
              <p className="text-xs text-amber-700 mt-0.5">
                {hd.daysUntil === 0 ? "Today" : hd.daysUntil === 1 ? "Tomorrow" : `${hd.date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}`}
                {" "}&middot; Mass at <span className="font-semibold">{hd.massTimes.join(", ")}</span>
              </p>
            </div>
          ))}
          {upcomingHolyDays.some(hd => hd.category === "holy_day") && (
            <p className="text-xs text-amber-600 mt-2 italic">Catholics are obligated to attend Mass on this day.</p>
          )}
        </div>
      </div>
    </div>
  );
}
