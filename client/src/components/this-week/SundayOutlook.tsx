/**
 * SundayOutlook — Shows weather forecast for the upcoming Sunday Masses.
 * Helps parishioners plan their Sunday (dress for weather, bring umbrella, etc.)
 * Appears in the This Week section when Sunday is within the 7-day forecast.
 */
import { useMemo } from "react";
import { ColorfulWeatherIcon, DropletIcon } from "@/components/WeatherIcons";
import { Sun, Umbrella, Snowflake, Wind } from "lucide-react";

interface DailyForecast {
  date: string;
  high: number;
  low: number;
  precipProbabilityMax: number;
  weatherCode: number;
  icon: string;
  description: string;
  sunrise: string;
  sunset: string;
}

interface SundayOutlookProps {
  dailyForecast: DailyForecast[] | undefined;
}

export function SundayOutlook({ dailyForecast }: SundayOutlookProps) {
  const sundayForecast = useMemo(() => {
    if (!dailyForecast || dailyForecast.length === 0) return null;

    // Find the next Sunday in the forecast
    const today = new Date();
    const todayDow = today.getDay();

    // If today is Sunday, show today's forecast
    // Otherwise find the next Sunday
    let daysUntilSunday = todayDow === 0 ? 0 : 7 - todayDow;

    if (daysUntilSunday >= dailyForecast.length) return null;

    return {
      forecast: dailyForecast[daysUntilSunday],
      isToday: daysUntilSunday === 0,
      daysAway: daysUntilSunday,
    };
  }, [dailyForecast]);

  if (!sundayForecast) return null;

  const { forecast, isToday } = sundayForecast;
  const isRainy = forecast.precipProbabilityMax >= 50;
  const isSnowy = forecast.weatherCode >= 71 && forecast.weatherCode <= 77;
  const isWindy = forecast.weatherCode >= 51 && forecast.weatherCode <= 55;

  // Determine advice
  let advice = "";
  let adviceIcon = <Sun className="w-3 h-3" />;
  if (isSnowy) {
    advice = "Snow expected — allow extra travel time";
    adviceIcon = <Snowflake className="w-3 h-3" />;
  } else if (isRainy) {
    advice = "Bring an umbrella to Mass";
    adviceIcon = <Umbrella className="w-3 h-3" />;
  } else if (forecast.high >= 90) {
    advice = "Hot day — dress cool, stay hydrated";
    adviceIcon = <Sun className="w-3 h-3" />;
  } else if (forecast.low <= 32) {
    advice = "Bundle up — freezing temperatures";
    adviceIcon = <Wind className="w-3 h-3" />;
  } else {
    advice = "Pleasant weather for Mass";
    adviceIcon = <Sun className="w-3 h-3" />;
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[var(--season-accent-light)] border border-[var(--season-badge-border)]">
      <ColorfulWeatherIcon icon={forecast.icon} className="w-8 h-8 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-[var(--season-badge-text)] uppercase tracking-wider">
          {isToday ? "Sunday Today" : "Sunday Outlook"}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-sm font-bold text-foreground">{forecast.high}°/{forecast.low}°</span>
          <span className="text-xs text-muted-foreground">{forecast.description}</span>
          {forecast.precipProbabilityMax > 20 && (
            <span className="inline-flex items-center gap-0.5 text-xs text-blue-600">
              <DropletIcon className="w-2.5 h-2.5" />
              {forecast.precipProbabilityMax}%
            </span>
          )}
        </div>
        <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
          {adviceIcon}
          {advice}
        </p>
      </div>
    </div>
  );
}
