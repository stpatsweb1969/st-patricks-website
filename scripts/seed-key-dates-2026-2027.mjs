/**
 * seed-key-dates-2026-2027.mjs
 *
 * Seeds all St. Patrick's Church Important Dates 2026-2027 from the bulletin sheet.
 * - Deletes all existing important_dates with eventDate >= 2026-09-01
 * - Inserts every event from the sheet (Parish BBQ excluded — canceled)
 * - TBD dates are set to the first day of the stated month
 *
 * Run: node scripts/seed-key-dates-2026-2027.mjs
 */

import mysql from "mysql2/promise";

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// ── Helper: parse a date string into a MySQL DATETIME ─────────────────────────
// Handles: "Saturday, September 5", "Monday, January 4", "TBD August" → Aug 1
function parseDate(str) {
  // TBD month → first of that month
  const tbdMatch = str.match(/TBD\s+(\w+)/i);
  if (tbdMatch) {
    const d = new Date(`${tbdMatch[1]} 1, 2026`);
    if (!isNaN(d)) return d;
    const d2 = new Date(`${tbdMatch[1]} 1, 2027`);
    if (!isNaN(d2)) return d2;
  }
  // "Week of October 12" → Oct 12
  const weekMatch = str.match(/Week of (\w+ \d+)/i);
  if (weekMatch) return parseDate(weekMatch[1]);
  // "Saturday, September 5 after 5:30pm Mass" → Sep 5
  // "Saturday, September 5" → Sep 5
  // "Monday, September 28 & Wednesday, September 30" → Sep 28 (first date)
  const dateMatch = str.match(/(\w+ \d+(?:,? \d{4})?)/);
  if (dateMatch) {
    // Try with year appended
    const raw = dateMatch[1].replace(/,/, "");
    // Determine year from context (2026 or 2027 based on month)
    // We'll pass year as a parameter instead
    return raw;
  }
  return str;
}

// ── Events from the bulletin sheet ────────────────────────────────────────────
// Format: { title, dateStr, location, category, note }
// category: "ccd" | "cyo" | "sacrament" | "parish" | "teen_life" | "social"
// Parish BBQ (Saturday, September 5) is EXCLUDED — canceled.

const events2026 = [
  // TBD August
  { title: "S'mores Teen Life Event", dateStr: "August 1, 2026", location: "Outside gym", category: "teen_life" },

  // September 2026
  // Parish BBQ EXCLUDED (canceled)
  { title: "Teen Life Kick Off Event", dateStr: "September 13, 2026", location: "Church", category: "teen_life", note: "Sunday, September 13 10:30am Mass" },
  { title: "Blessing of the School Backpacks", dateStr: "September 13, 2026", location: "Church", category: "parish", note: "Sunday, September 13 10:30am Mass" },
  { title: "St. Pat's CYO Golf Outing", dateStr: "September 21, 2026", location: "Whippoorwill Club", category: "cyo" },
  { title: "CCD Begins", dateStr: "September 28, 2026", location: "WH & Classrooms", category: "ccd", note: "Monday September 28 & Wednesday September 30" },

  // October 2026
  { title: "Pasta Night", dateStr: "October 3, 2026", location: "Gym", category: "social" },
  { title: "Catechists Mass 10:30am", dateStr: "October 4, 2026", location: "Church", category: "parish" },
  { title: "WWP Fall Season Begins", dateStr: "October 4, 2026", location: "WH", category: "parish", note: "TBD" },
  { title: "CYO Practice Begins", dateStr: "October 12, 2026", location: "Gym", category: "cyo", note: "Week of October 12" },
  { title: "TGIF Event 5:30–7pm", dateStr: "October 16, 2026", location: "Gym & WH", category: "social" },
  { title: "HS Paint & Pizza", dateStr: "October 22, 2026", location: "WH", category: "teen_life" },
  { title: "Trunk or Treat (before 5:30pm Mass)", dateStr: "October 24, 2026", location: "Church / Gym", category: "parish", note: "Saturday, October 24 4pm–5pm" },

  // November 2026
  { title: "All Saints Day Mass", dateStr: "November 1, 2026", location: "Church", category: "parish" },
  { title: "Teen Life DeCicco's Food Drive", dateStr: "November 7, 2026", location: "DeCicco's Armonk", category: "teen_life", note: "Saturday, November 7 (or 14)" },
  { title: "First Weekend of CYO Games", dateStr: "November 21, 2026", location: "Gym", category: "cyo", note: "Saturday November 21 & Sunday November 22" },
  { title: "CYO Mass at 10:30am", dateStr: "November 22, 2026", location: "Church", category: "cyo" },
  { title: "Advent Begins", dateStr: "November 29, 2026", location: "Church", category: "parish" },

  // December 2026
  { title: "WWP Fall Season Ends", dateStr: "December 1, 2026", location: "WH", category: "parish", note: "TBD" },
  { title: "Teen Life HS Advent Party", dateStr: "December 4, 2026", location: "Gym", category: "teen_life" },
  { title: "Breakfast with Santa", dateStr: "December 6, 2026", location: "Gym", category: "social" },
  { title: "TGIF Event 12noon–2pm", dateStr: "December 11, 2026", location: "Gym & WH", category: "social" },
  { title: "Last Day of CCD for 2026", dateStr: "December 14, 2026", location: "WH & Classrooms", category: "ccd", note: "Monday December 14 & Wednesday December 16" },
  { title: "Christmas Pageant", dateStr: "December 20, 2026", location: "Church", category: "parish" },
];

const events2027 = [
  // January 2027
  { title: "CCD Reopens", dateStr: "January 4, 2027", location: "WH & Classrooms", category: "ccd" },
  { title: "WWP Spring Season Begins", dateStr: "January 4, 2027", location: "Gym & WH", category: "parish", note: "TBD" },

  // February 2027
  { title: "St. Pat's Date Night", dateStr: "February 5, 2027", location: "Gym", category: "social" },
  { title: "First Penance (2nd graders)", dateStr: "February 6, 2027", location: "Church", category: "sacrament" },
  { title: "Ash Wednesday / Lent Begins", dateStr: "February 10, 2027", location: "Church", category: "parish" },
  { title: "CYO Playoffs", dateStr: "February 20, 2027", location: "Gym", category: "cyo", note: "Saturday February 20 & Sunday February 21" },
  { title: "CYO Playoffs", dateStr: "February 27, 2027", location: "Gym", category: "cyo", note: "Saturday February 27 & Sunday February 28" },

  // March 2027
  { title: "Confirmation Retreat 9am–1pm", dateStr: "March 6, 2027", location: "Church", category: "sacrament" },
  { title: "March Madness", dateStr: "March 7, 2027", location: "Gym", category: "social" },
  { title: "St. Patrick's & St. Joseph's Dinner", dateStr: "March 13, 2027", location: "Gym", category: "social" },
  { title: "Palm Sunday", dateStr: "March 21, 2027", location: "Church", category: "parish" },
  { title: "Easter / Resurrection Egg Hunt", dateStr: "March 28, 2027", location: "Church", category: "parish" },

  // April 2027
  { title: "Spring CYO Season Begins", dateStr: "April 3, 2027", location: "Gym", category: "cyo", note: "Saturday April 3 & Sunday April 4" },
  { title: "Confirmation Rehearsals", dateStr: "April 5, 2027", location: "WH", category: "sacrament", note: "Monday April 5 & Wednesday April 7" },
  { title: "Confirmation 10am & 1pm", dateStr: "April 10, 2027", location: "Church", category: "sacrament" },
  { title: "Last Day of CCD", dateStr: "April 19, 2027", location: "WH & Classrooms", category: "ccd", note: "Monday April 19 & Wednesday April 21" },
  { title: "Communion Rehearsals", dateStr: "April 26, 2027", location: "WH", category: "sacrament", note: "Monday April 26 & Wednesday April 28" },
  { title: "Designer Bag Bingo", dateStr: "April 29, 2027", location: "Gym", category: "social" },

  // May 2027
  { title: "Communion 10am & 1pm", dateStr: "May 1, 2027", location: "Church", category: "sacrament" },
  { title: "Communion Reunion Mass 10:30am", dateStr: "May 2, 2027", location: "Church", category: "sacrament" },
  { title: "WWP Spring Season Ends", dateStr: "May 2, 2027", location: "Gym & WH", category: "parish", note: "TBD" },
  { title: "TGIF Event", dateStr: "May 16, 2027", location: "Gym & WH", category: "social", note: "TBD" },
  { title: "Blessing of the Toys Mass 10:30am", dateStr: "May 16, 2027", location: "Church", category: "parish" },
  { title: "Teen Life Graduation Mass 10:30am", dateStr: "May 23, 2027", location: "Church", category: "teen_life" },

  // June 2027
  { title: "Teen Life Graduation Mass 10:30am", dateStr: "June 7, 2027", location: "Church", category: "teen_life" },
];

const allEvents = [...events2026, ...events2027];

try {
  // Delete all future key dates from Sep 2026 onwards (clean slate for 2026-2027)
  const [del] = await conn.execute(
    "DELETE FROM important_dates WHERE eventDate >= '2026-09-01'"
  );
  console.log(`Deleted ${del.affectedRows} existing future key dates`);

  // Insert all new events
  let inserted = 0;
  for (const ev of allEvents) {
    const d = new Date(ev.dateStr);
    if (isNaN(d.getTime())) {
      console.warn(`  SKIP (bad date): ${ev.dateStr} — ${ev.title}`);
      continue;
    }
    await conn.execute(
      `INSERT INTO important_dates (title, eventDate, location, note, category, published, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())`,
      [ev.title, d, ev.location ?? null, ev.note ?? null, ev.category]
    );
    inserted++;
    console.log(`  ✓ ${d.toISOString().slice(0, 10)} [${ev.category}] ${ev.title}`);
  }

  console.log(`\nDone — inserted ${inserted} key dates`);
} finally {
  await conn.end();
}
