/**
 * Fix parish_schedule in site_settings to use the correct ParishSchedule format
 * that scheduleEngine.ts expects (with dayOfWeek, name, durationMin fields).
 * 
 * Source of truth: June 21, 2026 bulletin
 * - Sunday Mass: 8:30 AM, 10:30 AM, 12:30 PM (no 12:30 July 5–Sept 6, resumes 9/13/26)
 * - Saturday Vigil: 5:30 PM
 * - Daily Mass: Tuesday–Friday 8:30 AM (NO Monday Mass)
 * - Confession: Saturday 4:30–5:15 PM (durationMin=45)
 * - Rosary: Thursday 7:30 PM
 * - First Friday Adoration: 9 AM–7 PM, Sept–June (durationMin=600)
 * - Holy Days: 8:30 AM, 12:10 PM, 7:30 PM
 */
import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// ParishSchedule format matching shared/scheduleEngine.ts types
const schedule = {
  services: [
    // Sunday
    { type: "mass", name: "Mass", dayOfWeek: 0, time: "8:30 AM", durationMin: 60 },
    { type: "mass", name: "Mass", dayOfWeek: 0, time: "10:30 AM", durationMin: 60 },
    {
      type: "mass",
      name: "Mass",
      dayOfWeek: 0,
      time: "12:30 PM",
      durationMin: 60,
      seasonal: {
        months: [9, 10, 11, 12, 1, 2, 3, 4, 5, 6],
        note: "No 12:30 Mass July 5 – Sept 6 (Resumes 9/13/26)"
      }
    },
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
      type: "adoration",
      name: "First Friday Adoration",
      dayOfWeek: 5,
      time: "9:00 AM",
      durationMin: 600,
      seasonal: {
        months: [9, 10, 11, 12, 1, 2, 3, 4, 5, 6],
        note: "First Fridays, Sept–June, 9 AM – 7 PM"
      },
      firstOfMonth: true,
      note: "Exposition of the Blessed Sacrament"
    },
    // Saturday
    { type: "confession", name: "Confession", dayOfWeek: 6, time: "4:30 PM", durationMin: 45, note: "4:30–5:15 PM · Also by appointment · No Confessions on Holy Saturday" },
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

await conn.execute(
  "UPDATE site_settings SET value = ? WHERE `key` = 'parish_schedule'",
  [JSON.stringify(schedule)]
);
console.log("✅ parish_schedule updated with correct ParishSchedule format");
console.log("Services stored:", schedule.services.length);
console.log("Holy Days stored:", schedule.holyDays.length);

// Also fix parish_info to match ParishInfo interface from scheduleEngine.ts
const info = {
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
  pastorPhone: "845-490-9307",
  flocknoteUrl: "https://stpatrickinarmonk.flocknote.com",
  youtubeUrl: "https://www.youtube.com/@stpatrickinarmonk",
  youtubeChannelId: "",
  mapCoordinates: { lat: 41.12789521205174, lng: -73.69853192447971 },
};

await conn.execute(
  "UPDATE site_settings SET value = ? WHERE `key` = 'parish_info'",
  [JSON.stringify(info)]
);
console.log("✅ parish_info updated with correct ParishInfo format");

await conn.end();
console.log("\n✅ All schedule and info updates complete");
