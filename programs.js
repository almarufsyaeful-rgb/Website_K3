/**
 * routes/programs.js
 * REST API endpoints for Program K3
 */

const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET all programs (or single program by query ?id=...)
router.get('/', (req, res) => {
  try {
    const { id } = req.query;
    if (id) {
      const row = db.prepare('SELECT * FROM programs WHERE id = ?').get(id);
      if (!row) {
        return res.status(404).json({ success: false, error: 'Program tidak ditemukan' });
      }
      row.kegiatanTerkait = row.kegiatan_terkait ? JSON.parse(row.kegiatan_terkait) : [];
      return res.json({ success: true, data: row });
    }

    const rows = db.prepare('SELECT * FROM programs ORDER BY id ASC').all();
    const formatted = rows.map(r => ({
      ...r,
      kegiatanTerkait: r.kegiatan_terkait ? JSON.parse(r.kegiatan_terkait) : []
    }));
    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET program by id
router.get('/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM programs WHERE id = ?').get(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, error: 'Program tidak ditemukan' });
    }
    row.kegiatanTerkait = row.kegiatan_terkait ? JSON.parse(row.kegiatan_terkait) : [];
    res.json({ success: true, data: row });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create program
router.post('/', (req, res) => {
  try {
    const { nama, kategori, deskripsi, ringkasan, pelaksana, tahun, icon, kegiatanTerkait } = req.body;
    if (!nama || !kategori) {
      return res.status(400).json({ success: false, error: 'Nama dan kategori wajib diisi' });
    }

    const id = 'prog-' + Date.now();
    const stmt = db.prepare(`
      INSERT INTO programs (id, nama, kategori, deskripsi, ringkasan, pelaksana, tahun, icon, kegiatan_terkait)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      nama,
      kategori,
      deskripsi || '',
      ringkasan || deskripsi || '',
      pelaksana || 'Bidang K3',
      tahun || 2025,
      icon || 'fa-shield-heart',
      JSON.stringify(kegiatanTerkait || [])
    );

    // Auto log aktivitas
    db.prepare('INSERT INTO aktivitas (aktivitas, tanggal, oleh) VALUES (?, ?, ?)')
      .run(`Menambah program baru: ${nama}`, 'Hari ini', 'Admin');

    res.status(201).json({ success: true, message: 'Program berhasil dibuat', data: { id, nama } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update program
router.put('/:id', (req, res) => {
  try {
    const { nama, kategori, deskripsi, ringkasan, pelaksana, tahun, icon, kegiatanTerkait } = req.body;
    const stmt = db.prepare(`
      UPDATE programs
      SET nama = ?, kategori = ?, deskripsi = ?, ringkasan = ?, pelaksana = ?, tahun = ?, icon = ?, kegiatan_terkait = ?
      WHERE id = ?
    `);

    const result = stmt.run(
      nama,
      kategori,
      deskripsi,
      ringkasan,
      pelaksana,
      tahun,
      icon,
      JSON.stringify(kegiatanTerkait || []),
      req.params.id
    );

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Program tidak ditemukan' });
    }

    // Auto log
    db.prepare('INSERT INTO aktivitas (aktivitas, tanggal, oleh) VALUES (?, ?, ?)')
      .run(`Mengubah data program: ${nama}`, 'Hari ini', 'Admin');

    res.json({ success: true, message: 'Program berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE program
router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM programs WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Program tidak ditemukan' });
    }
    res.json({ success: true, message: 'Program berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
