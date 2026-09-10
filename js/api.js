/**
 * js/api.js
 * Universal Client-side API Service layer
 * Automatically adapts between XAMPP PHP API & Node.js Express API
 */

let _isPhpBackend = null;

async function resolveApiUrl(resource, params = {}) {
  const queryStr = new URLSearchParams(params).toString();

  if (_isPhpBackend === null) {
    try {
      const probe = await fetch('/api/health', { signal: AbortSignal.timeout(600) });
      _isPhpBackend = !probe.ok;
    } catch {
      _isPhpBackend = true;
    }
  }

  if (_isPhpBackend) {
    const phpMap = {
      'programs': 'api/programs.php',
      'kegiatan': 'api/kegiatan.php',
      'turunan': 'api/turunan.php',
      'bkb': 'api/bkb.php',
      'dokumen': 'api/dokumen.php',
      'admin/stats': 'api/stats.php',
      'admin/aktivitas': 'api/stats.php?aktivitas=1',
      'news': 'api/news.php'
    };
    let target = phpMap[resource] || `api/${resource}.php`;
    if (queryStr) {
      target += target.includes('?') ? `&${queryStr}` : `?${queryStr}`;
    }
    return target;
  } else {
    let target = `/api/${resource}`;
    if (queryStr) target += `?${queryStr}`;
    return target;
  }
}

window.K3API = {
  // Programs
  async getPrograms() {
    const url = await resolveApiUrl('programs');
    const res = await fetch(url);
    const json = await res.json();
    return json.data;
  },

  async getProgram(id) {
    if (!id) return null;
    let url;
    if (_isPhpBackend) {
      url = await resolveApiUrl('programs', { id });
    } else {
      url = `/api/programs/${encodeURIComponent(id)}`;
    }
    const res = await fetch(url);
    const json = await res.json();
    if (!json || !json.data) return null;
    if (Array.isArray(json.data)) {
      return json.data.find(p => p.id === id) || json.data[0] || null;
    }
    return json.data;
  },

  // Kegiatan
  async getKegiatan(params = {}) {
    const url = await resolveApiUrl('kegiatan', params);
    const res = await fetch(url);
    const json = await res.json();
    return json.data;
  },

  async getKegiatanById(id) {
    if (!id) return null;
    let url;
    if (_isPhpBackend) {
      url = await resolveApiUrl('kegiatan', { id });
    } else {
      url = `/api/kegiatan/${encodeURIComponent(id)}`;
    }
    const res = await fetch(url);
    if (!res.ok) {
      // Fallback with query string
      const fallbackUrl = await resolveApiUrl('kegiatan', { id });
      const res2 = await fetch(fallbackUrl);
      const json2 = await res2.json();
      if (json2 && json2.data) {
        return Array.isArray(json2.data) ? (json2.data.find(k => k.id === id) || json2.data[0]) : json2.data;
      }
      return null;
    }
    const json = await res.json();
    if (!json || !json.data) return null;
    if (Array.isArray(json.data)) {
      return json.data.find(k => k.id === id) || json.data[0] || null;
    }
    return json.data;
  },

  async createKegiatan(data) {
    const url = await resolveApiUrl('kegiatan');
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async updateKegiatan(id, data) {
    let url;
    if (_isPhpBackend) {
      url = await resolveApiUrl('kegiatan', { id });
    } else {
      url = `/api/kegiatan/${encodeURIComponent(id)}`;
    }
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, id })
    });
    return await res.json();
  },

  async deleteKegiatan(id) {
    if (!id) throw new Error('ID Kegiatan dibutuhkan');
    let url;
    if (_isPhpBackend) {
      url = await resolveApiUrl('kegiatan', { id });
    } else {
      url = `/api/kegiatan/${encodeURIComponent(id)}`;
    }

    let res;
    try {
      res = await fetch(url, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      // Fallback: Try POST with action=delete or query param
      const fallbackUrl = await resolveApiUrl('kegiatan', { action: 'delete', id });
      res = await fetch(fallbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'delete' })
      });
    }

    const json = await res.json();
    if (!res.ok || json.success === false) {
      throw new Error(json.error || 'Gagal menghapus kegiatan');
    }
    return json;
  },

  async uploadFotoKegiatan(id, formData) {
    if (_isPhpBackend) {
      const res = await fetch(`api/kegiatan.php?action=upload_foto&id=${encodeURIComponent(id)}`, {
        method: 'POST',
        body: formData
      });
      return await res.json();
    } else {
      const res = await fetch(`/api/kegiatan/upload-foto/${encodeURIComponent(id)}`, {
        method: 'POST',
        body: formData
      });
      return await res.json();
    }
  },

  async replaceFotoKegiatan(id, formData) {
    if (_isPhpBackend) {
      const res = await fetch(`api/kegiatan.php?action=replace_foto&id=${encodeURIComponent(id)}`, {
        method: 'POST',
        body: formData
      });
      return await res.json();
    } else {
      const res = await fetch(`/api/kegiatan/replace-foto/${encodeURIComponent(id)}`, {
        method: 'POST',
        body: formData
      });
      return await res.json();
    }
  },

  async deleteFotoKegiatan(id, index, url) {
    if (_isPhpBackend) {
      const fd = new FormData();
      fd.append('action', 'delete_foto');
      fd.append('id', id);
      fd.append('index', index);
      fd.append('url', url);
      const res = await fetch(`api/kegiatan.php`, {
        method: 'POST',
        body: fd
      });
      return await res.json();
    } else {
      const res = await fetch(`/api/kegiatan/delete-foto/${encodeURIComponent(id)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index, url })
      });
      return await res.json();
    }
  },

  // Turunan
  async getTurunan() {
    const url = await resolveApiUrl('turunan');
    const res = await fetch(url);
    const json = await res.json();
    return json.data;
  },

  async getTurunanById(id) {
    if (_isPhpBackend) {
      const res = await fetch(`api/turunan.php?id=${encodeURIComponent(id)}`);
      const json = await res.json();
      return json.data;
    } else {
      const res = await fetch(`/api/turunan/${encodeURIComponent(id)}`);
      const json = await res.json();
      return json.data;
    }
  },

  // BKB
  async getBkb() {
    const url = await resolveApiUrl('bkb');
    const res = await fetch(url);
    const json = await res.json();
    return json.data;
  },

  async createBkb(data) {
    const url = await resolveApiUrl('bkb');
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async updateBkb(id, data) {
    const url = await resolveApiUrl('bkb', { id });
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async deleteBkb(id) {
    const url = await resolveApiUrl('bkb', { id });
    const res = await fetch(url, { method: 'DELETE' });
    return await res.json();
  },

  // Dokumen
  async getDokumen(params = {}) {
    const url = await resolveApiUrl('dokumen', params);
    const res = await fetch(url);
    const json = await res.json();
    return json.data;
  },

  async getDokumenById(id) {
    if (!id) return null;
    let url;
    if (_isPhpBackend) {
      url = await resolveApiUrl('dokumen', { id });
    } else {
      url = `/api/dokumen/${encodeURIComponent(id)}`;
    }
    const res = await fetch(url);
    if (!res.ok) {
      const fallbackUrl = await resolveApiUrl('dokumen', { id });
      const res2 = await fetch(fallbackUrl);
      const json2 = await res2.json();
      if (json2 && json2.data) {
        return Array.isArray(json2.data) ? (json2.data.find(d => d.id === id) || json2.data[0]) : json2.data;
      }
      return null;
    }
    const json = await res.json();
    if (!json || !json.data) return null;
    if (Array.isArray(json.data)) {
      return json.data.find(d => d.id === id) || json.data[0] || null;
    }
    return json.data;
  },

  async uploadDokumen(formData) {
    const url = await resolveApiUrl('dokumen');
    const res = await fetch(url, {
      method: 'POST',
      body: formData
    });
    return await res.json();
  },

  async updateDokumen(id, data) {
    const url = await resolveApiUrl('dokumen', { id });
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async deleteDokumen(id) {
    if (!id) throw new Error('ID Dokumen dibutuhkan');
    let url;
    if (_isPhpBackend) {
      url = await resolveApiUrl('dokumen', { id });
    } else {
      url = `/api/dokumen/${encodeURIComponent(id)}`;
    }

    let res;
    try {
      res = await fetch(url, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      // Fallback via POST action=delete
      const fallbackUrl = await resolveApiUrl('dokumen');
      res = await fetch(fallbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id })
      });
    }

    const json = await res.json();
    if (!json || !json.success) {
      throw new Error(json?.error || 'Gagal menghapus dokumen');
    }
    return json;
  },

  async getDocumentDownloadUrl(id) {
    if (!id) return '';
    if (_isPhpBackend === null) {
      try {
        const probe = await fetch('/api/health', { signal: AbortSignal.timeout(600) });
        _isPhpBackend = !probe.ok;
      } catch {
        _isPhpBackend = true;
      }
    }
    if (_isPhpBackend) {
      return `api/dokumen.php?download=1&id=${encodeURIComponent(id)}`;
    } else {
      return `/api/dokumen/download/${encodeURIComponent(id)}`;
    }
  },

  // Admin Stats & Log
  async getStats() {
    const url = await resolveApiUrl('admin/stats');
    const res = await fetch(url);
    const json = await res.json();
    return json.data;
  },

  async getAktivitas() {
    const url = await resolveApiUrl('admin/aktivitas');
    const res = await fetch(url);
    const json = await res.json();
    return json.data;
  },

  async getNews() {
    const url = await resolveApiUrl('news');
    const res = await fetch(url);
    const json = await res.json();
    return json.data;
  }
};
