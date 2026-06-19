import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { registerSeoRoutes } from "../seo";
import { appRouter, sendCcdReminders } from "../routers";
import { handleWeeklyDigest } from "../scheduledDigest";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { sdk } from "./sdk";
import * as db from "../db";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  registerSeoRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // ===== SCHEDULED HANDLERS =====
  // CCD Reminder cron handler - sends reminders for upcoming CCD events
  app.post("/api/scheduled/ccd-reminders", async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user || !(user as any).isCron) {
        return res.status(403).json({ error: "cron-only" });
      }

      // Get events happening in the next 2 days
      const upcomingEvents = await db.getUpcomingCcdEvents(2);
      if (upcomingEvents.length === 0) {
        return res.json({ ok: true, skipped: "no-upcoming-events" });
      }

      const result = await sendCcdReminders(upcomingEvents);
      res.json({ ok: true, ...result });
    } catch (error: any) {
      console.error("[Scheduled] CCD reminder error:", error);
      res.status(500).json({
        error: error.message || "Unknown error",
        stack: error.stack,
        context: { url: req.url, taskUid: (req as any).taskUid },
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Monday Analytics Digest cron handler - sends weekly analytics summary to owner
  app.post("/api/scheduled/analytics-digest", async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user || !(user as any).isCron) {
        return res.status(403).json({ error: "cron-only" });
      }
      const { handleAnalyticsDigest } = await import("../scheduledAnalytics");
      const result = await handleAnalyticsDigest();
      res.json({ ok: true, ...result });
    } catch (error: any) {
      console.error("[Scheduled] Analytics digest error:", error);
      res.status(500).json({
        error: error.message || "Unknown error",
        stack: error.stack,
        context: { url: req.url, taskUid: (req as any).taskUid },
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Weekly Digest cron handler - sends weekly email digest to all subscribers
  app.post("/api/scheduled/weekly-digest", async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user || !(user as any).isCron) {
        return res.status(403).json({ error: "cron-only" });
      }
      const result = await handleWeeklyDigest();
      res.json({ ok: true, ...result });
    } catch (error: any) {
      console.error("[Scheduled] Weekly digest error:", error);
      res.status(500).json({
        error: error.message || "Unknown error",
        stack: error.stack,
        context: { url: req.url, taskUid: (req as any).taskUid },
        timestamp: new Date().toISOString(),
      });
    }
  });

  // CCD Unsubscribe endpoint
  app.get("/api/ccd-unsubscribe", async (req, res) => {
    try {
      const token = req.query.token as string;
      if (!token) {
        return res.status(400).json({ error: "Token required" });
      }
      await db.unsubscribeCcdReminder(token);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
