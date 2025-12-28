const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');
const { getClientIp } = require('../utils/ipHelper');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'worfe_vip_secret_key_2024';

// Kayıt ol
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Tüm alanlar doldurulmalı' });
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Kullanıcıyı kaydet
    db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint')) {
            return res.status(400).json({ error: 'Kullanıcı adı veya email zaten kullanılıyor' });
          }
          return res.status(500).json({ error: 'Kayıt hatası' });
        }

        const token = jwt.sign(
          { userId: this.lastID, username },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        res.json({ token, userId: this.lastID, username });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Giriş yap
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const clientIp = getClientIp(req);

    if (!username || !password) {
      return res.status(400).json({ error: 'Kullanıcı adı ve şifre gerekli' });
    }

    db.get(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username],
      async (err, user) => {
        if (err) {
          console.error('Giriş hatası:', err);
          return res.status(500).json({ error: 'Sunucu hatası: ' + err.message });
        }

        if (!user) {
          return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı' });
        }

        // Ban kontrolü
        if (user.is_banned === 1) {
          return res.status(403).json({ 
            error: 'Hesabınız banlanmıştır', 
            ban_reason: user.ban_reason || 'Belirtilmemiş' 
          });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı' });
        }

        // IP kontrolü - eğer kullanıcının kayıtlı IP'si varsa ve farklıysa uyar
        if (user.last_ip && user.last_ip !== clientIp && user.username !== 'admin') {
          // IP değişmiş, güvenlik uyarısı ver ama girişe izin ver
          // (İsteğe bağlı: Burada girişi engelleyebilirsiniz)
        }

        // IP'yi güncelle
        db.run(
          'UPDATE users SET last_ip = ? WHERE id = ?',
          [clientIp, user.id],
          (err) => {
            if (err) console.error('IP güncelleme hatası:', err);
          }
        );

        const token = jwt.sign(
          { userId: user.id, username: user.username },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        res.json({ token, userId: user.id, username: user.username });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Token doğrula
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token gerekli' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, userId: decoded.userId, username: decoded.username });
  } catch (error) {
    res.status(401).json({ error: 'Geçersiz token' });
  }
});

module.exports = router;

