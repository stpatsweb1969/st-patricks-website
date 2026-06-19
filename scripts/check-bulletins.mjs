import mysql from 'mysql2/promise';

const dbUrl = process.env.DATABASE_URL;
const conn = await mysql.createConnection(dbUrl);

const [rows] = await conn.execute('SELECT id, title, DATE_FORMAT(weekDate, "%Y-%m-%d") as week_date, pdfUrl FROM bulletins ORDER BY weekDate DESC LIMIT 5');
rows.forEach(r => console.log(`ID=${r.id} | ${r.title} | ${r.week_date} | ${r.pdfUrl}`));

const [cnt] = await conn.execute('SELECT COUNT(*) as cnt FROM bulletins');
console.log(`\nTotal bulletins: ${cnt[0].cnt}`);

const [allIds] = await conn.execute('SELECT id FROM bulletins ORDER BY id');
const ids = allIds.map(r => r.id);
const max = Math.max(...ids);
for (let i = 1; i <= max; i++) {
  if (!ids.includes(i)) console.log(`Missing ID: ${i}`);
}

// Check audit log for deleted bulletins
const [deleted] = await conn.execute('SELECT entityId, details, createdAt FROM audit_logs WHERE entityType = "bulletin" AND action = "delete" ORDER BY createdAt DESC LIMIT 5');
if (deleted.length > 0) {
  console.log(`\nDeleted bulletins (from audit log):`);
  deleted.forEach(r => console.log(`  Entity ID=${r.entityId} | ${r.details} | deleted at ${r.createdAt}`));
}

await conn.end();
