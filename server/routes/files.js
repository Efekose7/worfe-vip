const express = require('express');
const db = require('../database');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Middleware: Token kontrolü
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Yetkisiz erişim' });
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'worfe_vip_secret_key_2024');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Geçersiz token' });
  }
};

// Dosya listesini getir
router.get('/list', verifyToken, (req, res) => {
  const { search, category, sortBy = 'uploaded_at', sortOrder = 'DESC', page = 1, limit = 20 } = req.query;
  
  let query = 'SELECT id, title, filename, content, type, category, description, file_size, download_count, view_count, tags, uploaded_at FROM files WHERE 1=1';
  const params = [];
  
  // Arama
  if (search) {
    query += ' AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  // Kategori filtresi
  if (category && category !== 'all') {
    query += ' AND category = ?';
    params.push(category);
  }
  
  // Sıralama
  const validSortBy = ['uploaded_at', 'title', 'download_count', 'view_count', 'file_size'];
  const sortColumn = validSortBy.includes(sortBy) ? sortBy : 'uploaded_at';
  const validSortOrder = ['ASC', 'DESC'];
  const order = validSortOrder.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';
  query += ` ORDER BY ${sortColumn} ${order}`;
  
  // Sayfalama
  const offset = (parseInt(page) - 1) * parseInt(limit);
  query += ' LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);
  
  db.all(query, params, (err, files) => {
    if (err) {
      console.error('Dosya listesi hatası:', err);
      return res.status(500).json({ error: 'Sunucu hatası' });
    }
    
    // Toplam sayıyı al
    let countQuery = 'SELECT COUNT(*) as total FROM files WHERE 1=1';
    const countParams = [];
    if (search) {
      countQuery += ' AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }
    if (category && category !== 'all') {
      countQuery += ' AND category = ?';
      countParams.push(category);
    }
    
    db.get(countQuery, countParams, (countErr, countResult) => {
      if (countErr) {
        return res.status(500).json({ error: 'Sunucu hatası' });
      }
      res.json({
        files,
        total: countResult.total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult.total / parseInt(limit))
      });
    });
  });
});

// Dosya görüntüleme sayısını artır
router.post('/view/:id', verifyToken, (req, res) => {
  const fileId = req.params.id;
  const userId = req.userId;
  
  // View count'u artır
  db.run('UPDATE files SET view_count = view_count + 1 WHERE id = ?', [fileId], (err) => {
    if (err) {
      console.error('View count güncelleme hatası:', err);
    }
  });
  
  // Son görüntülenenlere ekle
  db.run(
    'INSERT INTO recent_views (user_id, file_id) VALUES (?, ?)',
    [userId, fileId],
    (err) => {
      if (err) {
        console.error('Recent view ekleme hatası:', err);
      }
    }
  );
  
  res.json({ success: true });
});

// Dosya indir
router.get('/download/:id', verifyToken, (req, res) => {
  const fileId = req.params.id;
  const userId = req.userId;

  db.get('SELECT * FROM files WHERE id = ?', [fileId], (err, file) => {
    if (err) {
      return res.status(500).json({ error: 'Sunucu hatası' });
    }

    if (!file) {
      return res.status(404).json({ error: 'Dosya bulunamadı' });
    }

    const filePath = path.join(__dirname, '../uploads', file.filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Dosya bulunamadı' });
    }

    // İndirme sayacını artır
    db.run('UPDATE files SET download_count = download_count + 1 WHERE id = ?', [fileId], (err) => {
      if (err) {
        console.error('Download count güncelleme hatası:', err);
      }
    });
    
    // Aktivite logu
    db.run(
      'INSERT INTO activity_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)',
      [userId, 'download', `Dosya indirildi: ${file.title}`, req.ip || 'unknown'],
      (err) => {
        if (err) console.error('Activity log hatası:', err);
      }
    );

    res.download(filePath, file.filename, (err) => {
      if (err) {
        console.error('İndirme hatası:', err);
      }
    });
  });
});

// Kategorilere göre dosyaları getir
router.get('/category/:category', verifyToken, (req, res) => {
  const category = req.params.category;

  db.all(
    'SELECT id, title, filename, category, description, file_size, download_count, view_count, tags, uploaded_at FROM files WHERE category = ? ORDER BY uploaded_at DESC',
    [category],
    (err, files) => {
      if (err) {
        return res.status(500).json({ error: 'Sunucu hatası' });
      }
      res.json(files);
    }
  );
});

module.exports = router;

