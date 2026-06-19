/**
 * Homilies Router — public list + admin CRUD for homily archive.
 */
import { z } from "zod";
import { publicProcedure, protectedProcedure } from "./_helpers";
import { router } from "../_core/trpc";
import * as db from "../db";
import { storagePut } from "../storage";

export const homiliesRouter = router({
  list: publicProcedure.query(async () => {
    return db.getPublishedHomilies();
  }),

  listAll: protectedProcedure.query(async () => {
    return db.getAllHomilies();
  }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      date: z.string(), // ISO date string
      celebrant: z.string().optional(),
      topic: z.string().optional(),
      audioBase64: z.string().optional(),
      audioFilename: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      let audioUrl: string | undefined;
      let audioKey: string | undefined;

      if (input.audioBase64 && input.audioFilename) {
        const buffer = Buffer.from(input.audioBase64, "base64");
        const sanitizedName = input.audioFilename.replace(/[^a-zA-Z0-9._-]/g, "_");
        const key = `homilies/${Date.now()}-${sanitizedName}`;
        const result = await storagePut(key, buffer, "audio/mpeg");
        audioUrl = result.url;
        audioKey = result.key;
      }

      const id = await db.createHomily({
        title: input.title,
        date: new Date(input.date),
        celebrant: input.celebrant,
        topic: input.topic,
        audioUrl,
        audioKey,
        notes: input.notes,
      });
      return { id };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      date: z.string().optional(),
      celebrant: z.string().nullable().optional(),
      topic: z.string().nullable().optional(),
      notes: z.string().nullable().optional(),
      published: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, date, ...rest } = input;
      await db.updateHomily(id, {
        ...rest,
        ...(date ? { date: new Date(date) } : {}),
      });
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteHomily(input.id);
      return { success: true };
    }),
});
