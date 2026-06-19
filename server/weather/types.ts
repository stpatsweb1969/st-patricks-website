/**
 * Weather Service Types & Constants
 * Shared across all weather modules.
 */

// St. Patrick in Armonk coordinates
export const ARMONK_LAT = 41.1334;
export const ARMONK_LON = -73.7254;

// Named constants
export const FORECAST_DAYS = 7;
export const FETCH_TIMEOUT_MS = 5000; // 5 second timeout for API calls
export const MAX_FORECAST_HOUR_GAP_MS = 6 * 60 * 60 * 1000; // 6 hours

export interface HourlyForecast {
  time: string;
  timestamp: number; // Pre-computed for performance
  temperature: number; // Fahrenheit
  apparentTemperature: number; // Fahrenheit (feels like)
  precipitationProbability: number; // 0-100
  precipitation: number; // inches
  weatherCode: number; // WMO code
  cloudCover: number; // 0-100
  windSpeed: number; // mph
  isDay: boolean;
}

export interface EventWeather {
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

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  weatherCode: number;
  description: string;
  icon: string;
  windSpeed: number;
  isDay: boolean;
  humidity: number;
  sunrise: string; // e.g. "5:21 AM"
  sunset: string; // e.g. "8:29 PM"
}

export interface DailyForecast {
  date: string; // ISO date e.g. "2026-06-17"
  high: number;
  low: number;
  precipProbabilityMax: number;
  weatherCode: number; // WMO code
  icon: string; // e.g. "clear", "rain", "partly-cloudy"
  description: string; // e.g. "Clear sky", "Moderate rain"
  sunrise: string; // e.g. "5:21 AM"
  sunset: string; // e.g. "8:29 PM"
}
