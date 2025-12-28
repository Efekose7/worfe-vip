const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
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

// Dosya yükleme ayarları
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// V2: Dosya yükle - Metin paylaşma özelliği kaldırıldı
router.post('/upload', verifyToken, verifyAdmin, upload.single('file'), (req, res) => {
  // FormData'dan verileri al
  const title = req.body.title;
  const category = req.body.category;
  const description = req.body.description || null; // Hakkında bilgisi

  if (!title) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: 'Başlık gerekli' });
  }
  
  if (!req.file) {
    return res.status(400).json({ error: 'Dosya yüklenmedi' });
  }

  if (!category || !category.trim()) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: 'Kategori seçimi zorunludur' });
  }

  // Dosya boyutunu al
  const fileSize = req.file.size || 0;
  const tags = req.body.tags || null; // Etiketler

  // V2: Sadece dosya yükleme, metin içeriği kaldırıldı, description eklendi
  db.run(
    'INSERT INTO files (title, filename, filepath, content, type, category, description, file_size, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      title, 
      req.file.filename, 
      req.file.path,
      null, // V2: content her zaman null
      'file', // V2: type her zaman 'file'
      category.trim(),
      description, // Hakkında bilgisi
      fileSize, // Dosya boyutu
      tags // Etiketler
    ],
    function(err) {
      if (err) {
        if (req.file) fs.unlinkSync(req.file.path);
        console.error('Veritabanı hatası:', err);
        return res.status(500).json({ error: 'Kaydetme hatası: ' + err.message });
      }
      console.log('Başarıyla kaydedildi, ID:', this.lastID);
      res.json({ 
        id: this.lastID, 
        title, 
        filename: req.file.filename,
        type: 'file',
        category: category.trim(),
        description: description,
        file_size: fileSize,
        tags: tags
      });
    }
  );
});

// Dosya sil
router.delete('/file/:id', verifyToken, verifyAdmin, (req, res) => {
  const fileId = req.params.id;

  db.get('SELECT * FROM files WHERE id = ?', [fileId], (err, file) => {
    if (err) {
      return res.status(500).json({ error: 'Sunucu hatası' });
    }

    if (!file) {
      return res.status(404).json({ error: 'Dosya bulunamadı' });
    }

    // Dosyayı sil
    const filePath = path.join(__dirname, '../uploads', file.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Veritabanından sil
    db.run('DELETE FROM files WHERE id = ?', [fileId], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Silme hatası' });
      }
      res.json({ message: 'Dosya silindi' });
    });
  });
});

// Tüm dosyaları listele (Admin)
router.get('/files', verifyToken, verifyAdmin, (req, res) => {
  db.all('SELECT * FROM files ORDER BY uploaded_at DESC', [], (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Sunucu hatası' });
    }
    res.json(files);
  });
});

// Toplu dosya silme
router.post('/files/bulk-delete', verifyToken, verifyAdmin, (req, res) => {
  const { fileIds } = req.body;
  
  if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
    return res.status(400).json({ error: 'Geçerli dosya ID\'leri gerekli' });
  }
  
  const placeholders = fileIds.map(() => '?').join(',');
  
  // Dosya bilgilerini al
  db.all(`SELECT filename FROM files WHERE id IN (${placeholders})`, fileIds, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Sunucu hatası' });
    }
    
    // Dosyaları sil
    files.forEach(file => {
      if (file.filename) {
        const filePath = path.join(__dirname, '../uploads', file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    });
    
    // Veritabanından sil
    db.run(`DELETE FROM files WHERE id IN (${placeholders})`, fileIds, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Silme hatası' });
      }
      res.json({ message: `${fileIds.length} dosya silindi` });
    });
  });
});

// Toplu kategori güncelleme
router.post('/files/bulk-update-category', verifyToken, verifyAdmin, (req, res) => {
  const { fileIds, category } = req.body;
  
  if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
    return res.status(400).json({ error: 'Geçerli dosya ID\'leri gerekli' });
  }
  
  if (!category) {
    return res.status(400).json({ error: 'Kategori gerekli' });
  }
  
  const placeholders = fileIds.map(() => '?').join(',');
  
  db.run(
    `UPDATE files SET category = ? WHERE id IN (${placeholders})`,
    [category, ...fileIds],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Güncelleme hatası' });
      }
      res.json({ message: `${fileIds.length} dosyanın kategorisi güncellendi` });
    }
  );
});

// Tüm kullanıcıları listele (Admin)
router.get('/users', verifyToken, verifyAdmin, (req, res) => {
  db.all(
    `SELECT id, username, email, last_ip, is_banned, ban_reason, created_at 
     FROM users 
     ORDER BY created_at DESC`,
    [],
    (err, users) => {
      if (err) {
        return res.status(500).json({ error: 'Sunucu hatası' });
      }
      res.json(users);
    }
  );
});

// Kullanıcıyı banla/ban kaldır
router.post('/user/:id/ban', verifyToken, verifyAdmin, (req, res) => {
  const userId = req.params.id;
  const { is_banned, ban_reason } = req.body;

  db.run(
    'UPDATE users SET is_banned = ?, ban_reason = ? WHERE id = ?',
    [is_banned ? 1 : 0, ban_reason || null, userId],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Ban güncelleme hatası' });
      }
      res.json({ message: is_banned ? 'Kullanıcı banlandı' : 'Ban kaldırıldı' });
    }
  );
});

// Kullanıcıya mesaj gönder
router.post('/user/:id/message', verifyToken, verifyAdmin, (req, res) => {
  const userId = req.params.id;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Mesaj gerekli' });
  }

  db.run(
    'INSERT INTO messages (user_id, message) VALUES (?, ?)',
    [userId, message],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Mesaj gönderme hatası' });
      }
      res.json({ id: this.lastID, message: 'Mesaj gönderildi' });
    }
  );
});

// Genel duyuru oluştur
router.post('/announcement', verifyToken, verifyAdmin, (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Başlık ve içerik gerekli' });
  }

  // Önceki duyuruları pasif yap
  db.run('UPDATE announcements SET is_active = 0', [], (err) => {
    if (err) console.error('Duyuru güncelleme hatası:', err);
  });

  // Yeni duyuruyu oluştur
  db.run(
    'INSERT INTO announcements (title, content) VALUES (?, ?)',
    [title, content],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Duyuru oluşturma hatası' });
      }
      res.json({ id: this.lastID, message: 'Duyuru oluşturuldu' });
    }
  );
});

// Aktif duyuruyu getir
router.get('/announcement', verifyToken, (req, res) => {
  db.get(
    'SELECT * FROM announcements WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1',
    [],
    (err, announcement) => {
      if (err) {
        return res.status(500).json({ error: 'Sunucu hatası' });
      }
      res.json(announcement || null);
    }
  );
});

// Tüm duyuruları listele (Admin)
router.get('/announcements', verifyToken, verifyAdmin, (req, res) => {
  db.all(
    'SELECT * FROM announcements ORDER BY created_at DESC',
    [],
    (err, announcements) => {
      if (err) {
        return res.status(500).json({ error: 'Sunucu hatası' });
      }
      res.json(announcements);
    }
  );
});

// Duyuru sil
router.delete('/announcement/:id', verifyToken, verifyAdmin, (req, res) => {
  const announcementId = req.params.id;

  db.run(
    'DELETE FROM announcements WHERE id = ?',
    [announcementId],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Silme hatası' });
      }
      res.json({ message: 'Duyuru silindi' });
    }
  );
});

// Kategorileri getir
router.get('/categories', verifyToken, verifyAdmin, (req, res) => {
  db.all(
    'SELECT name FROM categories ORDER BY name',
    [],
    (err, categories) => {
      if (err) {
        return res.status(500).json({ error: 'Sunucu hatası' });
      }
      res.json(categories.map(c => c.name));
    }
  );
});

// Kategori ekle
router.post('/categories', verifyToken, verifyAdmin, (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Kategori adı gerekli' });
  }

  const categoryName = name.trim();

  // Kategori zaten var mı kontrol et
  db.get('SELECT id FROM categories WHERE name = ?', [categoryName], (err, existing) => {
    if (err) {
      return res.status(500).json({ error: 'Sunucu hatası' });
    }

    if (existing) {
      return res.status(400).json({ error: 'Bu kategori zaten mevcut' });
    }

    // Yeni kategoriyi ekle
    db.run(
      'INSERT INTO categories (name) VALUES (?)',
      [categoryName],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Kategori ekleme hatası' });
        }
        res.json({ id: this.lastID, name: categoryName, message: 'Kategori eklendi' });
      }
    );
  });
});

// Kategori sil
router.delete('/categories/:name', verifyToken, verifyAdmin, (req, res) => {
  const categoryName = req.params.name;

  if (!categoryName) {
    return res.status(400).json({ error: 'Kategori adı gerekli' });
  }

  // Bu kategoriye ait dosya var mı kontrol et
  db.get('SELECT COUNT(*) as count FROM files WHERE category = ?', [categoryName], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Sunucu hatası' });
    }

    if (result && result.count > 0) {
      return res.status(400).json({ error: 'Bu kategoriye ait dosyalar bulunduğu için silinemez. Önce dosyaların kategorisini değiştirin.' });
    }

    // Kategoriyi sil
    db.run('DELETE FROM categories WHERE name = ?', [categoryName], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Kategori silme hatası' });
      }
      res.json({ message: 'Kategori silindi' });
    });
  });
});

// Kullanıcının mesajlarını getir
router.get('/messages', verifyToken, (req, res) => {
  db.all(
    'SELECT * FROM messages WHERE user_id = ? AND is_read = 0 ORDER BY created_at DESC',
    [req.userId],
    (err, messages) => {
      if (err) {
        return res.status(500).json({ error: 'Sunucu hatası' });
      }
      res.json(messages);
    }
  );
});

// Mesajı okundu olarak işaretle
router.post('/message/:id/read', verifyToken, (req, res) => {
  const messageId = req.params.id;

  db.run(
    'UPDATE messages SET is_read = 1 WHERE id = ? AND user_id = ?',
    [messageId, req.userId],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Mesaj güncelleme hatası' });
      }
      res.json({ message: 'Mesaj okundu olarak işaretlendi' });
    }
  );
});

module.exports = router;

