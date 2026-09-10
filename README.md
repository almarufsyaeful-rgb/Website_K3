# Panduan Integrasi XAMPP, PHP & MySQL (Web K3 Disdalduk KB Kota Semarang)

Aplikasi website **Bidang K3 Disdalduk KB Kota Semarang** mendukung integrasi penuh dengan **XAMPP (Apache + PHP + MySQL/phpMyAdmin)**.

---

## 1. Persiapan Database MySQL di XAMPP

1. **Buka Aplikasi XAMPP Control Panel**:
   - Start modul **Apache**
   - Start modul **MySQL**
2. **Buka phpMyAdmin**:
   - Buka browser dan kunjungi: [http://localhost/phpmyadmin/](http://localhost/phpmyadmin/)
3. **Import Berkas Database**:
   - Klik tab **Import** di bagian atas phpMyAdmin.
   - Klik tombol **Choose File** (Pilih Berkas).
   - Pilih berkas `database.sql` yang berada di direktori proyek ini:
     `/Users/syaefulalmaruf/Documents/webk3/database.sql`
   - Klik tombol **Import / Kirim** di bagian bawah.
   - Database `db_webk3` beserta 7 tabel dan seluruh data awal akan otomatis dibuat!

---

## 2. Struktur Tabel Database (`db_webk3`)

| No | Nama Tabel | Deskripsi Data |
|---|---|---|
| 1 | `programs` | Data program K3 (Pembinaan, Ekonomi, Kesehatan, Pendidikan & Pengasuhan) |
| 2 | `kegiatan` | Data kegiatan operasional, tanggal, lokasi kecamatan, target peserta, dokumentasi |
| 3 | `turunan` | 7 Pilar kelompok binaan (BKB, BKR, BKL, UPPKA, PIK-R, PPKS, GENRE) |
| 4 | `bkb_data` | Data kelompok binaan (Nama Kelompok, Alamat, Ketua, Jumlah Anggota, Tahun) |
| 5 | `dokumen` | Arsip dokumen, kategori, format (PDF/Excel/Word/PPT), dan lokasi file fisik |
| 6 | `aktivitas` | Log audit aktivitas admin secara otomatis |
| 7 | `news` | Berita dan informasi terkini ketahanan keluarga |

---

## 3. Konfigurasi Koneksi Database PHP (`api/config/database.php`)

Pengaturan default sudah disesuaikan dengan standar XAMPP:
```php
private $host = "localhost";
private $db_name = "db_webk3";
private $username = "root";
private $password = ""; // Default XAMPP tanpa password
```

---

## 4. Cara Menjalankan Website di XAMPP

Folder proyek ini sudah terhubung (symlink) langsung ke direktori `htdocs` XAMPP Anda. Setelah Apache & MySQL di XAMPP berstatus **Running**, Anda dapat langsung mengakses:

- **Halaman Website Utama**: **[http://localhost/webk3/](http://localhost/webk3/)**
- **Panel phpMyAdmin**: **[http://localhost/phpmyadmin/](http://localhost/phpmyadmin/)**
- **Test Endpoint API**:
  - Programs: `http://localhost/webk3/api/programs.php`
  - Kegiatan: `http://localhost/webk3/api/kegiatan.php`
  - Dokumen: `http://localhost/webk3/api/dokumen.php`
  - BKB: `http://localhost/webk3/api/bkb.php`
  - Stats: `http://localhost/webk3/api/stats.php`

---

## 5. Menjalankan Alternatif dengan Node.js

Jika ingin menjalankan tanpa XAMPP (menggunakan server Node.js bawaan):
```bash
npm start
# Akses di: http://localhost:3000/
```
# Website_K3
