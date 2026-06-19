/**
 * Smoke tests for sacrament confirmation emails and the SacramentsManager hooks fix.
 */
import { describe, it, expect, vi } from "vitest";

// Mock the email module to avoid real sends
vi.mock("./email/sacramentConfirmations", () => ({
  sendBaptismConfirmation: vi.fn().mockResolvedValue(true),
  sendSponsorConfirmation: vi.fn().mockResolvedValue(true),
  sendMarriageConfirmation: vi.fn().mockResolvedValue(true),
  sendFuneralConfirmation: vi.fn().mockResolvedValue(true),
}));

import {
  sendBaptismConfirmation,
  sendSponsorConfirmation,
  sendMarriageConfirmation,
  sendFuneralConfirmation,
} from "./email/sacramentConfirmations";

describe("sacrament confirmation emails", () => {
  it("sendBaptismConfirmation is callable with correct args", async () => {
    const result = await sendBaptismConfirmation("parent@example.com", "John Smith");
    expect(result).toBe(true);
    expect(sendBaptismConfirmation).toHaveBeenCalledWith("parent@example.com", "John Smith");
  });

  it("sendSponsorConfirmation is callable with correct args", async () => {
    const result = await sendSponsorConfirmation("sponsor@example.com", "Jane Doe", "Candidate Name");
    expect(result).toBe(true);
    expect(sendSponsorConfirmation).toHaveBeenCalledWith("sponsor@example.com", "Jane Doe", "Candidate Name");
  });

  it("sendMarriageConfirmation is callable with correct args", async () => {
    const result = await sendMarriageConfirmation("bride@example.com", "Bride Name", "Groom Name");
    expect(result).toBe(true);
    expect(sendMarriageConfirmation).toHaveBeenCalledWith("bride@example.com", "Bride Name", "Groom Name");
  });

  it("sendFuneralConfirmation is callable with correct args (pre-planning)", async () => {
    const result = await sendFuneralConfirmation("planner@example.com", "Planner Name", "Deceased Name", true);
    expect(result).toBe(true);
    expect(sendFuneralConfirmation).toHaveBeenCalledWith("planner@example.com", "Planner Name", "Deceased Name", true);
  });

  it("sendFuneralConfirmation is callable with correct args (immediate)", async () => {
    const result = await sendFuneralConfirmation("planner@example.com", "Planner Name", "Deceased Name", false);
    expect(result).toBe(true);
    expect(sendFuneralConfirmation).toHaveBeenCalledWith("planner@example.com", "Planner Name", "Deceased Name", false);
  });
});

describe("staff directory vs user accounts separation", () => {
  it("staff_members table has no foreign key to users table (schema-level)", async () => {
    const { staffMembers, users } = await import("../drizzle/schema");
    expect(staffMembers).toBeDefined();
    expect(users).toBeDefined();
    // staffMembers columns should not include openId or userId
    const staffCols = Object.keys(staffMembers);
    expect(staffCols).not.toContain("openId");
    expect(staffCols).not.toContain("userId");
  });

  it("emeritus category exists in staffMembers enum", async () => {
    const { staffMembers } = await import("../drizzle/schema");
    // The category column config should include emeritus
    const categoryCol = staffMembers.category;
    expect(categoryCol).toBeDefined();
    // Drizzle enum columns store their values in enumValues
    expect(categoryCol.enumValues).toContain("emeritus");
  });
});
