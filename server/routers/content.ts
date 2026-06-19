/**
 * Content Router — Catholic resources, daily readings, saint of the day, prayer wall.
 * ~80 lines
 */
import { publicProcedure, protectedProcedure, router, z, db } from "./_helpers";

export const catholicResourcesRouter = router({
  feed: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(10).default(3) }).optional())
    .query(async ({ input }) => {
      const { fetchAllFeeds } = await import("../catholicResources");
      return fetchAllFeeds(input?.limit ?? 3);
    }),
  vatican: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(10).default(3) }).optional())
    .query(async ({ input }) => {
      const { fetchVaticanNews } = await import("../catholicResources");
      return fetchVaticanNews(input?.limit ?? 3);
    }),
  goodNewsroom: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(10).default(3) }).optional())
    .query(async ({ input }) => {
      const { fetchGoodNewsroom } = await import("../catholicResources");
      return fetchGoodNewsroom(input?.limit ?? 3);
    }),
  usccb: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(10).default(3) }).optional())
    .query(async ({ input }) => {
      const { fetchUSCCBNews } = await import("../catholicResources");
      return fetchUSCCBNews(input?.limit ?? 3);
    }),
  archny: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(10).default(3) }).optional())
    .query(async ({ input }) => {
      const { fetchArchNY } = await import("../catholicResources");
      return fetchArchNY(input?.limit ?? 3);
    }),
  links: publicProcedure.query(async () => {
    const { CATHOLIC_RESOURCES } = await import("../catholicResources");
    return CATHOLIC_RESOURCES;
  }),
});

// Keep backward compat for vaticanNews
export const vaticanNewsRouter = router({
  latest: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(10).default(5) }).optional())
    .query(async ({ input }) => {
      const { fetchVaticanNews } = await import("../catholicResources");
      return fetchVaticanNews(input?.limit ?? 5);
    }),
});

export const dailyReadingsRouter = router({
  today: publicProcedure.query(async () => {
    const { getDailyReadings } = await import("../dailyReadings");
    return getDailyReadings();
  }),
  nextSunday: publicProcedure.query(async () => {
    const { getSundayReadings } = await import("../dailyReadings");
    return getSundayReadings();
  }),
});

export const saintOfDayRouter = router({
  today: publicProcedure.query(async () => {
    const { getSaintOfDay } = await import("../saintOfDay");
    return getSaintOfDay();
  }),
  /** Record a visit and return streak info (authenticated users only) */
  recordVisit: protectedProcedure.mutation(async ({ ctx }) => {
    return db.recordVisit(ctx.user.openId);
  }),
  /** Get current streak for the logged-in user */
  getStreak: protectedProcedure.query(async ({ ctx }) => {
    const streak = await db.getStreak(ctx.user.openId);
    if (!streak) return { currentStreak: 0, longestStreak: 0, totalVisits: 0 };
    return { currentStreak: streak.currentStreak, longestStreak: streak.longestStreak, totalVisits: streak.totalVisits };
  }),
});

export const prayerWallRouter = router({
  getIntentions: publicProcedure.query(async () => {
    const intentions = await db.getRecentPrayerIntentions(30);
    const count = await db.getPrayerIntentionCount();
    return { intentions, candlesThisWeek: count };
  }),
  lightCandle: publicProcedure
    .input(z.object({
      name: z.string().max(100).optional(),
      intention: z.string().min(1).max(300),
      isPublic: z.boolean().optional().default(true),
    }))
    .mutation(async ({ input }) => {
      const id = await db.createPrayerIntention({
        name: input.name || undefined,
        intention: input.intention,
        isPublic: input.isPublic,
      });
      return { success: true, id };
    }),

  /** Get prayer support counts for a list of intentions */
  getSupportCounts: publicProcedure
    .input(z.object({ intentionIds: z.array(z.number()) }))
    .query(async ({ input }) => {
      return db.getPrayerSupportCounts(input.intentionIds);
    }),

  /** "I prayed for this" — add prayer support */
  prayForThis: publicProcedure
    .input(z.object({
      intentionId: z.number(),
      name: z.string().max(100).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = (ctx as any).user?.id;
      await db.addPrayerSupport({
        intentionId: input.intentionId,
        userId: userId || null,
        name: input.name || null,
      });
      return { success: true };
    }),
});
