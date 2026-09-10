/**
 * routes/dokumen.js
 * REST API endpoints untuk Dokumen K3 (Vercel & MySQL Version)
 */

const express = require('express');
const router = express.Router();
const path = require('node:path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const db = require('../db/database'); // Menggunakan koneksi MySQL Railway

// ==========================================
// ⚠️ MASUKKAN KUNCI CLOUDINARY KAMU DI SINI
// ==========================================
cloudinary.config({
  cloud_name: 'bxuyqqoh',
  api_key: '848692597846835',
  api_secret: 'HsXq53Cv8i8yAYylhy76DQ1dnwc'
});

// Setting Multer untuk melempar file ke Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'webk3_dokumen', // Nama folder di dalam akun Cloudinary-mu
    resource_type: 'auto'    // Mengizinkan file PDF, Word, Excel, dll
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 } // Batas maksimal 25MB
});

// GET semua dokumen
router.get('/', async (req, res) => {
  try {
    const { kategori, search } = req.query;
    let query = 'SELECT * FROM dokumen WHERE 1=1';
    let params = [];

    if (kategori && kategori !== 'SEMUA') {
      query += ' AND kategori = ?';
      params.push(kategori);
    }

    if (search) {
      query += ' AND (LOWER(nama_file) LIKE ? OR LOWER(judul) LIKE ? OR LOWER(jenis) LIKE ?)';
      const s = `%${search.toLowerCase()}%`;
      params.push(s, s, s);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await db.query(query, params);
    
    // Format data agar sesuai dengan frontend kamu
    const formatted = rows.map(r => ({
      id: r.id,
      namaFile: r.nama_file,
      judul: r.judul,
      kategori: r.kategori,
      jenis: r.jenis,
      icon: r.icon,
      iconColor: r.icon_color,
      ukuran: r.ukuran,
      tanggalUpload: r.tanggal_upload,
      pengunggah: r.pengunggah,
      deskripsi: r.deskripsi,
      filePath: r.file_path // Sekarang ini akan berisi link URL dari Cloudinary
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    console.error('Error GET dokumen:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST Upload Dokumen Baru
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { namaFile, judul, kategori, jenis, deskripsi, pengunggah } = req.body;
    const file = req.file; // Ini sudah diurus oleh Cloudinary

    const actualName = file ? file.originalname : (namaFile || 'dokumen_baru.pdf');
    const docJudul = judul || actualName;
    const docKategori = kategori || 'BKB';
    let docJenis = jenis || 'PDF';

    // Menentukan Icon
    let icon = 'fa-file-pdf';
    let iconColor = '#ea4335';
    if (docJenis === 'Excel') { icon = 'fa-file-excel'; iconColor = '#107c41'; }
    if (docJenis === 'Word') { icon = 'fa-file-word'; iconColor = '#2b579a'; }
    if (docJenis === 'PPT') { icon = 'fa-file-powerpoint'; iconColor = '#d24726'; }

    const sizeStr = file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : '0 MB';
    const id = req.body.id || ('doc-' + Date.now());
    const fileUrl = file ? file.path : null; // Mendapatkan link URL asli dari Cloudinary

    // Tanggal hari ini
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const dateDisplay = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

    // Simpan ke database MySQL
    await db.query(`
      INSERT INTO dokumen (id, nama_file, judul, kategori, jenis, icon, icon_color, ukuran, tanggal_upload, pengunggah, deskripsi, file_path)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, actualName, docJudul, docKategori, docJenis, icon, iconColor, sizeStr, dateDisplay, pengunggah || 'Admin K3', deskripsi, fileUrl]);

    res.status(201).json({
      success: true,
      message: 'Dokumen berhasil diunggah',
      data: { id, namaFile: actualName, filePath: fileUrl }
    });
  } catch (err) {
    console.error('Error Upload:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE Dokumen
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await db.query('DELETE FROM dokumen WHERE id = ?', [id]);
    res.json({ success: true, message: 'Dokumen berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;