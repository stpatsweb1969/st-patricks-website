import { eq, desc, and, sql } from "drizzle-orm";
import { galleryPhotos } from "../../drizzle/schema";
import type { InsertGalleryPhoto } from "../../drizzle/schema";
import { getDb } from "./_connection";

// ===== GALLERY PHOTOS =====

export async function getPublishedGalleryPhotos(album?: string) {
  const db = await getDb();
  if (album) {
    return db!.select().from(galleryPhotos)
      .where(and(eq(galleryPhotos.published, true), eq(galleryPhotos.album, album)))
      .orderBy(desc(galleryPhotos.createdAt));
  }
  return db!.select().from(galleryPhotos)
    .where(eq(galleryPhotos.published, true))
    .orderBy(desc(galleryPhotos.createdAt));
}

export async function getAllGalleryPhotos() {
  const db = await getDb();
  return db!.select().from(galleryPhotos).orderBy(desc(galleryPhotos.createdAt));
}

export async function createGalleryPhoto(data: InsertGalleryPhoto) {
  const db = await getDb();
  await db!.insert(galleryPhotos).values(data);
}

export async function updateGalleryPhoto(id: number, data: Partial<Pick<InsertGalleryPhoto, "title" | "caption" | "album" | "sortOrder" | "published">>) {
  const db = await getDb();
  await db!.update(galleryPhotos).set(data).where(eq(galleryPhotos.id, id));
}

export async function deleteGalleryPhoto(id: number) {
  const db = await getDb();
  await db!.delete(galleryPhotos).where(eq(galleryPhotos.id, id));
}

export async function getGalleryAlbums() {
  const db = await getDb();
  const results = await db!.select({ album: galleryPhotos.album, count: sql<number>`count(*)` })
    .from(galleryPhotos)
    .where(eq(galleryPhotos.published, true))
    .groupBy(galleryPhotos.album);
  return results.filter(r => r.album).map(r => ({ album: r.album as string, count: r.count }));
}
