/**
 * At a Glance — Quick reference table for Mass times, confession, and devotions.
 * All data derived from the shared schedule engine (single source of truth).
 */

import { Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useParishSchedule, parseTimeToMinutes } from "@/hooks/useParishSchedule";
import { DEFAULT_PARISH_SCHEDULE, minutesToTimeString } from "../../../../shared/scheduleEngine";

export function AtAGlance() {
  const { schedule } = useParishSchedule();
  const s = schedule ?? DEFAULT_PARISH_SCHEDULE;

  // Derive display data from schedule engine
  const satVigil = s.services.find(svc => svc.dayOfWeek === 6 && svc.type === "mass");
  const sunMasses = s.services.filter(svc => svc.dayOfWeek === 0 && svc.type === "mass");
  const weekdayMasses = s.services.filter(svc => svc.dayOfWeek >= 2 && svc.dayOfWeek <= 5 && svc.type === "mass");
  const confession = s.services.find(svc => svc.type === "confession");
  const prayers = s.services.filter(svc => svc.type === "prayer");
  const hasSeasonal = sunMasses.some(m => m.seasonal);

  // Build weekend text
  const weekendParts: string[] = [];
  if (satVigil) weekendParts.push(`Sat ${satVigil.time}`);
  if (sunMasses.length > 0) {
    const sunTimes = sunMasses.map(m => {
      const t = m.time.replace(" AM", "").replace(" PM", "");
      return m.seasonal ? `${t}*` : t;
    }).join(", ");
    weekendParts.push(`Sun ${sunTimes}`);
  }

  // Build weekday text
  const uniqueWeekdayTime = weekdayMasses.length > 0 ? weekdayMasses[0].time : "";
  const weekdayDays = Array.from(new Set(weekdayMasses.map(m => m.dayOfWeek))).sort();
  const dayAbbr = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekdayRange = weekdayDays.length > 0
    ? `${dayAbbr[weekdayDays[0]]}–${dayAbbr[weekdayDays[weekdayDays.length - 1]]}`
    : "";

  // Build confession text
  let confessionText = "";
  if (confession) {
    const endMin = parseTimeToMinutes(confession.time) + confession.durationMin;
    const endTime = minutesToTimeString(endMin);
    confessionText = `Sat ${confession.time.replace(" PM", "")}–${endTime.replace(" PM", "")} PM`;
  }

  // Build prayer text
  const prayerDays = Array.from(new Set(prayers.map(p => p.dayOfWeek))).sort();
  const prayerRange = prayerDays.length > 0
    ? `${dayAbbr[prayerDays[0]]}–${dayAbbr[prayerDays[prayerDays.length - 1]]}`
    : "";
  const prayerTime = prayers.length > 0 ? prayers[0].time : "";

  // Seasonal note
  const seasonalNote = hasSeasonal
    ? sunMasses.find(m => m.seasonal)?.seasonal?.note || ""
    : "";

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center">
          <Clock className="w-3.5 h-3.5 text-primary" />
        </div>
        <h2 className="font-serif text-xl font-bold">At a Glance</h2>
      </div>
      <Card className="border border-border/50 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden rounded-xl">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-border/40">
                <td className="px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider w-28">Weekend</td>
                <td className="px-4 py-3">
                  {satVigil && (
                    <>
                      <span className="font-semibold">Sat {satVigil.time}</span>
                      <span className="text-muted-foreground/50 mx-2">·</span>
                    </>
                  )}
                  {sunMasses.length > 0 && (
                    <span className="font-semibold">
                      Sun {sunMasses.map(m => {
                        const t = m.time.replace(" AM", "").replace(" PM", "");
                        return m.seasonal ? `${t}*` : t;
                      }).join(", ")}
                    </span>
                  )}
                </td>
              </tr>
              {weekdayMasses.length > 0 && (
                <tr className="border-b border-border/40">
                  <td className="px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Weekday</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold">{weekdayRange} {uniqueWeekdayTime}</span>
                    <span className="text-muted-foreground ml-2 text-xs">(No Monday Mass)</span>
                  </td>
                </tr>
              )}
              {confession && (
                <tr className="border-b border-border/40">
                  <td className="px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Confession</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold">{confessionText}</span>
                    <span className="text-muted-foreground ml-2 text-xs">or by appt.</span>
                  </td>
                </tr>
              )}
              {prayers.length > 0 && (
                <tr>
                  <td className="px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Devotions</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold">{prayers.map(p => `${p.name}: ${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][p.dayOfWeek]} ${p.time}`).join("; ")}</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {seasonalNote && (
            <div className="px-4 py-2.5 bg-muted/20 border-t border-border/40">
              <p className="text-xs text-muted-foreground">*{sunMasses.find(m => m.seasonal)?.time || "12:30 PM"} Mass: {seasonalNote}. Holy Days announced in bulletin.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
