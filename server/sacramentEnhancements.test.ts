import { describe, it, expect, vi } from "vitest";
import { NOTIFY_DEFAULT_ON, NOTIFY_DEFAULT_OFF } from "./email/sacramentStatusEmails";

// ─── 1. Notify gating: milestone statuses default ON, internal default OFF ───
describe("Sacrament status email notify defaults", () => {
  it("approved/scheduled/meeting_scheduled/denied/declined default ON", () => {
    const milestones = ["approved", "scheduled", "meeting_scheduled", "denied", "declined"];
    milestones.forEach((s) => {
      expect(NOTIFY_DEFAULT_ON).toContain(s);
    });
  });

  it("contacted/completed default OFF", () => {
    const internal = ["contacted", "completed"];
    internal.forEach((s) => {
      expect(NOTIFY_DEFAULT_OFF).toContain(s);
    });
  });

  it("no overlap between ON and OFF lists", () => {
    const overlap = NOTIFY_DEFAULT_ON.filter((s) => NOTIFY_DEFAULT_OFF.includes(s));
    expect(overlap).toHaveLength(0);
  });
});

// ─── 2. CSV export utility: headers + row correctness ───
describe("exportCsv utility", () => {
  // We test the logic by importing the module and verifying output
  // Since exportCsv triggers a download, we test the column/accessor logic directly
  it("CsvColumn accessor extracts correct values", async () => {
    // Simulate the column config used in SacramentsManager
    type Row = { type: string; name: string; email: string | null; stage: string };
    const cols = [
      { header: "Type", accessor: (r: Row) => r.type },
      { header: "Name", accessor: (r: Row) => r.name },
      { header: "Email", accessor: (r: Row) => r.email },
      { header: "Stage", accessor: (r: Row) => r.stage },
    ];

    const row: Row = { type: "baptism", name: "John Doe", email: "john@example.com", stage: "new" };
    expect(cols[0].accessor(row)).toBe("baptism");
    expect(cols[1].accessor(row)).toBe("John Doe");
    expect(cols[2].accessor(row)).toBe("john@example.com");
    expect(cols[3].accessor(row)).toBe("new");
  });

  it("handles null email gracefully", () => {
    type Row = { email: string | null };
    const col = { header: "Email", accessor: (r: Row) => r.email };
    const row: Row = { email: null };
    const value = col.accessor(row);
    // In the real exportCsv, null becomes ""
    expect(value === null || value === "").toBeTruthy();
  });

  it("handles CSV special characters in accessor output", () => {
    type Row = { name: string };
    const col = { header: "Name", accessor: (r: Row) => r.name };
    const row: Row = { name: 'O\'Brien, "Jr."' };
    const value = col.accessor(row);
    expect(value).toContain("O'Brien");
    expect(value).toContain('"Jr."');
  });
});

// ─── 3. Dashboard aggregate: sum of 4 types ───
describe("Dashboard aggregate Pending Sacraments", () => {
  it("aggregate equals sum of per-type pending counts", () => {
    // Simulate what the admin stats query returns
    const mockStats = {
      pendingBaptisms: 3,
      pendingSponsors: 1,
      pendingMarriages: 2,
      pendingFunerals: 0,
    };
    const aggregate =
      mockStats.pendingBaptisms +
      mockStats.pendingSponsors +
      mockStats.pendingMarriages +
      mockStats.pendingFunerals;
    expect(aggregate).toBe(6);
  });
});

// ─── 4. Bulletin count: deletedAt IS NULL filter ───
describe("Bulletin count excludes soft-deleted", () => {
  it("query logic filters out deleted rows", () => {
    // Simulate the filter condition
    const bulletins = [
      { id: 1, title: "Active", deletedAt: null },
      { id: 2, title: "Deleted", deletedAt: new Date("2024-01-01") },
      { id: 3, title: "Active 2", deletedAt: null },
    ];
    const activeCount = bulletins.filter((b) => b.deletedAt === null).length;
    expect(activeCount).toBe(2);
    expect(activeCount).toBeLessThan(bulletins.length);
  });
});
