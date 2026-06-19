/**
 * Fix site_settings parish_schedule and parish_info to match the exact
 * ParishSchedule / ParishInfo interfaces expected by scheduleEngine.ts.
 * Source of truth: June 21, 2026 bulletin.
 * Run: node scripts/fix-site-settings.mjs
 */

import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// ── PARISH SCHEDULE (must match ParishSchedule interface) ────────────────────
// Bulletin: Sun 8:30, 10:30, 12:30* | Sat Vigil 5:30 | Tue–Fri 8:30
// *No 12:30 Mass July 5 – September 6 (Resumes 9/13/26)
const parishSchedule = {
  services: [
    // Sunday
    { type: "mass", name: "Mass", dayOfWeek: 0, time: "8:30 AM", durationMin: 60 },
    { type: "mass", name: "Mass", dayOfWeek: 0, time: "10:30 AM", durationMin: 60 },
    {
      type: "mass", name: "Mass", dayOfWeek: 0, time: "12:30 PM", durationMin: 60,
      seasonal: {
        months: [9, 10, 11, 12, 1, 2, 3, 4, 5, 6],
        note: "No 12:30 PM Mass July 5 – September 6 (Resumes 9/13/26)"
      }
    },
    // Monday — no Mass
    // Tuesday
    { type: "mass", name: "Mass", dayOfWeek: 2, time: "8:30 AM", durationMin: 30 },
    // Wednesday
    { type: "mass", name: "Mass", dayOfWeek: 3, time: "8:30 AM", durationMin: 30 },
    // Thursday
    { type: "mass", name: "Mass", dayOfWeek: 4, time: "8:30 AM", durationMin: 30 },
    { type: "prayer", name: "Rosary", dayOfWeek: 4, time: "7:30 PM", durationMin: 30 },
    // Friday
    { type: "mass", name: "Mass", dayOfWeek: 5, time: "8:30 AM", durationMin: 30 },
    {
      type: "adoration", name: "First Friday Adoration", dayOfWeek: 5,
      time: "9:00 AM", durationMin: 600,
      seasonal: { months: [9, 10, 11, 12, 1, 2, 3, 4, 5, 6], note: "First Fridays, Sept–June, 9 AM – 7 PM" },
      firstOfMonth: true,
      note: "Exposition of the Blessed Sacrament"
    },
    // Saturday
    { type: "confession", name: "Confession", dayOfWeek: 6, time: "4:30 PM", durationMin: 45 },
    { type: "mass", name: "Vigil Mass", dayOfWeek: 6, time: "5:30 PM", durationMin: 60 },
  ],
  holyDays: [
    { month: 1, day: 1, name: "Solemnity of Mary, Mother of God", massTimes: ["8:30 AM", "12:10 PM", "7:30 PM"] },
    { month: 8, day: 15, name: "Assumption of the Blessed Virgin Mary", massTimes: ["8:30 AM", "12:10 PM", "7:30 PM"] },
    { month: 11, day: 1, name: "All Saints' Day", massTimes: ["8:30 AM", "12:10 PM", "7:30 PM"] },
    { month: 12, day: 8, name: "Immaculate Conception", massTimes: ["8:30 AM", "12:10 PM", "7:30 PM"] },
    { month: 12, day: 25, name: "Christmas", massTimes: ["8:30 AM", "12:10 PM", "7:30 PM"] },
  ],
};

// ── PARISH INFO (must match ParishInfo interface) ─────────────────────────────
// Source: June 21, 2026 bulletin page 1
const parishInfo = {
  name: "St. Patrick in Armonk",
  address: "29 Cox Avenue",
  city: "Armonk",
  state: "NY",
  zip: "10504",
  phone: "(914) 273-9724",
  officeEmail: "office@stpatrickinarmonk.org",
  officeHours: "Mon–Thu 9:00 AM – 5:00 PM",
  pastorName: "Rev. Thadeus Aravindathu",
  pastorEmail: "pastor.stpats@outlook.com",
  flocknoteUrl: "https://stpatarmonk.flocknote.com/home",
  youtubeUrl: "https://www.youtube.com/@StPatricksArmonk",
  youtubeChannelId: "UCVAmgwg8dltHe98xw95ZsKw",
  mapCoordinates: { lat: 41.1279, lng: -73.6985 },
};

await conn.execute(
  "UPDATE site_settings SET value = ? WHERE `key` = 'parish_schedule'",
  [JSON.stringify(parishSchedule)]
);
console.log('✓ Fixed parish_schedule in site_settings');

await conn.execute(
  "UPDATE site_settings SET value = ? WHERE `key` = 'parish_info'",
  [JSON.stringify(parishInfo)]
);
console.log('✓ Fixed parish_info in site_settings');

await conn.end();
console.log('\n✅ site_settings corrected — scheduleEngine should now work correctly.');
