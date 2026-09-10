/**
 * routes/stats.js
 * REST API endpoints for Admin Statistics, Audit Log, and News
 */

const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET Admin Dashboard stats
router.get('/stats', (req, res) => {
  try {
    const totalPrograms = db.prepare('SELECT COUNT(*) as c FROM programs').get().c;
    const totalKegiatan = db.prepare('SELECT COUNT(*) as c FROM kegiatan').get().c;
    const totalDokumen = db.prepare('SELECT COUNT(*) as c FROM dokumen').get().c;
    const turunanSum = db.prepare('SELECT SUM(total_kelompok) as s FROM turunan').get().s || 0;
    const bkbCount = db.prepare('SELECT COUNT(*) as c FROM bkb_data').get().c;

    res.json({
      success: true,
      data: {
        totalPrograms,
        totalKegiatan,
        totalDokumen,
        totalKelompok: turunanSum || (bkbCount + 137)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET Aktivitas log
router.get('/aktivitas', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM aktivitas ORDER BY id DESC LIMIT 10').all();
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET News
router.get('/news', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM news ORDER BY id ASC').all();
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
