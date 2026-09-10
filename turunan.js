/**
 * routes/turunan.js
 * REST API endpoints for Turunan Bidang K3 (BKB, BKR, BKL, UPPKA, PIK-R, PPKS, GENRE)
 */

const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET all turunan
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM turunan ORDER BY id ASC').all();
    const formatted = rows.map(r => ({
      ...r,
      tujuan: r.tujuan ? (typeof r.tujuan === 'string' ? JSON.parse(r.tujuan) : r.tujuan) : [],
      layanan: r.layanan ? (typeof r.layanan === 'string' ? JSON.parse(r.layanan) : r.layanan) : []
    }));
    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET by id / kode
router.get('/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM turunan WHERE id = ? OR kode = ?').get(req.params.id, req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, error: 'Sub-unit turunan tidak ditemukan' });
    }
    row.tujuan = row.tujuan ? (typeof row.tujuan === 'string' ? JSON.parse(row.tujuan) : row.tujuan) : [];
    row.layanan = row.layanan ? (typeof row.layanan === 'string' ? JSON.parse(row.layanan) : row.layanan) : [];
    res.json({ success: true, data: row });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
