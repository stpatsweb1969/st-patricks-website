/**
 * Weather Service — Barrel Export
 * Re-exports all public types and functions from the weather module.
 */

// Types
export type { HourlyForecast, EventWeather, CurrentWeather, DailyForecast } from "./types";
export { ARMONK_LAT, ARMONK_LON, FORECAST_DAYS } from "./types";

// Helpers (exported for potential reuse)
export { getWeatherInfo, parseOpenMeteoLocalTime } from "./helpers";

// Current weather
export { getCurrentWeather } from "./current";

// Daily forecast
export { getDailyForecast } from "./daily";

// Hourly forecast & event enrichment
export {
  fetchForecast,
  getWeatherForEvent,
  getWeatherForEvents,
  isOutdoorEvent,
  isHighAttendanceEvent,
  getParkingAdvisory,
} from "./forecast";
