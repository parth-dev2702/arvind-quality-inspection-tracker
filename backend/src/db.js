const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, '../quality_tracker.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

// Helper function to run sql queries with promises
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function allQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function initDatabase() {
  // Create users table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'supervisor',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create inspections table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS inspections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      inspection_code TEXT UNIQUE NOT NULL,
      date TEXT NOT NULL,
      machine_line_id TEXT NOT NULL,
      defect_type TEXT NOT NULL,
      severity TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Open',
      remarks TEXT,
      resolution_note TEXT,
      resolved_at TEXT,
      resolved_by TEXT,
      source TEXT DEFAULT 'manual',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Update existing users or seed default supervisor
  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash('arvind123', salt);

  const existingUser = await getQuery(`SELECT * FROM users WHERE email = ? OR username = ?`, ['parth@arvind.com', 'parth']);
  if (!existingUser) {
    await runQuery(`DELETE FROM users`);
    await runQuery(`
      INSERT INTO users (username, email, password_hash, name, role)
      VALUES (?, ?, ?, ?, ?)
    `, ['parth', 'parth@arvind.com', defaultPasswordHash, 'Parth Modi', 'supervisor']);
    console.log('Seeded default supervisor user: parth@arvind.com / arvind123 (Parth Modi)');
  } else {
    await runQuery(`UPDATE users SET name = ? WHERE email = ?`, ['Parth Modi', 'parth@arvind.com']);
  }

  // Seed initial inspection records if empty or update old supervisor name
  await runQuery(`UPDATE inspections SET resolved_by = 'Parth Modi' WHERE resolved_by = 'Rajesh Patel' OR resolved_by = 'Parth Patel'`);

  const inspectionCount = await getQuery(`SELECT COUNT(*) as count FROM inspections`);
  if (inspectionCount.count === 0) {
    const seedData = [
      {
        code: 'INS-2026-001',
        date: '2026-09-28T09:15:00.000Z',
        machine_line_id: 'Weave Line 04 (Naroda Plant)',
        defect_type: 'Weave Defect',
        severity: 'Critical',
        status: 'Open',
        remarks: 'Warp thread breakage causing mispicks over 50 meters of denim fabric.',
        resolution_note: null,
        resolved_at: null,
        resolved_by: null,
        source: 'manual'
      },
      {
        code: 'INS-2026-002',
        date: '2026-09-28T10:30:00.000Z',
        machine_line_id: 'Dyeing Unit 02 (Santej Plant)',
        defect_type: 'Shade Variation',
        severity: 'Major',
        status: 'Open',
        remarks: 'Batch #402 showing uneven indigo tone towards selvedge edge.',
        resolution_note: null,
        resolved_at: null,
        resolved_by: null,
        source: 'manual'
      },
      {
        code: 'INS-2026-003',
        date: '2026-09-27T14:20:00.000Z',
        machine_line_id: 'Finishing Line 01 (Naroda Plant)',
        defect_type: 'Hole/Tear',
        severity: 'Critical',
        status: 'Resolved',
        remarks: 'Stenter pin damaged fabric edge causing 10cm tear during heat setting.',
        resolution_note: 'Replaced damaged stenter pin #14 and trimmed affected roll segment (12m discarded). Line recalibrated.',
        resolved_at: '2026-09-27T16:45:00.000Z',
        resolved_by: 'Parth Modi',
        source: 'manual'
      },
      {
        code: 'INS-2026-004',
        date: '2026-09-27T11:00:00.000Z',
        machine_line_id: 'Spinning Mill B (Nagpur Plant)',
        defect_type: 'Count Deviation',
        severity: 'Minor',
        status: 'Resolved',
        remarks: 'Cotton yarn count variance observed at 20s Ne instead of specified 24s Ne.',
        resolution_note: 'Adjusted draft ratio on ring frame #08. Sample re-tested and passed quality tolerances.',
        resolved_at: '2026-09-27T12:30:00.000Z',
        resolved_by: 'Parth Modi',
        source: 'manual'
      },
      {
        code: 'INS-2026-005',
        date: '2026-09-26T16:50:00.000Z',
        machine_line_id: 'Weave Line 12 (Santej Plant)',
        defect_type: 'Other',
        severity: 'Minor',
        status: 'Open',
        remarks: 'Oil droplet stains along middle fabric width from overhead beam lubricant leakage.',
        resolution_note: null,
        resolved_at: null,
        resolved_by: null,
        source: 'manual'
      },
      {
        code: 'INS-2026-006',
        date: '2026-09-26T08:10:00.000Z',
        machine_line_id: 'SAP-IoT Line 09 (Santej Plant)',
        defect_type: 'Shade Variation',
        severity: 'Major',
        status: 'Resolved',
        remarks: 'Auto-flagged by SAP IoT Sensors: Dye liquor temperature fluctuated by 4.5°C during cycle.',
        resolution_note: 'Steam control valve re-seated. Dye batch re-processed with leveler chemical.',
        resolved_at: '2026-09-26T11:15:00.000Z',
        resolved_by: 'Auto-Resolved (Maintenance)',
        source: 'sap_webhook'
      }
    ];

    for (const item of seedData) {
      await runQuery(`
        INSERT INTO inspections 
        (inspection_code, date, machine_line_id, defect_type, severity, status, remarks, resolution_note, resolved_at, resolved_by, source)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        item.code,
        item.date,
        item.machine_line_id,
        item.defect_type,
        item.severity,
        item.status,
        item.remarks,
        item.resolution_note,
        item.resolved_at,
        item.resolved_by,
        item.source
      ]);
    }
    console.log(`Seeded ${seedData.length} sample inspection records.`);
  }
}

module.exports = {
  db,
  runQuery,
  getQuery,
  allQuery,
  initDatabase
};
