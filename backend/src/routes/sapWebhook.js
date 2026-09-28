const express = require('express');
const router = express.Router();
const { runQuery, getQuery } = require('../db');

const VALID_DEFECT_TYPES = [
  'Weave Defect',
  'Shade Variation',
  'Hole/Tear',
  'Count Deviation',
  'Other'
];

const VALID_SEVERITIES = ['Critical', 'Major', 'Minor'];

// Helper to format unique Inspection Code
function generateSapInspectionCode() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `INS-SAP-${dateStr}-${randomNum}`;
}

/**
 * POST /api/sap-webhook
 * Exposes Webhook for SAP ERP / IoT System Integration
 */
router.post('/', async (req, res) => {
  try {
    const payload = req.body;

    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({
        error: 'Invalid payload format. Expected JSON object.',
        examplePayload: {
          plantId: 'GJ-AHM-01',
          equipmentId: 'WEAVE-LINE-09',
          sapDefectCode: 'DEF-102',
          defectCategory: 'Shade Variation',
          severity: 'Major',
          timestamp: new Date().toISOString(),
          description: 'Auto-flagged by SAP IoT sensors'
        }
      });
    }

    const {
      equipmentId,
      plantId,
      defectCategory,
      severity,
      timestamp,
      description,
      telemetry
    } = payload;

    const machineLineId = equipmentId
      ? (plantId ? `${equipmentId} (${plantId})` : equipmentId)
      : 'SAP System Machine';

    let mappedDefectType = 'Other';
    if (defectCategory && VALID_DEFECT_TYPES.includes(defectCategory)) {
      mappedDefectType = defectCategory;
    }

    let mappedSeverity = 'Major';
    if (severity && VALID_SEVERITIES.includes(severity)) {
      mappedSeverity = severity;
    }

    let fullRemarks = description || 'Automated defect report received from SAP integration.';
    if (telemetry && typeof telemetry === 'object') {
      fullRemarks += ` | Telemetry: ${JSON.stringify(telemetry)}`;
    }

    const inspectionDate = timestamp || new Date().toISOString();
    const code = generateSapInspectionCode();

    const result = await runQuery(`
      INSERT INTO inspections (
        inspection_code, date, machine_line_id, defect_type, severity, status, remarks, source
      ) VALUES (?, ?, ?, ?, ?, 'Open', ?, 'sap_webhook')
    `, [
      code,
      inspectionDate,
      machineLineId,
      mappedDefectType,
      mappedSeverity,
      fullRemarks
    ]);

    const newRecord = await getQuery(`SELECT * FROM inspections WHERE id = ?`, [result.lastID]);

    res.status(201).json({
      success: true,
      message: 'SAP Webhook received and inspection logged automatically',
      inspection: newRecord
    });
  } catch (err) {
    console.error('SAP Webhook processing error:', err);
    res.status(500).json({ error: 'Failed to process SAP webhook payload' });
  }
});

module.exports = router;
