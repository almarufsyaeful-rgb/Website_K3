-- ==============================================================================
-- Database Schema & Initial Data for Disdalduk KB Kota Semarang (Bidang K3)
-- DBMS: MySQL / MariaDB (Compatible with XAMPP phpMyAdmin)
-- Database Name: db_webk3
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `db_webk3` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `db_webk3`;

-- ------------------------------------------------------------------------------
-- 1. Table: programs (Program K3)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `programs`;
CREATE TABLE `programs` (
  `id` VARCHAR(50) NOT NULL,
  `nama` VARCHAR(255) NOT NULL,
  `kategori` VARCHAR(100) NOT NULL,
  `deskripsi` TEXT NULL,
  `ringkasan` TEXT NULL,
  `pelaksana` VARCHAR(100) DEFAULT 'Bidang K3',
  `tahun` INT DEFAULT 2025,
  `icon` VARCHAR(50) DEFAULT 'fa-shield-heart',
  `kegiatan_terkait` JSON NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `programs` (`id`, `nama`, `kategori`, `deskripsi`, `ringkasan`, `pelaksana`, `tahun`, `icon`, `kegiatan_terkait`) VALUES
('prog-1', 'Program Pembinaan Ketahanan Keluarga', 'Pembinaan Keluarga', 'Program ini bertujuan untuk meningkatkan ketahanan keluarga melalui pembinaan, edukasi, dan pemberdayaan keluarga agar mampu menghadapi berbagai tantangan kehidupan.', 'Meningkatkan ketahanan keluarga melalui pembinaan dan edukasi.', 'Bidang K3', 2025, 'fa-shield-heart', '["Sosialisasi Ketahanan Keluarga", "Pelatihan Parenting & Pola Asuh", "Penyuluhan Gizi dan Pencegahan Stunting"]'),
('prog-2', 'Program Pemberdayaan Ekonomi Keluarga', 'Pemberdayaan Ekonomi', 'Meningkatkan kemandirian ekonomi keluarga melalui pelatihan kewirausahaan, kelompok usaha bersama (UPPKA), dan bantuan fasilitas usaha mikro.', 'Meningkatkan kemandirian ekonomi keluarga melalui pelatihan dan bantuan usaha.', 'Bidang K3 & UPPKA', 2025, 'fa-sack-dollar', '["Pelatihan Pemberdayaan Ekonomi Keluarga", "Workshop Pemasaran Digital UPPKA", "Bazar Produk Unggulan Keluarga"]'),
('prog-3', 'Program Kesehatan Keluarga', 'Kesehatan & Gizi', 'Mendorong keluarga sehat, tangguh dan produktif melalui integrasi posyandu balita, posyandu lansia, dan skrining calon pengantin.', 'Mendorong keluarga sehat dan produktif.', 'Bidang K3 & Tim Kesehatan', 2025, 'fa-heart-pulse', '["Pemeriksaan Kesehatan Berkala Lansia (BKL)", "Konseling Pranikah Calon Pengantin", "Edukasi Gizi Seimbang Keluarga"]'),
('prog-4', 'Program Pendidikan dan Pengasuhan Anak', 'Pengasuhan Anak', 'Meningkatkan kualitas pendidikan dan pengasuhan anak dalam keluarga demi mencetak generasi emas bebas stunting dan berkarakter kuat.', 'Meningkatkan kualitas pendidikan dan pengasuhan anak dalam keluarga.', 'Bidang K3 & BKB', 2025, 'fa-graduation-cap', '["Kelas Parenting Bina Keluarga Balita", "Pelatihan Fasilitator BKB Emas", "Monitoring Perkembangan Tumbuh Kembang"]');

-- ------------------------------------------------------------------------------
-- 2. Table: kegiatan (Kegiatan K3)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `kegiatan`;
CREATE TABLE `kegiatan` (
  `id` VARCHAR(50) NOT NULL,
  `nama` VARCHAR(255) NOT NULL,
  `tanggal` DATE NOT NULL,
  `tanggal_display` VARCHAR(50) NOT NULL,
  `tahun` VARCHAR(10) NOT NULL,
  `lokasi` VARCHAR(150) NOT NULL,
  `peserta` VARCHAR(100) DEFAULT '50 orang',
  `deskripsi` TEXT NULL,
  `dokumentasi` JSON NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `kegiatan` (`id`, `nama`, `tanggal`, `tanggal_display`, `tahun`, `lokasi`, `peserta`, `deskripsi`, `dokumentasi`) VALUES
('keg-1', 'Sosialisasi Ketahanan Keluarga', '2025-06-10', '10 Jun 2025', '2025', 'Kec. Tembalang', '50 orang', 'Kegiatan ini bertujuan untuk meningkatkan pemahaman keluarga mengenai pentingnya ketahanan keluarga dalam menghadapi tantangan zaman.', '["https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&auto=format&fit=crop&q=80", "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80", "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&auto=format&fit=crop&q=80"]'),
('keg-2', 'Pelatihan Pemberdayaan Ekonomi Keluarga', '2025-02-15', '15 Feb 2025', '2025', 'Kec. Genuk', '45 orang', 'Pelatihan praktis pembuatan kemasan produk dan digital marketing untuk kelompok usaha peningkatan pendapatan keluarga akseptor (UPPKA).', '["https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80", "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80"]'),
('keg-3', 'Pembinaan BKB', '2025-03-20', '20 Mar 2025', '2025', 'Kec. Banyumanik', '60 orang', 'Pembinaan kader Bina Keluarga Balita (BKB) tentang penggunaan Kartu Kembang Anak (KKA) dan stimulasi motorik balita.', '["https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&auto=format&fit=crop&q=80"]'),
('keg-4', 'Kampanye GenRe', '2025-04-12', '12 Apr 2025', '2025', 'Kec. Semarang Barat', '120 remaja', 'Gerakan kampanye Generasi Berencana (GenRe) bagi siswa SMA/SMK untuk pencegahan pernikahan dini, seks bebas, dan napza.', '["https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80"]'),
('keg-5', 'Pelatihan UPPKA', '2025-05-16', '16 Mei 2025', '2025', 'Kec. Ngaliyan', '35 orang', 'Pemberian bimbingan teknis pencatatan keuangan sederhana dan sertifikasi halal produk kelompok UPPKA.', '["https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80"]'),
('keg-6', 'Penyuluhan PPKS', '2025-06-22', '22 Jun 2025', '2025', 'Kec. Pedurungan', '70 orang', 'Sosialisasi layanan Pusat Pelayanan Keluarga Sejahtera (PPKS) meliputi konseling keluarga, hukum, serta kesehatan reproduksi.', '["https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&auto=format&fit=crop&q=80"]');

-- ------------------------------------------------------------------------------
-- 3. Table: turunan (7 Pilar Turunan K3)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `turunan`;
CREATE TABLE `turunan` (
  `id` VARCHAR(20) NOT NULL,
  `kode` VARCHAR(20) NOT NULL,
  `nama` VARCHAR(150) NOT NULL,
  `kategori` VARCHAR(50) DEFAULT 'balita',
  `kategori_label` VARCHAR(100) NULL,
  `tagline` VARCHAR(255) NULL,
  `deskripsi_singkat` TEXT NULL,
  `tujuan_singkat` TEXT NULL,
  `deskripsi` TEXT NULL,
  `icon` VARCHAR(50) DEFAULT 'fa-sitemap',
  `color` VARCHAR(20) DEFAULT '#3b82f6',
  `target` VARCHAR(150) NULL,
  `total_kelompok` INT DEFAULT 0,
  `tujuan` TEXT NULL,
  `layanan` TEXT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `turunan` (`id`, `kode`, `nama`, `kategori`, `kategori_label`, `tagline`, `deskripsi_singkat`, `tujuan_singkat`, `deskripsi`, `icon`, `color`, `target`, `total_kelompok`, `tujuan`, `layanan`) VALUES
('BKB', 'BKB', 'Bina Keluarga Balita', 'balita', '👶 Untuk Balita & Bayi (0–5 Thn)', 'Membantu Orang Tua Merawat Balita agar Sehat, Cerdas, dan Bebas Stunting', 'Kelompok belajar dan pendampingan bagi orang tua agar paham cara merawat dan mendidik anak balita dengan tepat, sehat, dan tidak stunting.', 'Membantu orang tua memantau tumbuh kembang anak sejak 1.000 hari pertama kehidupan serta mencegah stunting sedini mungkin.', 'Bina Keluarga Balita (BKB) adalah wadah belajar bersama bagi para orang tua yang memiliki anak usia 0 sampai 5 tahun. Di sini, orang tua diajarkan cara memberi gizi yang baik, melatih motorik anak melalui permainan edukatif, dan memantau perkembangan anak dengan Kartu Kembang Anak (KKA).', 'fa-baby-carriage', '#2563eb', 'Orang tua, ayah-ibu, atau pengasuh yang memiliki anak balita (0–5 tahun)', 48, '["Membantu orang tua memahami pola makan dan asupan gizi 1.000 Hari Pertama Kehidupan agar anak bebas stunting.","Melatih orang tua menggunakan Kartu Kembang Anak (KKA) untuk memantau apakah perkembangan anak sudah sesuai usianya.","Memberikan contoh permainan edukatif yang melatih kecerdasan otak, gerakan motorik, dan emosi anak.","Menciptakan suasana pengasuhan keluarga yang penuh kasih sayang dan bebas dari kekerasan."]', '["Pertemuan rutin kelompok orang tua membahas tips pengasuhan anak balita.","Pemeriksaan dan pencatatan tumbuh kembang anak di Kartu Kembang Anak (KKA).","Praktik bermain dengan Alat Permainan Edukatif (APE) bersama anak.","Konsultasi gizi balita dan rujukan terpadu ke Posyandu / Puskesmas terdekat."]'),
('BKR', 'BKR', 'Bina Keluarga Remaja', 'remaja', '🧑 Untuk Orang Tua yang Punya Anak Remaja', 'Membimbing Remaja Melewati Masa Pubertas dan Menyiapkan Masa Depan', 'Bimbingan bagi orang tua agar bisa berkomunikasi akrab dengan anak remaja dan membimbing pergaulan mereka di era media sosial.', 'Menghindarkan remaja dari pergaulan bebas, pernikahan di bawah umur, dan narkoba, serta merencanakan masa depan.', 'Bina Keluarga Remaja (BKR) membantu para orang tua memahami perubahan emosi, fisik, dan pergaulan anak remaja usia 10 hingga 24 tahun. Tujuannya agar orang tua bisa menjadi sahabat curhat bagi anak tanpa harus selalu menghakimi.', 'fa-user-group', '#8b5cf6', 'Keluarga dan orang tua yang memiliki anak usia remaja (10–24 tahun dan belum menikah)', 36, '["Membantu orang tua belajar cara berbicara santai dan terbuka dengan anak remaja (komunikasi dua arah).","Mencegah anak remaja terjerumus ke dalam seks bebas, pernikahan usia dini, minuman keras, dan narkoba (TRIAD KRR).","Mendampingi anak remaja dalam merencanakan sekolah, kuliah, karier, dan masa depannya.","Membentengi anak remaja dari bahaya konten negatif di internet dan media sosial."]', '["Kelas belajar pola asuh remaja di era digital untuk orang tua.","Konseling keluarga saat menghadapi anak remaja yang sedang bermasalah atau tertutup.","Sosialisasi kesehatan reproduksi remaja bersama duta sebaya."]'),
('BKL', 'BKL', 'Bina Keluarga Lansia', 'lansia', '👵 Untuk Lansia & Kakek-Nenek (60+ Thn)', 'Mewujudkan Kakek & Nenek yang Tetap Sehat, Bugar, Ceria, dan Mandiri', 'Wadah bagi keluarga dan lansia agar tetap aktif berolahraga, bersosialisasi, tidak mudah pikun, dan bahagia di usia senja.', 'Menjaga kesehatan fisik dan mental para lansia agar tetap mandiri, tidak kesepian, dan bahagia bersama keluarga.', 'Bina Keluarga Lansia (BKL) adalah kegiatan khusus lansia (usia 60 tahun ke atas) dan anggota keluarga yang merawatnya. Program ini mengedepankan konsep \"Lansia Tangguh\" yang sehat jasmani, aktif, terhubung dengan teman sebaya, dan bersemangat menjalani hidup.', 'fa-person-cane', '#06b6d4', 'Warga lanjut usia (60 tahun ke atas) serta anggota keluarga yang merawat lansia di rumah', 32, '["Menjaga kebugaran jasmani lansia melalui senam khusus dan cek kesehatan rutin.","Mencegah kepikunan (demensia) dengan permainan asah otak dan kegiatan bercerita.","Membekali anggota keluarga cara merawat lansia dengan sabar, penuh kasih, dan telaten.","Memberikan ruang kumpul gembira bagi sesama lansia agar tidak merasa kesepian atau terasing."]', '["Senam lansia bugar bersama instruktur dan cek tensi/kesehatan berkala.","Kegiatan sosial, pengajian, bernyanyi bersama, dan kerajinan tangan ringan.","Panduan menu makanan bergizi khusus lansia dan konsultasi perawatan usia lanjut."]'),
('UPPKA', 'UPPKA', 'Usaha Peningkatan Pendapatan Keluarga', 'ekonomi', '💼 Tambahan Penghasilan & Usaha Rumahan', 'Pemberdayaan Wirausaha Rumahan untuk Menambah Pemasukan Keluarga', 'Kelompok wirausaha bagi para ibu/keluarga peserta KB untuk belajar membuat produk olahan makanan/kerajinan dan menjualnya.', 'Membantu keluarga memiliki pemasukan keuangan tambahan agar kebutuhan rumah tangga tercukupi dan lebih mandiri.', 'UPPKA mengajak para ibu dan keluarga peserta KB untuk aktif berwirausaha secara kelompok maupun mandiri. Peserta dibimbing mulai dari cara membuat produk yang diminati pasar, mengemas produk secara menarik, mengurus izin usaha resmi, hingga memasarkannya lewat pameran dan media sosial.', 'fa-hand-holding-dollar', '#10b981', 'Keluarga peserta KB yang ingin memulai atau mengembangkan usaha rumahan / mikro', 25, '["Meningkatkan penghasilan keluarga agar lebih sejahtera dan mandiri secara ekonomi.","Melatih keterampilan membuat produk kuliner lezat, busana, atau kerajinan tangan khas lokal.","Membantu izin usaha gratis seperti NIB (Nomor Induk Berusaha), izin P-IRT, dan sertifikat halal.","Membuka akses pasar penjualan melalui bazar UMKM dan promosi online."]', '["Pelatihan memasak olahan pangan lokal dan pembuatan kerajinan tangan bernilai jual.","Bimbingan cara menghitung modal, keuntungan, dan pembukuan sederhana.","Bantuan pendaftaran izin usaha resmi dan fasilitasi pameran / bazar belanja warga."]'),
('PIK-R', 'PIK-R', 'Pusat Konseling Remaja Sebaya', 'remaja', '💬 Tempat Curhat & Diskusi Remaja', 'Ruang Curhat Ramah Remaja: Dari Remaja, Oleh Remaja, untuk Remaja', 'Tempat kumpul dan curhat yang asik bagi remaja di sekolah/kampus untuk bertanya soal masalah pribadi, pertemanan, dan kesehatan reproduksi.', 'Menyediakan tempat curhat yang nyaman, aman, dan tanpa penghakiman bagi remaja agar terhindar dari pergaulan salah.', 'PIK-R dibentuk agar anak muda punya tempat bertanya yang tepat mengenai persoalan pubertas, cinta, kesehatan reproduksi, dan cita-cita. Konselor yang melayani adalah sesama remaja yang sudah dilatih secara profesional sehingga komunikasinya santai dan tanpa rasa canggung.', 'fa-comments', '#f59e0b', 'Pelajar SMP, SMA/SMK, mahasiswa, dan pemuda karang taruna usia 10–24 tahun', 40, '["Memberikan teman curhat terpercaya untuk remaja yang sedang galau atau memiliki masalah pribadi.","Memberikan edukasi kesehatan reproduksi yang benar agar remaja tidak terjebak info hoaks di internet.","Mencegah kehamilan di luar nikah, penyakit menular seksual, dan pernikahan dini.","Melatih rasa percaya diri, jiwa kepemimpinan, dan kecakapan hidup (life skills) anak muda."]', '["Sesi curhat tatap muka dan konsultasi online secara rahasia dan gratis.","Diskusi kelompok dan workshop kesehatan remaja di sekolah-sekolah.","Aksi sosial pemuda, lomba kreasi video edukasi, dan gathering anak muda kreatif."]'),
('PPKS', 'PPKS', 'Pusat Konseling Keluarga Sejahtera', 'konseling', '👨‍👩‍👧 Konsultasi Masalah Keluarga (100% Gratis)', 'Layanan Terpadu Curhat & Solusi Masalah Keluarga Satu Pintu', 'Layanan konsultasi dan konseling keluarga gratis dengan psikolog dan tenaga ahli untuk membantu menyelesaikan masalah rumah tangga.', 'Membantu keluarga menyelesaikan persoalan rumah tangga, persiapan menikah, dan masalah anak secara kekeluargaan dan rahasia.', 'Pusat Pelayanan Keluarga Sejahtera (PPKS) adalah kantor layanan konsultasi gratis milik Pemerintah Kota Semarang. Masyarakat yang sedang memiliki masalah rumah tangga, calon pengantin yang ingin siap menikah, atau orang tua yang bingung mengatasi anak bermasalah bisa datang berkonsultasi dengan tenang.', 'fa-hospital-user', '#ec4899', 'Seluruh warga Kota Semarang, calon pengantin, pasangan suami-istri, orang tua, dan anak', 16, '["Menyediakan layanan konsultasi psikologi dan keluarga secara gratis tanpa dipungut biaya sepeserpun.","Mempersiapkan calon pengantin agar siap mental, fisik, dan ekonomi sebelum melangkah ke jenjang pernikahan.","Membantu mediasi keharmonisan suami-istri dan mencegah perceraian maupun KDRT.","Mendampingi keluarga yang memiliki anak dengan kebutuhan khusus atau trauma psikologis."]', '["Konseling Pranikah bagi pasangan yang akan menikah (bimbingan aplikasi Elsimil).","Konseling masalah komunikasi suami-istri dan mediasi keharmonisan keluarga.","Konsultasi psikologi anak dan pengasuhan keluarga.","Konsultasi gizi keluarga dan pendampingan rujukan medis gratis."]'),
('GENRE', 'GENRE', 'Generasi Berencana (GenRe)', 'remaja', '📣 Gerakan Anak Muda Keren & Berencana', 'Saatnya yang Muda yang Berencana: Sukseskan Pendidikan & Karier Dulu!', 'Gerakan anak muda Kota Semarang yang mengkampanyekan pentingnya menata masa depan, kuliah/kerja dulu, baru menikah di usia matang.', 'Mengajak remaja tidak terburu-buru menikah (target usia matang 21 tahun untuk wanita & 25 tahun untuk pria) demi masa depan cerah.', 'GenRe adalah komunitas anak muda kreatif di Kota Semarang. GenRe mengajak para remaja menjauhi pernikahan dini dan fokus mengejar mimpi, mengembangkan hobi positif, serta memiliki rencana hidup yang terarah sebelum berkeluarga.', 'fa-bullhorn', '#6366f1', 'Remaja, pelajar, mahasiswa, Duta GenRe, dan seluruh generasi muda Kota Semarang', 30, '["Mengkampanyekan usia nikah ideal: minimal 21 tahun bagi perempuan dan 25 tahun bagi laki-laki.","Membentuk generasi muda yang berpendidikan tinggi, berkarier mandiri, dan berakhlak mulia.","Memilih Duta GenRe dari kalangan remaja sebagai panutan bagi teman-temannya di media sosial.","Menyiapkan calon orang tua masa depan yang cerdas dan bebas dari anak stunting kelak."]', '["Pemilihan Duta GenRe Kota Semarang tingkat kecamatan dan kota setiap tahun.","Kunjungan edukasi GenRe Goes to School dan GenRe Goes to Campus.","Kemah kreatif pemuda (Jambore GenRe) dan lomba konten positif di media sosial."]');

-- ------------------------------------------------------------------------------
-- 4. Table: bkb_data (Kelompok Binaan)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `bkb_data`;
CREATE TABLE `bkb_data` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nama_kelompok` VARCHAR(150) NOT NULL,
  `alamat` TEXT NOT NULL,
  `ketua` VARCHAR(100) NOT NULL,
  `jumlah_anggota` INT NOT NULL DEFAULT 0,
  `tahun` VARCHAR(10) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `bkb_data` (`id`, `nama_kelompok`, `alamat`, `ketua`, `jumlah_anggota`, `tahun`) VALUES
(1, 'Melati', 'Jl. Sendangmulyo No. 12, RT 03/RW 05', 'Siti Rahmawati', 35, '2025'),
(2, 'Anggrek', 'Jl. Kedungmundu Raya No. 45', 'Sri Wahyuni', 28, '2025'),
(3, 'Cempaka', 'Kec. Tembalang RT 01/RW 02', 'Nurul Hidayah', 30, '2024'),
(4, 'Kenanga', 'Kel. Meteseh RT 04/RW 01', 'Endang Lestari', 25, '2024'),
(5, 'Mawar', 'Kel. Jangli No. 8', 'Dewi Kartika', 32, '2024');

-- ------------------------------------------------------------------------------
-- 5. Table: dokumen (Data Dokumen K3)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `dokumen`;
CREATE TABLE `dokumen` (
  `id` VARCHAR(50) NOT NULL,
  `nama_file` VARCHAR(255) NOT NULL,
  `judul` VARCHAR(255) NOT NULL,
  `kategori` VARCHAR(50) NOT NULL,
  `jenis` VARCHAR(20) NOT NULL,
  `icon` VARCHAR(50) DEFAULT 'fa-file-pdf',
  `icon_color` VARCHAR(20) DEFAULT '#ea4335',
  `ukuran` VARCHAR(30) DEFAULT '2.5 MB',
  `tanggal_upload` VARCHAR(50) NOT NULL,
  `pengunggah` VARCHAR(100) DEFAULT 'Admin K3',
  `deskripsi` TEXT NULL,
  `file_path` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `dokumen` (`id`, `nama_file`, `judul`, `kategori`, `jenis`, `icon`, `icon_color`, `ukuran`, `tanggal_upload`, `pengunggah`, `deskripsi`, `file_path`) VALUES
('doc-1', 'data_bkb_2025.xlsx', 'Data Rekapitulasi BKB Kota Semarang 2025', 'BKB', 'Excel', 'fa-file-excel', '#107c41', '2.8 MB', '12 Apr 2025', 'Admin K3', 'Data rekapitulasi keanggotaan dan sebaran kelompok Bina Keluarga Balita (BKB) di 16 kecamatan se-Kota Semarang tahun 2025.', NULL),
('doc-2', 'laporan_bkr.pptx', 'Laporan Evaluasi Pembinaan BKR Q1 2025', 'BKR', 'PPT', 'fa-file-powerpoint', '#d24726', '5.1 MB', '5 Apr 2025', 'Admin K3', 'Paparan hasil evaluasi pelaksanaan kegiatan Bina Keluarga Remaja (BKR) dan tingkat partisipasi orang tua triwulan I.', NULL),
('doc-3', 'profil_bkl.pdf', 'Profil Kelompok Bina Keluarga Lansia Tangguh', 'BKL', 'PDF', 'fa-file-pdf', '#ea4335', '3.4 MB', '20 Mar 2025', 'Admin K3', 'Buku profil kelompok BKL tangguh, indikator 7 dimensi lansia tangguh, serta panduan senam lansia di posyandu binaan.', NULL),
('doc-4', 'data_uppka.docx', 'Panduan Legalitas Usaha Kelompok UPPKA', 'UPPKA', 'Word', 'fa-file-word', '#2b579a', '1.9 MB', '10 Mar 2025', 'Admin K3', 'Panduan tata cara perizinan NIB dan sertifikasi P-IRT bagi produk binaan Usaha Peningkatan Pendapatan Keluarga Akseptor.', NULL),
('doc-5', 'laporan_genre.xlsx', 'Rekapitulasi Duta & Pusat Konseling GenRe 2025', 'GENRE', 'Excel', 'fa-file-excel', '#107c41', '3.1 MB', '15 Feb 2025', 'Admin K3', 'Daftar nama Duta GenRe Kota Semarang dan sebaran Pusat Informasi Konseling Remaja (PIK-R) di sekolah dan jalur masyarakat.', NULL),
('doc-6', 'panduan_program_bkb_2025.pdf', 'Panduan Program BKB 2025.pdf', 'BKB', 'PDF', 'fa-file-pdf', '#ea4335', '3.4 MB', '12 Apr 2025', 'Admin K3', 'Dokumen ini berisi panduan pelaksanaan program BKB tahun 2025.', NULL);

-- ------------------------------------------------------------------------------
-- 6. Table: aktivitas (Audit Log Admin)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `aktivitas`;
CREATE TABLE `aktivitas` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `aktivitas` VARCHAR(255) NOT NULL,
  `tanggal` VARCHAR(50) NOT NULL,
  `oleh` VARCHAR(100) NOT NULL DEFAULT 'Admin',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `aktivitas` (`id`, `aktivitas`, `tanggal`, `oleh`) VALUES
(1, 'Menambah data kegiatan', '12 Jun 2025', 'Admin'),
(2, 'Upload dokumen program', '10 Jun 2025', 'Admin'),
(3, 'Mengubah data program', '8 Jun 2025', 'Admin'),
(4, 'Menambah kategori', '5 Jun 2025', 'Admin');

-- ------------------------------------------------------------------------------
-- 7. Table: news (Berita & Informasi)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `news`;
CREATE TABLE `news` (
  `id` VARCHAR(50) NOT NULL,
  `judul` VARCHAR(255) NOT NULL,
  `ringkasan` VARCHAR(255) NULL,
  `tanggal` VARCHAR(50) NOT NULL,
  `kategori` VARCHAR(50) NULL,
  `gambar` TEXT NULL,
  `link` VARCHAR(100) NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `news` (`id`, `judul`, `ringkasan`, `tanggal`, `kategori`, `gambar`, `link`) VALUES
('news-1', 'Pelaksanaan Program BKB di Kecamatan Tembalang Berjalan Sukses', 'Pelaksanaan Program BKB', '12 Mei 2025', 'BKB', 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&auto=format&fit=crop&q=80', '#kegiatan-detail?id=keg-3'),
('news-2', 'Kegiatan Penyuluhan Remaja Cegah Stunting Sejak Dini', 'Kegiatan Penyuluhan Remaja', '5 Mei 2025', 'PIK-R', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80', '#kegiatan-detail?id=keg-4'),
('news-3', 'Rapat Koordinasi K3 Tingkat Kota Semarang Periode 2025', 'Rapat Koordinasi K3', '28 April 2025', 'Koordinasi', 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&auto=format&fit=crop&q=80', '#kegiatan-detail?id=keg-1');
