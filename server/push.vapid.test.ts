import { describe, it, expect } from "vitest";

describe("VAPID keys configuration", () => {
  it("should have VAPID_PUBLIC_KEY set in environment", () => {
    const key = process.env.VAPID_PUBLIC_KEY;
    expect(key).toBeDefined();
    expect(key!.length).toBeGreaterThan(20);
    // VAPID public keys are base64url encoded
    expect(key).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("should have VAPID_PRIVATE_KEY set in environment", () => {
    const key = process.env.VAPID_PRIVATE_KEY;
    expect(key).toBeDefined();
    expect(key!.length).toBeGreaterThan(20);
    expect(key).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("should be valid VAPID key pair usable by web-push", async () => {
    const webpush = await import("web-push");
    const publicKey = process.env.VAPID_PUBLIC_KEY!;
    const privateKey = process.env.VAPID_PRIVATE_KEY!;

    // This will throw if the keys are invalid
    expect(() => {
      webpush.setVapidDetails(
        "mailto:admin@stpatricksarmonk.org",
        publicKey,
        privateKey
      );
    }).not.toThrow();
  });
});
