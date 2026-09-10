/**
 * db/database.js
 * SQLite Database connection, schema setup, and auto-seeding
 * Using Node.js native DatabaseSync
 */

const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

// Ensure db directory exists
const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Database file path
const dbPath = path.join(dbDir, 'database.sqlite');
const db = new DatabaseSync(dbPath);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

// Initialize Tables
function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS programs (
      id TEXT PRIMARY KEY,
      nama TEXT NOT NULL,
      kategori TEXT NOT NULL,
      deskripsi TEXT,
      ringkasan TEXT,
      pelaksana TEXT,
      tahun INTEGER,
      icon TEXT,
      kegiatan_terkait TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS kegiatan (
      id TEXT PRIMARY KEY,
      nama TEXT NOT NULL,
      tanggal TEXT NOT NULL,
      tanggal_display TEXT NOT NULL,
      tahun TEXT NOT NULL,
      lokasi TEXT NOT NULL,
      peserta TEXT,
      deskripsi TEXT,
      dokumentasi TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS turunan (
      id TEXT PRIMARY KEY,
      kode TEXT NOT NULL,
      nama TEXT NOT NULL,
      tagline TEXT,
      deskripsi TEXT,
      icon TEXT,
      color TEXT,
      target TEXT,
      total_kelompok INTEGER DEFAULT 0,
      tujuan TEXT,
      layanan TEXT
    );

    CREATE TABLE IF NOT EXISTS bkb_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama_kelompok TEXT NOT NULL,
      alamat TEXT NOT NULL,
      ketua TEXT NOT NULL,
      jumlah_anggota INTEGER NOT NULL,
      tahun TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS dokumen (
      id TEXT PRIMARY KEY,
      nama_file TEXT NOT NULL,
      judul TEXT NOT NULL,
      kategori TEXT NOT NULL,
      jenis TEXT NOT NULL,
      icon TEXT,
      icon_color TEXT,
      ukuran TEXT,
      tanggal_upload TEXT,
      pengunggah TEXT,
      deskripsi TEXT,
      file_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS aktivitas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      aktivitas TEXT NOT NULL,
      tanggal TEXT NOT NULL,
      oleh TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS news (
      id TEXT PRIMARY KEY,
      judul TEXT NOT NULL,
      ringkasan TEXT,
      tanggal TEXT NOT NULL,
      kategori TEXT,
      gambar TEXT,
      link TEXT
    );
  `);

  seedInitialData();
}

function seedInitialData() {
  // Check if programs exist
  const progCount = db.prepare('SELECT COUNT(*) as count FROM programs').get().count;
  if (progCount === 0) {
    const insertProg = db.prepare(`
      INSERT INTO programs (id, nama, kategori, deskripsi, ringkasan, pelaksana, tahun, icon, kegiatan_terkait)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertProg.run(
      'prog-1',
      'Program Pembinaan Ketahanan Keluarga',
      'Pembinaan Keluarga',
      'Program ini bertujuan untuk meningkatkan ketahanan keluarga melalui pembinaan, edukasi, dan pemberdayaan keluarga agar mampu menghadapi berbagai tantangan kehidupan.',
      'Meningkatkan ketahanan keluarga melalui pembinaan dan edukasi.',
      'Bidang K3',
      2025,
      'fa-shield-heart',
      JSON.stringify([
        'Sosialisasi Ketahanan Keluarga',
        'Pelatihan Parenting & Pola Asuh',
        'Penyuluhan Gizi dan Pencegahan Stunting'
      ])
    );

    insertProg.run(
      'prog-2',
      'Program Pemberdayaan Ekonomi Keluarga',
      'Pemberdayaan Ekonomi',
      'Meningkatkan kemandirian ekonomi keluarga melalui pelatihan kewirausahaan, kelompok usaha bersama (UPPKA), dan bantuan fasilitas usaha mikro.',
      'Meningkatkan kemandirian ekonomi keluarga melalui pelatihan dan bantuan usaha.',
      'Bidang K3 & UPPKA',
      2025,
      'fa-sack-dollar',
      JSON.stringify([
        'Pelatihan Pemberdayaan Ekonomi Keluarga',
        'Workshop Pemasaran Digital UPPKA',
        'Bazar Produk Unggulan Keluarga'
      ])
    );

    insertProg.run(
      'prog-3',
      'Program Kesehatan Keluarga',
      'Kesehatan & Gizi',
      'Mendorong keluarga sehat, tangguh dan produktif melalui integrasi posyandu balita, posyandu lansia, dan skrining calon pengantin.',
      'Mendorong keluarga sehat dan produktif.',
      'Bidang K3 & Tim Kesehatan',
      2025,
      'fa-heart-pulse',
      JSON.stringify([
        'Pemeriksaan Kesehatan Berkala Lansia (BKL)',
        'Konseling Pranikah Calon Pengantin',
        'Edukasi Gizi Seimbang Keluarga'
      ])
    );

    insertProg.run(
      'prog-4',
      'Program Pendidikan dan Pengasuhan Anak',
      'Pengasuhan Anak',
      'Meningkatkan kualitas pendidikan dan pengasuhan anak dalam keluarga demi mencetak generasi emas bebas stunting dan berkarakter kuat.',
      'Meningkatkan kualitas pendidikan dan pengasuhan anak dalam keluarga.',
      'Bidang K3 & BKB',
      2025,
      'fa-graduation-cap',
      JSON.stringify([
        'Kelas Parenting Bina Keluarga Balita',
        'Pelatihan Fasilitator BKB Emas',
        'Monitoring Perkembangan Tumbuh Kembang'
      ])
    );
  }

  // Check if kegiatan exist
  const kegCount = db.prepare('SELECT COUNT(*) as count FROM kegiatan').get().count;
  if (kegCount === 0) {
    const insertKeg = db.prepare(`
      INSERT INTO kegiatan (id, nama, tanggal, tanggal_display, tahun, lokasi, peserta, deskripsi, dokumentasi)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const defaultKegs = [
      {
        id: 'keg-1',
        nama: 'Sosialisasi Ketahanan Keluarga',
        tanggal: '2025-06-10',
        tanggal_display: '10 Jun 2025',
        tahun: '2025',
        lokasi: 'Kec. Tembalang',
        peserta: '50 orang',
        deskripsi: 'Kegiatan ini bertujuan untuk meningkatkan pemahaman keluarga mengenai pentingnya ketahanan keluarga dalam menghadapi tantangan zaman.',
        dokumentasi: JSON.stringify([
          'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&auto=format&fit=crop&q=80'
        ])
      },
      {
        id: 'keg-2',
        nama: 'Pelatihan Pemberdayaan Ekonomi Keluarga',
        tanggal: '2025-02-15',
        tanggal_display: '15 Feb 2025',
        tahun: '2025',
        lokasi: 'Kec. Genuk',
        peserta: '45 orang',
        deskripsi: 'Pelatihan praktis pembuatan kemasan produk dan digital marketing untuk kelompok usaha peningkatan pendapatan keluarga akseptor (UPPKA).',
        dokumentasi: JSON.stringify([
          'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80'
        ])
      },
      {
        id: 'keg-3',
        nama: 'Pembinaan BKB',
        tanggal: '2025-03-20',
        tanggal_display: '20 Mar 2025',
        tahun: '2025',
        lokasi: 'Kec. Banyumanik',
        peserta: '60 orang',
        deskripsi: 'Pembinaan kader Bina Keluarga Balita (BKB) tentang penggunaan Kartu Kembang Anak (KKA) dan stimulasi motorik balita.',
        dokumentasi: JSON.stringify([
          'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&auto=format&fit=crop&q=80'
        ])
      },
      {
        id: 'keg-4',
        nama: 'Kampanye GenRe',
        tanggal: '2025-04-12',
        tanggal_display: '12 Apr 2025',
        tahun: '2025',
        lokasi: 'Kec. Semarang Barat',
        peserta: '120 remaja',
        deskripsi: 'Gerakan kampanye Generasi Berencana (GenRe) bagi siswa SMA/SMK untuk pencegahan pernikahan dini, seks bebas, dan napza.',
        dokumentasi: JSON.stringify([
          'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80'
        ])
      },
      {
        id: 'keg-5',
        nama: 'Pelatihan UPPKA',
        tanggal: '2025-05-16',
        tanggal_display: '16 Mei 2025',
        tahun: '2025',
        lokasi: 'Kec. Ngaliyan',
        peserta: '35 orang',
        deskripsi: 'Pemberian bimbingan teknis pencatatan keuangan sederhana dan sertifikasi halal produk kelompok UPPKA.',
        dokumentasi: JSON.stringify([
          'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80'
        ])
      },
      {
        id: 'keg-6',
        nama: 'Penyuluhan PPKS',
        tanggal: '2025-06-22',
        tanggal_display: '22 Jun 2025',
        tahun: '2025',
        lokasi: 'Kec. Pedurungan',
        peserta: '70 orang',
        deskripsi: 'Sosialisasi layanan Pusat Pelayanan Keluarga Sejahtera (PPKS) meliputi konseling keluarga, hukum, serta kesehatan reproduksi.',
        dokumentasi: JSON.stringify([
          'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&auto=format&fit=crop&q=80'
        ])
      }
    ];

    for (const k of defaultKegs) {
      insertKeg.run(k.id, k.nama, k.tanggal, k.tanggal_display, k.tahun, k.lokasi, k.peserta, k.deskripsi, k.dokumentasi);
    }
  }

  // Check if turunan exist
  try {
    const checkCol = db.prepare("PRAGMA table_info(turunan)").all();
    const hasTujuan = checkCol.some(c => c.name === 'tujuan');
    if (!hasTujuan) {
      db.prepare("ALTER TABLE turunan ADD COLUMN tagline TEXT").run();
      db.prepare("ALTER TABLE turunan ADD COLUMN tujuan TEXT").run();
      db.prepare("ALTER TABLE turunan ADD COLUMN layanan TEXT").run();
    }
  } catch (e) {}

  const turunanCount = db.prepare('SELECT COUNT(*) as count FROM turunan').get().count;
  if (turunanCount === 0 || true) {
    const replaceTurunan = db.prepare(`
      INSERT OR REPLACE INTO turunan (id, kode, nama, tagline, deskripsi, icon, color, target, total_kelompok, tujuan, layanan)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const defaultTurunan = [
      {
        id: 'BKB', kode: 'BKB', nama: 'Bina Keluarga Balita',
        tagline: 'Pengasuhan Tumbuh Kembang Balita Optimal & Bebas Stunting',
        deskripsi: 'Wadah kegiatan keluarga yang berfokus pada peningkatan pengetahuan, sikap, dan keterampilan orang tua serta anggota keluarga lainnya dalam membina tumbuh kembang balita secara menyeluruh, baik aspek fisik, kecerdasan motorik, emosional, maupun sosial.',
        icon: 'fa-baby-carriage', color: '#2563eb',
        target: 'Orang tua dan keluarga yang memiliki balita (0–5 tahun)', total_kelompok: 48,
        tujuan: JSON.stringify([
          'Meningkatkan pemahaman orang tua mengenai pola pengasuhan 1.000 HPK untuk pencegahan stunting.',
          'Membekali keluarga kemampuan memantau tumbuh kembang anak menggunakan KKA dan Buku KIA.',
          'Memberikan stimulasi dini kemampuan motorik, sensorik, komunikasi, dan kecerdasan emosional anak.',
          'Mewujudkan keluarga yang mandiri dan tangguh dalam mengasuh generasi emas berkualitas.'
        ]),
        layanan: JSON.stringify([
          'Penyuluhan berkala kelompok BKB dengan Modul BKB Holistik Integratif (HI).',
          'Pemantauan tumbuh kembang balita secara berkala dengan Kartu Kembang Anak (KKA).',
          'Praktik stimulasi motorik dan sensorik menggunakan Alat Permainan Edukatif (APE).',
          'Rujukan gizi, imunisasi posyandu, dan integrasi PAUD di tingkat kelurahan.'
        ])
      },
      {
        id: 'BKR', kode: 'BKR', nama: 'Bina Keluarga Remaja',
        tagline: 'Membimbing Generasi Remaja Menuju Masa Depan Berkarakter',
        deskripsi: 'Kelompok kegiatan yang membantu orang tua memahami perkembangan fisik, psikologis, pergaulan, dan pendidikan karakter remaja dalam melewati masa transisi menuju kedewasaan yang bertanggung jawab.',
        icon: 'fa-user-group', color: '#8b5cf6',
        target: 'Keluarga dengan anak usia remaja (10–24 tahun)', total_kelompok: 36,
        tujuan: JSON.stringify([
          'Meningkatkan komunikasi efektif dan keterbukaan antara orang tua dengan anak remaja.',
          'Mencegah perilaku berisiko remaja dari ancaman Seks Bebas, Pernikahan Dini, dan Napza (TRIAD KRR).',
          'Membimbing remaja dalam perencanaan pendidikan, karier, dan kesiapan berkeluarga.',
          'Menanamkan nilai-nilai moral, spiritual, dan ketahanan mental generasi muda di era digital.'
        ]),
        layanan: JSON.stringify([
          'Kelas parenting pengasuhan remaja dan literasi digital keluarga.',
          'Konseling keluarga untuk mengatasi problematika perilaku dan pergaulan remaja.',
          'Sosialisasi kesehatan reproduksi remaja bersama Pendidik Sebaya PIK-R.'
        ])
      },
      {
        id: 'BKL', kode: 'BKL', nama: 'Bina Keluarga Lansia',
        tagline: 'Mewujudkan Lansia Tangguh yang Sehat, Aktif, dan Bermartabat',
        deskripsi: 'Program pembinaan bagi keluarga lansia dan lansia itu sendiri agar tetap sehat, aktif, mandiri, dan bermartabat (Lansia Tangguh) sepanjang siklus kehidupan.',
        icon: 'fa-person-cane', color: '#06b6d4',
        target: 'Keluarga yang memiliki lansia dan para lansia (60+ tahun)', total_kelompok: 32,
        tujuan: JSON.stringify([
          'Menerapkan konsep 7 Dimensi Lansia Tangguh (spiritual, fisik, emosional, intelektual, sosial, vokasional, dan lingkungan).',
          'Meningkatkan kapasitas pendamping lansia (caregiver) dalam merawat dan memberikan perhatian psikologis.',
          'Mempertahankan kebugaran fisik dan fungsi kognitif lansia guna mencegah kepikunan (demensia).',
          'Membangun rasa kebermaknaan dan kebahagiaan hidup lansia dalam keluarga dan masyarakat.'
        ]),
        layanan: JSON.stringify([
          'Senam kebugaran lansia rutin dan pemeriksaan kesehatan/tekanan darah berkala.',
          'Forum interaksi sosial, rekreasi, keagamaan, dan keterampilan produktif ringan.',
          'Konsultasi gizi lansia dan pendampingan perawatan jangka panjang (PJP).'
        ])
      },
      {
        id: 'UPPKA', kode: 'UPPKA', nama: 'Usaha Peningkatan Pendapatan Keluarga Akseptor',
        tagline: 'Pemberdayaan Ekonomi & Kemandirian Finansial Keluarga Akseptor',
        deskripsi: 'Kelompok usaha mikro ekonomi keluarga untuk mewujudkan kemandirian ekonomi keluarga akseptor KB aktif, terutama dari keluarga pra-sejahtera dan sejahtera I.',
        icon: 'fa-hand-holding-dollar', color: '#10b981',
        target: 'Keluarga Akseptor KB Produktif', total_kelompok: 25,
        tujuan: JSON.stringify([
          'Meningkatkan pendapatan dan taraf kesejahteraan ekonomi keluarga peserta KB aktif.',
          'Menumbuhkan jiwa wirausaha mikro, inovasi kemasan, dan mutu produk keluarga binaan.',
          'Memfasilitasi legalitas izin usaha mikro (NIB), sertifikasi halal, dan izin edar P-IRT.',
          'Memperluas akses kemitraan permodalan, perbankan, dan pemasaran produk secara digital.'
        ]),
        layanan: JSON.stringify([
          'Pelatihan vokasi pengolahan produk kuliner, kriya, dan kerajinan lokal Semarang.',
          'Bimtek manajemen pembukuan keuangan usaha dan pemasaran digital (digital marketing).',
          'Fasilitasi bazar UMKM K3, pameran produk kota, dan temu mitra usaha.'
        ])
      },
      {
        id: 'PIK-R', kode: 'PIK-R', nama: 'Pusat Informasi & Konseling Remaja',
        tagline: 'Ruang Ramah Remaja: Dari, Oleh, dan Untuk Remaja',
        deskripsi: 'Pusat informasi dan konseling sebaya untuk remaja dalam merencanakan masa depan, menjaga kesehatan reproduksi, dan mengembangkan potensi diri yang positif.',
        icon: 'fa-comments', color: '#f59e0b',
        target: 'Remaja dan Mahasiswa usia 10–24 tahun', total_kelompok: 40,
        tujuan: JSON.stringify([
          'Menyediakan wadah informasi dan konseling sebaya yang nyaman, inklusif, dan tanpa stigma.',
          'Mengedukasi remaja mengenai kesehatan reproduksi, pubertas, dan perencanaan kehidupan berkeluarga.',
          'Mencegah kehamilan tidak diinginkan (KTD), infeksi menular seksual, dan pernikahan dini.',
          'Membentuk karakter kepemimpinan, kecakapan hidup (life skills), dan kepedulian sosial remaja.'
        ]),
        layanan: JSON.stringify([
          'Konseling sebaya tatap muka dan daring oleh Konselor Sebaya tersertifikasi.',
          'Workshop edukasi reproduksi sehat dan diskusi kelompok terarah (FGD).',
          'Aksi sosial, kampanye kreatif anti narkoba, dan lomba kreativitas remaja.'
        ])
      },
      {
        id: 'PPKS', kode: 'PPKS', nama: 'Pusat Pelayanan Keluarga Sejahtera',
        tagline: 'Layanan Terpadu Konsultasi & Konseling Keluarga Satu Pintu',
        deskripsi: 'Layanan terpadu konsultasi dan konseling keluarga, hukum keluarga, pra-nikah, gizi, dan tumbuh kembang anak berbasis profesional dan bebas biaya untuk seluruh lapisan masyarakat.',
        icon: 'fa-hospital-user', color: '#ec4899',
        target: 'Masyarakat umum, calon pengantin, dan seluruh tahapan keluarga', total_kelompok: 16,
        tujuan: JSON.stringify([
          'Memberikan pelayanan konsultasi dan konseling keluarga terpadu secara profesional dan gratis.',
          'Mempersiapkan calon pengantin (catin) dalam aspek fisik, psikologis, dan finansial menuju pernikahan berkualitas.',
          'Memfasilitasi mediasi konflik rumah tangga dan pencegahan kekerasan dalam rumah tangga (KDRT).',
          'Mendampingi keluarga dalam tumbuh kembang anak serta penanganan krisis psikologis keluarga.'
        ]),
        layanan: JSON.stringify([
          'Konseling Pranikah & bimbingan kesiapan berkeluarga (aplikasi Elsimil).',
          'Konseling Pengasuhan Balita, Anak, dan Remaja.',
          'Konseling Keharmonisan Rumah Tangga & Mediasi Keluarga.',
          'Konseling Gizi Keluarga dan rujukan medis/psikologis terpadu.'
        ])
      },
      {
        id: 'GENRE', kode: 'GENRE', nama: 'Generasi Berencana',
        tagline: 'Saatnya yang Muda yang Berencana!',
        deskripsi: 'Program pembentukan karakter generasi muda untuk mewujudkan Generasi Berencana yang sehat, cerdas, dan ceria melalui pemahaman 8 fungsi keluarga dan penyiapan masa depan.',
        icon: 'fa-bullhorn', color: '#6366f1',
        target: 'Remaja, Duta GenRe, & Pendidik Sebaya Kota Semarang', total_kelompok: 30,
        tujuan: JSON.stringify([
          'Mengkampanyekan penundaan usia perkawinan (minimal 21 tahun wanita, 25 tahun pria).',
          'Menanamkan pemahaman 8 fungsi keluarga sebagai fondasi kehidupan berkeluarga.',
          'Membina figur Duta GenRe sebagai panutan dan penyebar virus positif bagi generasi sebaya.',
          'Mempersiapkan generasi muda unggul yang cerdas emosional, bebas stunting, dan berdaya saing.'
        ]),
        layanan: JSON.stringify([
          'Pemilihan Duta GenRe Kota Semarang tingkat kecamatan dan kota.',
          'GenRe Goes to School dan GenRe Goes to Campus (roadshow interaktif).',
          'Kemah Temu Pendidik Sebaya (Jambore GenRe) dan kampanye media sosial kreatif.'
        ])
      }
    ];

    for (const t of defaultTurunan) {
      replaceTurunan.run(t.id, t.kode, t.nama, t.tagline, t.deskripsi, t.icon, t.color, t.target, t.total_kelompok, t.tujuan, t.layanan);
    }
  }

  // Check if bkb_data exist
  const bkbCount = db.prepare('SELECT COUNT(*) as count FROM bkb_data').get().count;
  if (bkbCount === 0) {
    const insertBkb = db.prepare(`
      INSERT INTO bkb_data (nama_kelompok, alamat, ketua, jumlah_anggota, tahun)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertBkb.run('Melati', 'Jl. Sendangmulyo No. 12, RT 03/RW 05', 'Siti Rahmawati', 35, '2025');
    insertBkb.run('Anggrek', 'Jl. Kedungmundu Raya No. 45', 'Sri Wahyuni', 28, '2025');
    insertBkb.run('Cempaka', 'Kec. Tembalang RT 01/RW 02', 'Nurul Hidayah', 30, '2024');
    insertBkb.run('Kenanga', 'Kel. Meteseh RT 04/RW 01', 'Endang Lestari', 25, '2024');
    insertBkb.run('Mawar', 'Kel. Jangli No. 8', 'Dewi Kartika', 32, '2024');
  }

  // Check if dokumen exist
  const docCount = db.prepare('SELECT COUNT(*) as count FROM dokumen').get().count;
  if (docCount === 0) {
    const insertDoc = db.prepare(`
      INSERT INTO dokumen (id, nama_file, judul, kategori, jenis, icon, icon_color, ukuran, tanggal_upload, pengunggah, deskripsi, file_path)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const defaultDocs = [
      { id: 'doc-1', nama_file: 'data_bkb_2025.xlsx', judul: 'Data Rekapitulasi BKB Kota Semarang 2025', kategori: 'BKB', jenis: 'Excel', icon: 'fa-file-excel', icon_color: '#107c41', ukuran: '2.8 MB', tanggal_upload: '12 Apr 2025', pengunggah: 'Admin K3', deskripsi: 'Data rekapitulasi keanggotaan dan sebaran kelompok Bina Keluarga Balita (BKB) di 16 kecamatan se-Kota Semarang tahun 2025.', file_path: null },
      { id: 'doc-2', nama_file: 'laporan_bkr.pptx', judul: 'Laporan Evaluasi Pembinaan BKR Q1 2025', kategori: 'BKR', jenis: 'PPT', icon: 'fa-file-powerpoint', icon_color: '#d24726', ukuran: '5.1 MB', tanggal_upload: '5 Apr 2025', pengunggah: 'Admin K3', deskripsi: 'Paparan hasil evaluasi pelaksanaan kegiatan Bina Keluarga Remaja (BKR) dan tingkat partisipasi orang tua triwulan I.', file_path: null },
      { id: 'doc-3', nama_file: 'profil_bkl.pdf', judul: 'Profil Kelompok Bina Keluarga Lansia Tangguh', kategori: 'BKL', jenis: 'PDF', icon: 'fa-file-pdf', icon_color: '#ea4335', ukuran: '3.4 MB', tanggal_upload: '20 Mar 2025', pengunggah: 'Admin K3', deskripsi: 'Buku profil kelompok BKL tangguh, indikator 7 dimensi lansia tangguh, serta panduan senam lansia di posyandu binaan.', file_path: null },
      { id: 'doc-4', nama_file: 'data_uppka.docx', judul: 'Panduan Legalitas Usaha Kelompok UPPKA', kategori: 'UPPKA', jenis: 'Word', icon: 'fa-file-word', icon_color: '#2b579a', ukuran: '1.9 MB', tanggal_upload: '10 Mar 2025', pengunggah: 'Admin K3', deskripsi: 'Panduan tata cara perizinan NIB dan sertifikasi P-IRT bagi produk binaan Usaha Peningkatan Pendapatan Keluarga Akseptor.', file_path: null },
      { id: 'doc-5', nama_file: 'laporan_genre.xlsx', judul: 'Rekapitulasi Duta & Pusat Konseling GenRe 2025', kategori: 'GENRE', jenis: 'Excel', icon: 'fa-file-excel', icon_color: '#107c41', ukuran: '3.1 MB', tanggal_upload: '15 Feb 2025', pengunggah: 'Admin K3', deskripsi: 'Daftar nama Duta GenRe Kota Semarang dan sebaran Pusat Informasi Konseling Remaja (PIK-R) di sekolah dan jalur masyarakat.', file_path: null },
      { id: 'doc-6', nama_file: 'panduan_program_bkb_2025.pdf', judul: 'Panduan Program BKB 2025.pdf', kategori: 'BKB', jenis: 'PDF', icon: 'fa-file-pdf', icon_color: '#ea4335', ukuran: '3.4 MB', tanggal_upload: '12 Apr 2025', pengunggah: 'Admin K3', deskripsi: 'Dokumen ini berisi panduan pelaksanaan program BKB tahun 2025.', file_path: null }
    ];

    for (const d of defaultDocs) {
      insertDoc.run(d.id, d.nama_file, d.judul, d.kategori, d.jenis, d.icon, d.icon_color, d.ukuran, d.tanggal_upload, d.pengunggah, d.deskripsi, d.file_path);
    }
  }

  // Check if aktivitas exist
  const aktCount = db.prepare('SELECT COUNT(*) as count FROM aktivitas').get().count;
  if (aktCount === 0) {
    const insertAkt = db.prepare(`
      INSERT INTO aktivitas (aktivitas, tanggal, oleh)
      VALUES (?, ?, ?)
    `);

    insertAkt.run('Menambah data kegiatan', '12 Jun 2025', 'Admin');
    insertAkt.run('Upload dokumen program', '10 Jun 2025', 'Admin');
    insertAkt.run('Mengubah data program', '8 Jun 2025', 'Admin');
    insertAkt.run('Menambah kategori', '5 Jun 2025', 'Admin');
  }

  // Check if news exist
  const newsCount = db.prepare('SELECT COUNT(*) as count FROM news').get().count;
  if (newsCount === 0) {
    const insertNews = db.prepare(`
      INSERT INTO news (id, judul, ringkasan, tanggal, kategori, gambar, link)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertNews.run(
      'news-1',
      'Pelaksanaan Program BKB di Kecamatan Tembalang Berjalan Sukses',
      'Pelaksanaan Program BKB',
      '12 Mei 2025',
      'BKB',
      'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&auto=format&fit=crop&q=80',
      '#kegiatan-detail?id=keg-3'
    );
    insertNews.run(
      'news-2',
      'Kegiatan Penyuluhan Remaja Cegah Stunting Sejak Dini',
      'Kegiatan Penyuluhan Remaja',
      '5 Mei 2025',
      'PIK-R',
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80',
      '#kegiatan-detail?id=keg-4'
    );
    insertNews.run(
      'news-3',
      'Rapat Koordinasi K3 Tingkat Kota Semarang Periode 2025',
      'Rapat Koordinasi K3',
      '28 April 2025',
      'Koordinasi',
      'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&auto=format&fit=crop&q=80',
      '#kegiatan-detail?id=keg-1'
    );
  }
}

// Initialize on require
initSchema();

module.exports = db;
