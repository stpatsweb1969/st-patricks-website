/**
 * SEO endpoints — dynamic XML sitemap and robots.txt.
 * Generates sitemap from static routes + dynamic content (news, bulletins).
 */
import type { Express } from "express";
import * as db from "./db";

const STATIC_ROUTES = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/mass-times", priority: "0.9", changefreq: "weekly" },
  { path: "/bulletins", priority: "0.8", changefreq: "weekly" },
  { path: "/news-events", priority: "0.8", changefreq: "daily" },
  { path: "/sacraments", priority: "0.7", changefreq: "monthly" },
  { path: "/faith-formation", priority: "0.7", changefreq: "monthly" },
  { path: "/about", priority: "0.6", changefreq: "monthly" },
  { path: "/contact", priority: "0.6", changefreq: "monthly" },
  { path: "/staff", priority: "0.5", changefreq: "monthly" },
  { path: "/ministries", priority: "0.6", changefreq: "monthly" },
  { path: "/giving", priority: "0.6", changefreq: "monthly" },
  { path: "/volunteer", priority: "0.6", changefreq: "weekly" },
  { path: "/new-here", priority: "0.7", changefreq: "monthly" },
  { path: "/key-dates", priority: "0.7", changefreq: "weekly" },
  { path: "/photo-gallery", priority: "0.5", changefreq: "weekly" },
  { path: "/forms-documents", priority: "0.5", changefreq: "monthly" },
  { path: "/prayers", priority: "0.5", changefreq: "daily" },
];

function getBaseUrl(req: any): string {
  const proto = req.headers["x-forwarded-proto"] || req.protocol || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "st-patricks-armonk.manus.space";
  return `${proto}://${host}`;
}

export function registerSeoRoutes(app: Express) {
  // Dynamic XML Sitemap
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const baseUrl = getBaseUrl(req);
      const today = new Date().toISOString().split("T")[0];

      let urls = STATIC_ROUTES.map((r) => `
  <url>
    <loc>${baseUrl}${r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`);

      // Add dynamic news posts
      try {
        const newsPosts = await db.getPublishedNewsPosts();
        if (newsPosts && newsPosts.length > 0) {
          for (const post of newsPosts.slice(0, 50)) {
            const date = post.publishedAt
              ? new Date(post.publishedAt).toISOString().split("T")[0]
              : today;
            urls.push(`
  <url>
    <loc>${baseUrl}/news-events</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`);
            break; // Only add one entry for the news page
          }
        }
      } catch {
        // Silently skip if DB not ready
      }

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}
</urlset>`;

      res.set("Content-Type", "application/xml");
      res.set("Cache-Control", "public, max-age=3600");
      res.send(xml);
    } catch (error) {
      console.error("[SEO] Sitemap generation error:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  // Robots.txt
  app.get("/robots.txt", (req, res) => {
    const baseUrl = getBaseUrl(req);
    const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`;
    res.set("Content-Type", "text/plain");
    res.set("Cache-Control", "public, max-age=86400");
    res.send(robotsTxt);
  });
}
