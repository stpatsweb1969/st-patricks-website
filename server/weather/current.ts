/**
 * Current Weather — Real-time conditions from Open-Meteo
 * Uses the "current" endpoint parameter for live data.
 * Cached for 15 minutes with in-flight deduplication.
 */

import type { CurrentWeather } from "./types";
import { ARMONK_LAT, ARMONK_LON } from "./types";
import { fetchWithTimeout, getWeatherInfo, parseOpenMeteoLocalTime } from "./helpers";

// Current weather cache (15 min TTL) — real-time conditions
let currentWeatherCache: { data: CurrentWeather; fetchedAt: number } | null = null;
const CURRENT_CACHE_TTL = 15 * 60 * 1000; // 15 minutes
let currentWeatherInflight: Promise<CurrentWeather | null> | null = null;

/**
 * Fetch real-time current weather from Open-Meteo's current endpoint.
 * Also fetches today's sunrise/sunset. Uses a separate 15-minute cache.
 * Includes in-flight deduplication to prevent cache stampede.
 */
export async function getCurrentWeather(): Promise<CurrentWeather | null> {
  if (currentWeatherCache && Date.now() - currentWeatherCache.fetchedAt < CURRENT_CACHE_TTL) {
    return currentWeatherCache.data;
  }
  // Deduplicate concurrent requests
  if (currentWeatherInflight) return currentWeatherInflight;

  currentWeatherInflight = (async () => {
    try {
      const url = new URL("https://api.open-meteo.com/v1/forecast");
      url.searchParams.set("latitude", ARMONK_LAT.toString());
      url.searchParams.set("longitude", ARMONK_LON.toString());
      url.searchParams.set("current", [
        "temperature_2m",
        "apparent_temperature",
        "weather_code",
        "wind_speed_10m",
        "is_day",
        "relative_humidity_2m",
      ].join(","));
      url.searchParams.set("daily", "sunrise,sunset");
      url.searchParams.set("temperature_unit", "fahrenheit");
      url.searchParams.set("wind_speed_unit", "mph");
      url.searchParams.set("timezone", "America/New_York");
      url.searchParams.set("forecast_days", "1");

      const response = await fetchWithTimeout(url.toString());
      if (!response.ok) {
        console.error(`Open-Meteo current weather API error: ${response.status}`);
        return currentWeatherCache?.data || null;
      }

      let data: any;
      try {
        data = await response.json();
      } catch {
        console.error("Open-Meteo current weather: failed to parse JSON response");
        return currentWeatherCache?.data || null;
      }

      // Validate response shape
      if (!data?.current?.temperature_2m === undefined || !data?.daily?.sunrise) {
        console.error("Open-Meteo current weather: unexpected response shape");
        return currentWeatherCache?.data || null;
      }

      const current = data.current;
      const weatherInfo = getWeatherInfo(current.weather_code);
      const sunrise = data.daily?.sunrise?.[0] ? parseOpenMeteoLocalTime(data.daily.sunrise[0]) : "";
      const sunset = data.daily?.sunset?.[0] ? parseOpenMeteoLocalTime(data.daily.sunset[0]) : "";

      const result: CurrentWeather = {
        temperature: Math.round(current.temperature_2m),
        feelsLike: Math.round(current.apparent_temperature),
        weatherCode: current.weather_code,
        description: weatherInfo.description,
        icon: weatherInfo.icon,
        windSpeed: Math.round(current.wind_speed_10m || 0),
        isDay: current.is_day === 1,
        humidity: current.relative_humidity_2m || 0,
        sunrise,
        sunset,
      };

      currentWeatherCache = { data: result, fetchedAt: Date.now() };
      return result;
    } catch (error) {
      console.error("Current weather fetch error:", error);
      return currentWeatherCache?.data || null;
    } finally {
      currentWeatherInflight = null;
    }
  })();

  return currentWeatherInflight;
}
