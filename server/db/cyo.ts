import { eq, desc } from "drizzle-orm";
import { cyoTeams, cyoGames } from "../../drizzle/schema";
import type { InsertCyoTeam, InsertCyoGame } from "../../drizzle/schema";
import { getDb } from "./_connection";

// ===== CYO BASKETBALL HELPERS =====

export async function createCyoTeam(data: InsertCyoTeam) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(cyoTeams).values(data);
  return result[0].insertId;
}

export async function getCyoTeams(season?: string) {
  const db = await getDb();
  if (!db) return [];
  if (season) {
    return db.select().from(cyoTeams).where(eq(cyoTeams.season, season)).orderBy(cyoTeams.name);
  }
  return db.select().from(cyoTeams).orderBy(desc(cyoTeams.createdAt));
}

export async function updateCyoTeam(id: number, data: Partial<InsertCyoTeam>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(cyoTeams).set(data).where(eq(cyoTeams.id, id));
}

export async function deleteCyoTeam(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(cyoGames).where(eq(cyoGames.teamId, id));
  await db.delete(cyoTeams).where(eq(cyoTeams.id, id));
}

export async function createCyoGame(data: InsertCyoGame) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(cyoGames).values(data);
  return result[0].insertId;
}

export async function getCyoGames(teamId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (teamId) {
    return db.select().from(cyoGames).where(eq(cyoGames.teamId, teamId)).orderBy(cyoGames.gameDate);
  }
  return db.select().from(cyoGames).orderBy(cyoGames.gameDate);
}

export async function updateCyoGame(id: number, data: Partial<InsertCyoGame>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(cyoGames).set(data).where(eq(cyoGames.id, id));
}

export async function deleteCyoGame(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(cyoGames).where(eq(cyoGames.id, id));
}
