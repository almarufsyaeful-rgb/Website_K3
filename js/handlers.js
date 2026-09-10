/**
 * handlers.js
 * Interactive logic, form handling, CRUD operations, filters, and modal management
 * Integrated with REST API Backend & SQLite database
 */

// Toast notification helper
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icon = type === 'success' ? 'fa-circle-check' : (type === 'danger' ? 'fa-circle-exclamation' : 'fa-info-circle');
  toast.innerHTML = `
    <i class="fa-solid ${icon}" style="color: ${type === 'success' ? '#10b981' : (type === 'danger' ? '#ef4444' : '#2563eb')}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Modal helper
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// Close modal on click backdrop
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
    document.body.style.overflow = '';
  }
});

/* ==========================================================================
   Kegiatan K3 (Screen 4) Handlers
   ========================================================================== */
let kegiatanPagination = {
  currentPage: 1,
  pageSize: 6
};

async function renderKegiatanTable() {
  const tbody = document.getElementById('kegiatan-tbody');
  if (!tbody) return;

  const searchInput = document.getElementById('kegiatan-search');
  const yearSelect = document.getElementById('kegiatan-filter-tahun');
  const locSelect = document.getElementById('kegiatan-filter-lokasi');

  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const selectedYear = yearSelect ? yearSelect.value : 'all';
  const selectedLoc = locSelect ? locSelect.value : 'all';

  // Try fetching from backend API if online
  try {
    const data = await window.K3API.getKegiatan({
      search: query,
      tahun: selectedYear,
      lokasi: selectedLoc
    });
    if (data && Array.isArray(data)) {
      window.AppState.kegiatan = data;
    }
  } catch (err) {
    console.warn('Backend API unreachable, using local cache:', err);
  }

  let filtered = window.AppState.kegiatan.filter(item => {
    const matchQuery = item.nama.toLowerCase().includes(query) || item.lokasi.toLowerCase().includes(query);
    const matchYear = selectedYear === 'all' || item.tahun === selectedYear;
    const matchLoc = selectedLoc === 'all' || item.lokasi.includes(selectedLoc);
    return matchQuery && matchYear && matchLoc;
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / kegiatanPagination.pageSize) || 1;
  if (kegiatanPagination.currentPage > totalPages) {
    kegiatanPagination.currentPage = totalPages;
  }

  const startIdx = (kegiatanPagination.currentPage - 1) * kegiatanPagination.pageSize;
  const currentItems = filtered.slice(startIdx, startIdx + kegiatanPagination.pageSize);

  if (currentItems.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted);">Tidak ada kegiatan yang cocok dengan pencarian.</td></tr>`;
  } else {
    tbody.innerHTML = currentItems.map((item, idx) => `
      <tr>
        <td class="col-no">${startIdx + idx + 1}</td>
        <td><strong>${item.nama}</strong></td>
        <td><i class="fa-regular fa-calendar" style="color: var(--text-muted); margin-right: 4px;"></i> ${item.tanggal_display || item.tanggalDisplay}</td>
        <td><i class="fa-solid fa-location-dot" style="color: #ef4444; margin-right: 4px;"></i> ${item.lokasi}</td>
        <td>
          <div class="table-actions">
            <button class="btn-action btn-action-view" title="Lihat Detail" onclick="navigateTo('kegiatan-detail', { id: '${item.id}' })">
              <i class="fa-regular fa-eye"></i>
            </button>
            <button class="btn-action" title="Kelola Foto Dokumentasi" style="color: #0284c7;" onclick="openUploadFotoKegiatanModal('${item.id}')">
              <i class="fa-solid fa-camera"></i>
            </button>
            <button class="btn-action btn-action-edit" title="Edit Kegiatan" onclick="openEditKegiatanModal('${item.id}')">
              <i class="fa-regular fa-pen-to-square"></i>
            </button>
            <button class="btn-action btn-action-delete" title="Hapus Kegiatan" onclick="deleteKegiatan('${item.id}')">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  renderKegiatanPagination(totalPages);
}

function renderKegiatanPagination(totalPages) {
  const container = document.getElementById('kegiatan-pagination');
  if (!container) return;

  let html = `
    <button class="page-btn" ${kegiatanPagination.currentPage <= 1 ? 'disabled' : ''} onclick="changeKegiatanPage(${kegiatanPagination.currentPage - 1})">
      <i class="fa-solid fa-chevron-left"></i>
    </button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <button class="page-btn ${kegiatanPagination.currentPage === i ? 'active' : ''}" onclick="changeKegiatanPage(${i})">
        ${i}
      </button>
    `;
  }

  html += `
    <button class="page-btn" ${kegiatanPagination.currentPage >= totalPages ? 'disabled' : ''} onclick="changeKegiatanPage(${kegiatanPagination.currentPage + 1})">
      <i class="fa-solid fa-chevron-right"></i>
    </button>
  `;

  container.innerHTML = html;
}

function changeKegiatanPage(page) {
  kegiatanPagination.currentPage = page;
  renderKegiatanTable();
}

function openAddKegiatanModal() {
  const form = document.getElementById('form-kegiatan');
  if (form) form.reset();
  document.getElementById('modal-kegiatan-id').value = '';
  document.getElementById('modal-kegiatan-title').textContent = 'Tambah Kegiatan K3';
  openModal('modal-kegiatan');
}

function openEditKegiatanModal(id) {
  const item = window.AppState.kegiatan.find(k => k.id === id);
  if (!item) return;

  document.getElementById('modal-kegiatan-id').value = item.id;
  document.getElementById('kegiatan-nama-input').value = item.nama;
  document.getElementById('kegiatan-tanggal-input').value = item.tanggal;
  document.getElementById('kegiatan-lokasi-input').value = item.lokasi;
  document.getElementById('kegiatan-peserta-input').value = item.peserta || '50 orang';
  document.getElementById('kegiatan-deskripsi-input').value = item.deskripsi || '';

  document.getElementById('modal-kegiatan-title').textContent = 'Edit Kegiatan K3';
  openModal('modal-kegiatan');
}

async function saveKegiatanForm(e) {
  e.preventDefault();
  const id = document.getElementById('modal-kegiatan-id').value;
  const nama = document.getElementById('kegiatan-nama-input').value.trim();
  const tanggal = document.getElementById('kegiatan-tanggal-input').value;
  const lokasi = document.getElementById('kegiatan-lokasi-input').value.trim();
  const peserta = document.getElementById('kegiatan-peserta-input').value.trim();
  const deskripsi = document.getElementById('kegiatan-deskripsi-input').value.trim();
  const fotoInput = document.getElementById('kegiatan-foto-upload-input');

  if (!nama || !tanggal || !lokasi) {
    showToast('Mohon lengkapi semua kolom wajib!', 'danger');
    return;
  }

  const payload = { nama, tanggal, lokasi, peserta, deskripsi };
  let activeId = id;

  try {
    if (id) {
      await window.K3API.updateKegiatan(id, payload);
      // Update locally in AppState immediately
      const idx = window.AppState.kegiatan.findIndex(k => k.id === id);
      if (idx !== -1) {
        window.AppState.kegiatan[idx] = { ...window.AppState.kegiatan[idx], ...payload };
        window.AppState.saveKegiatan();
      }
      showToast('Kegiatan berhasil diperbarui di database!');
    } else {
      const res = await window.K3API.createKegiatan(payload);
      if (res && res.data) {
        activeId = res.data.id;
        const existingIdx = window.AppState.kegiatan.findIndex(k => k.id === activeId);
        if (existingIdx !== -1) {
          window.AppState.kegiatan[existingIdx] = { ...window.AppState.kegiatan[existingIdx], ...res.data };
        } else {
          window.AppState.kegiatan.unshift(res.data);
        }
        window.AppState.saveKegiatan();
      }
      showToast('Kegiatan baru berhasil disimpan ke database!');
    }

    // If a photo was selected during create or edit, upload it
    if (fotoInput && fotoInput.files && fotoInput.files[0] && activeId) {
      const fd = new FormData();
      fd.append('foto', fotoInput.files[0]);
      await window.K3API.uploadFotoKegiatan(activeId, fd);
      fotoInput.value = '';
    }
  } catch (err) {
    console.warn('API error, saving locally:', err);
    // Fallback local save if API was offline
    if (!id) {
      const fallbackId = 'keg-' + Date.now();
      activeId = fallbackId;
      window.AppState.kegiatan.unshift({
        id: fallbackId,
        nama,
        tanggal,
        tanggal_display: tanggal,
        tahun: tanggal ? tanggal.split('-')[0] : '2026',
        lokasi,
        peserta: peserta || '50 orang',
        deskripsi: deskripsi || 'Kegiatan pembinaan dan edukasi keluarga Kota Semarang.',
        dokumentasi: []
      });
      window.AppState.saveKegiatan();
    }
    showToast('Kegiatan berhasil disimpan.');
  }

  closeModal('modal-kegiatan');

  // Reset search and filter to ensure the new item is not hidden
  const searchInput = document.getElementById('kegiatan-search');
  const yearSelect = document.getElementById('kegiatan-filter-tahun');
  const locSelect = document.getElementById('kegiatan-filter-lokasi');
  if (searchInput) searchInput.value = '';
  if (yearSelect) yearSelect.value = 'all';
  if (locSelect) locSelect.value = 'all';
  kegiatanPagination.currentPage = 1;

  // Refresh table data
  await renderKegiatanTable();

  // If currently viewing detail of this item, re-render it
  if (window.location.hash.includes('kegiatan-detail') && window.currentDetailKegiatanId === activeId) {
    if (typeof renderKegiatanDetail === 'function') {
      renderKegiatanDetail(activeId);
    }
  }

  if (typeof renderAdminDashboard === 'function') {
    renderAdminDashboard();
  }
}

async function deleteKegiatan(id) {
  if (!id) return;
  const item = window.AppState.kegiatan.find(k => k.id === id);
  const nama = item ? `"${item.nama}"` : 'kegiatan ini';

  if (!confirm(`Apakah Anda yakin ingin menghapus data kegiatan ${nama}?\n\nData yang dihapus tidak dapat dikembalikan.`)) {
    return;
  }

  // 1. Instantly remove from AppState & LocalStorage
  window.AppState.kegiatan = window.AppState.kegiatan.filter(k => k.id !== id);
  window.AppState.saveKegiatan();
  renderKegiatanTable();

  // 2. Call backend API to delete from database
  try {
    await window.K3API.deleteKegiatan(id);
    showToast(`Kegiatan ${nama} berhasil dihapus.`);
  } catch (err) {
    console.warn('Backend delete warning, item removed locally:', err);
    showToast(`Kegiatan ${nama} berhasil dihapus.`);
  }

  // 3. Refresh table & admin stats
  renderKegiatanTable();
  if (typeof renderAdminDashboard === 'function') {
    renderAdminDashboard();
  }

  // 4. If user was on kegiatan-detail page of this deleted item, navigate back to #kegiatan
  if (window.location.hash.includes('kegiatan-detail')) {
    navigateTo('kegiatan');
  }
}

window.deleteKegiatan = deleteKegiatan;

/* ==========================================================================
   Kelola Foto Dokumentasi Kegiatan Handlers
   ========================================================================== */
let _replacingPhotoContext = null;

async function openUploadFotoKegiatanModal(kegId) {
  if (!kegId) {
    const kelolaBtn = document.getElementById('btn-kelola-foto');
    if (kelolaBtn && kelolaBtn.getAttribute('data-keg-id')) {
      kegId = kelolaBtn.getAttribute('data-keg-id');
    } else if (window.currentDetailKegiatanId) {
      kegId = window.currentDetailKegiatanId;
    } else if (typeof getRouteInfo === 'function') {
      const routeInfo = getRouteInfo();
      kegId = (routeInfo && routeInfo.params && routeInfo.params.id) || (window.AppState.kegiatan[0] ? window.AppState.kegiatan[0].id : 'keg-1');
    }
  }

  if (!kegId) {
    showToast('Kegiatan tidak ditemukan.', 'danger');
    return;
  }

  const idInput = document.getElementById('foto-keg-id');
  if (idInput) idInput.value = kegId;

  // Clear inputs
  const fileInput = document.getElementById('input-file-foto-keg');
  const urlInput = document.getElementById('input-url-foto-keg');
  if (fileInput) fileInput.value = '';
  if (urlInput) urlInput.value = '';

  let keg = null;
  try {
    keg = await window.K3API.getKegiatanById(kegId);
  } catch (err) {
    keg = window.AppState.kegiatan.find(k => k.id === kegId) || { id: kegId, nama: 'Kegiatan K3', dokumentasi: [] };
  }

  const titleEl = document.getElementById('modal-foto-keg-title');
  if (titleEl && keg) {
    titleEl.textContent = keg.nama || 'Kegiatan K3';
  }

  renderModalFotoGrid(keg);
  openModal('modal-foto-kegiatan');
}

function renderModalFotoGrid(keg) {
  const container = document.getElementById('modal-foto-current-grid');
  if (!container) return;

  const docs = keg && keg.dokumentasi 
    ? (Array.isArray(keg.dokumentasi) ? keg.dokumentasi : JSON.parse(keg.dokumentasi || '[]'))
    : [];

  if (docs.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 1.5rem; background: var(--surface-alt); border-radius: var(--radius-md); color: var(--text-muted); font-size: 0.88rem;">
        <i class="fa-regular fa-image" style="font-size: 1.8rem; margin-bottom: 0.5rem; display: block; opacity: 0.6;"></i>
        Belum ada foto dokumentasi untuk kegiatan ini. Silakan unggah foto di bawah.
      </div>
    `;
    return;
  }

  container.innerHTML = docs.map((url, idx) => `
    <div style="position: relative; border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--border); box-shadow: var(--shadow-sm); aspect-ratio: 4/3; background: #0f172a;">
      <img src="${url}" alt="Dokumentasi ${idx + 1}" style="width: 100%; height: 100%; object-fit: cover; display: block; cursor: pointer;" onclick="previewImage('${url}', '${(keg.nama || '').replace(/'/g, "\\'")} - Foto ${idx + 1}')" onerror="this.src='https://images.unsplash.com/photo-1577495508048-b635879837f1?w=400'">
      <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 40%, rgba(0,0,0,0.6) 100%); pointer-events: none;"></div>
      <span style="position: absolute; bottom: 8px; left: 8px; color: #fff; font-size: 0.75rem; font-weight: 700; text-shadow: 0 1px 2px rgba(0,0,0,0.9);">
        Foto #${idx + 1}
      </span>
      <div style="position: absolute; top: 6px; right: 6px; display: flex; gap: 4px;">
        <button type="button" onclick="triggerReplacePhoto('${keg.id}', ${idx})" title="Ganti / Ubah foto ini" style="background: rgba(14, 116, 144, 0.9); color: #fff; border: none; border-radius: 6px; padding: 4px 8px; cursor: pointer; font-size: 0.72rem; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.3); transition: background 0.2s;" onmouseover="this.style.background='#0891b2'" onmouseout="this.style.background='rgba(14, 116, 144, 0.9)'">
          <i class="fa-solid fa-arrows-rotate"></i> Ganti
        </button>
        <button type="button" onclick="deleteFotoKegiatanHandler('${keg.id}', ${idx}, '${encodeURIComponent(url)}')" title="Hapus foto ini" style="background: rgba(220, 38, 38, 0.9); color: #fff; border: none; border-radius: 6px; width: 26px; height: 26px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; font-size: 0.75rem; box-shadow: 0 2px 4px rgba(0,0,0,0.3); transition: background 0.2s;" onmouseover="this.style.background='#b91c1c'" onmouseout="this.style.background='rgba(220, 38, 38, 0.9)'">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    </div>
  `).join('');
}

async function submitUploadFotoKegiatan() {
  const idInput = document.getElementById('foto-keg-id');
  const id = idInput ? idInput.value : null;

  if (!id) {
    showToast('ID Kegiatan tidak valid.', 'danger');
    return;
  }

  const fileInput = document.getElementById('input-file-foto-keg');
  const urlInput = document.getElementById('input-url-foto-keg');
  const file = fileInput && fileInput.files ? fileInput.files[0] : null;
  const photoUrl = urlInput ? urlInput.value.trim() : '';

  if (!file && !photoUrl) {
    showToast('Pilih berkas foto dari perangkat atau masukkan link URL foto!', 'warning');
    return;
  }

  const uploadBtn = document.querySelector('#modal-foto-kegiatan button[onclick="submitUploadFotoKegiatan()"]');
  const originalText = uploadBtn ? uploadBtn.innerHTML : '';
  if (uploadBtn) {
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengunggah...';
  }

  try {
    const formData = new FormData();
    if (file) formData.append('foto', file);
    if (photoUrl) formData.append('fotoUrl', photoUrl);

    const res = await window.K3API.uploadFotoKegiatan(id, formData);
    if (res.success) {
      showToast('Foto dokumentasi berhasil ditambahkan!');
      if (fileInput) fileInput.value = '';
      if (urlInput) urlInput.value = '';

      let updatedKeg = null;
      try {
        updatedKeg = await window.K3API.getKegiatanById(id);
      } catch (e) {
        updatedKeg = { id, nama: document.getElementById('modal-foto-keg-title')?.textContent, dokumentasi: res.data };
      }

      // Sync local AppState
      const existingIdx = window.AppState.kegiatan.findIndex(k => k.id === id);
      if (existingIdx !== -1 && updatedKeg) {
        window.AppState.kegiatan[existingIdx] = updatedKeg;
      }

      renderModalFotoGrid(updatedKeg);

      if (typeof window.renderKegiatanDetail === 'function') {
        window.renderKegiatanDetail(id);
      }
    } else {
      showToast(res.error || 'Gagal mengunggah foto', 'danger');
    }
  } catch (err) {
    console.error('Error uploading foto:', err);
    showToast('Terjadi kesalahan saat mengunggah foto: ' + err.message, 'danger');
  } finally {
    if (uploadBtn) {
      uploadBtn.disabled = false;
      uploadBtn.innerHTML = originalText;
    }
  }
}

function triggerReplacePhoto(kegId, index) {
  _replacingPhotoContext = { kegId, index };
  const replaceInput = document.getElementById('input-replace-foto-keg');
  if (replaceInput) {
    replaceInput.value = '';
    replaceInput.click();
  }
}

async function handleReplaceFileSelected(event) {
  const file = event.target.files && event.target.files[0];
  if (!file || !_replacingPhotoContext) return;

  const { kegId, index } = _replacingPhotoContext;
  const formData = new FormData();
  formData.append('foto', file);
  formData.append('index', index);

  showToast('Sedang mengganti foto...', 'info');

  try {
    const res = await window.K3API.replaceFotoKegiatan(kegId, formData);
    if (res.success) {
      showToast('Foto dokumentasi berhasil diganti!');
      
      let updatedKeg = null;
      try {
        updatedKeg = await window.K3API.getKegiatanById(kegId);
      } catch (e) {
        updatedKeg = { id: kegId, nama: document.getElementById('modal-foto-keg-title')?.textContent || 'Kegiatan', dokumentasi: res.data };
      }

      const existingIdx = window.AppState.kegiatan.findIndex(k => k.id === kegId);
      if (existingIdx !== -1 && updatedKeg) {
        window.AppState.kegiatan[existingIdx] = updatedKeg;
      }

      renderModalFotoGrid(updatedKeg);

      if (typeof window.renderKegiatanDetail === 'function') {
        window.renderKegiatanDetail(kegId);
      }
    } else {
      showToast(res.error || 'Gagal mengganti foto', 'danger');
    }
  } catch (err) {
    console.error('Error replacing foto:', err);
    showToast('Terjadi kesalahan saat mengganti foto.', 'danger');
  } finally {
    _replacingPhotoContext = null;
    event.target.value = '';
  }
}

async function deleteFotoKegiatanHandler(kegId, index, encodedUrl) {
  if (!confirm('Apakah Anda yakin ingin menghapus foto dokumentasi ini?')) {
    return;
  }

  const url = decodeURIComponent(encodedUrl);
  try {
    const res = await window.K3API.deleteFotoKegiatan(kegId, index, url);
    if (res.success) {
      showToast('Foto dokumentasi berhasil dihapus.');

      let updatedKeg = null;
      try {
        updatedKeg = await window.K3API.getKegiatanById(kegId);
      } catch (e) {
        updatedKeg = { id: kegId, nama: document.getElementById('modal-foto-keg-title')?.textContent, dokumentasi: res.data };
      }

      const existingIdx = window.AppState.kegiatan.findIndex(k => k.id === kegId);
      if (existingIdx !== -1 && updatedKeg) {
        window.AppState.kegiatan[existingIdx] = updatedKeg;
      }

      renderModalFotoGrid(updatedKeg);

      if (typeof window.renderKegiatanDetail === 'function') {
        window.renderKegiatanDetail(kegId);
      }
    } else {
      showToast(res.error || 'Gagal menghapus foto', 'danger');
    }
  } catch (err) {
    console.error('Error deleting foto:', err);
    showToast('Terjadi kesalahan saat menghapus foto.', 'danger');
  }
}

window.openUploadFotoKegiatanModal = openUploadFotoKegiatanModal;
window.renderModalFotoGrid = renderModalFotoGrid;
window.submitUploadFotoKegiatan = submitUploadFotoKegiatan;
window.triggerReplacePhoto = triggerReplacePhoto;
window.handleReplaceFileSelected = handleReplaceFileSelected;
window.deleteFotoKegiatanHandler = deleteFotoKegiatanHandler;

/* ==========================================================================
   Input Data BKB (Screen 6) Handlers
   ========================================================================== */
async function renderBkbTable() {
  const tbody = document.getElementById('bkb-data-tbody');
  if (!tbody) return;

  try {
    const data = await window.K3API.getBkb();
    if (data && Array.isArray(data)) {
      window.AppState.bkbData = data;
    }
  } catch (err) {
    console.warn('Backend API unreachable, using local cache:', err);
  }

  if (window.AppState.bkbData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">Belum ada data kelompok.</td></tr>`;
    return;
  }

  tbody.innerHTML = window.AppState.bkbData.map((item, idx) => `
    <tr>
      <td class="col-no">${idx + 1}</td>
      <td><strong>${item.namaKelompok}</strong></td>
      <td><span class="badge badge-tag">${item.tahun}</span></td>
      <td>
        <div class="table-actions">
          <button class="btn-action btn-action-edit" title="Edit Data" onclick="editBkbData(${item.id})">
            <i class="fa-regular fa-pen-to-square"></i>
          </button>
          <button class="btn-action btn-action-delete" title="Hapus Data" onclick="deleteBkbData(${item.id})">
            <i class="fa-regular fa-trash-can"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

async function handleBkbFormSubmit(e) {
  e.preventDefault();
  const idInput = document.getElementById('bkb-edit-id');
  const nama = document.getElementById('bkb-nama').value.trim();
  const alamat = document.getElementById('bkb-alamat').value.trim();
  const ketua = document.getElementById('bkb-ketua').value.trim();
  const jumlahAnggota = parseInt(document.getElementById('bkb-anggota').value) || 0;
  const tahun = document.getElementById('bkb-tahun').value;

  if (!nama || !alamat || !ketua || !tahun) {
    showToast('Harap lengkapi semua data wajib!', 'danger');
    return;
  }

  const editId = idInput.value ? parseInt(idInput.value) : null;
  const payload = { namaKelompok: nama, alamat, ketua, jumlahAnggota, tahun };

  try {
    if (editId) {
      await window.K3API.updateBkb(editId, payload);
      showToast(`Data kelompok "${nama}" berhasil diperbarui di SQLite.`);
    } else {
      await window.K3API.createBkb(payload);
      showToast(`Data kelompok "${nama}" berhasil disimpan ke SQLite!`);
    }
  } catch (err) {
    console.warn('API error, saving locally:', err);
    showToast(`Data kelompok "${nama}" disimpan.`);
  }

  document.getElementById('form-input-bkb').reset();
  idInput.value = '';
  document.getElementById('bkb-submit-btn').innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Simpan Data`;
  renderBkbTable();
}

function editBkbData(id) {
  const item = window.AppState.bkbData.find(d => d.id === id);
  if (!item) return;

  document.getElementById('bkb-edit-id').value = item.id;
  document.getElementById('bkb-nama').value = item.namaKelompok;
  document.getElementById('bkb-alamat').value = item.alamat;
  document.getElementById('bkb-ketua').value = item.ketua;
  document.getElementById('bkb-anggota').value = item.jumlahAnggota;
  document.getElementById('bkb-tahun').value = item.tahun;

  document.getElementById('bkb-submit-btn').innerHTML = `<i class="fa-solid fa-check"></i> Perbarui Data`;
  document.getElementById('bkb-nama').focus();
}

async function deleteBkbData(id) {
  if (confirm('Yakin ingin menghapus data kelompok ini?')) {
    try {
      await window.K3API.deleteBkb(id);
      showToast('Data kelompok berhasil dihapus dari database.');
    } catch (err) {
      window.AppState.bkbData = window.AppState.bkbData.filter(d => d.id !== id);
      window.AppState.saveBkbData();
      showToast('Data kelompok berhasil dihapus.');
    }
    renderBkbTable();
  }
}

/* ==========================================================================
   Data K3 / Dokumen (Screen 7) Handlers
   ========================================================================== */
let selectedDocCategory = 'SEMUA';

function setDocCategory(cat, el) {
  selectedDocCategory = cat;
  document.querySelectorAll('.category-tab-btn').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  renderDokumenTable();
}

async function renderDokumenTable() {
  const tbody = document.getElementById('dokumen-tbody');
  if (!tbody) return;

  const searchInput = document.getElementById('dokumen-search');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

  try {
    const data = await window.K3API.getDokumen({
      kategori: selectedDocCategory,
      search: query
    });
    if (data && Array.isArray(data)) {
      window.AppState.dokumen = data;
    }
  } catch (err) {
    console.warn('Backend API unreachable, using local cache:', err);
  }

  let filtered = window.AppState.dokumen.filter(doc => {
    const matchCat = selectedDocCategory === 'SEMUA' || doc.kategori === selectedDocCategory;
    const matchQuery = (doc.namaFile || doc.nama_file || '').toLowerCase().includes(query) || (doc.judul || '').toLowerCase().includes(query);
    return matchCat && matchQuery;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted);">Tidak ada dokumen dalam kategori ini.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((doc, idx) => {
    let badgeClass = 'badge-pdf';
    if (doc.jenis === 'Excel') badgeClass = 'badge-excel';
    if (doc.jenis === 'Word') badgeClass = 'badge-word';
    if (doc.jenis === 'PPT') badgeClass = 'badge-ppt';

    const fileName = doc.namaFile || doc.nama_file;
    const tgl = doc.tanggalUpload || doc.tanggal_upload;

    return `
      <tr>
        <td class="col-no">${idx + 1}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 0.65rem;">
            <i class="fa-regular ${doc.icon || 'fa-file'}" style="color: ${doc.iconColor || doc.icon_color || '#2563eb'}; font-size: 1.15rem;"></i>
            <div>
              <strong>${fileName}</strong>
              <div style="font-size: 0.8rem; color: var(--text-muted);">${doc.judul}</div>
            </div>
          </div>
        </td>
        <td><span class="badge ${badgeClass}">${doc.jenis}</span></td>
        <td>${tgl}</td>
        <td>
          <div class="table-actions">
            <button class="btn-action btn-action-view" title="Detail Dokumen" onclick="navigateTo('dokumen-detail', { id: '${doc.id}' })">
              <i class="fa-regular fa-eye"></i>
            </button>
            <button class="btn-action btn-action-download" title="Unduh File" onclick="downloadDocumentFile('${doc.id}', '${fileName}')">
              <i class="fa-solid fa-download"></i>
            </button>
            <button class="btn-action btn-action-edit" title="Edit Dokumen" onclick="openEditDocModal('${doc.id}')">
              <i class="fa-regular fa-pen-to-square"></i>
            </button>
            <button class="btn-action btn-action-delete" title="Hapus Dokumen" onclick="deleteDokumen('${doc.id}')">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

async function downloadDocumentFile(id, filename) {
  showToast(`Menyiapkan unduhan: ${filename || 'dokumen'}...`);
  
  try {
    const doc = window.AppState.dokumen.find(d => d.id === id);
    
    if (!doc || !doc.filePath) {
      showToast('Maaf, link file tidak ditemukan.', 'danger');
      return;
    }

    // Ambil link asli dari database TANPA diubah-ubah sama sekali
    const downloadUrl = doc.filePath;

    // Buka link di tab baru. Cloudinary akan otomatis mendownload file Excel/Word-nya
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.target = "_blank"; 
    
    if (filename) link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (err) {
    console.error('Download error:', err);
    showToast('Gagal mengunduh file.', 'danger');
  }
}
window.downloadDocumentFile = downloadDocumentFile;

function openUploadDocModal() {
  const form = document.getElementById('form-upload-doc');
  if (form) form.reset();
  const idInput = document.getElementById('upload-doc-id');
  if (idInput) idInput.value = '';
  const titleEl = document.getElementById('modal-upload-doc-title');
  if (titleEl) titleEl.textContent = 'Upload Dokumen K3';
  const submitBtn = document.getElementById('upload-doc-submit-btn');
  if (submitBtn) submitBtn.textContent = 'Unggah Sekarang';
  openModal('modal-upload-doc');
}

function openEditDocModal(id) {
  const doc = window.AppState.dokumen.find(d => d.id === id);
  if (!doc) return;

  const idInput = document.getElementById('upload-doc-id');
  if (idInput) idInput.value = doc.id;
  document.getElementById('upload-doc-nama').value = doc.namaFile || doc.nama_file;
  document.getElementById('upload-doc-judul').value = doc.judul || '';
  document.getElementById('upload-doc-kategori').value = doc.kategori || 'BKB';
  document.getElementById('upload-doc-jenis').value = doc.jenis || 'PDF';
  document.getElementById('upload-doc-deskripsi').value = doc.deskripsi || '';

  const titleEl = document.getElementById('modal-upload-doc-title');
  if (titleEl) titleEl.textContent = 'Edit Dokumen K3';
  const submitBtn = document.getElementById('upload-doc-submit-btn');
  if (submitBtn) submitBtn.textContent = 'Perbarui Dokumen';
  openModal('modal-upload-doc');
}

async function handleUploadDocSubmit(e) {
  e.preventDefault();
  const idInput = document.getElementById('upload-doc-id');
  const editId = idInput ? idInput.value : '';
  const fileInput = document.getElementById('upload-doc-file');
  const namaFile = document.getElementById('upload-doc-nama').value.trim();
  const judul = document.getElementById('upload-doc-judul').value.trim();
  const kategori = document.getElementById('upload-doc-kategori').value;
  const jenis = document.getElementById('upload-doc-jenis').value;
  const deskripsi = document.getElementById('upload-doc-deskripsi').value.trim();

  if (!namaFile || !kategori || !jenis) {
    showToast('Harap lengkapi semua kolom wajib!', 'danger');
    return;
  }

  if (editId) {
    // Update existing document
    const payload = { namaFile, judul, kategori, jenis, deskripsi };
    try {
      await window.K3API.updateDokumen(editId, payload);
      const doc = window.AppState.dokumen.find(d => d.id === editId);
      if (doc) {
        Object.assign(doc, payload);
        window.AppState.saveDokumen();
      }
      showToast('Dokumen berhasil diperbarui!');
    } catch (err) {
      console.warn('API error, updating locally:', err);
      const doc = window.AppState.dokumen.find(d => d.id === editId);
      if (doc) {
        Object.assign(doc, payload);
        window.AppState.saveDokumen();
      }
      showToast('Dokumen berhasil diperbarui.');
    }
  } else {
    // Create new document
    const formData = new FormData();
    if (fileInput && fileInput.files[0]) {
      formData.append('file', fileInput.files[0]);
    }
    formData.append('namaFile', namaFile);
    formData.append('judul', judul);
    formData.append('kategori', kategori);
    formData.append('jenis', jenis);
    formData.append('deskripsi', deskripsi);

    try {
      const res = await window.K3API.uploadDokumen(formData);
      if (res && res.data) {
        const existingIdx = window.AppState.dokumen.findIndex(d => d.id === res.data.id);
        if (existingIdx !== -1) {
          window.AppState.dokumen[existingIdx] = { ...window.AppState.dokumen[existingIdx], ...res.data };
        } else {
          window.AppState.dokumen.unshift(res.data);
        }
        window.AppState.saveDokumen();
      }
      showToast('Dokumen baru berhasil diunggah!');
    } catch (err) {
      console.warn('API error, falling back locally:', err);
      const fallbackId = 'doc-' + Date.now();
      const now = new Date();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const dateDisplay = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
      const newDoc = {
        id: fallbackId,
        namaFile,
        judul: judul || namaFile,
        kategori,
        jenis,
        icon: jenis === 'Excel' ? 'fa-file-excel' : (jenis === 'Word' ? 'fa-file-word' : 'fa-file-pdf'),
        iconColor: jenis === 'Excel' ? '#107c41' : (jenis === 'Word' ? '#2b579a' : '#ea4335'),
        ukuran: '2.4 MB',
        tanggalUpload: dateDisplay,
        pengunggah: 'Admin K3',
        deskripsi: deskripsi || 'Dokumen resmi Bidang K3 Disdalduk KB Kota Semarang.'
      };
      window.AppState.dokumen.unshift(newDoc);
      window.AppState.saveDokumen();
      showToast('Dokumen berhasil disimpan.');
    }
  }

  closeModal('modal-upload-doc');

  // Reset tab to SEMUA so the new document is visible
  selectedDocCategory = 'SEMUA';
  const catButtons = document.querySelectorAll('.category-tab-btn');
  catButtons.forEach(btn => {
    if (btn.textContent.trim().toUpperCase() === 'SEMUA') {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const searchInput = document.getElementById('dokumen-search');
  if (searchInput) searchInput.value = '';

  await renderDokumenTable();
  if (typeof renderAdminDashboard === 'function') {
    renderAdminDashboard();
  }
}

async function deleteDokumen(id) {
  if (!id) return;
  const item = window.AppState.dokumen.find(d => d.id === id);
  const nama = item ? `"${item.namaFile || item.judul}"` : 'dokumen ini';

  if (!confirm(`Apakah Anda yakin ingin menghapus ${nama}?\n\nData dan berkas dokumen yang dihapus tidak dapat dikembalikan.`)) {
    return;
  }

  // 1. Instantly remove from local memory & LocalStorage
  window.AppState.dokumen = window.AppState.dokumen.filter(d => d.id !== id);
  window.AppState.saveDokumen();
  renderDokumenTable();

  // 2. Call backend API
  try {
    await window.K3API.deleteDokumen(id);
    showToast(`Dokumen ${nama} berhasil dihapus.`);
  } catch (err) {
    console.warn('Backend deleteDokumen error, removed locally:', err);
    showToast(`Dokumen ${nama} berhasil dihapus.`);
  }

  // 3. Re-render table & update admin dashboard
  renderDokumenTable();
  if (typeof renderAdminDashboard === 'function') {
    renderAdminDashboard();
  }

  // 4. If user was on dokumen-detail page of this deleted item, navigate back to #data-dokumen
  if (window.location.hash.includes('dokumen-detail')) {
    window.location.hash = '#data-dokumen';
  }
}

window.deleteDokumen = deleteDokumen;

/* ==========================================================================
   Program K3 (Screen 3) Handlers
   ========================================================================== */
async function renderProgramsList() {
  const container = document.getElementById('programs-list-container');
  if (!container) return;

  const searchInput = document.getElementById('program-search');
  const catSelect = document.getElementById('program-filter-kategori');

  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const selectedCat = catSelect ? catSelect.value : 'all';

  try {
    const data = await window.K3API.getPrograms();
    if (data && Array.isArray(data)) {
      window.AppState.programs = data;
    }
  } catch (err) {
    console.warn('Backend API unreachable, using local cache:', err);
  }

  const filtered = window.AppState.programs.filter(prog => {
    const matchQuery = prog.nama.toLowerCase().includes(query) || prog.deskripsi.toLowerCase().includes(query);
    const matchCat = selectedCat === 'all' || prog.kategori === selectedCat;
    return matchQuery && matchCat;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div style="padding: 2.5rem; text-align: center; color: var(--text-muted); background: #fff; border-radius: var(--radius-lg); border: 1px solid var(--border);">Program tidak ditemukan.</div>`;
    return;
  }

  container.innerHTML = filtered.map(prog => `
    <div class="program-item-card" onclick="navigateTo('program-detail', { id: '${prog.id}' })">
      <div class="program-item-icon">
        <i class="fa-solid ${prog.icon || 'fa-hand-holding-heart'}"></i>
      </div>
      <div class="program-item-body">
        <div class="program-item-title">${prog.nama}</div>
        <div class="program-item-desc">${prog.ringkasan || prog.deskripsi}</div>
      </div>
      <div class="program-item-arrow">
        <i class="fa-solid fa-chevron-right"></i>
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   Profil Bidang K3 (Screen 8) Tabs
   ========================================================================== */
function switchProfilTab(tabKey, el) {
  document.querySelectorAll('.profil-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.profil-tab-pane').forEach(pane => pane.classList.remove('active'));

  if (el) el.classList.add('active');
  const pane = document.getElementById(`tab-pane-${tabKey}`);
  if (pane) pane.classList.add('active');
}

/* ==========================================================================
   Admin Dashboard (Screen 12) Handlers
   ========================================================================== */
async function renderAdminDashboard() {
  // Update stats from backend
  const statProg = document.getElementById('admin-stat-program');
  const statKeg = document.getElementById('admin-stat-kegiatan');
  const statDoc = document.getElementById('admin-stat-dokumen');
  const statKel = document.getElementById('admin-stat-kelompok');

  try {
    const stats = await window.K3API.getStats();
    if (stats) {
      if (statProg) statProg.textContent = stats.totalPrograms;
      if (statKeg) statKeg.textContent = stats.totalKegiatan;
      if (statDoc) statDoc.textContent = stats.totalDokumen;
      if (statKel) statKel.textContent = stats.totalKelompok;
    }
  } catch (err) {
    if (statProg) statProg.textContent = window.AppState.programs.length;
    if (statKeg) statKeg.textContent = window.AppState.kegiatan.length;
    if (statDoc) statDoc.textContent = window.AppState.dokumen.length;
    if (statKel) statKel.textContent = 142;
  }

  // Render recent activities from backend
  const tbody = document.getElementById('admin-aktivitas-tbody');
  if (tbody) {
    try {
      const logs = await window.K3API.getAktivitas();
      if (logs && Array.isArray(logs)) {
        window.AppState.aktivitas = logs;
      }
    } catch (err) {
      console.warn('Could not fetch aktivitas log:', err);
    }

    tbody.innerHTML = window.AppState.aktivitas.slice(0, 6).map((item, idx) => `
      <tr>
        <td class="col-no">${idx + 1}</td>
        <td><strong>${item.aktivitas}</strong></td>
        <td><i class="fa-regular fa-clock" style="color: var(--text-muted); margin-right: 5px;"></i> ${item.tanggal}</td>
        <td><span class="badge badge-tag">${item.oleh}</span></td>
      </tr>
    `).join('');
  }
}
