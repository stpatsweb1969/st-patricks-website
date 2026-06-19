/**
 * Saint of the Day fetcher using Evangelizo.org API
 * Fetches saint names and biography from the Evangelizo feed
 */

interface SaintOfDay {
  date: string;
  saints: string[];
  featuredSaint: {
    name: string;
    biography: string;
    imageUrl: string | null;
    prayer: string | null;
  } | null;
}

let cache: { data: SaintOfDay; fetchedAt: number } | null = null;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function getTodayDateStr(): string {
  // Use Eastern Time for date
  const now = new Date();
  const eastern = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const y = eastern.getFullYear();
  const m = String(eastern.getMonth() + 1).padStart(2, "0");
  const d = String(eastern.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<p[^>]*>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0169;/g, "©")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function getSaintOfDay(): Promise<SaintOfDay> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < CACHE_TTL) {
    return cache.data;
  }

  const dateStr = getTodayDateStr();

  try {
    // Fetch saint names list
    const saintListRes = await fetch(
      `https://feed.evangelizo.org/v2/reader.php?date=${dateStr}&type=saint&lang=AM`
    );
    const saintListHtml = await saintListRes.text();

    // Parse saint names from the response
    const saints: string[] = [];
    // Extract names from links and plain text
    let linkMatch: RegExpExecArray | null;
    const linkRegex = /<a[^>]*>([^<]+)<\/a>/g;
    while ((linkMatch = linkRegex.exec(saintListHtml)) !== null) {
      saints.push(linkMatch[1].trim());
    }
    // Also get plain text saints (not in links)
    const plainText = saintListHtml
      .replace(/<a[^>]*>.*?<\/a>/g, "|||")
      .replace(/<[^>]+>/g, "")
      .trim();
    const plainSaints = plainText.split("|||").map(s => s.trim()).filter(s => s.length > 2);
    for (const ps of plainSaints) {
      if (!saints.includes(ps)) {
        saints.push(ps);
      }
    }

    // Get the featured saint detail page (first linked saint)
    let featuredSaint: SaintOfDay["featuredSaint"] = null;
    const idMatch = saintListHtml.match(/id=([a-f0-9-]+)/);
    if (idMatch) {
      try {
        const detailRes = await fetch(
          `https://feed.evangelizo.org/v2/display_saint.php?id=${idMatch[1]}&language=AM`
        );
        const detailHtml = await detailRes.text();

        // Extract saint name from h3
        const nameMatch = detailHtml.match(/<h3>([^<]+)<\/h3>/);
        const name = nameMatch ? nameMatch[1].trim() : saints[0] || "Saint of the Day";

        // Extract image URL
        const imgMatch = detailHtml.match(/src="(https:\/\/files\.evangelizo\.org\/[^"]+)"/);
        const imageUrl = imgMatch ? imgMatch[1] : null;

        // Extract biography text (between the image and the ©Evangelizo)
        const bioSection = detailHtml.match(/<img[^>]*>([\s\S]*?)©Evangelizo/);
        let biography = "";
        let prayer: string | null = null;

        if (bioSection) {
          const fullText = stripHtml(bioSection[1]);
          // Split into biography and prayer
          const prayerIdx = fullText.indexOf("Prayer");
          if (prayerIdx > 0) {
            biography = fullText.substring(0, fullText.indexOf("Antiphon")).trim();
            const prayerText = fullText.substring(prayerIdx + 7).trim();
            // Remove source attribution
            prayer = prayerText.replace(/The Roman Breviary.*$/m, "").trim();
          } else {
            biography = fullText.substring(0, 500).trim();
          }
        }

        featuredSaint = { name, biography, imageUrl, prayer };
      } catch {
        // If detail fetch fails, just use the name
        featuredSaint = { name: saints[0] || "Saint of the Day", biography: "", imageUrl: null, prayer: null };
      }
    }

    const result: SaintOfDay = {
      date: dateStr,
      saints: saints.filter(s => s.length > 0),
      featuredSaint,
    };

    cache = { data: result, fetchedAt: now };
    return result;
  } catch (error) {
    // Return fallback if API is down
    return {
      date: dateStr,
      saints: [],
      featuredSaint: null,
    };
  }
}
