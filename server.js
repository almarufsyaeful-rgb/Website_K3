/**
 * server.js
 * Main Express.js server for Disdalduk KB Kota Semarang - Bidang K3
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('node:path');

// Initialize database (Hanya panggil ini 1 kali saja)
const db = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Intercept .php endpoints 
app.use((req, res, next) => {
  if (req.path.endsWith('.php')) {
    if (req.path.includes('dokumen.php')) {
      const id = req.query.id;
      if (req.query.download || req.query.action === 'download') {
        return res.redirect(`/api/dokumen/download/${encodeURIComponent(id || '')}`);
      }
      if (id) {
        return res.redirect(`/api/dokumen/${encodeURIComponent(id)}`);
      }
      return res.redirect('/api/dokumen');
    }
    return res.status(403).json({ success: false, error: 'Direct PHP file access not supported on Node.js server' });
  }
  next();
});

// Mount API routes
app.use('/api/programs', require('./routes/programs'));
app.use('/api/kegiatan', require('./routes/kegiatan'));
app.use('/api/turunan', require('./routes/turunan'));
app.use('/api/bkb', require('./routes/bkb'));
app.use('/api/dokumen', require('./routes/dokumen'));
app.use('/api/admin', require('./routes/stats'));

// Explicitly serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static frontend files
app.use((req, res, next) => {
  if (req.path.endsWith('.php')) {
    return res.status(404).send('File not found');
  }
  next();
});
app.use(express.static(path.join(__dirname)));

// Alias route for news
app.get('/api/news', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM news ORDER BY id ASC');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Web K3 Disdalduk KB Kota Semarang API',
    time: new Date().toISOString()
  });
});

// SPA Fallback
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(__dirname, 'index.html'));
  }
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, error: 'Endpoint API tidak ditemukan' });
  }
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log('================================================================');
  console.log(`🚀 Server K3 Disdalduk KB Kota Semarang aktif berjalan!`);
  console.log(`📍 Web Frontend : http://localhost:${PORT}`);
  console.log(`📡 REST API     : http://localhost:${PORT}/api/health`);
  console.log('================================================================');
});