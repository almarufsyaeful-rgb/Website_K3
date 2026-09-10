/**
 * routes/dokumen.js
 * REST API endpoints for Dokumen & Berkas K3 with Multer File Upload (Versi MySQL)
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

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB
});

// Handler for downloading documents (Diubah ke async)
const downloadDokumenHandler = async (req, res) => {
  try {
    const id = req.params.id || req.query.id;
    if (!id) {
      return res.status(400).json({ success: false, error: 'ID Dokumen dibutuhkan' });
    }

    // MySQL: Ambil data (Array), lalu pilih index 0
    const [rows] = await db.execute('SELECT * FROM dokumen WHERE id = ?', [id]);
    const doc = rows[0];

    if (!doc) {
      return res.status(404).json({ success: false, error: 'Dokumen tidak ditemukan' });
    }

    if (doc.file_path) {
      const fullPath = path.join(uploadDir, doc.file_path);
      if (fs.existsSync(fullPath)) {
        return res.download(fullPath, doc.nama_file);
      }
    }

    // If file is a mock/seeded file without physical binary, generate sample content
    res.setHeader('Content-Disposition', `attachment; filename="${doc.nama_file}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(`Dokumen Resmi Bidang K3 Disdalduk KB Kota Semarang\nNama File: ${doc.nama_file}\nJudul: ${doc.judul}\nKategori: ${doc.kategori}\nTanggal: ${doc.tanggal_upload}\nDeskripsi: ${doc.deskripsi}`);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

router.get('/download/:id', downloadDokumenHandler);
router.get('/download', downloadDokumenHandler);

// GET all documents
router.get('/', async (req, res) => {
  try {
    const { kategori, search, id, download, action } = req.query;

    if (download || action === 'download') {
      return downloadDokumenHandler(req, res);
    }

    if (id) {
      const [rows] = await db.execute('SELECT * FROM dokumen WHERE id = ?', [id]);
      const r = rows[0];
      if (!r) {
        return res.status(404).json({ success: false, error: 'Dokumen tidak ditemukan' });
      }
      return res.json({
        success: true,
        data: {
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
          filePath: r.file_path
        }
      });
    }

    let query = 'SELECT * FROM dokumen WHERE 1=1';
    const params = [];

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

    // MySQL: Gunakan db.query untuk query dinamis
    const [rows] = await db.query(query, params);
    
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
      filePath: r.file_path
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET document by id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM dokumen WHERE id = ?', [req.params.id]);
    const r = rows[0];

    if (!r) {
      return res.status(404).json({ success: false, error: 'Dokumen tidak ditemukan' });
    }

    res.json({
      success: true,
      data: {
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
        filePath: r.file_path
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST upload / create document 
const uploadDocHandler = async (req, res) => {
  try {
    const { namaFile, judul, kategori, jenis, deskripsi, pengunggah } = req.body;
    const file = req.file;

    const actualName = file ? file.originalname : (namaFile || 'dokumen_baru.pdf');
    const docJudul = judul || actualName;
    const docKategori = kategori || 'BKB';
    let docJenis = jenis;

    if (!docJenis) {
      const ext = path.extname(actualName).toLowerCase();
      if (ext === '.pdf') docJenis = 'PDF';
      else if (ext === '.xlsx' || ext === '.xls') docJenis = 'Excel';
      else if (ext === '.docx' || ext === '.doc') docJenis = 'Word';
      else if (ext === '.pptx' || ext === '.ppt') docJenis = 'PPT';
      else docJenis = 'PDF';
    }

    let icon = 'fa-file-pdf';
    let iconColor = '#ea4335';
    if (docJenis === 'Excel') { icon = 'fa-file-excel'; iconColor = '#107c41'; }
    if (docJenis === 'Word') { icon = 'fa-file-word'; iconColor = '#2b579a'; }
    if (docJenis === 'PPT') { icon = 'fa-file-powerpoint'; iconColor = '#d24726'; }

    const sizeStr = file 
      ? (file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(1)} KB` : `${(file.size / (1024 * 1024)).toFixed(1)} MB`)
      : '2.4 MB';
    const id = req.body.id || ('doc-' + Date.now());

    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const dateDisplay = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

    // MySQL: Gunakan execute untuk insert
    await db.execute(`
      INSERT INTO dokumen (id, nama_file, judul, kategori, jenis, icon, icon_color, ukuran, tanggal_upload, pengunggah, deskripsi, file_path)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, actualName, docJudul, docKategori, docJenis, icon, iconColor, sizeStr, dateDisplay,
      pengunggah || 'Admin K3', deskripsi || 'Dokumen resmi Bidang K3 Disdalduk KB Kota Semarang.',
      file ? file.filename : null
    ]);

    // Auto log aktivitas (tambahkan await)
    try {
      await db.execute(
        'INSERT INTO aktivitas (aktivitas, tanggal, oleh) VALUES (?, ?, ?)',
        [`Upload dokumen: ${actualName}`, dateDisplay, 'Admin']
      );
    } catch {}

    res.status(201).json({
      success: true,
      message: 'Dokumen berhasil diunggah',
      data: {
        id, namaFile: actualName, judul: docJudul, kategori: docKategori, jenis: docJenis,
        icon, iconColor, ukuran: sizeStr, tanggalUpload: dateDisplay,
        pengunggah: pengunggah || 'Admin K3', deskripsi: deskripsi || 'Dokumen resmi Bidang K3 Disdalduk KB Kota Semarang.',
        filePath: file ? file.filename : null
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

router.post('/', upload.single('file'), uploadDocHandler);
router.post('/upload', upload.single('file'), uploadDocHandler);

// PUT update document
const updateDokumenHandler = async (req, res) => {
  try {
    const id = req.params.id || req.query.id || (req.body && req.body.id);
    if (!id) {
      return res.status(400).json({ success: false, error: 'ID Dokumen dibutuhkan' });
    }

    const { namaFile, judul, kategori, jenis, deskripsi } = req.body;
    
    let icon = 'fa-file-pdf';
    let iconColor = '#ea4335';
    if (jenis === 'Excel') { icon = 'fa-file-excel'; iconColor = '#107c41'; }
    if (jenis === 'Word') { icon = 'fa-file-word'; iconColor = '#2b579a'; }
    if (jenis === 'PPT') { icon = 'fa-file-powerpoint'; iconColor = '#d24726'; }

    // MySQL: Gunakan execute dan periksa affectedRows
    const [result] = await db.execute(`
      UPDATE dokumen
      SET nama_file = ?, judul = ?, kategori = ?, jenis = ?, icon = ?, icon_color = ?, deskripsi = ?
      WHERE id = ?
    `, [namaFile, judul, kategori, jenis, icon, iconColor, deskripsi, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Dokumen tidak ditemukan' });
    }

    await db.execute(
      'INSERT INTO aktivitas (aktivitas, tanggal, oleh) VALUES (?, ?, ?)',
      [`Mengubah dokumen: ${namaFile}`, 'Hari ini', 'Admin']
    );

    res.json({ success: true, message: 'Dokumen berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

router.put('/:id', updateDokumenHandler);
router.put('/', updateDokumenHandler);

// DELETE document
const deleteDokumenHandler = async (req, res) => {
  try {
    const id = req.params.id || req.query.id || (req.body && req.body.id);
    if (!id) {
      return res.status(400).json({ success: false, error: 'ID Dokumen dibutuhkan' });
    }

    // Ambil data file dulu sebelum dihapus (untuk menghapus fisik filenya)
    const [rows] = await db.execute('SELECT * FROM dokumen WHERE id = ?', [id]);
    const doc = rows[0];

    if (!doc) {
      return res.status(404).json({ success: false, error: 'Dokumen tidak ditemukan' });
    }

    // Hapus file fisik (Tetap menggunakan module fs bawaan Node)
    if (doc.file_path) {
      const fullPath = path.join(uploadDir, doc.file_path);
      if (fs.existsSync(fullPath)) {
        try { fs.unlinkSync(fullPath); } catch {}
      }
    }

    // MySQL: Hapus dari database
    await db.execute('DELETE FROM dokumen WHERE id = ?', [id]);

    try {
      await db.execute(
        'INSERT INTO aktivitas (aktivitas, tanggal, oleh) VALUES (?, ?, ?)',
        [`Menghapus dokumen: ${doc.nama_file}`, 'Hari ini', 'Admin']
      );
    } catch {}

    res.json({ success: true, message: 'Dokumen berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

router.delete('/:id', deleteDokumenHandler);
router.delete('/', deleteDokumenHandler);
router.post('/delete', deleteDokumenHandler);

module.exports = router;