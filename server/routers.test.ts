import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext() {
  const clearedCookies: any[] = [];
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@stpatrick.org",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  const ctx: TrpcContext = {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };
  return { ctx, clearedCookies };
}

function createPublicContext() {
  const ctx: TrpcContext = {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
  return { ctx };
}

function createRegularUserContext() {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  const ctx: TrpcContext = {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
  return { ctx };
}

describe("auth.me", () => {
  it("returns null for unauthenticated users", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user data for authenticated users", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.email).toBe("admin@stpatrick.org");
    expect(result?.role).toBe("admin");
  });
});

describe("auth.logout", () => {
  it("clears the session cookie and reports success", async () => {
    const { ctx, clearedCookies } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
  });
});

describe("router structure", () => {
  it("has news router with listPublished procedure", () => {
    expect(appRouter.news).toBeDefined();
    expect(appRouter.news.listPublished).toBeDefined();
  });

  it("has events router with listUpcoming procedure", () => {
    expect(appRouter.events).toBeDefined();
    expect(appRouter.events.listUpcoming).toBeDefined();
  });

  it("has bulletins router with listPublished procedure", () => {
    expect(appRouter.bulletins).toBeDefined();
    expect(appRouter.bulletins.listPublished).toBeDefined();
  });

  it("has bulletins router with create, update, delete, uploadPdf procedures", () => {
    expect(appRouter.bulletins.create).toBeDefined();
    expect(appRouter.bulletins.update).toBeDefined();
    expect(appRouter.bulletins.delete).toBeDefined();
    expect(appRouter.bulletins.uploadPdf).toBeDefined();
  });

  it("has subscriptions router with subscribe procedure", () => {
    expect(appRouter.subscriptions).toBeDefined();
    expect(appRouter.subscriptions.subscribe).toBeDefined();
  });
});

describe("admin access control", () => {
  it("rejects non-admin users from news.listAll", async () => {
    const { ctx } = createRegularUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.news.listAll()).rejects.toThrow();
  });

  it("rejects unauthenticated users from news.create", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.news.create({ title: "Test", content: "Test content", published: false })
    ).rejects.toThrow();
  });

  it("rejects non-admin users from bulletins.create", async () => {
    const { ctx } = createRegularUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.bulletins.create({ title: "Test", pdfUrl: "/test.pdf", pdfKey: "key", weekDate: "2026-06-15", published: false })
    ).rejects.toThrow();
  });

  it("rejects unauthenticated users from bulletins.uploadPdf", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.bulletins.uploadPdf({ fileName: "test.pdf", fileBase64: "dGVzdA==", contentType: "application/pdf" })
    ).rejects.toThrow();
  });
});

describe("subscriptions.subscribe", () => {
  it("validates email format", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.subscriptions.subscribe({ email: "not-an-email" })
    ).rejects.toThrow();
  });
});
