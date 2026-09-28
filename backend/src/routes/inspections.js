const express = require('express');
const router = express.Router();
const { allQuery, getQuery, runQuery } = require('../db');
const { verifyToken } = require('../middleware/authMiddleware');

const VALID_DEFECT_TYPES = [
  'Weave Defect',
  'Shade Variation',
  'Hole/Tear',
  'Count Deviation',
  'Other'
];

const VALID_SEVERITIES = ['Critical', 'Major', 'Minor'];

// Helper to format unique Inspection Code e.g. INS-20260928-1234
function generateInspectionCode() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `INS-${dateStr}-${randomNum}`;
}

// GET /api/inspections/summary - Summary matrix count by severity and status
router.get('/summary', async (req, res) => {
  try {
    const rows = await allQuery(`
      SELECT severity, status, COUNT(*) as count 
      FROM inspections 
      GROUP BY severity, status
    `);

    const summaryMap = {
      Critical: { open: 0, resolved: 0, total: 0 },
      Major: { open: 0, resolved: 0, total: 0 },
      Minor: { open: 0, resolved: 0, total: 0 }
    };

    let totalOpen = 0;
    let totalResolved = 0;

    rows.forEach(r => {
      const sev = r.severity;
      const stat = r.status.toLowerCase();
      if (summaryMap[sev]) {
        if (stat === 'open') {
          summaryMap[sev].open += r.count;
          totalOpen += r.count;
        } else if (stat === 'resolved') {
          summaryMap[sev].resolved += r.count;
          totalResolved += r.count;
        }
        summaryMap[sev].total += r.count;
      }
    });

    res.json({
      summary: summaryMap,
      totals: {
        totalOpen,
        totalResolved,
        grandTotal: totalOpen + totalResolved
      }
    });
  } catch (err) {
    console.error('Error fetching summary:', err);
    res.status(500).json({ error: 'Failed to retrieve summary metrics' });
  }
});

// GET /api/inspections - List with filters & sorting
router.get('/', async (req, res) => {
  try {
    const { severity, status, startDate, endDate, search, sortBy = 'date', sortOrder = 'desc' } = req.query;

    let sql = `SELECT * FROM inspections WHERE 1=1`;
    const params = [];

    if (severity && severity !== 'all') {
      sql += ` AND severity = ?`;
      params.push(severity);
    }

    if (status && status !== 'all') {
      sql += ` AND status = ?`;
      params.push(status);
    }

    // Exact single date or date range filter fix
    if (startDate && endDate) {
      const end = endDate.length === 10 ? `${endDate}T23:59:59.999Z` : endDate;
      sql += ` AND date >= ? AND date <= ?`;
      params.push(startDate, end);
    } else if (startDate && startDate.trim() !== '') {
      const dateOnly = startDate.slice(0, 10);
      const dayStart = `${dateOnly}T00:00:00.000Z`;
      const dayEnd = `${dateOnly}T23:59:59.999Z`;
      sql += ` AND ((date >= ? AND date <= ?) OR date LIKE ?)`;
      params.push(dayStart, dayEnd, `${dateOnly}%`);
    }

    if (search && search.trim() !== '') {
      sql += ` AND (machine_line_id LIKE ? OR defect_type LIKE ? OR remarks LIKE ? OR inspection_code LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    // Sanitize sort column
    const validSortCols = {
      date: 'date',
      severity: "CASE severity WHEN 'Critical' THEN 1 WHEN 'Major' THEN 2 WHEN 'Minor' THEN 3 END",
      machine: 'machine_line_id',
      status: 'status',
      defect: 'defect_type'
    };

    const sortColumn = validSortCols[sortBy] || 'date';
    const direction = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    sql += ` ORDER BY ${sortColumn} ${direction}, id DESC`;

    const inspections = await allQuery(sql, params);
    res.json({ count: inspections.length, inspections });
  } catch (err) {
    console.error('Error fetching inspections:', err);
    res.status(500).json({ error: 'Failed to fetch inspections list' });
  }
});

// GET /api/inspections/:id - Fetch single inspection
router.get('/:id', async (req, res) => {
  try {
    const item = await getQuery(`SELECT * FROM inspections WHERE id = ?`, [req.params.id]);
    if (!item) {
      return res.status(404).json({ error: 'Inspection record not found' });
    }
    res.json(item);
  } catch (err) {
    console.error('Error fetching inspection:', err);
    res.status(500).json({ error: 'Failed to fetch inspection details' });
  }
});

// POST /api/inspections - Log new inspection
router.post('/', verifyToken, async (req, res) => {
  try {
    const { date, machineLineId, defectType, severity, remarks } = req.body;

    if (!machineLineId || !machineLineId.trim()) {
      return res.status(400).json({ error: 'Machine/Line ID is required' });
    }

    if (!defectType || !VALID_DEFECT_TYPES.includes(defectType)) {
      return res.status(400).json({
        error: `Defect type must be one of: ${VALID_DEFECT_TYPES.join(', ')}`
      });
    }

    if (!severity || !VALID_SEVERITIES.includes(severity)) {
      return res.status(400).json({
        error: `Severity must be one of: ${VALID_SEVERITIES.join(', ')}`
      });
    }

    const inspectionDate = date || new Date().toISOString();
    const code = generateInspectionCode();

    const result = await runQuery(`
      INSERT INTO inspections (
        inspection_code, date, machine_line_id, defect_type, severity, status, remarks, source
      ) VALUES (?, ?, ?, ?, ?, 'Open', ?, 'manual')
    `, [
      code,
      inspectionDate,
      machineLineId.trim(),
      defectType,
      severity,
      remarks ? remarks.trim() : null
    ]);

    const newRecord = await getQuery(`SELECT * FROM inspections WHERE id = ?`, [result.lastID]);

    res.status(201).json({
      message: 'Inspection logged successfully',
      inspection: newRecord
    });
  } catch (err) {
    console.error('Error logging inspection:', err);
    res.status(500).json({ error: 'Failed to log inspection record' });
  }
});

// PATCH /api/inspections/:id/resolve - Mark inspection as resolved
router.patch('/:id/resolve', verifyToken, async (req, res) => {
  try {
    const { resolutionNote } = req.body;
    const { id } = req.params;

    if (!resolutionNote || !resolutionNote.trim()) {
      return res.status(400).json({ error: 'Resolution note is mandatory to resolve an inspection' });
    }

    const item = await getQuery(`SELECT * FROM inspections WHERE id = ?`, [id]);
    if (!item) {
      return res.status(404).json({ error: 'Inspection record not found' });
    }

    if (item.status === 'Resolved') {
      return res.status(400).json({ error: 'Inspection is already marked as resolved' });
    }

    const resolvedAt = new Date().toISOString();
    const resolvedBy = req.user ? req.user.name : 'Parth Modi';

    await runQuery(`
      UPDATE inspections 
      SET status = 'Resolved',
          resolution_note = ?,
          resolved_at = ?,
          resolved_by = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [resolutionNote.trim(), resolvedAt, resolvedBy, id]);

    const updatedRecord = await getQuery(`SELECT * FROM inspections WHERE id = ?`, [id]);

    res.json({
      message: 'Inspection marked as resolved successfully',
      inspection: updatedRecord
    });
  } catch (err) {
    console.error('Error resolving inspection:', err);
    res.status(500).json({ error: 'Failed to resolve inspection record' });
  }
});

module.exports = router;
