/**
 * data.js
 * Mock data store for Disdalduk KB Kota Semarang - Bidang K3
 * Supports persistence using localStorage
 */

const STORAGE_KEYS = {
  PROGRAMS: 'webk3_programs',
  KEGIATAN: 'webk3_kegiatan',
  TURUNAN: 'webk3_turunan',
  BKB_DATA: 'webk3_bkb_data',
  DOKUMEN: 'webk3_dokumen',
  AKTIVITAS: 'webk3_aktivitas',
  NEWS: 'webk3_news'
};

// Initial default data matching wireframes exactly
const defaultPrograms = [
  {
    id: 'prog-1',
    nama: 'Program Pembinaan Ketahanan Keluarga',
    kategori: 'Pembinaan Keluarga',
    deskripsi: 'Meningkatkan ketahanan keluarga melalui pembinaan, edukasi, dan pemberdayaan keluarga agar mampu menghadapi berbagai tantangan kehidupan.',
    ringkasan: 'Meningkatkan ketahanan keluarga melalui pembinaan dan edukasi.',
    pelaksana: 'Bidang K3',
    tahun: 2025,
    icon: 'fa-shield-heart',
    kegiatanTerkait: [
      'Sosialisasi Ketahanan Keluarga',
      'Pelatihan Parenting & Pola Asuh',
      'Penyuluhan Gizi dan Pencegahan Stunting'
    ]
  },
  {
    id: 'prog-2',
    nama: 'Program Pemberdayaan Ekonomi Keluarga',
    kategori: 'Pemberdayaan Ekonomi',
    deskripsi: 'Meningkatkan kemandirian ekonomi keluarga melalui pelatihan kewirausahaan, kelompok usaha bersama (UPPKA), dan bantuan fasilitas usaha mikro.',
    ringkasan: 'Meningkatkan kemandirian ekonomi keluarga melalui pelatihan dan bantuan usaha.',
    pelaksana: 'Bidang K3 & UPPKA',
    tahun: 2025,
    icon: 'fa-sack-dollar',
    kegiatanTerkait: [
      'Pelatihan Pemberdayaan Ekonomi Keluarga',
      'Workshop Pemasaran Digital UPPKA',
      'Bazar Produk Unggulan Keluarga'
    ]
  },
  {
    id: 'prog-3',
    nama: 'Program Kesehatan Keluarga',
    kategori: 'Kesehatan & Gizi',
    deskripsi: 'Mendorong keluarga sehat, tangguh dan produktif melalui integrasi posyandu balita, posyandu lansia, dan skrining calon pengantin.',
    ringkasan: 'Mendorong keluarga sehat dan produktif.',
    pelaksana: 'Bidang K3 & Tim Kesehatan',
    tahun: 2025,
    icon: 'fa-heart-pulse',
    kegiatanTerkait: [
      'Pemeriksaan Kesehatan Berkala Lansia (BKL)',
      'Konseling Pranikah Calon Pengantin',
      'Edukasi Gizi Seimbang Keluarga'
    ]
  },
  {
    id: 'prog-4',
    nama: 'Program Pendidikan dan Pengasuhan Anak',
    kategori: 'Pengasuhan Anak',
    deskripsi: 'Meningkatkan kualitas pendidikan dan pengasuhan anak dalam keluarga demi mencetak generasi emas bebas stunting dan berkarakter kuat.',
    ringkasan: 'Meningkatkan kualitas pendidikan dan pengasuhan anak dalam keluarga.',
    pelaksana: 'Bidang K3 & BKB',
    tahun: 2025,
    icon: 'fa-graduation-cap',
    kegiatanTerkait: [
      'Kelas Parenting Bina Keluarga Balita',
      'Pelatihan Fasilitator BKB Emas',
      'Monitoring Perkembangan Tumbuh Kembang'
    ]
  }
];

const defaultKegiatan = [
  {
    id: 'keg-1',
    nama: 'Sosialisasi Ketahanan Keluarga',
    tanggal: '2025-06-10',
    tanggalDisplay: '10 Jun 2025',
    tahun: '2025',
    lokasi: 'Kec. Tembalang',
    peserta: '50 orang',
    deskripsi: 'Kegiatan ini bertujuan untuk meningkatkan pemahaman keluarga mengenai pentingnya ketahanan keluarga dalam menghadapi tantangan zaman.',
    dokumentasi: [
      'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'keg-2',
    nama: 'Pelatihan Pemberdayaan Ekonomi Keluarga',
    tanggal: '2025-02-15',
    tanggalDisplay: '15 Feb 2025',
    tahun: '2025',
    lokasi: 'Kec. Genuk',
    peserta: '45 orang',
    deskripsi: 'Pelatihan praktis pembuatan kemasan produk dan digital marketing untuk kelompok usaha peningkatan pendapatan keluarga akseptor (UPPKA).',
    dokumentasi: [
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'keg-3',
    nama: 'Pembinaan BKB',
    tanggal: '2025-03-20',
    tanggalDisplay: '20 Mar 2025',
    tahun: '2025',
    lokasi: 'Kec. Banyumanik',
    peserta: '60 orang',
    deskripsi: 'Pembinaan kader Bina Keluarga Balita (BKB) tentang penggunaan Kartu Kembang Anak (KKA) dan stimulasi motorik balita.',
    dokumentasi: [
      'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'keg-4',
    nama: 'Kampanye GenRe',
    tanggal: '2025-04-12',
    tanggalDisplay: '12 Apr 2025',
    tahun: '2025',
    lokasi: 'Kec. Semarang Barat',
    peserta: '120 remaja',
    deskripsi: 'Gerakan kampanye Generasi Berencana (GenRe) bagi siswa SMA/SMK untuk pencegahan pernikahan dini, seks bebas, dan napza.',
    dokumentasi: [
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'keg-5',
    nama: 'Pelatihan UPPKA',
    tanggal: '2025-05-16',
    tanggalDisplay: '16 Mei 2025',
    tahun: '2025',
    lokasi: 'Kec. Ngaliyan',
    peserta: '35 orang',
    deskripsi: 'Pemberian bimbingan teknis pencatatan keuangan sederhana dan sertifikasi halal produk kelompok UPPKA.',
    dokumentasi: [
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'keg-6',
    nama: 'Penyuluhan PPKS',
    tanggal: '2025-06-22',
    tanggalDisplay: '22 Jun 2025',
    tahun: '2025',
    lokasi: 'Kec. Pedurungan',
    peserta: '70 orang',
    deskripsi: 'Sosialisasi layanan Pusat Pelayanan Keluarga Sejahtera (PPKS) meliputi konseling keluarga, hukum, serta kesehatan reproduksi.',
    dokumentasi: [
      'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&auto=format&fit=crop&q=80'
    ]
  }
];

const defaultTurunan = [
  {
    id: 'BKB',
    kode: 'BKB',
    nama: 'Bina Keluarga Balita',
    kategori: 'balita',
    kategoriLabel: '👶 Untuk Balita & Bayi (0–5 Thn)',
    tagline: 'Membantu Orang Tua Merawat Balita agar Sehat, Cerdas, dan Bebas Stunting',
    deskripsiSingkat: 'Kelompok belajar dan pendampingan bagi orang tua agar paham cara merawat dan mendidik anak balita dengan tepat, sehat, dan tidak stunting.',
    tujuanSingkat: 'Membantu orang tua memantau tumbuh kembang anak sejak 1.000 hari pertama kehidupan serta mencegah stunting sedini mungkin.',
    deskripsi: 'Bina Keluarga Balita (BKB) adalah wadah belajar bersama bagi para orang tua yang memiliki anak usia 0 sampai 5 tahun. Di sini, orang tua diajarkan cara memberi gizi yang baik, melatih motorik anak melalui permainan edukatif, dan memantau perkembangan anak dengan Kartu Kembang Anak (KKA).',
    icon: 'fa-baby-carriage',
    color: '#2563eb',
    target: 'Orang tua, ayah-ibu, atau pengasuh yang memiliki anak balita (0–5 tahun)',
    totalKelompok: 48,
    tujuan: [
      'Membantu orang tua memahami pola makan dan asupan gizi 1.000 Hari Pertama Kehidupan agar anak bebas stunting.',
      'Melatih orang tua menggunakan Kartu Kembang Anak (KKA) untuk memantau apakah perkembangan anak sudah sesuai usianya.',
      'Memberikan contoh permainan edukatif yang melatih kecerdasan otak, gerakan motorik, dan emosi anak.',
      'Menciptakan suasana pengasuhan keluarga yang penuh kasih sayang dan bebas dari kekerasan.'
    ],
    layanan: [
      'Pertemuan rutin kelompok orang tua membahas tips pengasuhan anak balita.',
      'Pemeriksaan dan pencatatan tumbuh kembang anak di Kartu Kembang Anak (KKA).',
      'Praktik bermain dengan Alat Permainan Edukatif (APE) bersama anak.',
      'Konsultasi gizi balita dan rujukan terpadu ke Posyandu / Puskesmas terdekat.'
    ]
  },
  {
    id: 'BKR',
    kode: 'BKR',
    nama: 'Bina Keluarga Remaja',
    kategori: 'remaja',
    kategoriLabel: '🧑 Untuk Orang Tua yang Punya Anak Remaja',
    tagline: 'Membimbing Remaja Melewati Masa Pubertas dan Menyiapkan Masa Depan',
    deskripsiSingkat: 'Bimbingan bagi orang tua agar bisa berkomunikasi akrab dengan anak remaja dan membimbing pergaulan mereka di era media sosial.',
    tujuanSingkat: 'Menghindarkan remaja dari pergaulan bebas, pernikahan di bawah umur, dan narkoba, serta merencanakan masa depan.',
    deskripsi: 'Bina Keluarga Remaja (BKR) membantu para orang tua memahami perubahan emosi, fisik, dan pergaulan anak remaja usia 10 hingga 24 tahun. Tujuannya agar orang tua bisa menjadi sahabat curhat bagi anak tanpa harus selalu menghakimi.',
    icon: 'fa-user-group',
    color: '#8b5cf6',
    target: 'Keluarga dan orang tua yang memiliki anak usia remaja (10–24 tahun dan belum menikah)',
    totalKelompok: 36,
    tujuan: [
      'Membantu orang tua belajar cara berbicara santai dan terbuka dengan anak remaja (komunikasi dua arah).',
      'Mencegah anak remaja terjerumus ke dalam seks bebas, pernikahan usia dini, minuman keras, dan narkoba (TRIAD KRR).',
      'Mendampingi anak remaja dalam merencanakan sekolah, kuliah, karier, dan masa depannya.',
      'Membentengi anak remaja dari bahaya konten negatif di internet dan media sosial.'
    ],
    layanan: [
      'Kelas belajar pola asuh remaja di era digital untuk orang tua.',
      'Konseling keluarga saat menghadapi anak remaja yang sedang bermasalah atau tertutup.',
      'Sosialisasi kesehatan reproduksi remaja bersama duta sebaya.'
    ]
  },
  {
    id: 'BKL',
    kode: 'BKL',
    nama: 'Bina Keluarga Lansia',
    kategori: 'lansia',
    kategoriLabel: '👵 Untuk Lansia & Kakek-Nenek (60+ Thn)',
    tagline: 'Mewujudkan Kakek & Nenek yang Tetap Sehat, Bugar, Ceria, dan Mandiri',
    deskripsiSingkat: 'Wadah bagi keluarga dan lansia agar tetap aktif berolahraga, bersosialisasi, tidak mudah pikun, dan bahagia di usia senja.',
    tujuanSingkat: 'Menjaga kesehatan fisik dan mental para lansia agar tetap mandiri, tidak kesepian, dan bahagia bersama keluarga.',
    deskripsi: 'Bina Keluarga Lansia (BKL) adalah kegiatan khusus lansia (usia 60 tahun ke atas) dan anggota keluarga yang merawatnya. Program ini mengedepankan konsep "Lansia Tangguh" yang sehat jasmani, aktif, terhubung dengan teman sebaya, dan bersemangat menjalani hidup.',
    icon: 'fa-person-cane',
    color: '#06b6d4',
    target: 'Warga lanjut usia (60 tahun ke atas) serta anggota keluarga yang merawat lansia di rumah',
    totalKelompok: 32,
    tujuan: [
      'Menjaga kebugaran jasmani lansia melalui senam khusus dan cek kesehatan rutin.',
      'Mencegah kepikunan (demensia) dengan permainan asah otak dan kegiatan bercerita.',
      'Membekali anggota keluarga cara merawat lansia dengan sabar, penuh kasih, dan telaten.',
      'Memberikan ruang kumpul gembira bagi sesama lansia agar tidak merasa kesepian atau terasing.'
    ],
    layanan: [
      'Senam lansia bugar bersama instruktur dan cek tensi/kesehatan berkala.',
      'Kegiatan sosial, pengajian, bernyanyi bersama, dan kerajinan tangan ringan.',
      'Panduan menu makanan bergizi khusus lansia dan konsultasi perawatan usia lanjut.'
    ]
  },
  {
    id: 'UPPKA',
    kode: 'UPPKA',
    nama: 'Usaha Peningkatan Pendapatan Keluarga',
    kategori: 'ekonomi',
    kategoriLabel: '💼 Tambahan Penghasilan & Usaha Rumahan',
    tagline: 'Pemberdayaan Wirausaha Rumahan untuk Menambah Pemasukan Keluarga',
    deskripsiSingkat: 'Kelompok wirausaha bagi para ibu/keluarga peserta KB untuk belajar membuat produk olahan makanan/kerajinan dan menjualnya.',
    tujuanSingkat: 'Membantu keluarga memiliki pemasukan keuangan tambahan agar kebutuhan rumah tangga tercukupi dan lebih mandiri.',
    deskripsi: 'UPPKA mengajak para ibu dan keluarga peserta KB untuk aktif berwirausaha secara kelompok maupun mandiri. Peserta dibimbing mulai dari cara membuat produk yang diminati pasar, mengemas produk secara menarik, mengurus izin usaha resmi, hingga memasarkannya lewat pameran dan media sosial.',
    icon: 'fa-hand-holding-dollar',
    color: '#10b981',
    target: 'Keluarga peserta KB yang ingin memulai atau mengembangkan usaha rumahan / mikro',
    totalKelompok: 25,
    tujuan: [
      'Meningkatkan penghasilan keluarga agar lebih sejahtera dan mandiri secara ekonomi.',
      'Melatih keterampilan membuat produk kuliner lezat, busana, atau kerajinan tangan khas lokal.',
      'Membantu izin usaha gratis seperti NIB (Nomor Induk Berusaha), izin P-IRT, dan sertifikat halal.',
      'Membuka akses pasar penjualan melalui bazar UMKM dan promosi online.'
    ],
    layanan: [
      'Pelatihan memasak olahan pangan lokal dan pembuatan kerajinan tangan bernilai jual.',
      'Bimbingan cara menghitung modal, keuntungan, dan pembukuan sederhana.',
      'Bantuan pendaftaran izin usaha resmi dan fasilitasi pameran / bazar belanja warga.'
    ]
  },
  {
    id: 'PIK-R',
    kode: 'PIK-R',
    nama: 'Pusat Konseling Remaja Sebaya',
    kategori: 'remaja',
    kategoriLabel: '💬 Tempat Curhat & Diskusi Remaja',
    tagline: 'Ruang Curhat Ramah Remaja: Dari Remaja, Oleh Remaja, untuk Remaja',
    deskripsiSingkat: 'Tempat kumpul dan curhat yang asik bagi remaja di sekolah/kampus untuk bertanya soal masalah pribadi, pertemanan, dan kesehatan reproduksi.',
    tujuanSingkat: 'Menyediakan tempat curhat yang nyaman, aman, dan tanpa penghakiman bagi remaja agar terhindar dari pergaulan salah.',
    deskripsi: 'PIK-R dibentuk agar anak muda punya tempat bertanya yang tepat mengenai persoalan pubertas, cinta, kesehatan reproduksi, dan cita-cita. Konselor yang melayani adalah sesama remaja yang sudah dilatih secara profesional sehingga komunikasinya santai dan tanpa rasa canggung.',
    icon: 'fa-comments',
    color: '#f59e0b',
    target: 'Pelajar SMP, SMA/SMK, mahasiswa, dan pemuda karang taruna usia 10–24 tahun',
    totalKelompok: 40,
    tujuan: [
      'Memberikan teman curhat terpercaya untuk remaja yang sedang galau atau memiliki masalah pribadi.',
      'Memberikan edukasi kesehatan reproduksi yang benar agar remaja tidak terjebak info hoaks di internet.',
      'Mencegah kehamilan di luar nikah, penyakit menular seksual, dan pernikahan dini.',
      'Melatih rasa percaya diri, jiwa kepemimpinan, dan kecakapan hidup (life skills) anak muda.'
    ],
    layanan: [
      'Sesi curhat tatap muka dan konsultasi online secara rahasia dan gratis.',
      'Diskusi kelompok dan workshop kesehatan remaja di sekolah-sekolah.',
      'Aksi sosial pemuda, lomba kreasi video edukasi, dan gathering anak muda kreatif.'
    ]
  },
  {
    id: 'PPKS',
    kode: 'PPKS',
    nama: 'Pusat Konseling Keluarga Sejahtera',
    kategori: 'konseling',
    kategoriLabel: '👨‍👩‍👧 Konsultasi Masalah Keluarga (100% Gratis)',
    tagline: 'Layanan Terpadu Curhat & Solusi Masalah Keluarga Satu Pintu',
    deskripsiSingkat: 'Layanan konsultasi dan konseling keluarga gratis dengan psikolog dan tenaga ahli untuk membantu menyelesaikan masalah rumah tangga.',
    tujuanSingkat: 'Membantu keluarga menyelesaikan persoalan rumah tangga, persiapan menikah, dan masalah anak secara kekeluargaan dan rahasia.',
    deskripsi: 'Pusat Pelayanan Keluarga Sejahtera (PPKS) adalah kantor layanan konsultasi gratis milik Pemerintah Kota Semarang. Masyarakat yang sedang memiliki masalah rumah tangga, calon pengantin yang ingin siap menikah, atau orang tua yang bingung mengatasi anak bermasalah bisa datang berkonsultasi dengan tenang.',
    icon: 'fa-hospital-user',
    color: '#ec4899',
    target: 'Seluruh warga Kota Semarang, calon pengantin, pasangan suami-istri, orang tua, dan anak',
    totalKelompok: 16,
    tujuan: [
      'Menyediakan layanan konsultasi psikologi dan keluarga secara gratis tanpa dipungut biaya sepeserpun.',
      'Membekali calon pengantin agar siap mental, fisik, dan ekonomi sebelum melangkah ke jenjang pernikahan.',
      'Membantu mediasi keharmonisan suami-istri dan mencegah perceraian maupun KDRT.',
      'Mendampingi keluarga yang memiliki anak dengan kebutuhan khusus atau trauma psikologis.'
    ],
    layanan: [
      'Konseling Pranikah bagi pasangan yang akan menikah (bimbingan aplikasi Elsimil).',
      'Konseling masalah komunikasi suami-istri dan mediasi keharmonisan keluarga.',
      'Konsultasi psikologi anak dan pengasuhan keluarga.',
      'Konsultasi gizi keluarga dan pendampingan rujukan medis gratis.'
    ]
  },
  {
    id: 'GENRE',
    kode: 'GENRE',
    nama: 'Generasi Berencana (GenRe)',
    kategori: 'remaja',
    kategoriLabel: '📣 Gerakan Anak Muda Keren & Berencana',
    tagline: 'Saatnya yang Muda yang Berencana: Sukseskan Pendidikan & Karier Dulu!',
    deskripsiSingkat: 'Gerakan anak muda Kota Semarang yang mengkampanyekan pentingnya menata masa depan, kuliah/kerja dulu, baru menikah di usia matang.',
    tujuanSingkat: 'Mengajak remaja tidak terburu-buru menikah (target usia matang 21 tahun untuk wanita & 25 tahun untuk pria) demi masa depan cerah.',
    deskripsi: 'GenRe adalah komunitas anak muda kreatif di Kota Semarang. GenRe mengajak para remaja menjauhi pernikahan dini dan fokus mengejar mimpi, mengembangkan hobi positif, serta memiliki rencana hidup yang terarah sebelum berkeluarga.',
    icon: 'fa-bullhorn',
    color: '#6366f1',
    target: 'Remaja, pelajar, mahasiswa, Duta GenRe, dan seluruh generasi muda Kota Semarang',
    totalKelompok: 30,
    tujuan: [
      'Mengkampanyekan usia nikah ideal: minimal 21 tahun bagi perempuan dan 25 tahun bagi laki-laki.',
      'Membentuk generasi muda yang berpendidikan tinggi, berkarier mandiri, dan berakhlak mulia.',
      'Memilih Duta GenRe dari kalangan remaja sebagai panutan bagi teman-temannya di media sosial.',
      'Menyiapkan calon orang tua masa depan yang cerdas dan bebas dari anak stunting kelak.'
    ],
    layanan: [
      'Pemilihan Duta GenRe Kota Semarang tingkat kecamatan dan kota setiap tahun.',
      'Kunjungan edukasi GenRe Goes to School dan GenRe Goes to Campus.',
      'Kemah kreatif pemuda (Jambore GenRe) dan lomba konten positif di media sosial.'
    ]
  }
];

const defaultBkbData = [
  { id: 1, namaKelompok: 'Melati', alamat: 'Jl. Sendangmulyo No. 12, RT 03/RW 05', ketua: 'Siti Rahmawati', jumlahAnggota: 35, tahun: '2025' },
  { id: 2, namaKelompok: 'Anggrek', alamat: 'Jl. Kedungmundu Raya No. 45', ketua: 'Sri Wahyuni', jumlahAnggota: 28, tahun: '2025' },
  { id: 3, namaKelompok: 'Cempaka', alamat: 'Kec. Tembalang RT 01/RW 02', ketua: 'Nurul Hidayah', jumlahAnggota: 30, tahun: '2024' },
  { id: 4, namaKelompok: 'Kenanga', alamat: 'Kel. Meteseh RT 04/RW 01', ketua: 'Endang Lestari', jumlahAnggota: 25, tahun: '2024' },
  { id: 5, namaKelompok: 'Mawar', alamat: 'Kel. Jangli No. 8', ketua: 'Dewi Kartika', jumlahAnggota: 32, tahun: '2024' }
];

const defaultDokumen = [
  {
    id: 'doc-1',
    namaFile: 'data_bkb_2025.xlsx',
    judul: 'Data Rekapitulasi BKB Kota Semarang 2025',
    kategori: 'BKB',
    jenis: 'Excel',
    icon: 'fa-file-excel',
    iconColor: '#107c41',
    ukuran: '2.8 MB',
    tanggalUpload: '12 Apr 2025',
    pengunggah: 'Admin K3',
    deskripsi: 'Data rekapitulasi keanggotaan dan sebaran kelompok Bina Keluarga Balita (BKB) di 16 kecamatan se-Kota Semarang tahun 2025.'
  },
  {
    id: 'doc-2',
    namaFile: 'laporan_bkr.pptx',
    judul: 'Laporan Evaluasi Pembinaan BKR Q1 2025',
    kategori: 'BKR',
    jenis: 'PPT',
    icon: 'fa-file-powerpoint',
    iconColor: '#d24726',
    ukuran: '5.1 MB',
    tanggalUpload: '5 Apr 2025',
    pengunggah: 'Admin K3',
    deskripsi: 'Paparan hasil evaluasi pelaksanaan kegiatan Bina Keluarga Remaja (BKR) dan tingkat partisipasi orang tua triwulan I.'
  },
  {
    id: 'doc-3',
    namaFile: 'profil_bkl.pdf',
    judul: 'Profil Kelompok Bina Keluarga Lansia Tangguh',
    kategori: 'BKL',
    jenis: 'PDF',
    icon: 'fa-file-pdf',
    iconColor: '#ea4335',
    ukuran: '3.4 MB',
    tanggalUpload: '20 Mar 2025',
    pengunggah: 'Admin K3',
    deskripsi: 'Buku profil kelompok BKL tangguh, indikator 7 dimensi lansia tangguh, serta panduan senam lansia di posyandu binaan.'
  },
  {
    id: 'doc-4',
    namaFile: 'data_uppka.docx',
    judul: 'Panduan Legalitas Usaha Kelompok UPPKA',
    kategori: 'UPPKA',
    jenis: 'Word',
    icon: 'fa-file-word',
    iconColor: '#2b579a',
    ukuran: '1.9 MB',
    tanggalUpload: '10 Mar 2025',
    pengunggah: 'Admin K3',
    deskripsi: 'Panduan tata cara perizinan NIB dan sertifikasi P-IRT bagi produk binaan Usaha Peningkatan Pendapatan Keluarga Akseptor.'
  },
  {
    id: 'doc-5',
    namaFile: 'laporan_genre.xlsx',
    judul: 'Rekapitulasi Duta & Pusat Konseling GenRe 2025',
    kategori: 'GENRE',
    jenis: 'Excel',
    icon: 'fa-file-excel',
    iconColor: '#107c41',
    ukuran: '3.1 MB',
    tanggalUpload: '15 Feb 2025',
    pengunggah: 'Admin K3',
    deskripsi: 'Daftar nama Duta GenRe Kota Semarang dan sebaran Pusat Informasi Konseling Remaja (PIK-R) di sekolah dan jalur masyarakat.'
  },
  {
    id: 'doc-6',
    namaFile: 'panduan_program_bkb_2025.pdf',
    judul: 'Panduan Program BKB 2025.pdf',
    kategori: 'BKB',
    jenis: 'PDF',
    icon: 'fa-file-pdf',
    iconColor: '#ea4335',
    ukuran: '3.4 MB',
    tanggalUpload: '12 Apr 2025',
    pengunggah: 'Admin K3',
    deskripsi: 'Dokumen ini berisi panduan pelaksanaan program BKB tahun 2025.'
  }
];

const defaultNews = [
  {
    id: 'news-1',
    judul: 'Pelaksanaan Program BKB di Kecamatan Tembalang Berjalan Sukses',
    ringkasan: 'Pelaksanaan Program BKB',
    tanggal: '12 Mei 2025',
    kategori: 'BKB',
    gambar: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&auto=format&fit=crop&q=80',
    link: '#kegiatan-detail?id=keg-3'
  },
  {
    id: 'news-2',
    judul: 'Kegiatan Penyuluhan Remaja Cegah Stunting Sejak Dini',
    ringkasan: 'Kegiatan Penyuluhan Remaja',
    tanggal: '5 Mei 2025',
    kategori: 'PIK-R',
    gambar: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80',
    link: '#kegiatan-detail?id=keg-4'
  },
  {
    id: 'news-3',
    judul: 'Rapat Koordinasi K3 Tingkat Kota Semarang Periode 2025',
    ringkasan: 'Rapat Koordinasi K3',
    tanggal: '28 April 2025',
    kategori: 'Koordinasi',
    gambar: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&auto=format&fit=crop&q=80',
    link: '#kegiatan-detail?id=keg-1'
  }
];

const defaultAktivitas = [
  { id: 1, no: 1, aktivitas: 'Menambah data kegiatan', tanggal: '12 Jun 2025', oleh: 'Admin' },
  { id: 2, no: 2, aktivitas: 'Upload dokumen program', tanggal: '10 Jun 2025', oleh: 'Admin' },
  { id: 3, no: 3, aktivitas: 'Mengubah data program', tanggal: '8 Jun 2025', oleh: 'Admin' },
  { id: 4, no: 4, aktivitas: 'Menambah kategori', tanggal: '5 Jun 2025', oleh: 'Admin' }
];

// Storage Helper
class DataStore {
  static get(key, defaultValue) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.warn('LocalStorage error:', e);
      return defaultValue;
    }
  }

  static set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  static reset() {
    localStorage.clear();
  }
}

// Global state container
window.AppState = {
  programs: DataStore.get(STORAGE_KEYS.PROGRAMS, defaultPrograms),
  kegiatan: DataStore.get(STORAGE_KEYS.KEGIATAN, defaultKegiatan),
  turunan: (() => {
    const saved = DataStore.get(STORAGE_KEYS.TURUNAN, defaultTurunan);
    if (Array.isArray(saved) && saved.length > 0 && (!saved[0].tujuan || !saved[0].deskripsiSingkat)) {
      DataStore.set(STORAGE_KEYS.TURUNAN, defaultTurunan);
      return defaultTurunan;
    }
    return saved;
  })(),
  bkbData: DataStore.get(STORAGE_KEYS.BKB_DATA, defaultBkbData),
  dokumen: DataStore.get(STORAGE_KEYS.DOKUMEN, defaultDokumen),
  aktivitas: DataStore.get(STORAGE_KEYS.AKTIVITAS, defaultAktivitas),
  news: DataStore.get(STORAGE_KEYS.NEWS, defaultNews),

  savePrograms() { DataStore.set(STORAGE_KEYS.PROGRAMS, this.programs); },
  saveKegiatan() { DataStore.set(STORAGE_KEYS.KEGIATAN, this.kegiatan); },
  saveBkbData() { DataStore.set(STORAGE_KEYS.BKB_DATA, this.bkbData); },
  saveDokumen() { DataStore.set(STORAGE_KEYS.DOKUMEN, this.dokumen); },
  saveAktivitas() { DataStore.set(STORAGE_KEYS.AKTIVITAS, this.aktivitas); }
};
