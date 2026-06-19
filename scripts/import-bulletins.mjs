/**
 * Import bulletins from the original St. Patrick's eCatholic website.
 * These are external PDF URLs hosted on files.ecatholic.com.
 * We store the external URL directly (no need to re-upload to S3 since they're stable CDN URLs).
 * 
 * Usage: node scripts/import-bulletins.mjs
 */

import { readFileSync } from 'fs';
import mysql from 'mysql2/promise';

// Read all bulletin URLs from the extracted file
const allUrls = readFileSync('/home/ubuntu/all_bulletins.txt', 'utf-8')
  .trim()
  .split('\n')
  .filter(Boolean);

console.log(`Found ${allUrls.length} bulletin URLs to import`);

// Parse date from URL pattern: https://files.ecatholic.com/10907/bulletins/YYYYMMDD.pdf?t=...
function parseBulletinUrl(url) {
  const match = url.match(/bulletins\/(\d{4})(\d{2})(\d{2})\.pdf/);
  if (!match) return null;
  const [, year, month, day] = match;
  const dateStr = `${year}-${month}-${day}`;
  const date = new Date(`${dateStr}T12:00:00Z`);
  
  // Format title: "Bulletin — Month Day, Year"
  const formatted = date.toLocaleDateString('en-US', { 
    month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' 
  });
  const title = `Bulletin — ${formatted}`;
  
  return { title, weekDate: date, pdfUrl: url, dateStr };
}

// Connect to database
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const connection = await mysql.createConnection(dbUrl);

try {
  // Check existing count
  const [rows] = await connection.execute('SELECT COUNT(*) as cnt FROM bulletins');
  console.log(`Existing bulletins in DB: ${rows[0].cnt}`);
  
  if (rows[0].cnt > 0) {
    console.log('Bulletins already imported. Skipping.');
    process.exit(0);
  }

  // Parse all URLs
  const bulletins = allUrls
    .map(parseBulletinUrl)
    .filter(Boolean)
    .sort((a, b) => b.weekDate - a.weekDate); // newest first for insertion

  console.log(`Parsed ${bulletins.length} valid bulletins`);
  console.log(`Date range: ${bulletins[bulletins.length - 1].dateStr} to ${bulletins[0].dateStr}`);

  // Insert in batches of 50
  const batchSize = 50;
  let inserted = 0;

  for (let i = 0; i < bulletins.length; i += batchSize) {
    const batch = bulletins.slice(i, i + batchSize);
    const values = batch.map(b => [
      b.title,
      null, // description
      b.pdfUrl,
      `ecatholic-${b.dateStr}`, // pdfKey (reference key, not actual S3 key)
      b.weekDate,
      true, // published
      b.weekDate, // publishedAt = same as weekDate
      new Date(), // createdAt
      new Date(), // updatedAt
      null, // authorId
    ]);

    const placeholders = batch.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
    const flatValues = values.flat();

    await connection.execute(
      `INSERT INTO bulletins (title, description, pdfUrl, pdfKey, weekDate, published, publishedAt, createdAt, updatedAt, authorId) VALUES ${placeholders}`,
      flatValues
    );

    inserted += batch.length;
    console.log(`Inserted ${inserted}/${bulletins.length} bulletins...`);
  }

  console.log(`\nDone! Successfully imported ${inserted} bulletins.`);
  
  // Verify
  const [verify] = await connection.execute('SELECT COUNT(*) as cnt FROM bulletins');
  console.log(`Total bulletins in DB: ${verify[0].cnt}`);
  
  // Show most recent
  const [recent] = await connection.execute('SELECT title, weekDate, pdfUrl FROM bulletins ORDER BY weekDate DESC LIMIT 3');
  console.log('\nMost recent bulletins:');
  recent.forEach(r => console.log(`  ${r.title} (${r.weekDate})`));

} finally {
  await connection.end();
}
