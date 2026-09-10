/**
 * app.js
 * SPA Routing, State Integration, View Renderers & Event Listeners
 * Connected with REST API Backend & SQLite
 */

// Route configuration mapping view IDs to views
const ROUTES = {
  'beranda': { title: 'Beranda - Disdalduk KB Kota Semarang | Bidang K3', nav: 'beranda' },
  'pengertian': { title: 'Pengertian K3 - Bidang K3', nav: 'profil' },
  'program': { title: 'Program K3 - Bidang K3', nav: 'program' },
  'kegiatan': { title: 'Kegiatan K3 - Bidang K3', nav: 'kegiatan' },
  'turunan': { title: 'Turunan Bidang K3 - Bidang K3', nav: 'turunan' },
  'turunan-detail': { title: 'Detail Turunan K3 - Bidang K3', nav: 'turunan' },
  'input-data-bkb': { title: 'Input Data BKB - Bidang K3', nav: 'turunan' },
  'data-dokumen': { title: 'Data K3 & Dokumen - Bidang K3', nav: 'dokumen' },
  'profil': { title: 'Profil Bidang K3 - Disdalduk KB', nav: 'profil' },
  'program-detail': { title: 'Detail Program - Bidang K3', nav: 'program' },
  'kegiatan-detail': { title: 'Detail Kegiatan - Bidang K3', nav: 'kegiatan' },
  'dokumen-detail': { title: 'Detail Dokumen - Bidang K3', nav: 'dokumen' },
  'admin': { title: 'Admin Dashboard - Bidang K3', nav: 'admin' }
};

// Router navigation function
function navigateTo(viewName, params = {}) {
  let hash = '#' + viewName;
  const paramKeys = Object.keys(params);
  if (paramKeys.length > 0) {
    const queryStr = paramKeys.map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&');
    hash += '?' + queryStr;
  }
  window.location.hash = hash;
}

// Parse current URL hash
function getRouteInfo() {
  let hash = window.location.hash.slice(1);
  if (!hash) hash = 'beranda';

  const parts = hash.split('?');
  const viewId = parts[0] || 'beranda';
  const params = {};

  if (parts[1]) {
    const pairs = parts[1].split('&');
    for (const pair of pairs) {
      const [k, v] = pair.split('=');
      if (k) params[decodeURIComponent(k)] = decodeURIComponent(v || '');
    }
  }

  return { viewId, params };
}

// Handle route change
function handleRouting() {
  const { viewId, params } = getRouteInfo();
  const route = ROUTES[viewId] || ROUTES['beranda'];
  const targetViewId = ROUTES[viewId] ? viewId : 'beranda';

  // Update document title
  document.title = route.title;

  // Toggle page-view active class
  document.querySelectorAll('.page-view').forEach(view => {
    view.classList.remove('active');
  });

  const activeViewEl = document.getElementById(`view-${targetViewId}`);
  if (activeViewEl) {
    activeViewEl.classList.add('active');
  }

  // Update header nav active link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.dataset.nav === route.nav) {
      link.classList.add('active');
    }
  });

  // Update sidebar active links in all views
  updateSidebarActive(targetViewId);

  // Trigger view specific initialization
  onViewLoaded(targetViewId, params);

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateSidebarActive(viewId) {
  document.querySelectorAll('.sidebar-link, .sidebar-sub-link').forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (href === `#${viewId}`) {
      link.classList.add('active');
      const parentSubMenu = link.closest('.sidebar-sub-menu');
      if (parentSubMenu) {
        const parentHeader = parentSubMenu.previousElementSibling;
        if (parentHeader && parentHeader.classList.contains('sidebar-link')) {
          parentHeader.classList.add('active');
        }
      }
    }
  });

  document.querySelectorAll('.admin-menu-link').forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (href === `#${viewId}`) {
      link.classList.add('active');
    }
  });
}

function onViewLoaded(viewId, params) {
  switch (viewId) {
    case 'beranda':
      renderBerandaNews();
      break;
    case 'program':
      renderProgramsList();
      break;
    case 'kegiatan':
      renderKegiatanTable();
      break;
    case 'turunan':
      renderTurunanCards();
      break;
    case 'turunan-detail':
      renderTurunanDetail(params.id || 'BKB');
      break;
    case 'input-data-bkb':
      renderBkbTable();
      break;
    case 'data-dokumen':
      renderDokumenTable();
      break;
    case 'program-detail':
      renderProgramDetail(params.id || 'prog-1');
      break;
    case 'kegiatan-detail':
      renderKegiatanDetail(params.id || 'keg-1');
      break;
    case 'dokumen-detail':
      renderDokumenDetail(params.id || 'doc-6');
      break;
    case 'admin':
      renderAdminDashboard();
      break;
  }
}

/* ==========================================================================
   Detail Renderers
   ========================================================================== */

async function renderBerandaNews() {
  const container = document.getElementById('beranda-news-grid');
  if (!container) return;

  try {
    const news = await window.K3API.getNews();
    if (news && Array.isArray(news)) {
      window.AppState.news = news;
    }
  } catch (err) {
    console.warn('API news unreachable:', err);
  }

  container.innerHTML = window.AppState.news.map(item => `
    <div class="news-card" onclick="location.hash='${item.link}'">
      <div class="news-thumb-box">
        <i class="fa-solid fa-image"></i>
      </div>
      <div class="news-body">
        <div class="news-title">${item.ringkasan || item.judul}</div>
        <div class="news-date">
          <i class="fa-regular fa-calendar"></i>
          <span>${item.tanggal}</span>
        </div>
      </div>
    </div>
  `).join('');
}

let activeTurunanCategory = 'all';

window.filterTurunanByCategory = function(category, btnElement) {
  activeTurunanCategory = category || 'all';
  const buttons = document.querySelectorAll('.turunan-filter-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  if (btnElement) {
    btnElement.classList.add('active');
  } else {
    const match = Array.from(buttons).find(b => b.getAttribute('onclick')?.includes(`'${category}'`));
    if (match) match.classList.add('active');
  }
  renderTurunanCards(activeTurunanCategory);
};

async function renderTurunanCards(category = activeTurunanCategory) {
  const container = document.getElementById('turunan-grid-container');
  if (!container) return;

  try {
    const turunan = await window.K3API.getTurunan();
    if (turunan && Array.isArray(turunan) && turunan.length > 0) {
      window.AppState.turunan = defaultTurunan.map(def => {
        const fromApi = turunan.find(t => t.id === def.id || t.kode === def.kode);
        if (!fromApi) return def;
        return {
          ...def,
          ...fromApi,
          deskripsiSingkat: fromApi.deskripsi_singkat || fromApi.deskripsiSingkat || def.deskripsiSingkat,
          tujuanSingkat: fromApi.tujuan_singkat || fromApi.tujuanSingkat || def.tujuanSingkat,
          kategori: fromApi.kategori || def.kategori,
          kategoriLabel: fromApi.kategori_label || fromApi.kategoriLabel || def.kategoriLabel
        };
      });
    }
  } catch (err) {
    console.warn('API turunan unreachable:', err);
  }

  const items = category && category !== 'all'
    ? window.AppState.turunan.filter(t => t.kategori === category)
    : window.AppState.turunan;

  if (items.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem; background: var(--surface); border: 1px dashed var(--border); border-radius: var(--radius-lg);">
        <i class="fa-solid fa-layer-group" style="font-size: 2.2rem; color: var(--text-muted); margin-bottom: 0.75rem;"></i>
        <h4 style="color: var(--text-primary); margin-bottom: 0.5rem;">Tidak ada program pada kelompok ini</h4>
        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem;">Silakan pilih kelompok lain atau tampilkan seluruh layanan.</p>
        <button class="btn btn-primary btn-sm" onclick="filterTurunanByCategory('all')">
          <i class="fa-solid fa-arrow-rotate-left"></i> Tampilkan Semua (7 Layanan)
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="turunan-simple-card" onclick="navigateTo('turunan-detail', { id: '${item.id}' })">
      <div class="turunan-simple-header">
        <div class="turunan-simple-icon" style="background: ${item.color ? item.color + '18' : 'var(--primary-subtle)'}; color: ${item.color || 'var(--primary)'};">
          <i class="fa-solid ${item.icon}"></i>
        </div>
        <span class="turunan-simple-badge" style="background: ${item.color ? item.color + '18' : '#eff6ff'}; color: ${item.color || 'var(--primary)'};">
          ${item.kategoriLabel || item.kode}
        </span>
      </div>

      <h3 class="turunan-simple-title">
        ${item.nama}
        <span class="turunan-kode-chip">(${item.kode})</span>
      </h3>

      ${item.tagline ? `<div style="font-size: 0.82rem; font-weight: 600; color: ${item.color || 'var(--primary)'}; margin-bottom: 0.65rem; line-height: 1.4;">${item.tagline}</div>` : ''}

      <p class="turunan-simple-desc">
        ${item.deskripsiSingkat || item.deskripsi}
      </p>

      <div style="font-size: 0.82rem; color: var(--text-muted); display: flex; align-items: center; gap: 6px; margin-bottom: 0.75rem;">
        <i class="fa-solid fa-users" style="color: var(--primary); flex-shrink: 0;"></i>
        <span><strong>Sasaran:</strong> ${item.target}</span>
      </div>

      ${item.tujuanSingkat ? `
        <div class="turunan-simple-goal">
          <i class="fa-solid fa-bullseye" style="color: #10b981; margin-top: 2px; flex-shrink: 0;"></i>
          <div>
            <strong>Tujuan Utama:</strong> ${item.tujuanSingkat}
          </div>
        </div>
      ` : ''}

      <div class="turunan-simple-footer">
        <span class="turunan-simple-link">
          Pelajari Layanan <i class="fa-solid fa-arrow-right"></i>
        </span>
        ${item.kode === 'BKB' ? `
          <button type="button" class="turunan-btn-sub" title="Input & Lihat Data Kelompok BKB" onclick="event.stopPropagation(); navigateTo('input-data-bkb')">
            <i class="fa-solid fa-table-list"></i>
            <span>Data BKB</span>
          </button>
        ` : ''}
      </div>
    </div>
  `).join('');
}

async function renderTurunanDetail(id) {
  let item = null;
  const def = defaultTurunan.find(d => d.id === id || d.kode === id) || defaultTurunan[0];

  try {
    const fromApi = await window.K3API.getTurunanById(id);
    if (fromApi) {
      item = {
        ...def,
        ...fromApi,
        deskripsi: fromApi.deskripsi || def.deskripsi,
        tujuan: fromApi.tujuan && fromApi.tujuan.length > 0 ? fromApi.tujuan : def.tujuan,
        layanan: fromApi.layanan && fromApi.layanan.length > 0 ? fromApi.layanan : def.layanan
      };
    }
  } catch (err) {
    item = window.AppState.turunan.find(t => t.id === id || t.kode === id) || def;
  }

  if (!item) item = def;

  const headerTitle = document.getElementById('turunan-detail-header-title');
  const headerTagline = document.getElementById('turunan-detail-header-tagline');
  const breadcrumbEl = document.getElementById('turunan-detail-breadcrumb');
  const titleEl = document.getElementById('turunan-detail-title');
  const badgeEl = document.getElementById('turunan-detail-badge');
  const iconCircle = document.getElementById('turunan-detail-icon-circle');
  const iconEl = document.getElementById('turunan-detail-icon');
  const descEl = document.getElementById('turunan-detail-desc');
  const tujuanListEl = document.getElementById('turunan-detail-tujuan-list');
  const layananGridEl = document.getElementById('turunan-detail-layanan-grid');
  const targetEl = document.getElementById('turunan-detail-target');
  const kelompokEl = document.getElementById('turunan-detail-kelompok');
  const bkbBtn = document.getElementById('btn-turunan-to-bkb');
  const quickPillsEl = document.getElementById('turunan-quick-pills');

  if (headerTitle) headerTitle.textContent = `${item.nama} (${item.kode})`;
  if (headerTagline) headerTagline.textContent = item.tagline || 'Pilar Pembinaan Ketahanan dan Kesejahteraan Keluarga';
  if (breadcrumbEl) breadcrumbEl.textContent = `Detail ${item.kode}`;
  if (titleEl) titleEl.textContent = item.nama;
  if (badgeEl) {
    badgeEl.textContent = item.kode;
    if (item.color) {
      badgeEl.style.color = item.color;
      badgeEl.style.background = item.color + '18';
    }
  }
  if (iconCircle && item.color) {
    iconCircle.style.color = item.color;
    iconCircle.style.background = item.color + '18';
  }
  if (iconEl) {
    iconEl.className = `fa-solid ${item.icon}`;
  }
  if (descEl) descEl.textContent = item.deskripsi;
  if (targetEl) targetEl.textContent = item.target;
  if (kelompokEl) kelompokEl.textContent = `${item.totalKelompok || item.total_kelompok || 30} Kelompok Binaan di Kota Semarang`;

  // Tujuan list
  if (tujuanListEl) {
    const tujuan = Array.isArray(item.tujuan) 
      ? item.tujuan 
      : (typeof item.tujuan === 'string' ? JSON.parse(item.tujuan || '[]') : []);
    if (tujuan.length === 0) {
      tujuanListEl.innerHTML = `<li><i class="fa-solid fa-circle-check"></i><span>Meningkatkan kualitas ketahanan dan kesejahteraan keluarga binaan.</span></li>`;
    } else {
      tujuanListEl.innerHTML = tujuan.map(t => `
        <li>
          <i class="fa-solid fa-circle-check" style="color: #10b981;"></i>
          <span>${t}</span>
        </li>
      `).join('');
    }
  }

  // Layanan grid
  if (layananGridEl) {
    const layanan = Array.isArray(item.layanan) 
      ? item.layanan 
      : (typeof item.layanan === 'string' ? JSON.parse(item.layanan || '[]') : []);
    if (layanan.length === 0) {
      layananGridEl.innerHTML = `
        <div class="turunan-layanan-item">
          <i class="fa-solid fa-hand-holding-heart"></i>
          <span>Pembinaan dan edukasi berkala kepada keluarga sasaran.</span>
        </div>
        <div class="turunan-layanan-item">
          <i class="fa-solid fa-users"></i>
          <span>Pertemuan kelompok dan fasilitasi kader di tingkat kelurahan.</span>
        </div>
      `;
    } else {
      layananGridEl.innerHTML = layanan.map(l => `
        <div class="turunan-layanan-item">
          <i class="fa-solid fa-circle-dot" style="color: var(--primary);"></i>
          <span>${l}</span>
        </div>
      `).join('');
    }
  }

  // BKB button toggle
  if (bkbBtn) {
    if (item.kode === 'BKB') {
      bkbBtn.style.display = 'inline-flex';
    } else {
      bkbBtn.style.display = 'none';
    }
  }

  // Quick pills switcher
  if (quickPillsEl) {
    quickPillsEl.innerHTML = window.AppState.turunan.map(t => `
      <button type="button" class="turunan-quick-pill ${t.id === item.id || t.kode === item.kode ? 'active' : ''}" onclick="navigateTo('turunan-detail', { id: '${t.id}' })">
        <i class="fa-solid ${t.icon}"></i>
        <span>${t.kode}</span>
      </button>
    `).join('');
  }
}

async function renderProgramDetail(id) {
  let prog = null;
  try {
    prog = await window.K3API.getProgram(id);
    if (Array.isArray(prog)) {
      prog = prog.find(p => p.id === id) || prog[0];
    }
  } catch (err) {
    console.warn('API error getProgram:', err);
  }

  if (!prog || !prog.id) {
    prog = window.AppState.programs.find(p => p.id === id) || window.AppState.programs[0];
  }

  if (!prog) return;

  const titleEl = document.getElementById('program-detail-title');
  const descEl = document.getElementById('program-detail-desc');
  const catEl = document.getElementById('program-detail-cat');
  const pelaksanaEl = document.getElementById('program-detail-pelaksana');
  const tahunEl = document.getElementById('program-detail-tahun');
  const listEl = document.getElementById('program-detail-kegiatan-list');

  if (titleEl) titleEl.textContent = prog.nama || 'Detail Program';
  if (descEl) descEl.textContent = prog.deskripsi || '';
  if (catEl) catEl.textContent = prog.kategori || '-';
  if (pelaksanaEl) pelaksanaEl.textContent = prog.pelaksana || 'Bidang K3';
  if (tahunEl) tahunEl.textContent = prog.tahun || '-';

  if (listEl && prog.kegiatanTerkait) {
    const list = Array.isArray(prog.kegiatanTerkait) ? prog.kegiatanTerkait : JSON.parse(prog.kegiatanTerkait || '[]');
    listEl.innerHTML = list.map(keg => `
      <li>
        <i class="fa-solid fa-circle-check"></i>
        <span>${keg}</span>
      </li>
    `).join('');
  }
}

async function renderKegiatanDetail(id) {
  let keg = null;
  try {
    keg = await window.K3API.getKegiatanById(id);
    if (Array.isArray(keg)) {
      keg = keg.find(k => k.id === id) || keg[0];
    }
  } catch (err) {
    console.warn('API error getKegiatanById:', err);
  }

  if (!keg || !keg.id) {
    keg = window.AppState.kegiatan.find(k => k.id === id);
    if (!keg && window.AppState.kegiatan.length > 0) {
      keg = window.AppState.kegiatan[0];
    }
  }

  if (!keg) return;

  window.currentDetailKegiatanId = keg.id;
  const kelolaBtn = document.getElementById('btn-kelola-foto');
  if (kelolaBtn) {
    kelolaBtn.setAttribute('data-keg-id', keg.id);
  }

  const titleEl = document.getElementById('keg-detail-title');
  const descEl = document.getElementById('keg-detail-desc');
  const tglEl = document.getElementById('keg-detail-tgl');
  const lokEl = document.getElementById('keg-detail-lok');
  const pesEl = document.getElementById('keg-detail-pes');
  const galleryEl = document.getElementById('keg-detail-gallery');

  if (titleEl) titleEl.textContent = keg.nama || 'Detail Kegiatan';
  if (descEl) descEl.textContent = keg.deskripsi || 'Kegiatan pembinaan dan edukasi keluarga Kota Semarang.';
  if (tglEl) tglEl.textContent = keg.tanggal_display || keg.tanggalDisplay || keg.tanggal || '-';
  if (lokEl) lokEl.textContent = keg.lokasi || '-';
  if (pesEl) pesEl.textContent = keg.peserta || '50 orang';

  if (galleryEl) {
    let docs = [];
    if (Array.isArray(keg.dokumentasi)) {
      docs = keg.dokumentasi;
    } else if (typeof keg.dokumentasi === 'string' && keg.dokumentasi.trim()) {
      try { docs = JSON.parse(keg.dokumentasi); } catch { docs = [keg.dokumentasi]; }
    }

    if (docs.length === 0) {
      galleryEl.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 2rem; background: var(--surface-alt); border: 1px dashed var(--border); border-radius: var(--radius-md); text-align: center; color: var(--text-muted);">
          <i class="fa-regular fa-image" style="font-size: 2rem; display: block; margin-bottom: 0.5rem; opacity: 0.6;"></i>
          <p style="margin-bottom: 0.75rem; font-size: 0.9rem;">Belum ada foto dokumentasi untuk kegiatan ini.</p>
          <button type="button" class="btn btn-primary btn-sm" onclick="openUploadFotoKegiatanModal('${keg.id}')">
            <i class="fa-solid fa-cloud-arrow-up"></i> Upload Foto Dokumentasi
          </button>
        </div>
      `;
    } else {
      galleryEl.innerHTML = docs.map((imgUrl, idx) => `
        <div class="gallery-thumb" style="position: relative;" onclick="previewImage('${imgUrl}', '${(keg.nama || '').replace(/'/g, "\\'")} - Foto ${idx + 1}')" title="Klik untuk memperbesar">
          <img src="${imgUrl}" alt="${keg.nama || 'Dokumentasi Kegiatan'}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600'">
          <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 6px 10px; background: linear-gradient(transparent, rgba(0,0,0,0.75)); display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #fff; font-size: 0.75rem; font-weight: 600;">Foto #${idx + 1}</span>
            <span style="color: #93c5fd; font-size: 0.75rem;"><i class="fa-solid fa-expand"></i></span>
          </div>
        </div>
      `).join('');
    }
  }
}

window.renderKegiatanDetail = renderKegiatanDetail;

async function renderDokumenDetail(id) {
  let doc = null;
  try {
    doc = await window.K3API.getDokumenById(id);
    if (Array.isArray(doc)) {
      doc = doc.find(d => d.id === id) || doc[0];
    }
  } catch (err) {
    console.warn('API error getDokumenById:', err);
  }

  if (!doc || !doc.id) {
    doc = window.AppState.dokumen.find(d => d.id === id) || window.AppState.dokumen[0];
  }

  if (!doc) return;

  window.currentDetailDokumenId = doc.id;

  const judulEl = document.getElementById('doc-detail-judul');
  const nameEl = document.getElementById('doc-detail-name');
  const kategoriEl = document.getElementById('doc-detail-kategori');
  const badgeEl = document.getElementById('doc-detail-kategori-badge');
  const jenisEl = document.getElementById('doc-detail-jenis');
  const sizeEl = document.getElementById('doc-detail-size');
  const dateEl = document.getElementById('doc-detail-date');
  const uploaderEl = document.getElementById('doc-detail-uploader');
  const descEl = document.getElementById('doc-detail-desc');
  const iconElem = document.getElementById('doc-detail-icon-elem');
  const iconLabel = document.getElementById('doc-detail-icon-label');
  const iconBox = document.getElementById('doc-detail-icon-box');
  const downloadBtn = document.getElementById('doc-detail-download-btn');
  const previewBtn = document.getElementById('doc-detail-view-btn');

  const fileName = doc.namaFile || doc.nama_file;
  const docJudul = doc.judul || fileName;
  const uploadDate = doc.tanggalUpload || doc.tanggal_upload;
  const docKategori = doc.kategori || 'BKB';
  const docJenis = doc.jenis || 'PDF';

  if (judulEl) judulEl.textContent = docJudul;
  if (nameEl) nameEl.textContent = fileName || 'Dokumen K3';
  if (kategoriEl) kategoriEl.textContent = docKategori;
  if (badgeEl) {
    badgeEl.textContent = docKategori;
    badgeEl.className = 'badge badge-' + docKategori.toLowerCase();
  }
  if (jenisEl) jenisEl.textContent = docJenis;
  if (sizeEl) sizeEl.textContent = doc.ukuran || '-';
  if (dateEl) dateEl.textContent = uploadDate || '-';
  if (uploaderEl) uploaderEl.textContent = doc.pengunggah || 'Admin K3';
  if (descEl) descEl.textContent = doc.deskripsi || '-';

  // Dynamic icon styling
  let iconClass = 'fa-file-pdf';
  let iconColor = '#ea4335';
  if (docJenis === 'Excel') { iconClass = 'fa-file-excel'; iconColor = '#107c41'; }
  else if (docJenis === 'Word') { iconClass = 'fa-file-word'; iconColor = '#2b579a'; }
  else if (docJenis === 'PPT') { iconClass = 'fa-file-powerpoint'; iconColor = '#d24726'; }

  if (iconElem) {
    iconElem.className = `fa-solid ${doc.icon || iconClass}`;
    iconElem.style.color = doc.iconColor || iconColor;
  }
  if (iconLabel) {
    iconLabel.textContent = docJenis.toUpperCase();
    iconLabel.style.color = doc.iconColor || iconColor;
  }
  if (iconBox) {
    iconBox.style.borderColor = (doc.iconColor || iconColor) + '80';
    iconBox.style.background = (doc.iconColor || iconColor) + '12';
  }

  if (downloadBtn) {
    downloadBtn.onclick = () => downloadDocumentFile(doc.id, fileName);
  }
  if (previewBtn) {
    previewBtn.onclick = () => previewDocument(doc);
  }

  // Render inline interactive preview
  const previewContentEl = document.getElementById('doc-detail-preview-content');
  const sheetTabsEl = document.getElementById('doc-detail-sheet-tabs');
  if (previewContentEl) {
    renderFilePreview(doc, previewContentEl, sheetTabsEl);
  }
}

/**
 * Interactive File Previewer supporting Excel (SheetJS), PDF, Images, and Fallback Cards
 */
async function renderFilePreview(doc, containerEl, tabsContainerEl) {
  if (!containerEl) return;
  const fileName = doc.namaFile || doc.nama_file || '';
  const filePath = doc.filePath || doc.file_path;
  const jenis = (doc.jenis || '').toLowerCase();
  const ext = fileName.split('.').pop().toLowerCase();
  const isExcel = ext === 'xlsx' || ext === 'xls' || ext === 'csv' || jenis === 'excel';
  const isPdf = ext === 'pdf' || jenis === 'pdf';
  const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext);

  if (tabsContainerEl) tabsContainerEl.innerHTML = '';

  const fileUrl = filePath ? filePath : null;

  if (isExcel) {
    containerEl.innerHTML = `
      <div style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
        <i class="fa-solid fa-spinner fa-spin fa-2x" style="color: #107c41; margin-bottom: 0.85rem;"></i>
        <div style="font-weight: 600;">Memuat dan membaca lembar kerja Excel...</div>
      </div>
    `;

    if (fileUrl && window.XLSX) {
      try {
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const arrayBuf = await response.arrayBuffer();
        const workbook = window.XLSX.read(arrayBuf, { type: 'array' });

        if (workbook.SheetNames && workbook.SheetNames.length > 0) {
          const sheetNames = workbook.SheetNames;
          let currentSheet = sheetNames[0];

          function displaySheet(sheetName) {
            currentSheet = sheetName;
            if (tabsContainerEl) {
              tabsContainerEl.querySelectorAll('.sheet-tab-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.sheet === sheetName);
              });
            }
            const worksheet = workbook.Sheets[sheetName];
            const rows = window.XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

            if (!rows || rows.length === 0) {
              containerEl.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                  <i class="fa-regular fa-file-excel" style="font-size: 2.5rem; color: #107c41; margin-bottom: 0.5rem;"></i>
                  <div>Lembar kerja <strong>${sheetName}</strong> kosong.</div>
                </div>
              `;
              return;
            }

            let maxCols = 0;
            rows.forEach(r => { if (r.length > maxCols) maxCols = r.length; });

            let html = `<div class="excel-preview-table-wrap"><table class="excel-preview-table">`;
            html += `<thead><tr><th style="width: 45px; text-align: center; background: #e2e8f0;">No</th>`;
            for (let c = 0; c < maxCols; c++) {
              const colLabel = String.fromCharCode(65 + (c % 26)) + (c >= 26 ? Math.floor(c / 26) : '');
              html += `<th>${colLabel}</th>`;
            }
            html += `</tr></thead><tbody>`;

            const displayLimit = Math.min(rows.length, 100);
            for (let r = 0; r < displayLimit; r++) {
              const row = rows[r];
              html += `<tr><td style="text-align: center; font-weight: 700; color: #64748b; background: #f8fafc;">${r + 1}</td>`;
              for (let c = 0; c < maxCols; c++) {
                const val = row[c] !== undefined ? String(row[c]) : '';
                html += `<td>${val || '<span style="color:#cbd5e1">-</span>'}</td>`;
              }
              html += `</tr>`;
            }
            html += `</tbody></table></div>`;

            if (rows.length > 100) {
              html += `<div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem; text-align: right;">Menampilkan 100 dari ${rows.length} baris. Unduh berkas untuk data lengkap.</div>`;
            }

            containerEl.innerHTML = html;
          }

          if (tabsContainerEl && sheetNames.length > 1) {
            tabsContainerEl.innerHTML = sheetNames.map((name, idx) => `
              <button type="button" class="sheet-tab-btn ${idx === 0 ? 'active' : ''}" data-sheet="${name}">
                <i class="fa-solid fa-table"></i> ${name}
              </button>
            `).join('');

            tabsContainerEl.querySelectorAll('.sheet-tab-btn').forEach(btn => {
              btn.onclick = () => displaySheet(btn.dataset.sheet);
            });
          }

          displaySheet(currentSheet);
          return;
        }
      } catch (err) {
        console.warn('Gagal membaca binary Excel:', err);
      }
    }

    // Fallback UI if binary not loaded
    containerEl.innerHTML = `
      <div style="text-align: center; padding: 2rem;">
        <i class="fa-solid fa-file-excel" style="font-size: 3.5rem; color: #107c41; margin-bottom: 0.75rem;"></i>
        <h4 style="color: #107c41; margin-bottom: 0.4rem;">${doc.judul || fileName}</h4>
        <p style="color: var(--text-muted); font-size: 0.92rem; max-width: 500px; margin: 0 auto 1.25rem;">
          ${doc.deskripsi || 'Dokumen spreadsheet K3.'}
        </p>
        <button class="btn btn-primary btn-sm" onclick="downloadDocumentFile('${doc.id}', '${fileName}')">
          <i class="fa-solid fa-download"></i> Unduh Berkas Excel (.xlsx)
        </button>
      </div>
    `;
    return;
  }

  if (isPdf) {
    if (fileUrl) {
      containerEl.innerHTML = `
        <div>
          <iframe src="${fileUrl}" style="width: 100%; height: 520px; border: 1px solid var(--border); border-radius: 8px;" title="PDF Preview"></iframe>
          <div style="margin-top: 0.75rem; display: flex; justify-content: flex-end;">
            <a href="${fileUrl}" target="_blank" class="btn btn-outline btn-sm">
              <i class="fa-solid fa-arrow-up-right-from-square"></i> Buka PDF di Tab Baru
            </a>
          </div>
        </div>
      `;
    } else {
      containerEl.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <i class="fa-solid fa-file-pdf" style="font-size: 3.5rem; color: #ea4335; margin-bottom: 1rem;"></i>
          <h4 style="color: var(--primary); margin-bottom: 0.5rem;">${doc.judul || fileName}</h4>
          <p style="color: var(--text-muted); font-size: 0.92rem; max-width: 500px; margin: 0 auto 1.25rem;">${doc.deskripsi}</p>
          <button class="btn btn-primary btn-sm" onclick="downloadDocumentFile('${doc.id}', '${fileName}')">
            <i class="fa-solid fa-download"></i> Unduh Berkas PDF
          </button>
        </div>
      `;
    }
    return;
  }

  if (isImage && fileUrl) {
    containerEl.innerHTML = `
      <div style="text-align: center; padding: 1rem;">
        <img src="${fileUrl}" alt="${doc.judul || fileName}" style="max-width: 100%; max-height: 480px; border-radius: 8px; box-shadow: var(--shadow-sm); object-fit: contain;" />
      </div>
    `;
    return;
  }

  // Generic Word, PPT, etc.
  containerEl.innerHTML = `
    <div style="text-align: center; padding: 2rem;">
      <i class="fa-solid ${doc.icon || 'fa-file-lines'}" style="font-size: 3.5rem; color: ${doc.iconColor || '#2563eb'}; margin-bottom: 1rem;"></i>
      <h4 style="color: var(--primary); margin-bottom: 0.4rem;">${doc.judul || fileName}</h4>
      <p style="color: var(--text-muted); font-size: 0.92rem; margin-bottom: 1.25rem;">${doc.deskripsi}</p>
      <div style="display: inline-flex; gap: 0.5rem; background: var(--surface); padding: 0.6rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border); font-size: 0.85rem; margin-bottom: 1.25rem;">
        <span><strong>Format:</strong> ${doc.jenis || ext.toUpperCase()}</span> &bull; 
        <span><strong>Ukuran:</strong> ${doc.ukuran}</span>
      </div>
      <div>
        <button class="btn btn-primary btn-sm" onclick="downloadDocumentFile('${doc.id}', '${fileName}')">
          <i class="fa-solid fa-download"></i> Unduh Berkas Asli
        </button>
      </div>
    </div>
  `;
}

function previewDocument(doc) {
  const modalBody = document.getElementById('preview-modal-content');
  const modalTitle = document.getElementById('preview-modal-title');
  const modalFooter = document.getElementById('preview-modal-footer');
  const fileName = doc.namaFile || doc.nama_file;

  if (modalTitle) modalTitle.textContent = `Pratinjau: ${doc.judul || fileName}`;

  if (modalFooter) {
    modalFooter.innerHTML = `
      <button type="button" class="btn btn-primary btn-sm" onclick="downloadDocumentFile('${doc.id}', '${fileName}')">
        <i class="fa-solid fa-download"></i> Download Berkas Asli
      </button>
      <button type="button" class="btn btn-secondary btn-sm" onclick="closeModal('modal-preview')">Tutup</button>
    `;
  }

  if (modalBody) {
    renderFilePreview(doc, modalBody, null);
  }
  openModal('modal-preview');
}

function previewImage(src, caption) {
  const modalBody = document.getElementById('preview-modal-content');
  const modalTitle = document.getElementById('preview-modal-title');
  if (modalTitle) modalTitle.textContent = caption || 'Dokumentasi Foto Kegiatan';
  if (modalBody) {
    modalBody.innerHTML = `
      <div style="text-align: center;">
        <img src="${src}" style="max-height: 480px; width: auto; max-width: 100%; border-radius: var(--radius-md); box-shadow: var(--shadow-md); margin: 0 auto;" alt="Preview">
        <p style="margin-top: 1rem; color: var(--text-secondary); font-weight: 600;">${caption || ''}</p>
      </div>
    `;
  }
  openModal('modal-preview');
}

// Global Search bar handler
function handleGlobalSearch() {
  const query = prompt('Ketik kata kunci pencarian (Program, Kegiatan, atau Dokumen K3):');
  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    if (q.includes('program') || q.includes('bina') || q.includes('ekonomi')) {
      navigateTo('program');
      setTimeout(() => {
        const inp = document.getElementById('program-search');
        if (inp) { inp.value = query; renderProgramsList(); }
      }, 100);
    } else if (q.includes('kegiatan') || q.includes('sosialisasi') || q.includes('pelatihan')) {
      navigateTo('kegiatan');
      setTimeout(() => {
        const inp = document.getElementById('kegiatan-search');
        if (inp) { inp.value = query; renderKegiatanTable(); }
      }, 100);
    } else {
      navigateTo('data-dokumen');
      setTimeout(() => {
        const inp = document.getElementById('dokumen-search');
        if (inp) { inp.value = query; renderDokumenTable(); }
      }, 100);
    }
  }
}

// Mobile sidebar & navigation toggler
function toggleMobileMenu() {
  const nav = document.querySelector('.nav-desktop');
  if (nav) {
    nav.classList.toggle('open-mobile');
  }
}

// Init when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('hashchange', handleRouting);
  handleRouting();

  // Setup form event listeners
  const formKegiatan = document.getElementById('form-kegiatan');
  if (formKegiatan) formKegiatan.addEventListener('submit', saveKegiatanForm);

  const formBkb = document.getElementById('form-input-bkb');
  if (formBkb) formBkb.addEventListener('submit', handleBkbFormSubmit);

  const formDoc = document.getElementById('form-upload-doc');
  if (formDoc) formDoc.addEventListener('submit', handleUploadDocSubmit);

  // Search input live triggers
  const kegSearch = document.getElementById('kegiatan-search');
  if (kegSearch) kegSearch.addEventListener('input', () => { kegiatanPagination.currentPage = 1; renderKegiatanTable(); });

  const kegYear = document.getElementById('kegiatan-filter-tahun');
  if (kegYear) kegYear.addEventListener('change', () => { kegiatanPagination.currentPage = 1; renderKegiatanTable(); });

  const kegLoc = document.getElementById('kegiatan-filter-lokasi');
  if (kegLoc) kegLoc.addEventListener('change', () => { kegiatanPagination.currentPage = 1; renderKegiatanTable(); });

  const progSearch = document.getElementById('program-search');
  if (progSearch) progSearch.addEventListener('input', renderProgramsList);

  const progCat = document.getElementById('program-filter-kategori');
  if (progCat) progCat.addEventListener('change', renderProgramsList);

  const docSearch = document.getElementById('dokumen-search');
  if (docSearch) docSearch.addEventListener('input', renderDokumenTable);
});
