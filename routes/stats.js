/**
 * routes/stats.js
 * REST API endpoints for Admin Statistics, Audit Log, and News (Versi MySQL)
 */

const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET Admin Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    // MySQL: Karena hasil SELECT selalu berupa Array, kita panggil elemen pertama [0]
    const [progRows] = await db.query('SELECT COUNT(*) as c FROM programs');
    const totalPrograms = progRows[0].c;

    const [kegRows] = await db.query('SELECT COUNT(*) as c FROM kegiatan');
    const totalKegiatan = kegRows[0].c;

    const [docRows] = await db.query('SELECT COUNT(*) as c FROM dokumen');
    const totalDokumen = docRows[0].c;

    const [turunanRows] = await db.query('SELECT SUM(total_kelompok) as s FROM turunan');
    const turunanSum = turunanRows[0].s || 0;

    const [bkbRows] = await db.query('SELECT COUNT(*) as c FROM bkb_data');
    const bkbCount = bkbRows[0].c;

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
router.get('/aktivitas', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM aktivitas ORDER BY id DESC LIMIT 10');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET News
router.get('/news', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM news ORDER BY id ASC');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;