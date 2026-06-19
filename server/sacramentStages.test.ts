import { describe, it, expect, vi } from "vitest";
import { rawStatusToStage, STAGE_META, TYPE_META, ACTIONS, STAGE_SORT_ORDER } from "../shared/sacramentStages";
import type { SacramentStage, SacramentType } from "../shared/sacramentStages";

describe("sacramentStages — canonical stage mapping", () => {
  it("maps all known raw statuses to correct stages", () => {
    expect(rawStatusToStage("pending")).toBe("new");
    expect(rawStatusToStage("contacted")).toBe("contacted");
    expect(rawStatusToStage("approved")).toBe("scheduled");
    expect(rawStatusToStage("meeting_scheduled")).toBe("scheduled");
    expect(rawStatusToStage("scheduled")).toBe("scheduled");
    expect(rawStatusToStage("completed")).toBe("completed");
    expect(rawStatusToStage("denied")).toBe("declined");
  });

  it("defaults unknown statuses to 'new' with a warning", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(rawStatusToStage("unknown_status")).toBe("new");
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Unknown raw status "unknown_status"')
    );
    warnSpy.mockRestore();
  });

  it("STAGE_META has entries for all stages", () => {
    const stages: SacramentStage[] = ["new", "contacted", "scheduled", "completed", "declined"];
    for (const stage of stages) {
      expect(STAGE_META[stage]).toBeDefined();
      expect(STAGE_META[stage].label).toBeTruthy();
      expect(STAGE_META[stage].className).toBeTruthy();
    }
  });

  it("TYPE_META has entries for all types", () => {
    const types: SacramentType[] = ["baptism", "sponsor", "marriage", "funeral"];
    for (const type of types) {
      expect(TYPE_META[type]).toBeDefined();
      expect(TYPE_META[type].label).toBeTruthy();
      expect(TYPE_META[type].className).toBeTruthy();
    }
  });

  it("ACTIONS defines at least one action for pending status of each type", () => {
    const types: SacramentType[] = ["baptism", "sponsor", "marriage", "funeral"];
    for (const type of types) {
      expect(ACTIONS[type]["pending"]).toBeDefined();
      expect(ACTIONS[type]["pending"].length).toBeGreaterThan(0);
    }
  });

  it("sponsor deny action has confirm: true", () => {
    const denyAction = ACTIONS.sponsor.pending.find((a) => a.nextStatus === "denied");
    expect(denyAction).toBeDefined();
    expect(denyAction!.confirm).toBe(true);
  });

  it("STAGE_SORT_ORDER has increasing values from new to declined", () => {
    expect(STAGE_SORT_ORDER.new).toBeLessThan(STAGE_SORT_ORDER.contacted);
    expect(STAGE_SORT_ORDER.contacted).toBeLessThan(STAGE_SORT_ORDER.scheduled);
    expect(STAGE_SORT_ORDER.scheduled).toBeLessThan(STAGE_SORT_ORDER.completed);
    expect(STAGE_SORT_ORDER.completed).toBeLessThan(STAGE_SORT_ORDER.declined);
  });
});

describe("sacramentStages — allSubmissions DB helper typing", () => {
  it("getAllSacramentSubmissions exports a function", async () => {
    const mod = await import("./db/sacramentSubmissions");
    expect(typeof mod.getAllSacramentSubmissions).toBe("function");
  });
});
