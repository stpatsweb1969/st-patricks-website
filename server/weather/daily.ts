/**
 * Daily Forecast — 7-day high/low, precipitation, sunrise/sunset
 * Cached for 60 minutes with in-flight deduplication.
 */

import type { DailyForecast } from "./types";
import { ARMONK_LAT, ARMONK_LON, FORECAST_DAYS } from "./types";
import { fetchWithTimeout, parseOpenMeteoLocalTime, getWeatherInfo } from "./helpers";

// Daily forecast cache (60 min TTL)
let dailyForecastCache: { data: DailyForecast[]; fetchedAt: number } | null = null;
const DAILY_CACHE_TTL = 60 * 60 * 1000;
let dailyForecastInflight: Promise<DailyForecast[]> | null = null;

/**
 * Fetch 7-day daily forecast: high/low temps, precipitation probability, sunrise/sunset.
 * Cached for 60 minutes. Includes in-flight deduplication.
 */
export async function getDailyForecast(): Promise<DailyForecast[]> {
  if (dailyForecastCache && Date.now() - dailyForecastCache.fetchedAt < DAILY_CACHE_TTL) {
    return dailyForecastCache.data;
  }
  // Deduplicate concurrent requests
  if (dailyForecastInflight) return dailyForecastInflight;

  dailyForecastInflight = (async () => {
    try {
      const url = new URL("https://api.open-meteo.com/v1/forecast");
      url.searchParams.set("latitude", ARMONK_LAT.toString());
      url.searchParams.set("longitude", ARMONK_LON.toString());
      url.searchParams.set("daily", [
        "temperature_2m_max",
        "temperature_2m_min",
        "precipitation_probability_max",
        "weather_code",
        "sunrise",
        "sunset",
      ].join(","));
      url.searchParams.set("temperature_unit", "fahrenheit");
      url.searchParams.set("timezone", "America/New_York");
      url.searchParams.set("forecast_days", FORECAST_DAYS.toString());

      const response = await fetchWithTimeout(url.toString());
      if (!response.ok) {
        console.error(`Open-Meteo daily API error: ${response.status}`);
        return dailyForecastCache?.data || [];
      }

      let data: any;
      try {
        data = await response.json();
      } catch {
        console.error("Open-Meteo daily forecast: failed to parse JSON response");
        return dailyForecastCache?.data || [];
      }

      // Validate response shape
      if (!data?.daily?.time || !Array.isArray(data.daily.time)) {
        console.error("Open-Meteo daily forecast: unexpected response shape");
        return dailyForecastCache?.data || [];
      }

      const daily = data.daily;
      const forecasts: DailyForecast[] = daily.time.map((date: string, i: number) => {
        const weatherCode = daily.weather_code?.[i] ?? 0;
        const weatherInfo = getWeatherInfo(weatherCode);
        return {
          date,
          high: Math.round(daily.temperature_2m_max[i]),
          low: Math.round(daily.temperature_2m_min[i]),
          precipProbabilityMax: daily.precipitation_probability_max[i] || 0,
          weatherCode,
          icon: weatherInfo.icon,
          description: weatherInfo.description,
          sunrise: parseOpenMeteoLocalTime(daily.sunrise[i]),
          sunset: parseOpenMeteoLocalTime(daily.sunset[i]),
        };
      });

      dailyForecastCache = { data: forecasts, fetchedAt: Date.now() };
      return forecasts;
    } catch (error) {
      console.error("Daily forecast fetch error:", error);
      return dailyForecastCache?.data || [];
    } finally {
      dailyForecastInflight = null;
    }
  })();

  return dailyForecastInflight;
}
