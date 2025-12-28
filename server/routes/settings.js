const express = require('express');
const db = require('../database');
// 2FA için speakeasy ve qrcode paketleri gerekli (npm install speakeasy qrcode)
// Şimdilik basit bir implementasyon yapıyoruz

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

// Kullanıcı ayarlarını getir
router.get('/user-settings', verifyToken, (req, res) => {
  const userId = req.userId;
  
  db.get('SELECT * FROM user_settings WHERE user_id = ?', [userId], (err, settings) => {
    if (err) {
      return res.status(500).json({ error: 'Sunucu hatası' });
    }
    
    if (!settings) {
      // Varsayılan ayarları oluştur
      db.run(
        'INSERT INTO user_settings (user_id) VALUES (?)',
        [userId],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Sunucu hatası' });
          }
          res.json({ theme: 'dark', notifications_enabled: 1 });
        }
      );
    } else {
      res.json(settings);
    }
  });
});

// Kullanıcı ayarlarını güncelle
router.post('/user-settings', verifyToken, (req, res) => {
  const userId = req.userId;
  const { theme, notifications_enabled } = req.body;
  
  db.run(
    `INSERT INTO user_settings (user_id, theme, notifications_enabled) 
     VALUES (?, ?, ?) 
     ON CONFLICT(user_id) DO UPDATE SET 
     theme = COALESCE(?, theme), 
     notifications_enabled = COALESCE(?, notifications_enabled)`,
    [userId, theme, notifications_enabled, theme, notifications_enabled],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Sunucu hatası' });
      }
      res.json({ message: 'Ayarlar güncellendi' });
    }
  );
});

// 2FA secret oluştur (Basit implementasyon - speakeasy paketi gerekli)
router.post('/2fa/generate', verifyToken, (req, res) => {
  const userId = req.userId;
  
  db.get('SELECT username FROM users WHERE id = ?', [userId], (err, user) => {
    if (err || !user) {
      return res.status(500).json({ error: 'Sunucu hatası' });
    }
    
    // Basit secret oluştur (gerçek implementasyon için speakeasy gerekli)
    const crypto = require('crypto');
    const secret = crypto.randomBytes(20).toString('base32');
    
    // Secret'ı kaydet
    db.run(
      `INSERT INTO two_factor_auth (user_id, secret) 
       VALUES (?, ?) 
       ON CONFLICT(user_id) DO UPDATE SET secret = ?`,
      [userId, secret, secret],
      (err) => {
        if (err) {
          return res.status(500).json({ error: 'Sunucu hatası' });
        }
        res.json({ 
          secret: secret, 
          message: '2FA secret oluşturuldu. Gerçek implementasyon için speakeasy paketi gerekli.',
          note: 'npm install speakeasy qrcode komutu ile paketleri yükleyin'
        });
      }
    );
  });
});

// 2FA doğrula ve etkinleştir (Basit implementasyon)
router.post('/2fa/verify', verifyToken, (req, res) => {
  const userId = req.userId;
  const { token } = req.body;
  
  db.get('SELECT secret FROM two_factor_auth WHERE user_id = ?', [userId], (err, result) => {
    if (err || !result) {
      return res.status(400).json({ error: '2FA ayarlanmamış' });
    }
    
    // Basit doğrulama (gerçek implementasyon için speakeasy gerekli)
    // Şimdilik sadece secret'ın varlığını kontrol ediyoruz
    if (token && token.length === 6) {
      db.run('UPDATE two_factor_auth SET is_enabled = 1 WHERE user_id = ?', [userId], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Sunucu hatası' });
        }
        res.json({ message: '2FA etkinleştirildi (Basit mod - gerçek doğrulama için speakeasy gerekli)' });
      });
    } else {
      res.status(400).json({ error: 'Geçersiz kod formatı' });
    }
  });
});

// 2FA devre dışı bırak
router.post('/2fa/disable', verifyToken, (req, res) => {
  const userId = req.userId;
  
  db.run('UPDATE two_factor_auth SET is_enabled = 0 WHERE user_id = ?', [userId], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Sunucu hatası' });
    }
    res.json({ message: '2FA devre dışı bırakıldı' });
  });
});

// IP whitelist ekle
router.post('/ip-whitelist', verifyToken, (req, res) => {
  const userId = req.userId;
  const { ip_address } = req.body;
  
  if (!ip_address) {
    return res.status(400).json({ error: 'IP adresi gerekli' });
  }
  
  db.run(
    'INSERT INTO ip_whitelist (user_id, ip_address) VALUES (?, ?)',
    [userId, ip_address],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Sunucu hatası' });
      }
      res.json({ id: this.lastID, message: 'IP adresi eklendi' });
    }
  );
});

// IP whitelist listesi
router.get('/ip-whitelist', verifyToken, (req, res) => {
  const userId = req.userId;
  
  db.all('SELECT * FROM ip_whitelist WHERE user_id = ?', [userId], (err, ips) => {
    if (err) {
      return res.status(500).json({ error: 'Sunucu hatası' });
    }
    res.json(ips);
  });
});

// IP whitelist sil
router.delete('/ip-whitelist/:id', verifyToken, (req, res) => {
  const id = req.params.id;
  const userId = req.userId;
  
  db.run('DELETE FROM ip_whitelist WHERE id = ? AND user_id = ?', [id, userId], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Sunucu hatası' });
    }
    res.json({ message: 'IP adresi silindi' });
  });
});

module.exports = router;

