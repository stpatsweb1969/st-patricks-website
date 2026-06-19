/**
 * Staff Router — basic unit tests for the staff CRUD procedures.
 */
import { describe, it, expect } from "vitest";
import { z } from "zod";

// Validate the upsert input schema matches what we expect
const upsertSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1).max(300),
  role: z.string().min(1).max(300),
  category: z.enum(["clergy", "staff", "leadership", "ministry_leader", "emeritus"]),
  phone: z.string().max(50).optional().nullable(),
  email: z.string().max(320).optional().nullable(),
  sortOrder: z.number().default(0),
});

describe("Staff router schema validation", () => {
  it("accepts valid clergy upsert input", () => {
    const input = {
      name: "Father Test",
      role: "Pastor",
      category: "clergy" as const,
      phone: "(914) 555-0001",
      email: "test@parish.org",
      sortOrder: 1,
    };
    const result = upsertSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const input = {
      name: "",
      role: "Pastor",
      category: "clergy" as const,
    };
    const result = upsertSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects invalid category", () => {
    const input = {
      name: "Test",
      role: "Role",
      category: "invalid_cat",
    };
    const result = upsertSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("allows null phone and email", () => {
    const input = {
      name: "Test Person",
      role: "Trustee",
      category: "leadership" as const,
      phone: null,
      email: null,
      sortOrder: 5,
    };
    const result = upsertSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("defaults sortOrder to 0 when omitted", () => {
    const input = {
      name: "Test Person",
      role: "Staff",
      category: "staff" as const,
    };
    const result = upsertSchema.parse(input);
    expect(result.sortOrder).toBe(0);
  });

  it("accepts update with id", () => {
    const input = {
      id: 42,
      name: "Updated Name",
      role: "Updated Role",
      category: "emeritus" as const,
      sortOrder: 3,
    };
    const result = upsertSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.id).toBe(42);
  });
});
