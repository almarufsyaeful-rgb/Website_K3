/**
 * routes/bkb.js
 * REST API endpoints for BKB / Kelompok Binaan Data
 */

const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET all BKB data
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM bkb_data ORDER BY id DESC').all();
    const formatted = rows.map(r => ({
      id: r.id,
      namaKelompok: r.nama_kelompok,
      alamat: r.alamat,
      ketua: r.ketua,
      jumlahAnggota: r.jumlah_anggota,
      tahun: r.tahun
    }));
    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create BKB data
router.post('/', (req, res) => {
  try {
    const { namaKelompok, alamat, ketua, jumlahAnggota, tahun } = req.body;
    if (!namaKelompok || !alamat || !ketua || !tahun) {
      return res.status(400).json({ success: false, error: 'Harap lengkapi semua data wajib' });
    }

    const stmt = db.prepare(`
      INSERT INTO bkb_data (nama_kelompok, alamat, ketua, jumlah_anggota, tahun)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(namaKelompok, alamat, ketua, parseInt(jumlahAnggota) || 0, tahun);

    // Auto log aktivitas
    db.prepare('INSERT INTO aktivitas (aktivitas, tanggal, oleh) VALUES (?, ?, ?)')
      .run(`Menambah kelompok BKB: ${namaKelompok}`, 'Hari ini', 'Admin');

    res.status(201).json({
      success: true,
      message: 'Data kelompok berhasil disimpan',
      data: {
        id: Number(result.lastInsertRowid),
        namaKelompok,
        alamat,
        ketua,
        jumlahAnggota,
        tahun
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update BKB data
router.put('/:id', (req, res) => {
  try {
    const { namaKelompok, alamat, ketua, jumlahAnggota, tahun } = req.body;
    const stmt = db.prepare(`
      UPDATE bkb_data
      SET nama_kelompok = ?, alamat = ?, ketua = ?, jumlah_anggota = ?, tahun = ?
      WHERE id = ?
    `);

    const result = stmt.run(namaKelompok, alamat, ketua, parseInt(jumlahAnggota) || 0, tahun, req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Data kelompok tidak ditemukan' });
    }

    db.prepare('INSERT INTO aktivitas (aktivitas, tanggal, oleh) VALUES (?, ?, ?)')
      .run(`Mengubah data kelompok BKB: ${namaKelompok}`, 'Hari ini', 'Admin');

    res.json({ success: true, message: 'Data kelompok berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE BKB data
router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM bkb_data WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Data kelompok tidak ditemukan' });
    }
    res.json({ success: true, message: 'Data kelompok berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
