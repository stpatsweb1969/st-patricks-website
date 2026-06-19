/**
 * Update staff, schedule, and contacts from the EXACT text of the June 21, 2026 bulletin.
 * Page 1: Clergy, staff, schedule, sacrament info
 * Page 2: Contacts, parish committees, parish ministries
 */
import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// ── 1. CLEAR AND RESEED STAFF ──────────────────────────────────────────────

await conn.execute("DELETE FROM staff_members");
console.log("Cleared staff_members table");

const staff = [
  // CLERGY
  { name: "Rev. Thadeus Aravindathu", role: "Pastor", category: "clergy", email: "pastor.stpats@outlook.com", phone: "845-490-9307", sort_order: 1 },
  { name: "Fr. John Vigilanti", role: "Weekend Assistant", category: "clergy", email: null, phone: null, sort_order: 2 },

  // PARISH OFFICE
  { name: "Linda Maffia", role: "Office Administrative Assistant", category: "staff", email: "office@stpatrickinarmonk.org", phone: "914-273-9724", sort_order: 10 },
  { name: "Tania DeLuca", role: "Bookkeeper", category: "staff", email: "tania@stpatrickinarmonk.org", phone: null, sort_order: 11 },
  { name: "Maureen McNamara", role: "Bulletin Editor", category: "staff", email: "bulletin.editor@stpatrickinarmonk.org", phone: null, sort_order: 12 },

  // RELIGIOUS EDUCATION
  { name: "Sarah Aliotta", role: "Religious Education Coordinator", category: "staff", email: "reled@stpatrickinarmonk.org", phone: "914-273-8226", sort_order: 20 },
  { name: "John Erickson", role: "Religious Education Assistant", category: "staff", email: "reled@stpatrickinarmonk.org", phone: "914-531-1759", sort_order: 21 },

  // MUSIC
  { name: "John Failla", role: "Music Director", category: "staff", email: "MusicAtStPats@gmail.com", phone: null, sort_order: 30 },

  // PARISH COUNCIL
  { name: "Leo Greco", role: "Parish Council President", category: "leadership", email: null, phone: null, sort_order: 40 },
  { name: "Tina Mannix", role: "Parish Council Secretary", category: "leadership", email: null, phone: null, sort_order: 41 },
  { name: "John Di Capua", role: "Finance Committee Chairman", category: "leadership", email: null, phone: null, sort_order: 42 },
  { name: "Colin McBride", role: "Parish Trustee", category: "leadership", email: null, phone: null, sort_order: 43 },
  { name: "Maria Tedesco", role: "Parish Trustee", category: "leadership", email: null, phone: null, sort_order: 44 },

  // PARISH MINISTRIES
  { name: "Gwen Torre", role: "Youth Ministry", category: "ministry_leader", email: null, phone: null, sort_order: 50 },
  { name: "Elvis Grgurovic", role: "CYO Basketball", category: "ministry_leader", email: null, phone: null, sort_order: 51 },
  { name: "Kevin Mannix", role: "CYO Basketball", category: "ministry_leader", email: null, phone: null, sort_order: 52 },
  { name: "Mike Corelli", role: "Gym Schedule", category: "ministry_leader", email: null, phone: null, sort_order: 53 },
  { name: "Linda Maffia", role: "Gym Rentals", category: "ministry_leader", email: "office@stpatrickinarmonk.org", phone: null, sort_order: 54 },
  { name: "Margaret Poppo", role: "Walking with Purpose", category: "ministry_leader", email: null, phone: null, sort_order: 55 },
  { name: "Tania DeLuca", role: "Walking with Purpose", category: "ministry_leader", email: "tania@stpatrickinarmonk.org", phone: null, sort_order: 56 },
  { name: "Judith Grech", role: "Food First Program", category: "ministry_leader", email: null, phone: null, sort_order: 57 },
  { name: "Jack DiPietro", role: "Buildings & Grounds", category: "ministry_leader", email: null, phone: null, sort_order: 58 },

  // RCIA
  { name: "Robert Golia", role: "RCIA Leader", category: "ministry_leader", email: "rgolia28@gmail.com", phone: null, sort_order: 60 },
  { name: "Faith Lorenzo", role: "RCIA Leader", category: "ministry_leader", email: "lorenzotrio@gmail.com", phone: null, sort_order: 61 },
];

for (const s of staff) {
  await conn.execute(
    `INSERT INTO staff_members (name, role, category, email, phone, sort_order) VALUES (?, ?, ?, ?, ?, ?)`,
    [s.name, s.role, s.category, s.email, s.phone, s.sort_order]
  );
}
console.log(`Inserted ${staff.length} staff members`);

// ── 2. UPDATE PARISH SCHEDULE (exact bulletin times) ──────────────────────
// From bulletin page 1:
// Sunday Mass: 8:30am, 10:30am, 12:30pm (*No 12:30 Mass July 5 – Sept 6, resumes 9/13/26)
// Saturday Vigil: 5:30pm
// Daily Mass: Tuesday – Friday: 8:30am
// Holy Days: 8:30am, 12:10pm, 7:30pm
// Confession: Saturday 4:30–5:15pm and by appointment (No Confessions on Holy Saturday)
// Rosary: Thursdays at 7:30pm
// First Fridays (Sept–June): Exposition of the Blessed Sacrament 9am–7pm

const schedule = {
  services: [
    // Saturday Vigil
    { id: "sat-vigil", day: "Saturday", time: "5:30 PM", label: "Mass (Vigil)", type: "mass", location: "Main Church" },
    // Sunday
    { id: "sun-830", day: "Sunday", time: "8:30 AM", label: "Mass", type: "mass", location: "Main Church" },
    { id: "sun-1030", day: "Sunday", time: "10:30 AM", label: "Mass", type: "mass", location: "Main Church" },
    { id: "sun-1230", day: "Sunday", time: "12:30 PM", label: "Mass", type: "mass", location: "Main Church", note: "No 12:30 Mass July 5 – Sept 6 (Resumes 9/13/26)" },
    // Daily Mass Tue–Fri
    { id: "tue-830", day: "Tuesday", time: "8:30 AM", label: "Mass", type: "mass", location: "Main Church" },
    { id: "wed-830", day: "Wednesday", time: "8:30 AM", label: "Mass", type: "mass", location: "Main Church" },
    { id: "thu-830", day: "Thursday", time: "8:30 AM", label: "Mass", type: "mass", location: "Main Church" },
    { id: "fri-830", day: "Friday", time: "8:30 AM", label: "Mass", type: "mass", location: "Main Church" },
    // Confession
    { id: "sat-confession", day: "Saturday", time: "4:30 PM", label: "Confession", type: "confession", location: "Main Church", note: "4:30–5:15 PM · Also by appointment · No Confessions on Holy Saturday" },
    // Rosary
    { id: "thu-rosary", day: "Thursday", time: "7:30 PM", label: "Rosary", type: "devotion", location: "Main Church" },
    // First Friday Adoration
    { id: "fri-adoration", day: "Friday", time: "9:00 AM", label: "First Friday Adoration", type: "devotion", location: "Main Church", note: "First Fridays, Sept–June · Exposition of the Blessed Sacrament 9 AM – 7 PM" },
  ],
  holyDays: [
    { time: "8:30 AM", label: "Mass" },
    { time: "12:10 PM", label: "Mass" },
    { time: "7:30 PM", label: "Mass" },
  ],
};

await conn.execute(
  `UPDATE site_settings SET value = ? WHERE \`key\` = 'parish_schedule'`,
  [JSON.stringify(schedule)]
);
console.log("Updated parish_schedule");

// ── 3. UPDATE PARISH INFO ──────────────────────────────────────────────────
const info = {
  name: "Church of St. Patrick in Armonk",
  address: "29 Cox Avenue, Armonk, NY 10504",
  mailingAddress: "PO Box 6, Armonk, NY 10504",
  phone: "914-273-9724",
  cell: "914-531-1760",
  website: "www.stpatrickinarmonk.org",
  officeEmail: "office@stpatrickinarmonk.org",
  officeHours: "Monday–Thursday: 9:00 AM – 5:00 PM",
  pastor: "Rev. Thadeus Aravindathu",
  pastorEmail: "pastor.stpats@outlook.com",
  pastorPhone: "845-490-9307",
  religiousEdEmail: "reled@stpatrickinarmonk.org",
  religiousEdPhone: "914-273-8226",
  tagline: "God Bless the Whole World, No Exceptions",
};

await conn.execute(
  `UPDATE site_settings SET value = ? WHERE \`key\` = 'parish_info'`,
  [JSON.stringify(info)]
);
console.log("Updated parish_info");

await conn.end();
console.log("\n✅ All updates complete from June 21 bulletin");
