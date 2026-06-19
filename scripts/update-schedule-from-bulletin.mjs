/**
 * Updates parish_schedule in site_settings with exact times from the June 21, 2026 bulletin.
 *
 * LITURGY SCHEDULE (from bulletin):
 * Sunday Mass: 8:30am, 10:30am, 12:30pm (*No 12:30 July 5 – Sept 6, resumes 9/13/26)
 * Saturday Vigil: 5:30pm
 * Daily Mass: Tuesday – Friday 8:30am
 * Holy Days: 8:30am, 12:10pm, 7:30pm
 * Confession: Saturday 4:30–5:15pm (no confessions Holy Saturday)
 * Rosary: Thursdays 7:30pm
 * First Fridays (Sept–June): Exposition 9am–7pm
 */

import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const db = await mysql.createConnection(process.env.DATABASE_URL);

const schedule = {
  services: [
    // Saturday Vigil
    {
      id: "sat-vigil",
      day: "Saturday",
      time: "5:30 PM",
      type: "mass",
      label: "Saturday Vigil Mass",
      note: null,
    },
    // Sunday Masses
    {
      id: "sun-830",
      day: "Sunday",
      time: "8:30 AM",
      type: "mass",
      label: "Sunday Mass",
      note: null,
    },
    {
      id: "sun-1030",
      day: "Sunday",
      time: "10:30 AM",
      type: "mass",
      label: "Sunday Mass",
      note: null,
    },
    {
      id: "sun-1230",
      day: "Sunday",
      time: "12:30 PM",
      type: "mass",
      label: "Sunday Mass",
      note: "No 12:30 PM Mass July 5 – September 6 (resumes September 13)",
    },
    // Daily Mass — Tuesday through Friday
    {
      id: "tue-830",
      day: "Tuesday",
      time: "8:30 AM",
      type: "mass",
      label: "Daily Mass",
      note: null,
    },
    {
      id: "wed-830",
      day: "Wednesday",
      time: "8:30 AM",
      type: "mass",
      label: "Daily Mass",
      note: null,
    },
    {
      id: "thu-830",
      day: "Thursday",
      time: "8:30 AM",
      type: "mass",
      label: "Daily Mass",
      note: null,
    },
    {
      id: "fri-830",
      day: "Friday",
      time: "8:30 AM",
      type: "mass",
      label: "Daily Mass",
      note: null,
    },
    // Confession
    {
      id: "sat-confession",
      day: "Saturday",
      time: "4:30 PM",
      type: "confession",
      label: "Confession",
      note: "4:30–5:15 PM. By appointment also available. No Confessions on Holy Saturday.",
    },
    // Rosary
    {
      id: "thu-rosary",
      day: "Thursday",
      time: "7:30 PM",
      type: "devotion",
      label: "Rosary",
      note: null,
    },
    // First Friday Adoration (September – June only)
    {
      id: "fri-adoration",
      day: "Friday",
      time: "9:00 AM",
      type: "devotion",
      label: "First Friday — Exposition of the Blessed Sacrament",
      note: "First Fridays only, September through June. 9:00 AM – 7:00 PM.",
    },
  ],
  holyDays: [
    { time: "8:30 AM", label: "Holy Day Mass" },
    { time: "12:10 PM", label: "Holy Day Mass" },
    { time: "7:30 PM", label: "Holy Day Mass" },
  ],
};

const [rows] = await db.execute(
  "SELECT id FROM site_settings WHERE `key` = 'parish_schedule' LIMIT 1"
);

if (rows.length > 0) {
  await db.execute(
    "UPDATE site_settings SET value = ?, updatedAt = NOW() WHERE `key` = 'parish_schedule'",
    [JSON.stringify(schedule)]
  );
  console.log("✅ Updated parish_schedule with bulletin mass times.");
} else {
  await db.execute(
    "INSERT INTO site_settings (`key`, value, label, description) VALUES ('parish_schedule', ?, 'Parish Schedule', 'Mass times and devotions schedule')",
    [JSON.stringify(schedule)]
  );
  console.log("✅ Inserted parish_schedule with bulletin mass times.");
}

await db.end();
console.log("Done.");
