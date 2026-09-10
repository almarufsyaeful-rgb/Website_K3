/**
 * routes/kegiatan.js
 * REST API endpoints untuk Kegiatan K3 (Versi MySQL + Cloudinary)
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const db = require('../db/database'); // Koneksi MySQL Railway

// ==========================================
// ⚠️ KONFIGURASI CLOUDINARY
// Masukkan kunci yang SAMA PERSIS dengan yang ada di dokumen.js
// ==========================================
cloudinary.config({
  cloud_name: 'bxuyqqoh',
  api_key: '848692597846835',
  api_secret: 'HsXq53Cv8i8yAYylhy76DQ1dnwc'
});

// Setting Multer untuk melempar foto ke Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'webk3_kegiatan', // Beda folder biar rapi di Cloudinary
    resource_type: 'image'
  }
});

const uploadPhoto = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // Batas foto 10MB
});

// Helper for robust date display
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

// GET all kegiatan
router.get('/', async (req, res) => {
  try {
    const { search, tahun, lokasi, id } = req.query;

    if (id) {
      const [rows] = await db.query('SELECT * FROM kegiatan WHERE id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Kegiatan tidak ditemukan' });
      }
      const row = rows[0];
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
    const [rows] = await db.query('SELECT * FROM kegiatan WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Kegiatan tidak ditemukan' });
    }
    const row = rows[0];
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
    const [rows] = await db.query('SELECT * FROM kegiatan WHERE id = ?', [kegId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Kegiatan tidak ditemukan' });
    }
    const keg = rows[0];

    let docs = keg.dokumentasi ? JSON.parse(keg.dokumentasi) : [];
    if (!Array.isArray(docs)) docs = [];

    if (req.file) {
      docs.unshift(req.file.path); // Mendapatkan URL langsung dari Cloudinary
    } else if (req.body.fotoUrl) {
      docs.unshift(req.body.fotoUrl.trim());
    } else {
      return res.status(400).json({ success: false, error: 'Tidak ada foto yang diunggah' });
    }

    await db.query('UPDATE kegiatan SET dokumentasi = ? WHERE id = ?', [JSON.stringify(docs), kegId]);

    try {
      await db.query('INSERT INTO aktivitas (aktivitas, tanggal, oleh) VALUES (?, ?, ?)', [`Upload foto kegiatan: ${keg.nama}`, 'Hari ini', 'Admin']);
    } catch (e) {}

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
    
    const [rows] = await db.query('SELECT * FROM kegiatan WHERE id = ?', [kegId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Kegiatan tidak ditemukan' });
    }
    const keg = rows[0];

    let docs = keg.dokumentasi ? JSON.parse(keg.dokumentasi) : [];
    if (!Array.isArray(docs)) docs = [];

    if (typeof index === 'number' && index >= 0 && index < docs.length) {
      docs.splice(index, 1);
    } else if (url) {
      docs = docs.filter(u => u !== url);
    }

    await db.query('UPDATE kegiatan SET dokumentasi = ? WHERE id = ?', [JSON.stringify(docs), kegId]);

    res.json({ success: true, message: 'Foto berhasil dihapus', data: docs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST replace a specific photo by index
router.post('/replace-foto/:id', uploadPhoto.single('foto'), async (req, res) => {
  try {
    const kegId = req.params.id;
    const [rows] = await db.query('SELECT * FROM kegiatan WHERE id = ?', [kegId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Kegiatan tidak ditemukan' });
    }
    const keg = rows[0];

    let docs = keg.dokumentasi ? JSON.parse(keg.dokumentasi) : [];
    if (!Array.isArray(docs)) docs = [];

    const index = parseInt(req.body.index ?? 0, 10);
    let newPath = '';

    if (req.file) {
      newPath = req.file.path; // URL Cloudinary Baru
    } else if (req.body.fotoUrl) {
      newPath = req.body.fotoUrl.trim();
    } else {
      return res.status(400).json({ success: false, error: 'Tidak ada foto yang diunggah' });
    }

    if (index >= 0 && index < docs.length) {
      docs[index] = newPath;
    } else {
      docs.push(newPath);
    }

    await db.query('UPDATE kegiatan SET dokumentasi = ? WHERE id = ?', [JSON.stringify(docs), kegId]);

    res.json({ success: true, message: 'Foto berhasil diubah!', data: docs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create kegiatan
router.post('/', async (req, res) => {
  try {
    const { nama, tanggal, lokasi, peserta, deskripsi, dokumentasi } = req.body;
    if (!nama || !tanggal || !lokasi) {
      return res.status(400).json({ success: false, error: 'Nama, tanggal, dan lokasi wajib diisi' });
    }

    const id = req.body.id || ('keg-' + Date.now());
    const { display, yearStr } = formatTanggalDisplay(tanggal);

    const docs = dokumentasi || [];

    await db.query(`
      INSERT INTO kegiatan (id, nama, tanggal, tanggal_display, tahun, lokasi, peserta, deskripsi, dokumentasi)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, nama, tanggal, display, yearStr, lokasi, peserta || '50 orang', deskripsi || 'Kegiatan pembinaan K3.', JSON.stringify(docs)]);

    try {
      await db.query('INSERT INTO aktivitas (aktivitas, tanggal, oleh) VALUES (?, ?, ?)', [`Menambah kegiatan: ${nama}`, display, 'Admin']);
    } catch (e) {}

    res.status(201).json({
      success: true,
      message: 'Kegiatan berhasil ditambahkan',
      data: {
        id, nama, tanggal, tanggal_display: display, tahun: yearStr, lokasi, peserta, deskripsi, dokumentasi: docs
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

    if (dokumentasi) {
      await db.query(`
        UPDATE kegiatan SET nama = ?, tanggal = ?, tanggal_display = ?, tahun = ?, lokasi = ?, peserta = ?, deskripsi = ?, dokumentasi = ? WHERE id = ?
      `, [nama, tanggal, display, yearStr, lokasi, peserta, deskripsi, JSON.stringify(dokumentasi), id]);
    } else {
      await db.query(`
        UPDATE kegiatan SET nama = ?, tanggal = ?, tanggal_display = ?, tahun = ?, lokasi = ?, peserta = ?, deskripsi = ? WHERE id = ?
      `, [nama, tanggal, display, yearStr, lokasi, peserta, deskripsi, id]);
    }

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
    if (!id) return res.status(400).json({ success: false, error: 'ID Kegiatan dibutuhkan' });
    
    await db.query('DELETE FROM kegiatan WHERE id = ?', [id]);
    res.json({ success: true, message: 'Kegiatan berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

router.delete('/:id', deleteKegiatanHandler);
router.delete('/', deleteKegiatanHandler);

module.exports = router;