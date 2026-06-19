/**
 * Update staff_members table with accurate data from the June 21, 2026 bulletin.
 * The bulletin is the single source of truth.
 * Run: node scripts/update-staff-from-bulletin.mjs
 */

import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Clear all existing staff and re-seed from bulletin
await conn.execute('DELETE FROM staff_members');
console.log('Cleared existing staff records.');

const staff = [
  // ── CLERGY ──────────────────────────────────────────────────────────────────
  {
    name: 'Rev. Thadeus Aravindathu',
    role: 'Pastor',
    category: 'clergy',
    email: 'pastor.stpats@outlook.com',
    phone: '845-490-9307',
    sortOrder: 1,
  },
  {
    name: 'Fr. John Vigilanti',
    role: 'Weekend Associate',
    category: 'clergy',
    email: null,
    phone: null,
    sortOrder: 2,
  },

  // ── PARISH OFFICE ────────────────────────────────────────────────────────────
  {
    name: 'Linda Maffia',
    role: 'Office Administrative Assistant / Gym Rentals',
    category: 'staff',
    email: 'office@stpatrickinarmonk.org',
    phone: '914-273-9724',
    sortOrder: 10,
  },
  {
    name: 'Tania DeLuca',
    role: 'Bookkeeper',
    category: 'staff',
    email: 'tania@stpatrickinarmonk.org',
    phone: null,
    sortOrder: 11,
  },
  {
    name: 'Maureen McNamara',
    role: 'Bulletin Editor',
    category: 'staff',
    email: 'bulletin.editor@stpatrickinarmonk.org',
    phone: null,
    sortOrder: 12,
  },
  {
    name: 'John Failla',
    role: 'Music Director',
    category: 'staff',
    email: 'MusicAtStPats@gmail.com',
    phone: null,
    sortOrder: 13,
  },

  // ── RELIGIOUS EDUCATION ──────────────────────────────────────────────────────
  {
    name: 'Sarah Aliotta',
    role: 'Religious Education Coordinator',
    category: 'staff',
    email: 'reled@stpatrickinarmonk.org',
    phone: '914-273-8226',
    sortOrder: 20,
  },
  {
    name: 'John Erickson',
    role: 'Religious Education Assistant',
    category: 'staff',
    email: 'reled@stpatrickinarmonk.org',
    phone: '914-531-1759',
    sortOrder: 21,
  },

  // ── PARISH COUNCIL / LEADERSHIP ──────────────────────────────────────────────
  {
    name: 'Leo Greco',
    role: 'Parish Council President',
    category: 'leadership',
    email: null,
    phone: null,
    sortOrder: 30,
  },
  {
    name: 'Tina Mannix',
    role: 'Parish Council Secretary',
    category: 'leadership',
    email: null,
    phone: null,
    sortOrder: 31,
  },
  {
    name: 'John Di Capua',
    role: 'Finance Committee Chairman',
    category: 'leadership',
    email: null,
    phone: null,
    sortOrder: 32,
  },
  {
    name: 'Colin McBride',
    role: 'Parish Trustee',
    category: 'leadership',
    email: null,
    phone: null,
    sortOrder: 33,
  },
  {
    name: 'Maria Tedesco',
    role: 'Parish Trustee',
    category: 'leadership',
    email: null,
    phone: null,
    sortOrder: 34,
  },

  // ── PARISH MINISTRIES ────────────────────────────────────────────────────────
  {
    name: 'Gwen Torre',
    role: 'Youth Ministry',
    category: 'ministry_leader',
    email: null,
    phone: null,
    sortOrder: 40,
  },
  {
    name: 'Elvis Grgurovic',
    role: 'CYO Basketball',
    category: 'ministry_leader',
    email: null,
    phone: null,
    sortOrder: 41,
  },
  {
    name: 'Kevin Mannix',
    role: 'CYO Basketball',
    category: 'ministry_leader',
    email: null,
    phone: null,
    sortOrder: 42,
  },
  {
    name: 'Mike Corelli',
    role: 'Gym Schedule',
    category: 'ministry_leader',
    email: null,
    phone: null,
    sortOrder: 43,
  },
  {
    name: 'Margaret Poppo',
    role: 'Walking With Purpose',
    category: 'ministry_leader',
    email: null,
    phone: null,
    sortOrder: 44,
  },
  {
    name: 'Tania DeLuca',
    role: 'Walking With Purpose',
    category: 'ministry_leader',
    email: 'tania@stpatrickinarmonk.org',
    phone: null,
    sortOrder: 45,
  },
  {
    name: 'Judith Grech',
    role: 'Food First Program',
    category: 'ministry_leader',
    email: null,
    phone: null,
    sortOrder: 46,
  },
  {
    name: 'Jack DiPietro',
    role: 'Buildings & Grounds',
    category: 'ministry_leader',
    email: null,
    phone: null,
    sortOrder: 47,
  },
];

// Insert all staff
for (const s of staff) {
  await conn.execute(
    `INSERT INTO staff_members 
      (name, role, category, email, phone, sort_order, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [
      s.name,
      s.role,
      s.category,
      s.email ?? null,
      s.phone ?? null,
      s.sortOrder,
    ]
  );
  console.log(`  ✓ ${s.name} — ${s.title}`);
}

// Also update the parish schedule / site_settings to match bulletin exactly
// Office hours from bulletin: Monday-Thursday 9:00am - 5:00pm (Friday closed)
await conn.execute(
  "UPDATE site_settings SET value = ? WHERE `key` = 'parish_info'",
  [JSON.stringify({
    name: "Church of St. Patrick in Armonk",
    address: "29 Cox Avenue, Armonk, NY 10504",
    mailingAddress: "PO Box 6, Armonk, NY 10504",
    phone: "914-273-9724",
    cellPhone: "914-531-1760",
    website: "www.stpatrickinarmonk.org",
    officeHours: "Monday–Thursday: 9:00am–5:00pm",
    pastor: "Rev. Thadeus Aravindathu",
    pastoralEmail: "pastor.stpats@outlook.com",
    officeEmail: "office@stpatrickinarmonk.org",
    youtubeHandle: "@StPatricksArmonk",
    youtubeChannelId: "UCVAmgwg8dltHe98xw95ZsKw",
    flocknoteUrl: "https://stpatarmonk.flocknote.com/home",
  })]
);
console.log('\n✓ Updated parish_info in site_settings');

// Update parish schedule to match bulletin exactly
await conn.execute(
  "UPDATE site_settings SET value = ? WHERE `key` = 'parish_schedule'",
  [JSON.stringify({
    sundayMass: ["8:30am", "10:30am", "12:30pm*"],
    sundayMassNote: "*No 12:30 Mass July 5 – September 6 (Resumes 9/13/26)",
    saturdayVigil: "5:30pm",
    weekdayMass: "Tuesday–Friday: 8:30am",
    holyDayMass: ["8:30am", "12:10pm", "7:30pm"],
    confession: "Saturday 4:30–5:15pm and by appointment (No Confessions on Holy Saturday)",
    rosary: "Thursdays at 7:30pm",
    firstFridayAdoration: "Exposition of the Blessed Sacrament: 9am–7pm (September–June)",
  })]
);
console.log('✓ Updated parish_schedule in site_settings');

await conn.end();
console.log('\n✅ All staff and parish info updated from June 21, 2026 bulletin.');
