/**
 * Gallery Router — photo albums and image management.
 * ~70 lines
 */
import { publicProcedure, router, z, db, nanoid, storagePut, sectionProcedure, TRPCError } from "./_helpers";
import { validateBase64File } from "../middleware";

export const galleryRouter = router({
  listPublished: publicProcedure
    .input(z.object({ album: z.string().optional() }).optional())
    .query(async ({ input }) => {
      return db.getPublishedGalleryPhotos(input?.album);
    }),
  listAll: sectionProcedure("gallery").query(async () => {
    return db.getAllGalleryPhotos();
  }),
  albums: publicProcedure.query(async () => {
    return db.getGalleryAlbums();
  }),
  uploadImage: sectionProcedure("gallery")
    .input(z.object({
      fileName: z.string(),
      fileData: z.string(),
      contentType: z.string(),
    }))
    .mutation(async ({ input }) => {
      const validation = validateBase64File(input.fileData, input.contentType);
      if (!validation.valid) {
        throw new TRPCError({ code: "BAD_REQUEST", message: validation.error || "Invalid file" });
      }
      const buffer = validation.buffer!;
      const safeFileName = input.fileName.replace(/[\s]+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
      const key = `gallery/${nanoid()}-${safeFileName}`;
      const { url } = await storagePut(key, buffer, validation.detectedMimeType || input.contentType);
      return { url, key };
    }),
  upload: sectionProcedure("gallery")
    .input(z.object({
      title: z.string().optional(),
      caption: z.string().optional(),
      album: z.string().optional(),
      imageUrl: z.string(),
      imageKey: z.string(),
    }))
    .mutation(async ({ input }) => {
      await db.createGalleryPhoto({
        title: input.title || null,
        caption: input.caption || null,
        album: input.album || null,
        imageUrl: input.imageUrl,
        imageKey: input.imageKey,
      });
      return { success: true };
    }),
  update: sectionProcedure("gallery")
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      caption: z.string().optional(),
      album: z.string().optional(),
      sortOrder: z.number().optional(),
      published: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateGalleryPhoto(id, data);
      return { success: true };
    }),
  delete: sectionProcedure("gallery")
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteGalleryPhoto(input.id);
      return { success: true };
    }),
});
