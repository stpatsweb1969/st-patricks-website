/**
 * CYO Basketball Router — teams and games management.
 * ~90 lines
 */
import { publicProcedure, router, z, db, sectionProcedure } from "./_helpers";
const cyoSection = sectionProcedure("cyo");

export const cyoRouter = router({
  // Teams
  listTeams: publicProcedure.input(z.object({
    season: z.string().optional(),
  }).optional()).query(async ({ input }) => {
    return db.getCyoTeams(input?.season);
  }),
  createTeam: cyoSection.input(z.object({
    name: z.string().min(1),
    division: z.string().min(1),
    ageGroup: z.string().min(1),
    season: z.string().min(1),
    coachName: z.string().optional(),
    coachEmail: z.string().optional(),
    coachPhone: z.string().optional(),
  })).mutation(async ({ input }) => {
    const id = await db.createCyoTeam({
      ...input,
      coachName: input.coachName ?? null,
      coachEmail: input.coachEmail ?? null,
      coachPhone: input.coachPhone ?? null,
    });
    return { success: true, id };
  }),
  updateTeam: cyoSection.input(z.object({
    id: z.number(),
    name: z.string().optional(),
    division: z.string().optional(),
    ageGroup: z.string().optional(),
    coachName: z.string().optional(),
    coachEmail: z.string().optional(),
    coachPhone: z.string().optional(),
    wins: z.number().optional(),
    losses: z.number().optional(),
  })).mutation(async ({ input }) => {
    const { id, ...data } = input;
    await db.updateCyoTeam(id, data as any);
    return { success: true };
  }),
  deleteTeam: cyoSection.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await db.deleteCyoTeam(input.id);
    return { success: true };
  }),
  // Games
  listGames: publicProcedure.input(z.object({
    teamId: z.number().optional(),
  }).optional()).query(async ({ input }) => {
    return db.getCyoGames(input?.teamId);
  }),
  createGame: cyoSection.input(z.object({
    teamId: z.number(),
    opponent: z.string().min(1),
    gameDate: z.string(),
    location: z.string().min(1),
    homeAway: z.enum(["home", "away"]),
    notes: z.string().optional(),
  })).mutation(async ({ input }) => {
    const id = await db.createCyoGame({
      ...input,
      gameDate: new Date(input.gameDate),
      notes: input.notes ?? null,
    });
    return { success: true, id };
  }),
  updateGame: cyoSection.input(z.object({
    id: z.number(),
    opponent: z.string().optional(),
    gameDate: z.string().optional(),
    location: z.string().optional(),
    homeAway: z.enum(["home", "away"]).optional(),
    ourScore: z.number().optional(),
    theirScore: z.number().optional(),
    status: z.enum(["scheduled", "completed", "cancelled", "postponed"]).optional(),
    notes: z.string().optional(),
  })).mutation(async ({ input }) => {
    const { id, gameDate, ...rest } = input;
    const data: any = { ...rest };
    if (gameDate) data.gameDate = new Date(gameDate);
    await db.updateCyoGame(id, data);
    return { success: true };
  }),
  deleteGame: cyoSection.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await db.deleteCyoGame(input.id);
    return { success: true };
  }),
});
