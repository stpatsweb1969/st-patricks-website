/**
 * Weather Router — current conditions, daily forecast, and event weather.
 * ~35 lines
 */
import { publicProcedure, router, z } from "./_helpers";

export const weatherRouter = router({
  forEvents: publicProcedure
    .input(z.object({
      events: z.array(z.object({
        id: z.string(),
        title: z.string(),
        description: z.string().optional(),
        location: z.string().optional(),
        startDate: z.string(),
      })),
    }))
    .query(async ({ input }) => {
      const { getWeatherForEvents } = await import("../weather");
      return getWeatherForEvents(input.events);
    }),
  current: publicProcedure.query(async () => {
    const { getCurrentWeather } = await import("../weather");
    return getCurrentWeather();
  }),
  daily: publicProcedure.query(async () => {
    const { getDailyForecast } = await import("../weather");
    return getDailyForecast();
  }),
});
