# Render.com Backend Deploy Ayarları

## ✅ Doğru Ayarlar

### Basic Settings
- **Name:** `worfe-vip-backend`
- **Environment:** `Node`
- **Region:** En yakın bölge (örn: Frankfurt)

### Build & Deploy
- **Root Directory:** `server` ✅
- **Build Command:** `npm install` ✅
- **Start Command:** `node index.js` ✅ (server klasöründe olduğumuz için)

### Environment Variables
- **JWT_SECRET:** `worfe_vip_secret_key_2024_secure`
- **NODE_ENV:** `production`

## ⚠️ Önemli

Root Directory `server` olduğu için:
- Start Command: `node index.js` (✅ DOĞRU)
- Start Command: `node server/index.js` (❌ YANLIŞ - çünkü zaten server klasöründeyiz)

## 📝 Not

Render.com otomatik olarak port'u ayarlar, `process.env.PORT` kullanılır.

