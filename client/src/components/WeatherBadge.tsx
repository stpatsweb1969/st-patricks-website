/**
 * WeatherBadge — Contextual weather display for upcoming events.
 * Shows temperature, condition, and precipitation probability.
 * Uses colorful multi-color SVG icons for a polished look.
 */
import { ColorfulWeatherIcon, DropletIcon, WindIcon } from "@/components/WeatherIcons";

interface WeatherData {
  temperature: number;
  feelsLike: number;
  precipProbability: number;
  precipAmount: number;
  weatherCode: number;
  description: string;
  icon: string;
  windSpeed: number;
  isDay: boolean;
  isRainWarning: boolean;
  isSevereWarning: boolean;
  forecastStrip: Array<{
    time: string;
    label: string;
    temperature: number;
    precipProbability: number;
    weatherCode: number;
    icon: string;
  }>;
}

export function WeatherBadge({
  weather,
  compact = false,
}: {
  weather: WeatherData;
  compact?: boolean;
}) {
  const { temperature, description, icon, precipProbability, isRainWarning, isSevereWarning } = weather;

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
          isSevereWarning
            ? "weather-badge-severe"
            : isRainWarning
            ? "weather-badge-rain"
            : "weather-badge-clear"
        }`}
      >
        <ColorfulWeatherIcon icon={icon} className="w-3.5 h-3.5" />
        <span>{temperature}°F</span>
        {precipProbability > 20 && (
          <span className="flex items-center gap-0.5">
            <DropletIcon className="w-2.5 h-2.5" />
            {precipProbability}%
          </span>
        )}
      </span>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border transition-all ${
        isSevereWarning
          ? "weather-badge-severe"
          : isRainWarning
          ? "weather-badge-rain"
          : "weather-badge-clear"
      }`}
    >
      <ColorfulWeatherIcon icon={icon} className="w-5 h-5 shrink-0" />
      <span className="font-semibold">{temperature}°F</span>
      <span className="text-xs opacity-75">·</span>
      <span className="text-xs">{description}</span>
      {precipProbability > 20 && (
        <>
          <span className="text-xs opacity-75">·</span>
          <span className="flex items-center gap-0.5 text-xs">
            <DropletIcon className="w-3 h-3" />
            {precipProbability}% rain
          </span>
        </>
      )}
      {weather.windSpeed > 15 && (
        <>
          <span className="text-xs opacity-75">·</span>
          <span className="flex items-center gap-0.5 text-xs">
            <WindIcon className="w-3.5 h-3.5" />
            {weather.windSpeed} mph
          </span>
        </>
      )}
    </div>
  );
}

export function WeatherForecastStrip({ weather }: { weather: WeatherData }) {
  if (!weather.forecastStrip || weather.forecastStrip.length === 0) return null;

  return (
    <div className="flex gap-1 mt-2">
      {weather.forecastStrip.map((slot, i) => (
        <div
          key={i}
          className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-md text-xs ${
            slot.precipProbability > 40
              ? "weather-strip-rain"
              : "bg-muted/50"
          }`}
        >
          <span className="text-xs text-muted-foreground font-medium">{slot.label}</span>
          <ColorfulWeatherIcon icon={slot.icon} className="w-4 h-4" />
          <span className="font-semibold">{slot.temperature}°</span>
          {slot.precipProbability > 20 && (
            <span className="text-xs weather-strip-rain-text flex items-center gap-0.5">
              <DropletIcon className="w-2 h-2" />
              {slot.precipProbability}%
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export function ParkingAdvisory({ advisory }: { advisory: string }) {
  return (
    <div className="flex items-start gap-2 px-3 py-2 rounded-lg weather-parking-advisory text-xs">
      <span className="text-base shrink-0 mt-[-1px]">🚗</span>
      <span>{advisory}</span>
    </div>
  );
}
