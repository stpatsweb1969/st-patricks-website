/**
 * Comprehensive Parish Data Seed Script
 * Seeds: staff members, holy days, FAQs, site settings (parish schedule + parish info + ICS URLs),
 * volunteer needs, and important dates.
 *
 * Run: node scripts/seed-parish-data.mjs
 */
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const conn = await mysql.createConnection(DATABASE_URL);
console.log("✅ Connected to database");

// ─── 1. CLEAR TEST DATA ────────────────────────────────────────────────────────
await conn.execute("DELETE FROM staff_members WHERE name = 'Admin Test'");
console.log("🧹 Cleared test staff data");

// ─── 2. STAFF MEMBERS ─────────────────────────────────────────────────────────
const staffData = [
  // Clergy
  { name: "Fr. Thadeus Aravindathu", role: "Pastor", category: "clergy", phone: "(914) 531-1760", email: "Pastor.stpats@outlook.com", sortOrder: 1 },
  { name: "Deacon John Erickson", role: "Permanent Deacon", category: "clergy", phone: "(914) 531-1760", email: "john.erickson@stpatrickinarmonk.org", sortOrder: 2 },

  // Parish Staff
  { name: "Donna Guarnieri", role: "Parish Secretary", category: "staff", phone: "(914) 273-9724", email: "office@stpatrickinarmonk.org", sortOrder: 1 },
  { name: "Maureen Brannigan", role: "Director of Religious Education", category: "staff", phone: "(914) 531-1759", email: "reled@stpatrickinarmonk.org", sortOrder: 2 },
  { name: "Cathy Condon", role: "Business Manager", category: "staff", phone: "(914) 273-9724", email: "office@stpatrickinarmonk.org", sortOrder: 3 },
  { name: "Diane Giordano", role: "Bulletin Editor", category: "staff", phone: "(914) 531-1760", email: "bulletin.editor@stpatrickinarmonk.org", sortOrder: 4 },
  { name: "Kathleen Malone", role: "Music Director", category: "staff", email: "MusicAtStPats@gmail.com", sortOrder: 5 },
  { name: "Teen Life Coordinator", role: "Youth Ministry Coordinator", category: "staff", email: "teenlife@stpatrickinarmonk.org", sortOrder: 6 },
  { name: "Gym Manager", role: "St. Francis Hall Manager", category: "staff", phone: "(914) 468-5938", email: "gym@stpatrickinarmonk.org", sortOrder: 7 },

  // Parish Leadership
  { name: "Parish Council President", role: "Parish Council President", category: "leadership", email: "ParishCouncilPresident@stpatrickinarmonk.org", sortOrder: 1 },
  { name: "Finance Committee Chair", role: "Finance Committee Chairman", category: "leadership", sortOrder: 2 },
  { name: "Building & Grounds Chair", role: "Building & Grounds Committee", category: "leadership", sortOrder: 3 },

  // Ministry Leaders
  { name: "Food Pantry Coordinator", role: "Food Pantry / Share & Care", category: "ministry_leader", email: "FoodPantry@stpatrickinarmonk.org", sortOrder: 1 },
  { name: "Project Embrace Coordinator", role: "Project Embrace", category: "ministry_leader", email: "projectembrace@parishmail.com", sortOrder: 2 },
  { name: "Walking With Purpose Leader", role: "Walking With Purpose", category: "ministry_leader", phone: "(914) 273-9483", sortOrder: 3 },
  { name: "Contemplative Prayer Leader", role: "Contemplative Prayer Group", category: "ministry_leader", phone: "(914) 767-9096", email: "ContemplativePrayer@stpatrickinarmonk.org", sortOrder: 4 },
  { name: "FIAT Leader", role: "FIAT Women's Ministry", category: "ministry_leader", sortOrder: 5 },
  { name: "Blaze Ministry Leader", role: "Blaze Girls Ministry (Gr. 7–8)", category: "ministry_leader", phone: "(914) 531-1759", sortOrder: 6 },
  { name: "Lector Coordinator", role: "Lectors Ministry", category: "ministry_leader", sortOrder: 7 },
  { name: "Eucharistic Ministers Coordinator", role: "Extraordinary Ministers of Holy Communion", category: "ministry_leader", sortOrder: 8 },
  { name: "Altar Servers Coordinator", role: "Altar Servers", category: "ministry_leader", sortOrder: 9 },
  { name: "Ushers Coordinator", role: "Ushers & Greeters", category: "ministry_leader", sortOrder: 10 },
];

// Check existing staff
const [existingStaff] = await conn.execute("SELECT COUNT(*) as cnt FROM staff_members");
if (existingStaff[0].cnt === 0) {
  for (const s of staffData) {
    await conn.execute(
      "INSERT INTO staff_members (name, role, category, phone, email, sort_order) VALUES (?, ?, ?, ?, ?, ?)",
      [s.name, s.role, s.category, s.phone || null, s.email || null, s.sortOrder]
    );
  }
  console.log(`✅ Seeded ${staffData.length} staff members`);
} else {
  console.log(`ℹ️  Staff already has ${existingStaff[0].cnt} records, skipping`);
}

// ─── 3. HOLY DAYS ─────────────────────────────────────────────────────────────
const holyDays = [
  { name: "Mary, Mother of God (New Year's Day)", date: "2026-01-01", massTimes: JSON.stringify(["8:30 AM", "12:10 PM"]), category: "holy_day", notes: "Holy Day of Obligation" },
  { name: "Ash Wednesday", date: "2026-02-18", massTimes: JSON.stringify(["8:30 AM", "12:10 PM", "7:30 PM"]), category: "seasonal", notes: "Beginning of Lent. Ashes distributed at all Masses." },
  { name: "Palm Sunday", date: "2026-03-29", massTimes: JSON.stringify(["8:30 AM", "10:30 AM", "12:30 PM"]), category: "triduum", notes: "Regular Sunday schedule with palms blessed at all Masses." },
  { name: "Holy Thursday", date: "2026-04-02", massTimes: JSON.stringify(["7:30 PM"]), category: "triduum", notes: "Mass of the Lord's Supper. Adoration follows until midnight." },
  { name: "Good Friday", date: "2026-04-03", massTimes: JSON.stringify(["3:00 PM"]), category: "triduum", notes: "Celebration of the Lord's Passion. No Mass — Liturgy of the Word, Veneration of the Cross, and Communion." },
  { name: "Easter Vigil", date: "2026-04-04", massTimes: JSON.stringify(["8:00 PM"]), category: "triduum", notes: "The Great Easter Vigil — the holiest night of the year." },
  { name: "Easter Sunday", date: "2026-04-05", massTimes: JSON.stringify(["8:30 AM", "10:30 AM", "12:30 PM"]), category: "triduum", notes: "He is Risen! Regular Sunday schedule." },
  { name: "Ascension of the Lord", date: "2026-05-14", massTimes: JSON.stringify(["8:30 AM", "12:10 PM", "7:30 PM"]), category: "holy_day", notes: "Holy Day of Obligation in the Archdiocese of New York." },
  { name: "Pentecost Sunday", date: "2026-05-24", massTimes: JSON.stringify(["8:30 AM", "10:30 AM", "12:30 PM"]), category: "seasonal", notes: "Regular Sunday schedule." },
  { name: "Assumption of the Blessed Virgin Mary", date: "2026-08-15", massTimes: JSON.stringify(["8:30 AM", "12:10 PM", "7:30 PM"]), category: "holy_day", notes: "Holy Day of Obligation." },
  { name: "All Saints Day", date: "2026-11-01", massTimes: JSON.stringify(["8:30 AM", "12:10 PM", "7:30 PM"]), category: "holy_day", notes: "Holy Day of Obligation." },
  { name: "Immaculate Conception", date: "2026-12-08", massTimes: JSON.stringify(["8:30 AM", "12:10 PM", "7:30 PM"]), category: "holy_day", notes: "Holy Day of Obligation. Patronal feast of the United States." },
  { name: "Christmas Eve", date: "2026-12-24", massTimes: JSON.stringify(["4:00 PM", "8:00 PM", "10:00 PM"]), category: "seasonal", notes: "Christmas Eve Masses. Please arrive early — church fills quickly." },
  { name: "Christmas Day", date: "2026-12-25", massTimes: JSON.stringify(["8:30 AM", "10:30 AM"]), category: "holy_day", notes: "Holy Day of Obligation." },
];

const [existingHD] = await conn.execute("SELECT COUNT(*) as cnt FROM holy_days");
if (existingHD[0].cnt === 0) {
  for (const hd of holyDays) {
    await conn.execute(
      "INSERT INTO holy_days (name, date, mass_times, category, notes) VALUES (?, ?, ?, ?, ?)",
      [hd.name, hd.date, hd.massTimes, hd.category, hd.notes || null]
    );
  }
  console.log(`✅ Seeded ${holyDays.length} holy days`);
} else {
  console.log(`ℹ️  Holy days already has ${existingHD[0].cnt} records, skipping`);
}

// ─── 4. FAQs ──────────────────────────────────────────────────────────────────
const faqs = [
  // Mass & Worship
  { question: "What are the Mass times?", answer: "Saturday Vigil: 5:30 PM. Sunday: 8:30 AM, 10:30 AM, and 12:30 PM (October–June only). Weekday Mass: Tuesday–Friday at 8:30 AM. There is no Monday Mass.", category: "mass", sortOrder: 1 },
  { question: "When is Confession?", answer: "Confessions are heard every Saturday from 4:30–5:15 PM, before the Vigil Mass. Confession is also available by appointment — call the parish office at (914) 273-9724.", category: "mass", sortOrder: 2 },
  { question: "Is there a 12:30 PM Sunday Mass year-round?", answer: "No — the 12:30 PM Sunday Mass is seasonal. It runs from the first Sunday in October through Labor Day weekend (approximately September). It is suspended during the summer months.", category: "mass", sortOrder: 3 },
  { question: "What is First Friday Adoration?", answer: "On the first Friday of each month (September through June), Exposition of the Blessed Sacrament takes place from 9:00 AM to 7:00 PM following the 8:30 AM Mass. All are welcome to come and pray.", category: "mass", sortOrder: 4 },
  { question: "Is there a Rosary?", answer: "Yes — the Rosary is prayed every Thursday evening at 7:30 PM in the church.", category: "mass", sortOrder: 5 },

  // Sacraments
  { question: "How do I register my child for Baptism?", answer: "Complete the online Baptism Registration form on our website under Sacraments → Baptism. A parish staff member will contact you to schedule a date and the required pre-baptism meeting. Baptisms are typically celebrated on Sundays after the 10:30 AM Mass.", category: "sacraments", sortOrder: 1 },
  { question: "How do I schedule a wedding at St. Patrick's?", answer: "Complete the Marriage Inquiry form on our website at least 12 months before your desired wedding date. One party must be a registered parishioner. Pre-Cana preparation is required. Contact the parish office for more details.", category: "sacraments", sortOrder: 2 },
  { question: "How do I arrange a funeral Mass?", answer: "Please call the parish office at (914) 273-9724 as soon as possible. You can also complete the Funeral Pre-Planning form on our website. Our staff will work with you and the funeral home to arrange everything.", category: "sacraments", sortOrder: 3 },
  { question: "How do I request a Mass Intention?", answer: "Mass Intentions can be requested online through our website or by contacting the parish office. A suggested offering is $20. Intentions are listed in the weekly bulletin.", category: "sacraments", sortOrder: 4 },
  { question: "What is a Sponsor Certificate?", answer: "A Sponsor Certificate (also called a Godparent Certificate) confirms that a sponsor for Baptism or Confirmation is a practicing Catholic in good standing. Complete the Sponsor Certificate form on our website and we will process it for you.", category: "sacraments", sortOrder: 5 },

  // Faith Formation
  { question: "How do I register my child for CCD (Religious Education)?", answer: "CCD registration is open each spring for the following school year. Complete the online CCD Registration form on our website under Faith Formation → Religious Education. Classes are for grades 1–8.", category: "faith_formation", sortOrder: 1 },
  { question: "What are the CCD class times?", answer: "Grades 1–2: Wednesdays 3:45–4:45 PM. Grades 3–4: Wednesdays 3:30–4:45 PM. Grades 5–8: Mondays 5:00–6:00 PM or Wednesdays 6:00–7:00 PM. Classes meet at the parish school building.", category: "faith_formation", sortOrder: 2 },
  { question: "What is RCIA?", answer: "RCIA (Rite of Christian Initiation of Adults) is the process for adults who wish to become Catholic, or for baptized Catholics who wish to complete their sacraments. Contact the parish office for information on when the next RCIA session begins.", category: "faith_formation", sortOrder: 3 },
  { question: "What is Teen Life?", answer: "Teen Life is our youth ministry program for high school students (grades 9–12). It meets regularly at St. Francis Hall and includes service projects, retreats, and faith discussions. Email teenlife@stpatrickinarmonk.org for more information.", category: "faith_formation", sortOrder: 4 },

  // Parish Life
  { question: "How do I register as a parishioner?", answer: "Welcome! Complete the Parish Registration form on our website under About → Parish Registration, or pick up a registration card at the parish office. Registered parishioners receive the weekly bulletin and can request sacramental letters.", category: "parish", sortOrder: 1 },
  { question: "What are the parish office hours?", answer: "The parish office is open Monday–Thursday, 9:00 AM–5:00 PM. The office is closed on Fridays. You can reach us at (914) 273-9724 or office@stpatrickinarmonk.org.", category: "parish", sortOrder: 2 },
  { question: "Where is St. Patrick Church located?", answer: "We are located at 29 Cox Avenue, Armonk, NY 10504. We are in the heart of Armonk village, easily accessible from Route 22 and I-684.", category: "parish", sortOrder: 3 },
  { question: "How do I give online?", answer: "You can give online through our website at the Give page, which links to our WeShare online giving platform. You can make a one-time gift or set up recurring giving. We also accept Venmo @StPatricksArmonk.", category: "parish", sortOrder: 4 },
  { question: "How do I subscribe to the parish bulletin?", answer: "The weekly bulletin is available on our website each Sunday. To receive it by email, sign up through Flocknote at stpatarmonk.flocknote.com/home or use the subscription form on our Bulletins page.", category: "parish", sortOrder: 5 },
  { question: "What is Flocknote?", answer: "Flocknote is our parish communication platform. Sign up at stpatarmonk.flocknote.com/home to receive the weekly bulletin, CCD reminders, and important parish announcements by email or text.", category: "parish", sortOrder: 6 },
];

const [existingFAQ] = await conn.execute("SELECT COUNT(*) as cnt FROM parish_faqs");
if (existingFAQ[0].cnt === 0) {
  for (const faq of faqs) {
    await conn.execute(
      "INSERT INTO parish_faqs (question, answer, category, sortOrder, active) VALUES (?, ?, ?, ?, 1)",
      [faq.question, faq.answer, faq.category, faq.sortOrder]
    );
  }
  console.log(`✅ Seeded ${faqs.length} FAQs`);
} else {
  console.log(`ℹ️  FAQs already has ${existingFAQ[0].cnt} records, skipping`);
}

// ─── 5. SITE SETTINGS ─────────────────────────────────────────────────────────
const parishSchedule = {
  services: [
    { type: "mass", name: "Mass", dayOfWeek: 0, time: "8:30 AM", durationMin: 60 },
    { type: "mass", name: "Mass", dayOfWeek: 0, time: "10:30 AM", durationMin: 60 },
    { type: "mass", name: "Mass", dayOfWeek: 0, time: "12:30 PM", durationMin: 60, seasonal: { months: [9,10,11,12,1,2,3,4,5,6], note: "No 12:30 PM Mass from 1st Sunday in July through Labor Day weekend (resumes mid-September)" } },
    { type: "mass", name: "Mass", dayOfWeek: 2, time: "8:30 AM", durationMin: 30 },
    { type: "mass", name: "Mass", dayOfWeek: 3, time: "8:30 AM", durationMin: 30 },
    { type: "mass", name: "Mass", dayOfWeek: 4, time: "8:30 AM", durationMin: 30 },
    { type: "prayer", name: "Rosary", dayOfWeek: 4, time: "7:30 PM", durationMin: 30 },
    { type: "mass", name: "Mass", dayOfWeek: 5, time: "8:30 AM", durationMin: 30 },
    { type: "adoration", name: "First Friday Adoration", dayOfWeek: 5, time: "9:00 AM", durationMin: 600, seasonal: { months: [9,10,11,12,1,2,3,4,5,6], note: "First Fridays, Sept–June, 9 AM – 7 PM" }, firstOfMonth: true, note: "Exposition of the Blessed Sacrament" },
    { type: "confession", name: "Confession", dayOfWeek: 6, time: "4:30 PM", durationMin: 45 },
    { type: "mass", name: "Vigil Mass", dayOfWeek: 6, time: "5:30 PM", durationMin: 60 },
  ],
  holyDays: [
    { month: 1, day: 1, name: "Mary, Mother of God", massTimes: ["8:30 AM", "12:10 PM"] },
    { month: 8, day: 15, name: "Assumption of the Blessed Virgin Mary", massTimes: ["8:30 AM", "12:10 PM", "7:30 PM"] },
    { month: 11, day: 1, name: "All Saints Day", massTimes: ["8:30 AM", "12:10 PM", "7:30 PM"] },
    { month: 12, day: 8, name: "Immaculate Conception", massTimes: ["8:30 AM", "12:10 PM", "7:30 PM"] },
    { month: 12, day: 25, name: "Christmas Day", massTimes: ["8:30 AM", "10:30 AM"] },
  ]
};

const parishInfo = {
  name: "St. Patrick in Armonk",
  address: "29 Cox Avenue",
  city: "Armonk",
  state: "NY",
  zip: "10504",
  phone: "(914) 273-9724",
  officeEmail: "office@stpatrickinarmonk.org",
  officeHours: "Mon–Thu 9:00 AM – 5:00 PM",
  pastorName: "Fr. Thadeus Aravindathu",
  pastorEmail: "Pastor.stpats@outlook.com",
  flocknoteUrl: "https://stpatarmonk.flocknote.com/home",
  youtubeUrl: "https://www.youtube.com/@StPatricksArmonk",
  youtubeChannelId: "UCVAmgwg8dltHe98xw95ZsKw",
  mapCoordinates: { lat: 41.1264, lng: -73.7137 }
};

const siteSettings = [
  { key: "parish_schedule", value: JSON.stringify(parishSchedule) },
  { key: "parish_info", value: JSON.stringify(parishInfo) },
  { key: "parish_ics_url", value: "https://calendar.google.com/calendar/ical/stpatrickinarmonk.org_parish%40group.calendar.google.com/public/basic.ics" },
  { key: "ccd_ics_url", value: "https://calendar.google.com/calendar/ical/reled%40stpatrickinarmonk.org/public/basic.ics" },
  { key: "cyo_ics_url", value: "https://calendar.google.com/calendar/ical/stpatrickinarmonk.org_5snqr5qqph11et22r6sk81k67g%40group.calendar.google.com/public/basic.ics" },
];

for (const setting of siteSettings) {
  const [existing] = await conn.execute("SELECT id FROM site_settings WHERE `key` = ?", [setting.key]);
  if (existing.length === 0) {
    await conn.execute("INSERT INTO site_settings (`key`, value) VALUES (?, ?)", [setting.key, setting.value]);
    console.log(`✅ Seeded site setting: ${setting.key}`);
  } else {
    await conn.execute("UPDATE site_settings SET value = ? WHERE `key` = ?", [setting.value, setting.key]);
    console.log(`🔄 Updated site setting: ${setting.key}`);
  }
}

// ─── 6. VOLUNTEER NEEDS ───────────────────────────────────────────────────────
const volunteerNeeds = [
  { title: "Lector", description: "Proclaim the Word of God at weekend Masses. Training provided.", category: "liturgy", urgency: "medium", spotsNeeded: 10 },
  { title: "Extraordinary Minister of Holy Communion", description: "Assist with the distribution of Holy Communion at Mass.", category: "liturgy", urgency: "medium", spotsNeeded: 15 },
  { title: "Altar Server", description: "Serve at the altar during Mass. Open to youth and adults.", category: "liturgy", urgency: "medium", spotsNeeded: 20 },
  { title: "Usher / Greeter", description: "Welcome parishioners, assist with seating, and take up the collection.", category: "liturgy", urgency: "medium", spotsNeeded: 12 },
  { title: "Food Pantry Volunteer", description: "Help distribute food to families in need through our Share & Care Food Pantry.", category: "outreach", urgency: "high", spotsNeeded: 8 },
  { title: "CCD Catechist", description: "Teach religious education classes for grades 1–8. Faith formation training provided.", category: "education", urgency: "high", spotsNeeded: 6 },
  { title: "CCD Aide / Substitute", description: "Assist catechists in the classroom or substitute when needed.", category: "education", urgency: "medium", spotsNeeded: 5 },
  { title: "Teen Life Youth Minister", description: "Help lead and organize Teen Life activities and events for high school students.", category: "youth", urgency: "medium", spotsNeeded: 3 },
  { title: "Hospitality Committee", description: "Help organize parish social events, coffee hours, and community gatherings.", category: "community", urgency: "medium", spotsNeeded: 10 },
  { title: "Bereavement Ministry", description: "Provide comfort and support to families who have lost a loved one.", category: "pastoral", urgency: "medium", spotsNeeded: 5 },
];

const [existingVN] = await conn.execute("SELECT COUNT(*) as cnt FROM volunteer_needs");
if (existingVN[0].cnt === 0) {
  for (const vn of volunteerNeeds) {
    await conn.execute(
      "INSERT INTO volunteer_needs (title, description, category, urgency, spotsNeeded, spotsFilled, active) VALUES (?, ?, ?, ?, ?, 0, 1)",
      [vn.title, vn.description, vn.category, vn.urgency, vn.spotsNeeded]
    );
  }
  console.log(`✅ Seeded ${volunteerNeeds.length} volunteer needs`);
} else {
  console.log(`ℹ️  Volunteer needs already has ${existingVN[0].cnt} records, skipping`);
}

// ─── 7. IMPORTANT DATES ───────────────────────────────────────────────────────
const importantDates = [
  // CCD 2026-27
  { title: "CCD Registration Opens for 2026–27", eventDate: "2026-04-01", category: "ccd", location: "Online / Parish Office", published: 1 },
  { title: "CCD First Day of Classes", eventDate: "2026-09-16", category: "ccd", location: "Parish School Building", published: 1 },
  { title: "First Holy Communion", eventDate: "2026-05-02", category: "sacrament", location: "St. Patrick Church", note: "2nd Grade", published: 1 },
  { title: "Confirmation", eventDate: "2026-05-09", category: "sacrament", location: "St. Patrick Church", note: "8th Grade", published: 1 },
  { title: "CCD Last Day of Classes", eventDate: "2026-05-20", category: "ccd", location: "Parish School Building", published: 1 },
  // Parish events
  { title: "Parish Picnic", eventDate: "2026-09-13", category: "social", location: "Parish Grounds", published: 1 },
  { title: "All Saints Day Mass", eventDate: "2026-11-01", category: "parish", location: "St. Patrick Church", note: "Holy Day of Obligation", published: 1 },
  { title: "Advent Begins", eventDate: "2026-11-29", category: "parish", location: "St. Patrick Church", published: 1 },
  { title: "Christmas Eve Masses", eventDate: "2026-12-24", category: "parish", location: "St. Patrick Church", note: "4:00 PM, 8:00 PM, 10:00 PM", published: 1 },
  // CYO
  { title: "CYO Basketball Season Begins", eventDate: "2026-11-07", category: "cyo", location: "St. Francis Hall", note: "Grades 3–8", published: 1 },
  { title: "CYO Basketball Season Ends", eventDate: "2027-03-14", category: "cyo", location: "St. Francis Hall", published: 1 },
  // Teen Life
  { title: "Teen Life Retreat", eventDate: "2026-10-17", category: "teen_life", location: "TBD", published: 1 },
];

const [existingID] = await conn.execute("SELECT COUNT(*) as cnt FROM important_dates");
if (existingID[0].cnt === 0) {
  for (const d of importantDates) {
    await conn.execute(
      "INSERT INTO important_dates (title, eventDate, category, location, note, published) VALUES (?, ?, ?, ?, ?, ?)",
      [d.title, d.eventDate, d.category, d.location || null, d.note || null, d.published]
    );
  }
  console.log(`✅ Seeded ${importantDates.length} important dates`);
} else {
  console.log(`ℹ️  Important dates already has ${existingID[0].cnt} records, skipping`);
}

await conn.end();
console.log("\n🎉 Seed complete!");
