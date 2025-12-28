const express = require('express');
const db = require('../database');

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

// Admin kontrolü
const verifyAdmin = (req, res, next) => {
  db.get('SELECT username FROM users WHERE id = ?', [req.userId], (err, user) => {
    if (err || !user || user.username !== 'admin') {
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }
    next();
  });
};

// Admin dashboard istatistikleri
router.get('/admin/dashboard', verifyToken, verifyAdmin, (req, res) => {
  const stats = {};
  
  // Toplam dosya sayısı
  db.get('SELECT COUNT(*) as count FROM files', [], (err, result) => {
    if (err) return res.status(500).json({ error: 'Sunucu hatası' });
    stats.totalFiles = result.count;
    
    // Toplam kullanıcı sayısı
    db.get('SELECT COUNT(*) as count FROM users', [], (err, result) => {
      if (err) return res.status(500).json({ error: 'Sunucu hatası' });
      stats.totalUsers = result.count;
      
      // Toplam indirme sayısı
      db.get('SELECT SUM(download_count) as total FROM files', [], (err, result) => {
        if (err) return res.status(500).json({ error: 'Sunucu hatası' });
        stats.totalDownloads = result.total || 0;
        
        // Toplam görüntülenme sayısı
        db.get('SELECT SUM(view_count) as total FROM files', [], (err, result) => {
          if (err) return res.status(500).json({ error: 'Sunucu hatası' });
          stats.totalViews = result.total || 0;
          
          // Toplam dosya boyutu
          db.get('SELECT SUM(file_size) as total FROM files', [], (err, result) => {
            if (err) return res.status(500).json({ error: 'Sunucu hatası' });
            stats.totalFileSize = result.total || 0;
            
            // Son 7 günün istatistikleri
            db.all(
              `SELECT DATE(created_at) as date, COUNT(*) as count 
               FROM files 
               WHERE created_at >= datetime('now', '-7 days')
               GROUP BY DATE(created_at)
               ORDER BY date ASC`,
              [],
              (err, dailyStats) => {
                if (err) return res.status(500).json({ error: 'Sunucu hatası' });
                stats.dailyStats = dailyStats;
                
                // En popüler kategoriler
                db.all(
                  `SELECT category, COUNT(*) as count 
                   FROM files 
                   WHERE category IS NOT NULL 
                   GROUP BY category 
                   ORDER BY count DESC 
                   LIMIT 5`,
                  [],
                  (err, popularCategories) => {
                    if (err) return res.status(500).json({ error: 'Sunucu hatası' });
                    stats.popularCategories = popularCategories;
                    
                    // En çok indirilen dosyalar
                    db.all(
                      `SELECT id, title, download_count 
                       FROM files 
                       ORDER BY download_count DESC 
                       LIMIT 5`,
                      [],
                      (err, topDownloads) => {
                        if (err) return res.status(500).json({ error: 'Sunucu hatası' });
                        stats.topDownloads = topDownloads;
                        
                        res.json(stats);
                      }
                    );
                  }
                );
              }
            );
          });
        });
      });
    });
  });
});

// Kullanıcı istatistikleri
router.get('/user/stats', verifyToken, (req, res) => {
  const userId = req.userId;
  
  const stats = {};
  
  // İndirilen dosya sayısı
  db.get(
    `SELECT COUNT(DISTINCT file_id) as count 
     FROM activity_logs 
     WHERE user_id = ? AND action = 'download'`,
    [userId],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Sunucu hatası' });
      stats.downloadedFiles = result.count;
      
      // Favori sayısı
      db.get('SELECT COUNT(*) as count FROM favorites WHERE user_id = ?', [userId], (err, result) => {
        if (err) return res.status(500).json({ error: 'Sunucu hatası' });
        stats.favoriteCount = result.count;
        
        // Yorum sayısı
        db.get('SELECT COUNT(*) as count FROM comments WHERE user_id = ?', [userId], (err, result) => {
          if (err) return res.status(500).json({ error: 'Sunucu hatası' });
          stats.commentCount = result.count;
          
          // Beğeni sayısı
          db.get('SELECT COUNT(*) as count FROM likes WHERE user_id = ?', [userId], (err, result) => {
            if (err) return res.status(500).json({ error: 'Sunucu hatası' });
            stats.likeCount = result.count;
            
            res.json(stats);
          });
        });
      });
    }
  );
});

// Aktivite logları (Admin)
router.get('/admin/activity-logs', verifyToken, verifyAdmin, (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  
  db.all(
    `SELECT al.*, u.username 
     FROM activity_logs al 
     LEFT JOIN users u ON al.user_id = u.id 
     ORDER BY al.created_at DESC 
     LIMIT ?`,
    [limit],
    (err, logs) => {
      if (err) {
        return res.status(500).json({ error: 'Sunucu hatası' });
      }
      res.json(logs);
    }
  );
});

module.exports = router;

