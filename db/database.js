/**
 * db/database.js
 * MySQL Database connection, schema setup, and auto-seeding for Railway
 */

require('dotenv').config();
const mysql = require('mysql2/promise'); 

// ==========================================
// PENGATURAN KONEKSI DATABASE
// Pastikan isi data di bawah ini sesuai dengan tab Variables di Railway!
// ==========================================
const db = mysql.createPool({
    host: 'junction.proxy.rlwy.net',       // Contoh: 'viaduct.proxy.rlwy.net'
    port: 37661,                          // Ganti angka ini dengan port aslimu (TIDAK PERLU tanda kutip)
    user: 'root',                         // Biasanya tetap 'root'
    password: 'ynjPCpPzcZMcsLzprVtodXpxNjwZdScf',  // Ganti dengan password aslimu
    database: 'railway',                  // Biasanya tetap 'railway'
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Inisialisasi Tabel dan Data
async function initSchema() {
  try {
    const connection = await db.getConnection();
    console.log('✅ Terhubung ke database MySQL Railway!');

    // 1. MEMBUAT TABEL (SCHEMA)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS programs (
        id VARCHAR(50) PRIMARY KEY,
        nama VARCHAR(255) NOT NULL,
        kategori VARCHAR(100) NOT NULL,
        deskripsi TEXT,
        ringkasan TEXT,
        pelaksana VARCHAR(100),
        tahun INT,
        icon VARCHAR(50),
        kegiatan_terkait TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS kegiatan (
        id VARCHAR(50) PRIMARY KEY,
        nama VARCHAR(255) NOT NULL,
        tanggal VARCHAR(50) NOT NULL,
        tanggal_display VARCHAR(50) NOT NULL,
        tahun VARCHAR(10) NOT NULL,
        lokasi VARCHAR(255) NOT NULL,
        peserta VARCHAR(100),
        deskripsi TEXT,
        dokumentasi TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS turunan (
        id VARCHAR(50) PRIMARY KEY,
        kode VARCHAR(50) NOT NULL,
        nama VARCHAR(255) NOT NULL,
        tagline TEXT,
        deskripsi TEXT,
        icon VARCHAR(50),
        color VARCHAR(20),
        target VARCHAR(255),
        total_kelompok INT DEFAULT 0,
        tujuan TEXT,
        layanan TEXT
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS bkb_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama_kelompok VARCHAR(255) NOT NULL,
        alamat TEXT NOT NULL,
        ketua VARCHAR(100) NOT NULL,
        jumlah_anggota INT NOT NULL,
        tahun VARCHAR(10) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS dokumen (
        id VARCHAR(50) PRIMARY KEY,
        nama_file VARCHAR(255) NOT NULL,
        judul VARCHAR(255) NOT NULL,
        kategori VARCHAR(50) NOT NULL,
        jenis VARCHAR(20) NOT NULL,
        icon VARCHAR(50),
        icon_color VARCHAR(20),
        ukuran VARCHAR(20),
        tanggal_upload VARCHAR(50),
        pengunggah VARCHAR(100),
        deskripsi TEXT,
        file_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS aktivitas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        aktivitas VARCHAR(255) NOT NULL,
        tanggal VARCHAR(50) NOT NULL,
        oleh VARCHAR(100) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS news (
        id VARCHAR(50) PRIMARY KEY,
        judul VARCHAR(255) NOT NULL,
        ringkasan TEXT,
        tanggal VARCHAR(50) NOT NULL,
        kategori VARCHAR(50),
        gambar TEXT,
        link TEXT
      )
    `);

    // 2. SEEDING DATA AWAL 
    
    // Cek & Isi Programs
    const [progRows] = await connection.query('SELECT COUNT(*) as count FROM programs');
    if (progRows[0].count === 0) {
      const progQuery = `INSERT INTO programs (id, nama, kategori, deskripsi, ringkasan, pelaksana, tahun, icon, kegiatan_terkait) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      await connection.query(progQuery, ['prog-1', 'Program Pembinaan Ketahanan Keluarga', 'Pembinaan Keluarga', 'Program ini bertujuan untuk meningkatkan ketahanan keluarga...', 'Meningkatkan ketahanan keluarga.', 'Bidang K3', 2025, 'fa-shield-heart', JSON.stringify(['Sosialisasi', 'Pelatihan'])]);
      await connection.query(progQuery, ['prog-2', 'Program Pemberdayaan Ekonomi Keluarga', 'Pemberdayaan Ekonomi', 'Meningkatkan kemandirian ekonomi...', 'Meningkatkan kemandirian.', 'Bidang K3 & UPPKA', 2025, 'fa-sack-dollar', JSON.stringify(['Workshop'])]);
    }

    // Cek & Isi Turunan
    const [turunanRows] = await connection.query('SELECT COUNT(*) as count FROM turunan');
    if (turunanRows[0].count === 0) {
      const turunanQuery = `REPLACE INTO turunan (id, kode, nama, tagline, deskripsi, icon, color, target, total_kelompok, tujuan, layanan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      await connection.query(turunanQuery, ['BKB', 'BKB', 'Bina Keluarga Balita', 'Pengasuhan Tumbuh Kembang', 'Wadah kegiatan keluarga...', 'fa-baby-carriage', '#2563eb', 'Orang tua balita', 48, JSON.stringify(['Tujuan 1']), JSON.stringify(['Layanan 1'])]);
    }

    // Cek & Isi News
    const [newsRows] = await connection.query('SELECT COUNT(*) as count FROM news');
    if (newsRows[0].count === 0) {
      const newsQuery = `INSERT INTO news (id, judul, ringkasan, tanggal, kategori, gambar, link) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      await connection.query(newsQuery, ['news-1', 'Pelaksanaan Program BKB', 'Pelaksanaan Program BKB', '12 Mei 2025', 'BKB', 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&auto=format&fit=crop&q=80', '#kegiatan-detail?id=keg-3']);
    }

    console.log('✅ Database berhasil disiapkan (Tables & Seeding)!');
    connection.release();

  } catch (error) {
    console.error('❌ Gagal menyiapkan database MySQL:', error);
  }
}

// Jalankan fungsi inisialisasi saat server menyala
initSchema();

module.exports = db;