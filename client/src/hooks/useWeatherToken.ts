/**
 * useWeatherToken — Maps weather conditions to design-system token classes.
 * Uses CSS custom properties (--weather-*) defined in index.css.
 *
 * Usage:
 *   const cls = getWeatherTokenClass({ isSevere, isRain, precipProbability });
 *   <span className={cls.badge}>...</span>
 */

export interface WeatherCondition {
  isSevereWarning?: boolean;
  isRainWarning?: boolean;
  precipProbability?: number;
}

export interface WeatherTokenClasses {
  badge: string;      // Background + text for weather pill
  text: string;       // Text color only
  border: string;     // Border color only
  icon: string;       // Icon color
}

/**
 * Returns token-based CSS classes for a given weather condition.
 * Falls back to "clear" if no warning conditions are present.
 */
export function getWeatherTokenClass(condition: WeatherCondition): WeatherTokenClasses {
  if (condition.isSevereWarning) {
    return {
      badge: "bg-[var(--weather-severe)]/10 text-[var(--weather-severe)]",
      text: "text-[var(--weather-severe)]",
      border: "border-[var(--weather-severe)]/30",
      icon: "text-[var(--weather-severe)]",
    };
  }

  if (condition.isRainWarning || (condition.precipProbability && condition.precipProbability >= 60)) {
    return {
      badge: "bg-[var(--weather-rain)]/10 text-[var(--weather-rain)]",
      text: "text-[var(--weather-rain)]",
      border: "border-[var(--weather-rain)]/30",
      icon: "text-[var(--weather-rain)]",
    };
  }

  if (condition.precipProbability && condition.precipProbability >= 30) {
    return {
      badge: "bg-[var(--weather-cloudy)]/10 text-[var(--weather-cloudy)]",
      text: "text-[var(--weather-cloudy)]",
      border: "border-[var(--weather-cloudy)]/30",
      icon: "text-[var(--weather-cloudy)]",
    };
  }

  // Clear / default
  return {
    badge: "bg-[var(--weather-clear)]/10 text-[var(--weather-clear)]",
    text: "text-[var(--weather-clear)]",
    border: "border-[var(--weather-clear)]/30",
    icon: "text-[var(--weather-clear)]",
  };
}
