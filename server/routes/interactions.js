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

// Favorilere ekle/çıkar
router.post('/favorite/:fileId', verifyToken, (req, res) => {
  const fileId = req.params.fileId;
  const userId = req.userId;
  
  // Favori var mı kontrol et
  db.get('SELECT * FROM favorites WHERE user_id = ? AND file_id = ?', [userId, fileId], (err, favorite) => {
    if (err) {
      return res.status(500).json({ error: 'Sunucu hatası' });
    }
    
    if (favorite) {
      // Favoriden çıkar
      db.run('DELETE FROM favorites WHERE user_id = ? AND file_id = ?', [userId, fileId], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Sunucu hatası' });
        }
        res.json({ isFavorite: false });
      });
    } else {
      // Favoriye ekle
      db.run('INSERT INTO favorites (user_id, file_id) VALUES (?, ?)', [userId, fileId], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Sunucu hatası' });
        }
        res.json({ isFavorite: true });
      });
    }
  });
});

// Favorileri getir
router.get('/favorites', verifyToken, (req, res) => {
  const userId = req.userId;
  
  db.all(
    `SELECT f.*, fav.created_at as favorited_at 
     FROM files f 
     INNER JOIN favorites fav ON f.id = fav.file_id 
     WHERE fav.user_id = ? 
     ORDER BY fav.created_at DESC`,
    [userId],
    (err, files) => {
      if (err) {
        return res.status(500).json({ error: 'Sunucu hatası' });
      }
      res.json(files);
    }
  );
});

// Favori kontrolü
router.get('/favorite/:fileId', verifyToken, (req, res) => {
  const fileId = req.params.fileId;
  const userId = req.userId;
  
  db.get('SELECT * FROM favorites WHERE user_id = ? AND file_id = ?', [userId, fileId], (err, favorite) => {
    if (err) {
      return res.status(500).json({ error: 'Sunucu hatası' });
    }
    res.json({ isFavorite: !!favorite });
  });
});

// Son görüntülenenler
router.get('/recent', verifyToken, (req, res) => {
  const userId = req.userId;
  const limit = parseInt(req.query.limit) || 10;
  
  db.all(
    `SELECT DISTINCT f.*, rv.viewed_at 
     FROM files f 
     INNER JOIN recent_views rv ON f.id = rv.file_id 
     WHERE rv.user_id = ? 
     ORDER BY rv.viewed_at DESC 
     LIMIT ?`,
    [userId, limit],
    (err, files) => {
      if (err) {
        return res.status(500).json({ error: 'Sunucu hatası' });
      }
      res.json(files);
    }
  );
});

// Yorum ekle
router.post('/comment/:fileId', verifyToken, (req, res) => {
  const fileId = req.params.fileId;
  const userId = req.userId;
  const { comment } = req.body;
  
  if (!comment || !comment.trim()) {
    return res.status(400).json({ error: 'Yorum boş olamaz' });
  }
  
  db.run(
    'INSERT INTO comments (file_id, user_id, comment) VALUES (?, ?, ?)',
    [fileId, userId, comment.trim()],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Sunucu hatası' });
      }
      res.json({ id: this.lastID, message: 'Yorum eklendi' });
    }
  );
});

// Yorumları getir
router.get('/comments/:fileId', verifyToken, (req, res) => {
  const fileId = req.params.fileId;
  
  db.all(
    `SELECT c.*, u.username 
     FROM comments c 
     INNER JOIN users u ON c.user_id = u.id 
     WHERE c.file_id = ? 
     ORDER BY c.created_at DESC`,
    [fileId],
    (err, comments) => {
      if (err) {
        return res.status(500).json({ error: 'Sunucu hatası' });
      }
      res.json(comments);
    }
  );
});

// Yorum sil
router.delete('/comment/:id', verifyToken, (req, res) => {
  const commentId = req.params.id;
  const userId = req.userId;
  
  // Yorumun sahibi mi kontrol et
  db.get('SELECT * FROM comments WHERE id = ?', [commentId], (err, comment) => {
    if (err) {
      return res.status(500).json({ error: 'Sunucu hatası' });
    }
    
    if (!comment) {
      return res.status(404).json({ error: 'Yorum bulunamadı' });
    }
    
    if (comment.user_id !== userId) {
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }
    
    db.run('DELETE FROM comments WHERE id = ?', [commentId], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Sunucu hatası' });
      }
      res.json({ message: 'Yorum silindi' });
    });
  });
});

// Beğeni ekle/çıkar
router.post('/like/:fileId', verifyToken, (req, res) => {
  const fileId = req.params.fileId;
  const userId = req.userId;
  
  // Beğeni var mı kontrol et
  db.get('SELECT * FROM likes WHERE user_id = ? AND file_id = ?', [userId, fileId], (err, like) => {
    if (err) {
      return res.status(500).json({ error: 'Sunucu hatası' });
    }
    
    if (like) {
      // Beğeniyi kaldır
      db.run('DELETE FROM likes WHERE user_id = ? AND file_id = ?', [userId, fileId], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Sunucu hatası' });
        }
        // Toplam beğeni sayısını al
        db.get('SELECT COUNT(*) as count FROM likes WHERE file_id = ?', [fileId], (err, result) => {
          res.json({ isLiked: false, likeCount: result.count });
        });
      });
    } else {
      // Beğeni ekle
      db.run('INSERT INTO likes (user_id, file_id) VALUES (?, ?)', [userId, fileId], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Sunucu hatası' });
        }
        // Toplam beğeni sayısını al
        db.get('SELECT COUNT(*) as count FROM likes WHERE file_id = ?', [fileId], (err, result) => {
          res.json({ isLiked: true, likeCount: result.count });
        });
      });
    }
  });
});

// Beğeni kontrolü ve sayısı
router.get('/like/:fileId', verifyToken, (req, res) => {
  const fileId = req.params.fileId;
  const userId = req.userId;
  
  db.get('SELECT * FROM likes WHERE user_id = ? AND file_id = ?', [userId, fileId], (err, like) => {
    if (err) {
      return res.status(500).json({ error: 'Sunucu hatası' });
    }
    
    db.get('SELECT COUNT(*) as count FROM likes WHERE file_id = ?', [fileId], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Sunucu hatası' });
      }
      res.json({ isLiked: !!like, likeCount: result.count });
    });
  });
});

// Bildirimleri getir
router.get('/notifications', verifyToken, (req, res) => {
  const userId = req.userId;
  const unreadOnly = req.query.unread === 'true';
  
  let query = 'SELECT * FROM notifications WHERE user_id = ?';
  const params = [userId];
  
  if (unreadOnly) {
    query += ' AND is_read = 0';
  }
  
  query += ' ORDER BY created_at DESC LIMIT 50';
  
  db.all(query, params, (err, notifications) => {
    if (err) {
      return res.status(500).json({ error: 'Sunucu hatası' });
    }
    res.json(notifications);
  });
});

// Bildirimi okundu işaretle
router.post('/notification/:id/read', verifyToken, (req, res) => {
  const notificationId = req.params.id;
  const userId = req.userId;
  
  db.run(
    'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
    [notificationId, userId],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Sunucu hatası' });
      }
      res.json({ message: 'Bildirim okundu' });
    }
  );
});

// Tüm bildirimleri okundu işaretle
router.post('/notifications/read-all', verifyToken, (req, res) => {
  const userId = req.userId;
  
  db.run('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Sunucu hatası' });
    }
    res.json({ message: 'Tüm bildirimler okundu' });
  });
});

// Okunmamış bildirim sayısı
router.get('/notifications/unread-count', verifyToken, (req, res) => {
  const userId = req.userId;
  
  db.get(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
    [userId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Sunucu hatası' });
      }
      res.json({ count: result.count });
    }
  );
});

module.exports = router;

