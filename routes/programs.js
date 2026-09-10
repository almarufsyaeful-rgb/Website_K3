/**
 * routes/programs.js
 * REST API endpoints for Program K3 (Versi MySQL)
 */

const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET all programs (or single program by query ?id=...)
router.get('/', async (req, res) => {
  try {
    const { id } = req.query;
    if (id) {
      // MySQL: Ambil data, pilih index 0
      const [rows] = await db.execute('SELECT * FROM programs WHERE id = ?', [id]);
      const row = rows[0];

      if (!row) {
        return res.status(404).json({ success: false, error: 'Program tidak ditemukan' });
      }
      row.kegiatanTerkait = row.kegiatan_terkait ? JSON.parse(row.kegiatan_terkait) : [];
      return res.json({ success: true, data: row });
    }

    // MySQL: Gunakan db.query untuk mengambil semua data
    const [rows] = await db.query('SELECT * FROM programs ORDER BY id ASC');
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
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM programs WHERE id = ?', [req.params.id]);
    const row = rows[0];

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
router.post('/', async (req, res) => {
  try {
    const { nama, kategori, deskripsi, ringkasan, pelaksana, tahun, icon, kegiatanTerkait } = req.body;
    if (!nama || !kategori) {
      return res.status(400).json({ success: false, error: 'Nama dan kategori wajib diisi' });
    }

    const id = 'prog-' + Date.now();
    
    // MySQL: Gunakan db.execute untuk insert
    await db.execute(`
      INSERT INTO programs (id, nama, kategori, deskripsi, ringkasan, pelaksana, tahun, icon, kegiatan_terkait)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      nama,
      kategori,
      deskripsi || '',
      ringkasan || deskripsi || '',
      pelaksana || 'Bidang K3',
      tahun || 2025,
      icon || 'fa-shield-heart',
      JSON.stringify(kegiatanTerkait || [])
    ]);

    // Auto log aktivitas
    await db.execute(
      'INSERT INTO aktivitas (aktivitas, tanggal, oleh) VALUES (?, ?, ?)',
      [`Menambah program baru: ${nama}`, 'Hari ini', 'Admin']
    );

    res.status(201).json({ success: true, message: 'Program berhasil dibuat', data: { id, nama } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update program
router.put('/:id', async (req, res) => {
  try {
    const { nama, kategori, deskripsi, ringkasan, pelaksana, tahun, icon, kegiatanTerkait } = req.body;
    
    // MySQL: Cek affectedRows
    const [result] = await db.execute(`
      UPDATE programs
      SET nama = ?, kategori = ?, deskripsi = ?, ringkasan = ?, pelaksana = ?, tahun = ?, icon = ?, kegiatan_terkait = ?
      WHERE id = ?
    `, [
      nama,
      kategori,
      deskripsi,
      ringkasan,
      pelaksana,
      tahun,
      icon,
      JSON.stringify(kegiatanTerkait || []),
      req.params.id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Program tidak ditemukan' });
    }

    // Auto log
    await db.execute(
      'INSERT INTO aktivitas (aktivitas, tanggal, oleh) VALUES (?, ?, ?)',
      [`Mengubah data program: ${nama}`, 'Hari ini', 'Admin']
    );

    res.json({ success: true, message: 'Program berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE program
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM programs WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Program tidak ditemukan' });
    }
    res.json({ success: true, message: 'Program berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;