const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'worfe_vip.db');
const db = new sqlite3.Database(dbPath);

// Veritabanını başlat
db.serialize(() => {
  // Kullanıcılar tablosu
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    last_ip TEXT,
    is_banned INTEGER DEFAULT 0,
    ban_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Özel kodlar tablosu
  db.run(`CREATE TABLE IF NOT EXISTS access_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    user_id INTEGER,
    used_ip TEXT,
    is_used INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  // Dosyalar tablosu
  db.run(`CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    filename TEXT,
    filepath TEXT,
    content TEXT,
    type TEXT DEFAULT 'file',
    category TEXT,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Mevcut tabloyu güncelle (yeni kolonlar ekle - eğer yoksa)
  db.all("PRAGMA table_info(files)", [], (err, rows) => {
    if (!err && rows && Array.isArray(rows)) {
      const columns = rows.map(row => row.name);
      
      if (!columns.includes('content')) {
        db.run(`ALTER TABLE files ADD COLUMN content TEXT`, (alterErr) => {
          if (alterErr) {
            console.error('Content kolonu ekleme hatası:', alterErr);
          } else {
            console.log('✓ Content kolonu eklendi');
          }
        });
      }
      
      if (!columns.includes('type')) {
        db.run(`ALTER TABLE files ADD COLUMN type TEXT DEFAULT 'file'`, (alterErr) => {
          if (alterErr) {
            console.error('Type kolonu ekleme hatası:', alterErr);
          } else {
            console.log('✓ Type kolonu eklendi');
          }
        });
      }
      
      if (!columns.includes('description')) {
        db.run(`ALTER TABLE files ADD COLUMN description TEXT`, (alterErr) => {
          if (alterErr) {
            console.error('Description kolonu ekleme hatası:', alterErr);
          } else {
            console.log('✓ Description kolonu eklendi');
          }
        });
      }
      
      if (!columns.includes('file_size')) {
        db.run(`ALTER TABLE files ADD COLUMN file_size INTEGER DEFAULT 0`, (alterErr) => {
          if (alterErr) {
            console.error('File_size kolonu ekleme hatası:', alterErr);
          } else {
            console.log('✓ File_size kolonu eklendi');
          }
        });
      }
      
      if (!columns.includes('download_count')) {
        db.run(`ALTER TABLE files ADD COLUMN download_count INTEGER DEFAULT 0`, (alterErr) => {
          if (alterErr) {
            console.error('Download_count kolonu ekleme hatası:', alterErr);
          } else {
            console.log('✓ Download_count kolonu eklendi');
          }
        });
      }
      
      if (!columns.includes('view_count')) {
        db.run(`ALTER TABLE files ADD COLUMN view_count INTEGER DEFAULT 0`, (alterErr) => {
          if (alterErr) {
            console.error('View_count kolonu ekleme hatası:', alterErr);
          } else {
            console.log('✓ View_count kolonu eklendi');
          }
        });
      }
      
      if (!columns.includes('tags')) {
        db.run(`ALTER TABLE files ADD COLUMN tags TEXT`, (alterErr) => {
          if (alterErr) {
            console.error('Tags kolonu ekleme hatası:', alterErr);
          } else {
            console.log('✓ Tags kolonu eklendi');
          }
        });
      }
    }
  });
  
  // Favoriler tablosu
  db.run(`CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    file_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (file_id) REFERENCES files(id),
    UNIQUE(user_id, file_id)
  )`);
  
  // Son görüntülenenler tablosu
  db.run(`CREATE TABLE IF NOT EXISTS recent_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    file_id INTEGER NOT NULL,
    viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (file_id) REFERENCES files(id)
  )`);
  
  // Yorumlar tablosu
  db.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    comment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (file_id) REFERENCES files(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);
  
  // Beğeniler tablosu
  db.run(`CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (file_id) REFERENCES files(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(file_id, user_id)
  )`);
  
  // Aktivite logları tablosu
  db.run(`CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);
  
  // Bildirimler tablosu
  db.run(`CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);
  
  // Kullanıcı ayarları tablosu
  db.run(`CREATE TABLE IF NOT EXISTS user_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    theme TEXT DEFAULT 'dark',
    notifications_enabled INTEGER DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);
  
  // IP whitelist tablosu
  db.run(`CREATE TABLE IF NOT EXISTS ip_whitelist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    ip_address TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);
  
  // 2FA tablosu
  db.run(`CREATE TABLE IF NOT EXISTS two_factor_auth (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    secret TEXT NOT NULL,
    is_enabled INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);
  
  // Rate limiting tablosu
  db.run(`CREATE TABLE IF NOT EXISTS rate_limits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    ip_address TEXT,
    action TEXT NOT NULL,
    count INTEGER DEFAULT 1,
    reset_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  // Mesajlar tablosu
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  // Duyurular tablosu kaldırıldı - artık kullanılmıyor

  // Kategoriler tablosu
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Admin kullanıcısı oluştur (varsayılan: admin/admin123)
  const adminPassword = bcrypt.hashSync('admin123', 10);
  db.run(`INSERT OR IGNORE INTO users (username, email, password) 
    VALUES ('admin', 'admin@worfe.vip', ?)`, [adminPassword], (err) => {
    if (err) console.error('Admin oluşturma hatası:', err);
  });
});

module.exports = db;

