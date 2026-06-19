/**
 * Admin Gating Regression Test
 * Asserts that broadcast, staff.upsert, and staff.delete reject non-admin users.
 */
import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createUserContext(role: "user" | "admin"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("admin gating — broadcast, staff.upsert, staff.delete", () => {
  it("rejects broadcast from a non-admin user with FORBIDDEN", async () => {
    const ctx = createUserContext("user");
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.pushNotifications.broadcast({
        title: "Test",
        body: "Test body",
        channels: { push: false, email: false, banner: false },
        segment: "all",
      })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects staff.upsert from a non-admin user with FORBIDDEN", async () => {
    const ctx = createUserContext("user");
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.staff.upsert({
        name: "Test Person",
        role: "Office Manager",
        category: "staff",
        sortOrder: 0,
      })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects staff.delete from a non-admin user with FORBIDDEN", async () => {
    const ctx = createUserContext("user");
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.staff.delete({ id: 999 })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("allows broadcast from an admin user (does not throw FORBIDDEN)", async () => {
    const ctx = createUserContext("admin");
    const caller = appRouter.createCaller(ctx);
    // Should not throw FORBIDDEN — may fail for other reasons (DB not available in test)
    // but the auth gate itself should pass
    try {
      await caller.pushNotifications.broadcast({
        title: "Admin Test",
        body: "Admin body",
        channels: { push: false, email: false, banner: false },
        segment: "all",
      });
    } catch (err: any) {
      // Acceptable errors: DB not available, VAPID not configured, etc.
      // NOT acceptable: FORBIDDEN
      expect(err.code).not.toBe("FORBIDDEN");
    }
  });

  it("allows staff.upsert from an admin user (does not throw FORBIDDEN)", async () => {
    const ctx = createUserContext("admin");
    const caller = appRouter.createCaller(ctx);
    try {
      await caller.staff.upsert({
        name: "Admin Test",
        role: "Tester",
        category: "staff",
        sortOrder: 0,
      });
    } catch (err: any) {
      expect(err.code).not.toBe("FORBIDDEN");
    }
  });

  it("allows staff.delete from an admin user (does not throw FORBIDDEN)", async () => {
    const ctx = createUserContext("admin");
    const caller = appRouter.createCaller(ctx);
    try {
      await caller.staff.delete({ id: 999 });
    } catch (err: any) {
      expect(err.code).not.toBe("FORBIDDEN");
    }
  });
});
