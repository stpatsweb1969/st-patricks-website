/**
 * Vatican News RSS Feed Parser
 * Fetches and parses the Vatican News RSS feed with in-memory caching.
 */

export interface VaticanNewsItem {
  title: string;
  link: string;
  description: string;
  pubDate: string; // ISO string
  imageUrl?: string;
}

// Cache parsed items for 30 minutes
let cachedData: { items: VaticanNewsItem[]; fetchedAt: number } = { items: [], fetchedAt: 0 };
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

const VATICAN_NEWS_RSS = "https://www.vaticannews.va/en.rss.xml";

/**
 * Fetch and parse Vatican News RSS feed
 */
export async function fetchVaticanNews(maxItems: number = 5): Promise<VaticanNewsItem[]> {
  // Check cache
  if (Date.now() - cachedData.fetchedAt < CACHE_TTL && cachedData.items.length > 0) {
    return cachedData.items.slice(0, maxItems);
  }

  try {
    const response = await fetch(VATICAN_NEWS_RSS, {
      headers: { "User-Agent": "StPatricksArmonk/1.0" },
    });
    if (!response.ok) {
      console.error(`Vatican News RSS fetch failed: ${response.status}`);
      return cachedData.items.slice(0, maxItems);
    }

    const xml = await response.text();
    const items = parseRSS(xml);

    // Update cache
    cachedData = { items, fetchedAt: Date.now() };

    return items.slice(0, maxItems);
  } catch (err) {
    console.error("Vatican News RSS parse error:", err);
    return cachedData.items.slice(0, maxItems);
  }
}

/**
 * Simple RSS XML parser (no external dependency needed)
 */
function parseRSS(xml: string): VaticanNewsItem[] {
  const items: VaticanNewsItem[] = [];

  // Extract all <item> blocks
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];

    const title = extractTag(itemXml, "title");
    const link = extractTag(itemXml, "link");
    const description = extractTag(itemXml, "description");
    const pubDate = extractTag(itemXml, "pubDate");

    // Try to extract image from media:content or enclosure
    let imageUrl = extractAttribute(itemXml, "media:content", "url")
      || extractAttribute(itemXml, "enclosure", "url");

    if (title && link) {
      items.push({
        title: cleanHtml(title),
        link,
        description: cleanHtml(description || "").slice(0, 200),
        pubDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        imageUrl: imageUrl || undefined,
      });
    }
  }

  return items;
}

function extractTag(xml: string, tag: string): string | null {
  // Handle CDATA
  const cdataRegex = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tag}>`, "i");
  const cdataMatch = cdataRegex.exec(xml);
  if (cdataMatch) return cdataMatch[1].trim();

  // Handle regular content
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = regex.exec(xml);
  return match ? match[1].trim() : null;
}

function extractAttribute(xml: string, tag: string, attr: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, "i");
  const match = regex.exec(xml);
  return match ? match[1] : null;
}

function cleanHtml(text: string): string {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}
