/**
 * Hourly Forecast & Event Weather Enrichment
 * Provides weather data for specific events and batch enrichment.
 */

import type { HourlyForecast, EventWeather } from "./types";
import { ARMONK_LAT, ARMONK_LON, FORECAST_DAYS, MAX_FORECAST_HOUR_GAP_MS } from "./types";
import { fetchWithTimeout, getWeatherInfo } from "./helpers";

// In-memory cache (60 min TTL) for hourly forecast
let weatherCache: { hourly: HourlyForecast[]; fetchedAt: number } | null = null;
const CACHE_TTL = 60 * 60 * 1000;

// In-flight promise deduplication to prevent cache stampede
let forecastInflight: Promise<HourlyForecast[]> | null = null;

/**
 * Fetch 7-day hourly forecast from Open-Meteo for Armonk, NY.
 * Includes in-flight deduplication to prevent cache stampede.
 */
export async function fetchForecast(): Promise<HourlyForecast[]> {
  if (weatherCache && Date.now() - weatherCache.fetchedAt < CACHE_TTL) {
    return weatherCache.hourly;
  }
  // Deduplicate concurrent requests
  if (forecastInflight) return forecastInflight;

  forecastInflight = (async () => {
    try {
      const url = new URL("https://api.open-meteo.com/v1/forecast");
      url.searchParams.set("latitude", ARMONK_LAT.toString());
      url.searchParams.set("longitude", ARMONK_LON.toString());
      url.searchParams.set("hourly", [
        "temperature_2m",
        "apparent_temperature",
        "precipitation_probability",
        "precipitation",
        "weather_code",
        "cloud_cover",
        "wind_speed_10m",
        "is_day",
      ].join(","));
      url.searchParams.set("temperature_unit", "fahrenheit");
      url.searchParams.set("wind_speed_unit", "mph");
      url.searchParams.set("precipitation_unit", "inch");
      url.searchParams.set("timezone", "America/New_York");
      url.searchParams.set("forecast_days", FORECAST_DAYS.toString());

      const response = await fetchWithTimeout(url.toString());
      if (!response.ok) {
        console.error(`Open-Meteo API error: ${response.status}`);
        return weatherCache?.hourly || [];
      }

      let data: any;
      try {
        data = await response.json();
      } catch {
        console.error("Open-Meteo hourly forecast: failed to parse JSON response");
        return weatherCache?.hourly || [];
      }

      // Validate response shape
      if (!data?.hourly?.time || !Array.isArray(data.hourly.time)) {
        console.error("Open-Meteo hourly forecast: unexpected response shape");
        return weatherCache?.hourly || [];
      }

      const hourly = data.hourly;

      // Pre-compute timestamps for O(1) lookups later
      const forecasts: HourlyForecast[] = hourly.time.map((time: string, i: number) => ({
        time,
        timestamp: new Date(time).getTime(),
        temperature: Math.round(hourly.temperature_2m[i]),
        apparentTemperature: Math.round(hourly.apparent_temperature[i]),
        precipitationProbability: hourly.precipitation_probability[i] || 0,
        precipitation: hourly.precipitation[i] || 0,
        weatherCode: hourly.weather_code[i] || 0,
        cloudCover: hourly.cloud_cover[i] || 0,
        windSpeed: Math.round(hourly.wind_speed_10m[i] || 0),
        isDay: hourly.is_day[i] === 1,
      }));

      weatherCache = { hourly: forecasts, fetchedAt: Date.now() };
      return forecasts;
    } catch (error) {
      console.error("Weather fetch error:", error);
      return weatherCache?.hourly || [];
    } finally {
      forecastInflight = null;
    }
  })();

  return forecastInflight;
}

/**
 * Get weather for a specific event time. Returns null if > 7 days away.
 */
export async function getWeatherForEvent(eventStartISO: string): Promise<EventWeather | null> {
  const eventDate = new Date(eventStartISO);
  const now = new Date();
  const daysAway = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (daysAway > 7 || daysAway < -1) return null; // Allow today's events even if start time is past

  const forecasts = await fetchForecast();
  if (forecasts.length === 0) return null;

  // Find closest forecast hour to event start using pre-computed timestamps
  const eventTime = eventDate.getTime();
  let closest = forecasts[0];
  let closestDiff = Math.abs(closest.timestamp - eventTime);

  for (const f of forecasts) {
    const diff = Math.abs(f.timestamp - eventTime);
    if (diff < closestDiff) {
      closest = f;
      closestDiff = diff;
    }
  }

  // If closest is more than 6 hours away, skip (relaxed for daily schedule views)
  if (closestDiff > MAX_FORECAST_HOUR_GAP_MS) return null;

  const weatherInfo = getWeatherInfo(closest.weatherCode);

  // Build 3-slot forecast strip around event time
  const stripForecasts = forecasts.filter(f => {
    return f.timestamp >= eventTime - 2 * 60 * 60 * 1000 &&
           f.timestamp <= eventTime + 4 * 60 * 60 * 1000;
  }).slice(0, 4);

  const forecastStrip = stripForecasts.map(f => {
    // Parse hour directly from the time string to avoid timezone issues
    const [, timePart] = f.time.split("T");
    const hour = parseInt(timePart?.split(":")[0] || "0", 10);
    let label = "Night";
    if (hour >= 5 && hour < 12) label = "Morning";
    else if (hour >= 12 && hour < 17) label = "Afternoon";
    else if (hour >= 17 && hour < 21) label = "Evening";
    return {
      time: f.time,
      label,
      temperature: f.temperature,
      precipProbability: f.precipitationProbability,
      weatherCode: f.weatherCode,
      icon: getWeatherInfo(f.weatherCode).icon,
    };
  });

  return {
    temperature: closest.temperature,
    feelsLike: closest.apparentTemperature,
    precipProbability: closest.precipitationProbability,
    precipAmount: closest.precipitation,
    weatherCode: closest.weatherCode,
    description: weatherInfo.description,
    icon: weatherInfo.icon,
    windSpeed: closest.windSpeed,
    isDay: closest.isDay,
    isRainWarning: closest.precipitationProbability > 40,
    isSevereWarning: closest.precipitationProbability > 70 ||
                     closest.temperature < 20 ||
                     closest.temperature > 100 ||
                     closest.windSpeed > 40,
    forecastStrip,
  };
}

/**
 * Detect outdoor events from title/description/location heuristics.
 * Note: broad keyword matching — intentionally permissive for a small parish site.
 */
export function isOutdoorEvent(event: { title: string; description?: string; location?: string }): boolean {
  const text = `${event.title} ${event.description || ""} ${event.location || ""}`.toLowerCase();
  const keywords = [
    "outdoor", "outside", "procession", "picnic", "bbq", "barbecue",
    "garden", "park", "field", "lawn", "parking lot", "walk", "hike",
    "blessing of", "stations of the cross", "living rosary",
    "corpus christi procession", "palm sunday procession",
    "easter egg hunt", "trunk or treat", "carnival", "fair",
    "sports", "soccer", "baseball", "softball", "track",
  ];
  return keywords.some(kw => text.includes(kw));
}

/**
 * Detect high-attendance events
 */
export function isHighAttendanceEvent(event: { title: string; description?: string }): boolean {
  const text = `${event.title} ${event.description || ""}`.toLowerCase();
  const keywords = [
    "easter", "christmas", "midnight mass", "christmas eve",
    "palm sunday", "ash wednesday", "holy thursday", "good friday",
    "easter vigil", "first communion", "confirmation mass",
    "parish picnic", "parish bbq", "parish carnival",
  ];
  return keywords.some(kw => text.includes(kw));
}

/**
 * Get parking advisory for high-attendance events
 */
export function getParkingAdvisory(event: { title: string }): string | null {
  const title = event.title.toLowerCase();
  if (title.includes("christmas eve") || title.includes("midnight mass")) {
    return "Expect full lots by 11:00 PM — carpooling recommended. Overflow at Town Hall lot on Bedford Rd.";
  }
  if (title.includes("easter") || title.includes("palm sunday")) {
    return "Expect full lots 15 min before Mass — arrive early. Overflow at Town Hall lot on Bedford Rd.";
  }
  if (title.includes("first communion") || title.includes("confirmation")) {
    return "Limited parking due to large families. Consider carpooling with other parish families.";
  }
  if (title.includes("parish picnic") || title.includes("parish bbq")) {
    return "Street parking on Cox Ave and Maple Ave. Please be mindful of neighbors.";
  }
  return null;
}

/**
 * Batch weather enrichment for events within 7 days.
 * Returns a map of event ID → enrichment data.
 * Pre-warms the forecast cache and uses Promise.all for parallel processing.
 */
export async function getWeatherForEvents(
  events: Array<{ id: string; title: string; description?: string; location?: string; startDate: string }>
): Promise<Record<string, { weather: EventWeather | null; isOutdoor: boolean; isHighAttendance: boolean; parkingAdvisory: string | null }>> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysOut = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Filter events that are within the forecast window
  const eventsToEnrich = events.filter(event => {
    const eventDate = new Date(event.startDate);
    return eventDate <= sevenDaysOut && eventDate >= todayStart;
  });

  if (eventsToEnrich.length === 0) return {};

  // Pre-warm the forecast cache once before processing all events
  await fetchForecast();

  // Process all events in parallel (cache is warm, so these are synchronous lookups)
  const entries = await Promise.all(
    eventsToEnrich.map(async (event) => {
      const outdoor = isOutdoorEvent(event);
      const highAttendance = isHighAttendanceEvent(event);
      const weather = await getWeatherForEvent(event.startDate);
      const parkingAdvisory = highAttendance ? getParkingAdvisory(event) : null;
      return [event.id, { weather, isOutdoor: outdoor, isHighAttendance: highAttendance, parkingAdvisory }] as const;
    })
  );

  return Object.fromEntries(entries);
}
