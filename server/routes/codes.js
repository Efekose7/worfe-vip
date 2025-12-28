const express = require('express');
const db = require('../database');
const crypto = require('crypto');
const { getClientIp } = require('../utils/ipHelper');

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

// Özel kod oluştur (Admin)
router.post('/create', verifyToken, (req, res) => {
  // Admin kontrolü (basit: username 'admin' ise)
  db.get('SELECT username FROM users WHERE id = ?', [req.userId], (err, user) => {
    if (err || !user || user.username !== 'admin') {
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }

    // Format: XXXX-XXXX-XXXX (tire olmadan sakla)
    const code1 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const code2 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const code3 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const codeWithoutDashes = `${code1}${code2}${code3}`;
    const codeDisplay = `${code1}-${code2}-${code3}`;
    
    db.run(
      'INSERT INTO access_codes (code, user_id) VALUES (?, ?)',
      [codeWithoutDashes, null],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Kod oluşturma hatası' });
        }
        res.json({ code: codeDisplay, id: this.lastID });
      }
    );
  });
});

// Özel kod doğrula
router.post('/verify', verifyToken, (req, res) => {
  let { code } = req.body;
  const clientIp = getClientIp(req);

  if (!code) {
    return res.status(400).json({ error: 'Kod gerekli' });
  }

  // Tireleri kaldır
  code = code.replace(/-/g, '').toUpperCase();

  db.get(
    'SELECT * FROM access_codes WHERE code = ?',
    [code],
    (err, accessCode) => {
      if (err) {
        return res.status(500).json({ error: 'Sunucu hatası' });
      }

      if (!accessCode) {
        return res.status(401).json({ error: 'Geçersiz kod' });
      }

      // Kod zaten bir kullanıcıya atanmış mı?
      if (accessCode.user_id !== null && accessCode.user_id !== req.userId) {
        // Farklı kullanıcı kullanmaya çalışıyor
        return res.status(403).json({ error: 'Bu kod başka bir kullanıcıya aittir' });
      }

      // Kodu kullanıcıya bağla (ilk kullanımda) veya sadece IP güncelle
      if (accessCode.user_id === null) {
        // İlk kullanım - kullanıcıya bağla
        db.run(
          'UPDATE access_codes SET used_ip = ?, user_id = ? WHERE id = ?',
          [clientIp, req.userId, accessCode.id],
          (err) => {
            if (err) {
              return res.status(500).json({ error: 'Kod kaydetme hatası' });
            }
            res.json({ valid: true, message: 'Kod doğrulandı' });
          }
        );
      } else {
        // Aynı kullanıcı tekrar kullanıyor - sadece IP güncelle
        db.run(
          'UPDATE access_codes SET used_ip = ? WHERE id = ?',
          [clientIp, accessCode.id],
          (err) => {
            if (err) {
              return res.status(500).json({ error: 'Kod güncelleme hatası' });
            }
            res.json({ valid: true, message: 'Kod doğrulandı' });
          }
        );
      }
    }
  );
});

// Tüm kodları listele (Admin)
router.get('/list', verifyToken, (req, res) => {
  db.get('SELECT username FROM users WHERE id = ?', [req.userId], (err, user) => {
    if (err || !user || user.username !== 'admin') {
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }

    db.all(
      `SELECT ac.*, u.username, u.email
       FROM access_codes ac 
       LEFT JOIN users u ON ac.user_id = u.id 
       ORDER BY ac.created_at DESC`,
      [],
      (err, codes) => {
        if (err) {
          return res.status(500).json({ error: 'Sunucu hatası' });
        }
        res.json(codes);
      }
    );
  });
});

module.exports = router;

