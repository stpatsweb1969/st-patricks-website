/**
 * Notification Routing — unit tests
 * Verifies: mapped section → alias + BCC catchall; unmapped → catchall only; failure never throws.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock sendEmail
vi.mock("./email", () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}));

// Mock notifyOwner
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

// Mock getSiteSetting — return null so DEFAULT is used
vi.mock("./db", () => ({
  getSiteSetting: vi.fn().mockResolvedValue(null),
  upsertSiteSetting: vi.fn().mockResolvedValue(undefined),
}));

import { routeNotification, DEFAULT_NOTIFICATION_ROUTING, getRoutingConfig } from "./notifications/route";
import { sendEmail } from "./email";
import { notifyOwner } from "./_core/notification";

describe("routeNotification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("routes a mapped section to its alias + BCC catchall", async () => {
    await routeNotification("sacraments", {
      title: "New Baptism Request",
      content: "John Doe submitted a baptism form.",
    });

    // Should send to sacraments alias
    expect(sendEmail).toHaveBeenCalledWith(
      "office@stpatrickinarmonk.org",
      "[St. Patrick] New Baptism Request",
      expect.stringContaining("New Baptism Request")
    );

    // notifyOwner should also be called (belt-and-suspenders)
    expect(notifyOwner).toHaveBeenCalledWith({
      title: "New Baptism Request",
      content: "John Doe submitted a baptism form.",
    });
  });

  it("routes CCD to reled@ + BCC catchall", async () => {
    await routeNotification("ccd_registrations", {
      title: "CCD Registration",
      content: "Jane Smith registered for CCD.",
    });

    // First call = section recipient (reled@)
    expect(sendEmail).toHaveBeenCalledWith(
      "reled@stpatrickinarmonk.org",
      "[St. Patrick] CCD Registration",
      expect.stringContaining("CCD Registration")
    );

    // Second call = BCC to catchall (office@)
    expect(sendEmail).toHaveBeenCalledWith(
      "office@stpatrickinarmonk.org",
      "[St. Patrick] CCD Registration",
      expect.stringContaining("CCD Registration")
    );
  });

  it("routes an unmapped section to catchall only (no BCC)", async () => {
    // "faq" is not in the default bySection map
    await routeNotification("faq", {
      title: "FAQ Submission",
      content: "Someone submitted something.",
    });

    // Only one sendEmail call — to catchall
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledWith(
      "office@stpatrickinarmonk.org",
      "[St. Patrick] FAQ Submission",
      expect.stringContaining("FAQ Submission")
    );
  });

  it("never throws even if sendEmail fails", async () => {
    vi.mocked(sendEmail).mockRejectedValueOnce(new Error("SMTP down"));

    // Should not throw
    await expect(
      routeNotification("sacraments", {
        title: "Test",
        content: "Should not throw",
      })
    ).resolves.toBeUndefined();
  });

  it("never throws even if notifyOwner fails", async () => {
    vi.mocked(notifyOwner).mockRejectedValueOnce(new Error("API down"));

    await expect(
      routeNotification("sacraments", {
        title: "Test",
        content: "Should not throw",
      })
    ).resolves.toBeUndefined();
  });
});

describe("getRoutingConfig", () => {
  it("returns DEFAULT_NOTIFICATION_ROUTING when no DB value exists", async () => {
    const config = await getRoutingConfig();
    expect(config).toEqual(DEFAULT_NOTIFICATION_ROUTING);
    expect(config.catchall).toBe("office@stpatrickinarmonk.org");
    expect(config.bySection.ccd_registrations).toBe("reled@stpatrickinarmonk.org");
  });
});
