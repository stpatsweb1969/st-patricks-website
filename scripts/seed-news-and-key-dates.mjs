/**
 * seed-news-and-key-dates.mjs
 *
 * 1. Clears and re-seeds news_posts from the June 21, 2026 bulletin
 * 2. Clears and re-seeds important_dates for 2026-2027 (Parish BBQ excluded — canceled)
 *
 * Run: node scripts/seed-news-and-key-dates.mjs
 */

import mysql from "mysql2/promise";

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// ─── NEWS POSTS ───────────────────────────────────────────────────────────────

const newsPosts = [
  {
    title: "Ice Cream Social — Sunday, June 21 After 10:30 Mass",
    excerpt: "Beat the heat and kick off a cool summer at St. Patrick's! Join us for fellowship and ice cream outside the church after the 10:30 Mass, courtesy of American Swirl.",
    content: `<p>Beat the heat and kick off a cool summer at St. Patrick's! Please join us for fellowship and ice cream outside the church after the 10:30 Mass on <strong>Sunday, June 21</strong>.</p><p><em>Courtesy of: American Swirl Craft Art &amp; Ice Cream Parties</em></p>`,
    publishedAt: new Date("2026-06-21"),
  },
  {
    title: "Blessing of the Toys — Sunday, June 21 at 10:30 Mass",
    excerpt: "Have your child bring their favorite toy to the 10:30 Mass for a special blessing in honor of St. Philip Neri, Patron Saint of Joy. Gently used toy donations welcome.",
    content: `<p>Dear parishioner families,</p><p>Please join us for a Mass dedicated to <strong>St. Philip Neri</strong>, who is known as the Patron Saint of Joy. In celebration, have your child bring their favorite toy to Mass for a special blessing.</p><p>A toy is anything your child loves, adores, and brings JOY — a doll, a sports ball, a sports helmet, a truck, crayons, a 3D-printed figure, a bag, a blanket, a bubble wand, etc.</p><p>Please consider bringing in a gently <em>used</em> toy to donate to bless another child. Donated toys &amp; books will support a local high school community closet. Labeled boxes will be set up in Wallace Hall at the start of Mass.</p><p><em>Forgot a toy? No worries! A basket will be available in Wallace Hall for your child to choose from.</em></p>`,
    publishedAt: new Date("2026-06-21"),
  },
  {
    title: "Happy Father's Day — A Blessing of Fathers",
    excerpt: "On this Father's Day, we hold up the fathers and father figures in our parish community. A prayer of blessing for all who model fatherhood in our midst.",
    content: `<p>God and Father of all creation, we come before you today with humble hearts. You are our model of a loving father.</p><p>When we fail and fall short of your expectations, you are always there at the end of the day with open arms, ready to heal the cuts and scrapes of the day and to encourage us to try again and not to give up.</p><p>We hold up these men in our midst who act in the world as fathers to their children or models of fathers for others.</p><p>Bless them in their moments of doubt and frustration with their children. Give them warm and open hearts to forgive failures. Provide them with the words needed for encouragement and perseverance.</p><p><em>We ask all this in the name of Jesus. Amen.</em></p>`,
    publishedAt: new Date("2026-06-21"),
  },
  {
    title: "Cardinal's Appeal 2026 — We Need Your Support",
    excerpt: "As of June 9, 2026 we have received 71 gifts totaling $37,097 toward our $59,000 goal. We still need $21,903. Please consider supporting the 2026 Cardinal's Appeal.",
    content: `<h3>Cardinal's Appeal Summary as of June 9, 2026</h3><table><tr><td>Goal</td><td>$59,000</td></tr><tr><td>Pledged</td><td>$37,097</td></tr><tr><td>Amount Needed</td><td>$21,903</td></tr><tr><td>Number of Gifts</td><td>71</td></tr></table><p>Please support the 2026 Appeal. You can:</p><ul><li>Use the envelopes in the pews in the church</li><li>Visit the Parish office</li><li>Use the QR Code in the bulletin</li><li>Go directly to <a href="https://cardinalsappeal.org/donate" target="_blank">cardinalsappeal.org/donate</a> and list <strong>St. Patrick, Armonk</strong> as your parish</li></ul>`,
    publishedAt: new Date("2026-06-21"),
  },
  {
    title: "Congratulations to Our Newly Baptized: Giuliana & Lorenzo Paolucci",
    excerpt: "Giuliana Paolucci and Lorenzo Paolucci were baptized on June 6, 2026. Please welcome them to the family of God and our St. Patrick's Parish Community!",
    content: `<p>We joyfully congratulate our newly baptized:</p><p><strong>Giuliana Paolucci and Lorenzo Paolucci</strong><br/>Baptized on June 6, 2026</p><p><strong>Parents:</strong> Samantha &amp; Stefano Paolucci<br/><strong>Godparents:</strong> Patrick &amp; Danielle Hickey and Dino &amp; Alessandra Paolucci</p><p><em>Please welcome them to the family of God and our St. Patrick's Parish Community!</em></p>`,
    publishedAt: new Date("2026-06-21"),
  },
  {
    title: "CCD Registration is Open for 2026-2027",
    excerpt: "Religious Education classes are open for registration. Visit stpatrickinarmonk.org/religiouseducation for class times and registration details.",
    content: `<p>CCD Registration is now open for the 2026-2027 year!</p><p>Please visit <a href="https://stpatrickinarmonk.org/religiouseducation" target="_blank">stpatrickinarmonk.org/religiouseducation</a> for class times and registration details.</p><h3>Catechists Needed</h3><p>CCD Teachers and Co-teachers needed! Classes meet on <strong>Monday and Wednesday afternoons/evenings</strong>. "Team teaching" is welcome!</p><p>Contact Religious Ed Coordinator <strong>Sarah Aliotta</strong>:<br/>Phone: (914) 531-1759<br/>Email: <a href="mailto:reled@stpatrickinarmonk.org">reled@stpatrickinarmonk.org</a></p>`,
    publishedAt: new Date("2026-06-21"),
  },
  {
    title: "St. Patrick's Food First Program — Summer Food Drive",
    excerpt: "St. Patrick's is a Sponsoring Congregation to the Pantry (formerly MKIFP). Please drop off food donations in Wallace Hall. Summer and School's Out Supplement items are especially needed.",
    content: `<p>St. Patrick's Church is a Sponsoring Congregation to <strong>the Pantry</strong> (previously known as MKIFP).</p><h3>Updated Summer Food List</h3><p>Please drop off donations in Wallace Hall:</p><ul><li>Cereal, Hot &amp; Cold</li><li>Canned Black Beans</li><li>Pasta</li><li>Peanut Butter</li><li>Pasta Sauce</li><li>Canned Pineapple</li><li>Canned Corn</li></ul><h3>SOS Most Needed Items (School's Out Supplement)</h3><p>Please drop off donations in Wallace Hall:</p><ul><li>Small applesauce or fruit cups</li><li>Granola bars</li><li>Trail mix</li><li>Small packs of popcorn, veggie straws or other healthier snack options</li><li>Small individual boxes of cereal (single serve)</li><li>Tuna packets</li></ul><p>In addition to the items above, the Pantry's <em>School's Out Supplement (SOS) Program</em> is in need of these additional items. With our support, we can ensure that local children have the nutritious food they need all summer long.</p>`,
    publishedAt: new Date("2026-06-21"),
  },
  {
    title: "CYO Golf Outing — Save the Date: September 21, 2026",
    excerpt: "Mark your calendars! The St. Pat's CYO Golf Outing is scheduled for September 21, 2026 at the Whippoorwill Club.",
    content: `<p>Mark your calendars for the <strong>St. Pat's CYO Golf Outing</strong>!</p><p><strong>Date:</strong> September 21, 2026<br/><strong>Location:</strong> Whippoorwill Club</p><p>More details to follow. Stay tuned to the bulletin and parish website.</p>`,
    publishedAt: new Date("2026-06-21"),
  },
  {
    title: "Teen Life — Calling All Freshmen, Sophomores, Juniors & Seniors",
    excerpt: "Christ is calling you to serve, to lead, and make a difference in the world. Teen Life is looking for leaders from each class year. Visit StPatrickinArmonk.org/teen-life.",
    content: `<p><strong>ATTN: Freshmen, Sophomores, Juniors &amp; Seniors</strong></p><p>Christ is calling you to serve, to lead, and make a difference in the world.</p><p>Teen Life is looking for leaders from each class year. You can make an impact!</p><p>Visit: <a href="https://stpatrickinarmonk.org/teen-life" target="_blank">StPatrickinArmonk.org/teen-life</a></p>`,
    publishedAt: new Date("2026-06-21"),
  },
  {
    title: "Everyday Stewardship: Care for God's Creation",
    excerpt: "\"Two of the greatest gifts from God to each of us are life and time.\" A reflection on stewardship and noticing the beauty of God's creation around us. — Tracy Earl Welliver MTS",
    content: `<p><em>By Tracy Earl Welliver MTS © Liturgical Publications Inc</em></p><p>When I was a teenager, after a homecoming dance one year, I took my date for a walk on the Potomac in downtown Alexandria. The moon was out, and I was struck by how the light shimmered on the ripples. I remember focusing to try to see all the details of the dancing rays on the ripples. My date didn't see it and thought it was no big deal. It was a great fun night but for that one moment we saw the world from two completely different vantage points.</p><p>Two of the greatest gifts from God to each of us are life and time. Without taking care, we can easily miss the grandeur and beauty of both. Being mindful as an everyday steward means pausing to see the detail in all that exists around us. God's creation is not something created with a broad brush but instead with the intricacies of a master painter.</p><p>God created all things with purpose and a complexity only the divine could fully comprehend. Every single hair on our head has been counted!</p><p>But when we take a moment to reflect on the beauty that is created by that complexity, we allow ourselves to revel in God's generosity. There is so much to give thanks for in this life. But you and I can't give thanks to God unless we really stop to take notice. When was the last time you stared in awe at the moon?</p><blockquote><em>"All of heaven and earth belong to the Lord." — Deuteronomy 10:14</em></blockquote>`,
    publishedAt: new Date("2026-06-21"),
  },
];

// ─── KEY DATES 2026-2027 ──────────────────────────────────────────────────────

const keyDates = [
  // 2026 — TBD August
  { title: "S'mores Teen Life Event", dateStr: "2026-08-01", location: "Outside gym", category: "teen_life", note: "TBD August" },

  // September 2026 — Parish BBQ EXCLUDED (canceled)
  { title: "Teen Life Kick Off Event", dateStr: "2026-09-13", location: "Church", category: "teen_life", note: "Sunday, September 13 10:30am Mass" },
  { title: "Blessing of the School Backpacks", dateStr: "2026-09-13", location: "Church", category: "parish", note: "Sunday, September 13 10:30am Mass" },
  { title: "St. Pat's CYO Golf Outing", dateStr: "2026-09-21", location: "Whippoorwill Club", category: "cyo" },
  { title: "CCD Begins", dateStr: "2026-09-28", location: "WH & Classrooms", category: "ccd", note: "Monday September 28 & Wednesday September 30" },

  // October 2026
  { title: "Pasta Night", dateStr: "2026-10-03", location: "Gym", category: "social" },
  { title: "Catechists Mass 10:30am", dateStr: "2026-10-04", location: "Church", category: "parish" },
  { title: "WWP Fall Season Begins", dateStr: "2026-10-04", location: "WH", category: "parish", note: "TBD" },
  { title: "CYO Practice Begins", dateStr: "2026-10-12", location: "Gym", category: "cyo", note: "Week of October 12" },
  { title: "TGIF Event 5:30–7pm", dateStr: "2026-10-16", location: "Gym & WH", category: "social" },
  { title: "HS Paint & Pizza", dateStr: "2026-10-22", location: "WH", category: "teen_life" },
  { title: "Trunk or Treat (before 5:30pm Mass)", dateStr: "2026-10-24", location: "Church / Gym", category: "parish", note: "4pm–5pm" },

  // November 2026
  { title: "All Saints Day Mass", dateStr: "2026-11-01", location: "Church", category: "parish" },
  { title: "Teen Life DeCicco's Food Drive", dateStr: "2026-11-07", location: "DeCicco's Armonk", category: "teen_life", note: "Saturday, November 7 (or 14)" },
  { title: "First Weekend of CYO Games", dateStr: "2026-11-21", location: "Gym", category: "cyo", note: "Saturday November 21 & Sunday November 22" },
  { title: "CYO Mass at 10:30am", dateStr: "2026-11-22", location: "Church", category: "cyo" },
  { title: "Advent Begins", dateStr: "2026-11-29", location: "Church", category: "parish" },

  // December 2026
  { title: "WWP Fall Season Ends", dateStr: "2026-12-01", location: "WH", category: "parish", note: "TBD" },
  { title: "Teen Life HS Advent Party", dateStr: "2026-12-04", location: "Gym", category: "teen_life" },
  { title: "Breakfast with Santa", dateStr: "2026-12-06", location: "Gym", category: "social" },
  { title: "TGIF Event 12noon–2pm", dateStr: "2026-12-11", location: "Gym & WH", category: "social" },
  { title: "Last Day of CCD for 2026", dateStr: "2026-12-14", location: "WH & Classrooms", category: "ccd", note: "Monday December 14 & Wednesday December 16" },
  { title: "Christmas Pageant", dateStr: "2026-12-20", location: "Church", category: "parish" },

  // 2027 — January
  { title: "CCD Reopens", dateStr: "2027-01-04", location: "WH & Classrooms", category: "ccd" },
  { title: "WWP Spring Season Begins", dateStr: "2027-01-04", location: "Gym & WH", category: "parish", note: "TBD" },

  // February 2027
  { title: "St. Pat's Date Night", dateStr: "2027-02-05", location: "Gym", category: "social" },
  { title: "First Penance (2nd graders)", dateStr: "2027-02-06", location: "Church", category: "sacrament" },
  { title: "Ash Wednesday / Lent Begins", dateStr: "2027-02-10", location: "Church", category: "parish" },
  { title: "CYO Playoffs", dateStr: "2027-02-20", location: "Gym", category: "cyo", note: "Saturday February 20 & Sunday February 21" },
  { title: "CYO Playoffs", dateStr: "2027-02-27", location: "Gym", category: "cyo", note: "Saturday February 27 & Sunday February 28" },

  // March 2027
  { title: "Confirmation Retreat 9am–1pm", dateStr: "2027-03-06", location: "Church", category: "sacrament" },
  { title: "March Madness", dateStr: "2027-03-07", location: "Gym", category: "social" },
  { title: "St. Patrick's & St. Joseph's Dinner", dateStr: "2027-03-13", location: "Gym", category: "social" },
  { title: "Palm Sunday", dateStr: "2027-03-21", location: "Church", category: "parish" },
  { title: "Easter / Resurrection Egg Hunt", dateStr: "2027-03-28", location: "Church", category: "parish" },

  // April 2027
  { title: "Spring CYO Season Begins", dateStr: "2027-04-03", location: "Gym", category: "cyo", note: "Saturday April 3 & Sunday April 4" },
  { title: "Confirmation Rehearsals", dateStr: "2027-04-05", location: "WH", category: "sacrament", note: "Monday April 5 & Wednesday April 7" },
  { title: "Confirmation 10am & 1pm", dateStr: "2027-04-10", location: "Church", category: "sacrament" },
  { title: "Last Day of CCD", dateStr: "2027-04-19", location: "WH & Classrooms", category: "ccd", note: "Monday April 19 & Wednesday April 21" },
  { title: "Communion Rehearsals", dateStr: "2027-04-26", location: "WH", category: "sacrament", note: "Monday April 26 & Wednesday April 28" },
  { title: "Designer Bag Bingo", dateStr: "2027-04-29", location: "Gym", category: "social" },

  // May 2027
  { title: "Communion 10am & 1pm", dateStr: "2027-05-01", location: "Church", category: "sacrament" },
  { title: "Communion Reunion Mass 10:30am", dateStr: "2027-05-02", location: "Church", category: "sacrament" },
  { title: "WWP Spring Season Ends", dateStr: "2027-05-02", location: "Gym & WH", category: "parish", note: "TBD" },
  { title: "TGIF Event", dateStr: "2027-05-16", location: "Gym & WH", category: "social", note: "TBD" },
  { title: "Blessing of the Toys Mass 10:30am", dateStr: "2027-05-16", location: "Church", category: "parish" },
  { title: "Teen Life Graduation Mass 10:30am", dateStr: "2027-05-23", location: "Church", category: "teen_life" },

  // June 2027
  { title: "Teen Life Graduation Mass 10:30am", dateStr: "2027-06-07", location: "Church", category: "teen_life" },
];

try {
  // ── 1. Clear and re-seed news posts ────────────────────────────────────────
  const [delNews] = await conn.execute("DELETE FROM news_posts");
  console.log(`Deleted ${delNews.affectedRows} existing news posts`);

  let newsInserted = 0;
  for (const post of newsPosts) {
    await conn.execute(
      `INSERT INTO news_posts (title, content, excerpt, published, publishedAt, createdAt, updatedAt)
       VALUES (?, ?, ?, 1, ?, NOW(), NOW())`,
      [post.title, post.content, post.excerpt, post.publishedAt]
    );
    newsInserted++;
    console.log(`  ✓ [news] ${post.title.slice(0, 60)}`);
  }
  console.log(`\nInserted ${newsInserted} news posts\n`);

  // ── 2. Clear and re-seed key dates from Sept 2026 onwards ──────────────────
  const [delDates] = await conn.execute(
    "DELETE FROM important_dates WHERE eventDate >= '2026-08-01'"
  );
  console.log(`Deleted ${delDates.affectedRows} existing future key dates`);

  let datesInserted = 0;
  for (const ev of keyDates) {
    const d = new Date(ev.dateStr + "T12:00:00Z");
    await conn.execute(
      `INSERT INTO important_dates (title, eventDate, location, note, category, published, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())`,
      [ev.title, d, ev.location ?? null, ev.note ?? null, ev.category]
    );
    datesInserted++;
    console.log(`  ✓ [${ev.category}] ${ev.dateStr} ${ev.title}`);
  }
  console.log(`\nInserted ${datesInserted} key dates`);
  console.log("\n✅ All done!");
} finally {
  await conn.end();
}
