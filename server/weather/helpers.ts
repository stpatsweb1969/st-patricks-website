/**
 * Weather Service Helpers
 * Shared utility functions for weather modules.
 */

import { FETCH_TIMEOUT_MS } from "./types";

// WMO Weather Code mapping
const WMO_CODES: Record<number, { description: string; icon: string }> = {
  0: { description: "Clear sky", icon: "clear" },
  1: { description: "Mainly clear", icon: "mostly-clear" },
  2: { description: "Partly cloudy", icon: "partly-cloudy" },
  3: { description: "Overcast", icon: "overcast" },
  45: { description: "Foggy", icon: "fog" },
  48: { description: "Rime fog", icon: "fog" },
  51: { description: "Light drizzle", icon: "drizzle" },
  53: { description: "Moderate drizzle", icon: "drizzle" },
  55: { description: "Dense drizzle", icon: "rain" },
  56: { description: "Freezing drizzle", icon: "rain" },
  57: { description: "Dense freezing drizzle", icon: "rain" },
  61: { description: "Slight rain", icon: "light-rain" },
  63: { description: "Moderate rain", icon: "rain" },
  65: { description: "Heavy rain", icon: "heavy-rain" },
  66: { description: "Freezing rain", icon: "rain" },
  67: { description: "Heavy freezing rain", icon: "heavy-rain" },
  71: { description: "Slight snow", icon: "light-snow" },
  73: { description: "Moderate snow", icon: "snow" },
  75: { description: "Heavy snow", icon: "heavy-snow" },
  77: { description: "Snow grains", icon: "snow" },
  80: { description: "Light showers", icon: "light-rain" },
  81: { description: "Moderate showers", icon: "rain" },
  82: { description: "Violent showers", icon: "heavy-rain" },
  85: { description: "Light snow showers", icon: "light-snow" },
  86: { description: "Heavy snow showers", icon: "heavy-snow" },
  95: { description: "Thunderstorm", icon: "thunderstorm" },
  96: { description: "Thunderstorm with hail", icon: "thunderstorm" },
  99: { description: "Severe thunderstorm", icon: "thunderstorm" },
};

export function getWeatherInfo(code: number): { description: string; icon: string } {
  // Use "partly-cloudy" as neutral fallback instead of misleading "clear"
  return WMO_CODES[code] ?? { description: "Unknown", icon: "partly-cloudy" };
}

/**
 * Parse Open-Meteo local time strings (e.g. "2026-06-17T05:21") directly
 * without going through new Date() which would apply server timezone.
 * Open-Meteo returns times in the requested timezone (America/New_York).
 */
export function parseOpenMeteoLocalTime(isoTime: string): string {
  const [, timePart] = isoTime.split("T");
  if (!timePart) return isoTime;
  const [hourStr, minuteStr] = timePart.split(":");
  const hours = parseInt(hourStr, 10);
  const minutes = parseInt(minuteStr, 10);
  const ampm = hours >= 12 ? "PM" : "AM";
  const h = hours % 12 || 12;
  return minutes === 0
    ? `${h} ${ampm}`
    : `${h}:${minutes.toString().padStart(2, "0")} ${ampm}`;
}

/**
 * Create a fetch request with a timeout to prevent hanging if Open-Meteo is unresponsive.
 */
export async function fetchWithTimeout(url: string, timeoutMs: number = FETCH_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}
