/**
 * routes/turunan.js
 * REST API endpoints for Turunan Bidang K3 (BKB, BKR, BKL, UPPKA, PIK-R, PPKS, GENRE) - Versi MySQL
 */

const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET all turunan
router.get('/', async (req, res) => {
  try {
    // MySQL: Gunakan db.query untuk mengambil seluruh data
    const [rows] = await db.query('SELECT * FROM turunan ORDER BY id ASC');
    
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
router.get('/:id', async (req, res) => {
  try {
    // MySQL: Gunakan db.execute dan masukkan parameter ke dalam array
    const [rows] = await db.execute('SELECT * FROM turunan WHERE id = ? OR kode = ?', [req.params.id, req.params.id]);
    const row = rows[0];

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