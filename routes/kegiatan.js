/**
 * routes/kegiatan.js
 * REST API endpoints for Kegiatan K3 with Photo Documentation Upload (Versi MySQL)
 */

const express = require('express');
const router = express.Router();
const path = require('node:path');
const fs = require('node:fs');
const multer = require('multer');
const db = require('../db/database');

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer setup for photos
const photoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `keg_${Date.now()}_${Math.round(Math.random() * 1E4)}${ext}`);
  }
});

const uploadPhoto = multer({
  storage: photoStorage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// GET all kegiatan with optional search, tahun, and lokasi query params (or single by id)
router.get('/', async (req, res) => {
  try {
    const { search, tahun, lokasi, id } = req.query;

    // Single item fetch via query param: /api/kegiatan?id=...
    if (id) {
      const [rows] = await db.execute('SELECT * FROM kegiatan WHERE id = ?', [id]);
      const row = rows[0];
      if (!row) {
        return res.status(404).json({ success: false, error: 'Kegiatan tidak ditemukan' });
      }
      row.dokumentasi = row.dokumentasi ? JSON.parse(row.dokumentasi) : [];
      return res.json({ success: true, data: row });
    }

    let query = 'SELECT * FROM kegiatan WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (LOWER(nama) LIKE ? OR LOWER(lokasi) LIKE ? OR LOWER(deskripsi) LIKE ?)';
      const s = `%${search.toLowerCase()}%`;
      params.push(s, s, s);
    }

    if (tahun && tahun !== 'all') {
      query += ' AND tahun = ?';
      params.push(tahun);
    }

    if (lokasi && lokasi !== 'all') {
      query += ' AND lokasi LIKE ?';
      params.push(`%${lokasi}%`);
    }

    query += ' ORDER BY tanggal DESC';

    // MySQL: Gunakan db.query untuk array parameter yang dinamis
    const [rows] = await db.query(query, params);
    const formatted = rows.map(r => ({
      ...r,
      dokumentasi: r.dokumentasi ? JSON.parse(r.dokumentasi) : []
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET kegiatan by id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM kegiatan WHERE id = ?', [req.params.id]);
    const row = rows[0];
    if (!row) {
      return res.status(404).json({ success: false, error: 'Kegiatan tidak ditemukan' });
    }
    row.dokumentasi = row.dokumentasi ? JSON.parse(row.dokumentasi) : [];
    res.json({ success: true, data: row });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST upload photo to specific kegiatan
router.post('/upload-foto/:id', uploadPhoto.single('foto'), async (req, res) => {
  try {
    const kegId = req.params.id;
    const [rows] = await db.execute('SELECT * FROM kegiatan WHERE id = ?', [kegId]);
    const keg = rows[0];
    
    if (!keg) {
      return res.status(404).json({ success: false, error: 'Kegiatan tidak ditemukan' });
    }

    let docs = keg.dokumentasi ? JSON.parse(keg.dokumentasi) : [];
    if (!Array.isArray(docs)) docs = [];

    if (req.file) {
      docs.unshift(`uploads/${req.file.filename}`);
    } else if (req.body.fotoUrl) {
      docs.unshift(req.body.fotoUrl.trim());
    } else {
      return res.status(400).json({ success: false, error: 'Tidak ada foto yang diunggah' });
    }

    await db.execute('UPDATE kegiatan SET dokumentasi = ? WHERE id = ?', [JSON.stringify(docs), kegId]);

    await db.execute('INSERT INTO aktivitas (aktivitas, tanggal, oleh) VALUES (?, ?, ?)', 
      [`Upload foto kegiatan: ${keg.nama}`, 'Hari ini', 'Admin']
    );

    res.json({ success: true, message: 'Foto berhasil ditambahkan!', data: docs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST delete a specific photo from kegiatan
router.post('/delete-foto/:id', async (req, res) => {
  try {
    const kegId = req.params.id;
    const { index, url } = req.body;
    const [rows] = await db.execute('SELECT * FROM kegiatan WHERE id = ?', [kegId]);
    const keg = rows[0];
    
    if (!keg) {
      return res.status(404).json({ success: false, error: 'Kegiatan tidak ditemukan' });
    }

    let docs = keg.dokumentasi ? JSON.parse(keg.dokumentasi) : [];
    if (!Array.isArray(docs)) docs = [];

    if (typeof index === 'number' && index >= 0 && index < docs.length) {
      docs.splice(index, 1);
    } else if (url) {
      docs = docs.filter(u => u !== url);
    }

    await db.execute('UPDATE kegiatan SET dokumentasi = ? WHERE id = ?', [JSON.stringify(docs), kegId]);

    res.json({ success: true, message: 'Foto berhasil dihapus', data: docs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST replace a specific photo by index
router.post('/replace-foto/:id', uploadPhoto.single('foto'), async (req, res) => {
  try {
    const kegId = req.params.id;
    const [rows] = await db.execute('SELECT * FROM kegiatan WHERE id = ?', [kegId]);
    const keg = rows[0];
    
    if (!keg) {
      return res.status(404).json({ success: false, error: 'Kegiatan tidak ditemukan' });
    }

    let docs = keg.dokumentasi ? JSON.parse(keg.dokumentasi) : [];
    if (!Array.isArray(docs)) docs = [];

    const index = parseInt(req.body.index ?? 0, 10);
    let newPath = '';

    if (req.file) {
      newPath = `uploads/${req.file.filename}`;
    } else if (req.body.fotoUrl) {
      newPath = req.body.fotoUrl.trim();
    } else {
      return res.status(400).json({ success: false, error: 'Tidak ada foto yang diunggah' });
    }

    if (docs[index] && docs[index].startsWith('uploads/')) {
      const oldPath = path.join(__dirname, '..', docs[index]);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    if (index >= 0 && index < docs.length) {
      docs[index] = newPath;
    } else {
      docs.push(newPath);
    }

    await db.execute('UPDATE kegiatan SET dokumentasi = ? WHERE id = ?', [JSON.stringify(docs), kegId]);

    await db.execute('INSERT INTO aktivitas (aktivitas, tanggal, oleh) VALUES (?, ?, ?)', 
      [`Ubah foto kegiatan: ${keg.nama}`, 'Hari ini', 'Admin']
    );

    res.json({ success: true, message: 'Foto berhasil diubah!', data: docs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Helper for robust date display (Tidak perlu async karena tidak akses database)
function formatTanggalDisplay(tanggal) {
  let display = tanggal || '';
  let yearStr = new Date().getFullYear().toString();
  if (tanggal && typeof tanggal === 'string' && tanggal.includes('-')) {
    const parts = tanggal.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      display = `${d} ${months[m] || ''} ${y}`;
      yearStr = `${y}`;
    }
  }
  return { display, yearStr };
}

// POST create kegiatan
router.post('/', async (req, res) => {
  try {
    const { nama, tanggal, lokasi, peserta, deskripsi, dokumentasi } = req.body;
    if (!nama || !tanggal || !lokasi) {
      return res.status(400).json({ success: false, error: 'Nama, tanggal, dan lokasi wajib diisi' });
    }

    const id = req.body.id || ('keg-' + Date.now());
    const { display, yearStr } = formatTanggalDisplay(tanggal);

    const defaultImages = [
      'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80'
    ];
    const docs = dokumentasi || defaultImages;

    await db.execute(`
      INSERT INTO kegiatan (id, nama, tanggal, tanggal_display, tahun, lokasi, peserta, deskripsi, dokumentasi)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, nama, tanggal, display, yearStr, lokasi, peserta || '50 orang', 
      deskripsi || 'Kegiatan pembinaan dan edukasi keluarga Kota Semarang.', JSON.stringify(docs)
    ]);

    await db.execute('INSERT INTO aktivitas (aktivitas, tanggal, oleh) VALUES (?, ?, ?)', 
      [`Menambah data kegiatan: ${nama}`, display, 'Admin']
    );

    res.status(201).json({
      success: true,
      message: 'Kegiatan berhasil ditambahkan',
      data: {
        id, nama, tanggal, tanggal_display: display, tahun: yearStr, lokasi, 
        peserta: peserta || '50 orang', 
        deskripsi: deskripsi || 'Kegiatan pembinaan dan edukasi keluarga Kota Semarang.', 
        dokumentasi: docs
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update handler 
const updateKegiatanHandler = async (req, res) => {
  try {
    const id = req.params.id || req.query.id || (req.body && req.body.id);
    if (!id) {
      return res.status(400).json({ success: false, error: 'ID Kegiatan dibutuhkan' });
    }

    const { nama, tanggal, lokasi, peserta, deskripsi, dokumentasi } = req.body;
    const { display, yearStr } = formatTanggalDisplay(tanggal);

    let result;
    if (dokumentasi) {
      [result] = await db.execute(`
        UPDATE kegiatan
        SET nama = ?, tanggal = ?, tanggal_display = ?, tahun = ?, lokasi = ?, peserta = ?, deskripsi = ?, dokumentasi = ?
        WHERE id = ?
      `, [nama, tanggal, display, yearStr, lokasi, peserta, deskripsi, JSON.stringify(dokumentasi), id]);
    } else {
      [result] = await db.execute(`
        UPDATE kegiatan
        SET nama = ?, tanggal = ?, tanggal_display = ?, tahun = ?, lokasi = ?, peserta = ?, deskripsi = ?
        WHERE id = ?
      `, [nama, tanggal, display, yearStr, lokasi, peserta, deskripsi, id]);
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Kegiatan tidak ditemukan' });
    }

    await db.execute('INSERT INTO aktivitas (aktivitas, tanggal, oleh) VALUES (?, ?, ?)', 
      [`Mengubah data kegiatan: ${nama}`, display, 'Admin']
    );

    res.json({ success: true, message: 'Kegiatan berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

router.put('/:id', updateKegiatanHandler);
router.put('/', updateKegiatanHandler);

// DELETE kegiatan 
const deleteKegiatanHandler = async (req, res) => {
  try {
    const id = req.params.id || req.query.id || (req.body && req.body.id);
    if (!id) {
      return res.status(400).json({ success: false, error: 'ID Kegiatan dibutuhkan' });
    }
    
    const [result] = await db.execute('DELETE FROM kegiatan WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Kegiatan tidak ditemukan' });
    }
    
    try {
      await db.execute('INSERT INTO aktivitas (aktivitas, tanggal, oleh) VALUES (?, ?, ?)', [
        `Menghapus data kegiatan: ${id}`, 'Hari ini', 'Admin'
      ]);
    } catch (e) {}
    
    res.json({ success: true, message: 'Kegiatan berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

router.delete('/:id', deleteKegiatanHandler);
router.delete('/', deleteKegiatanHandler);
router.post('/delete', deleteKegiatanHandler);

module.exports = router;