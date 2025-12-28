# Backend Deployment Rehberi

## 🔍 Sorun

Frontend worfe.vip'de yayında ama giriş yaparken "sunucuya bağlanılamıyor" hatası alınıyor.

**Neden:** Backend henüz deploy edilmemiş veya Netlify'da `REACT_APP_API_URL` environment variable'ı ayarlanmamış.

## ✅ Çözüm: Backend Deploy Et

### Seçenek 1: Render.com (Önerilen - Ücretsiz)

1. **https://render.com** adresine git ve hesap oluştur
2. **New** > **Web Service** seç
3. GitHub repository'yi bağla: `worfe-vip`
4. Ayarlar:
   - **Name:** `worfe-vip-backend`
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
   - **Plan:** Free (veya istediğiniz plan)

5. **Environment Variables** ekle:
   - `JWT_SECRET` = Güvenli bir secret key (örn: `worfe_vip_secret_key_2024_secure`)
   - `PORT` = `5000` (Render otomatik port atar, bu opsiyonel)
   - `NODE_ENV` = `production`

6. **Create Web Service** tıkla
7. Deploy tamamlandığında URL alacaksınız: `https://worfe-vip-backend.onrender.com`

### Seçenek 2: Heroku

1. **https://heroku.com** adresine git
2. Yeni app oluştur
3. GitHub repository'yi bağla
4. **Settings** > **Config Vars** ekle:
   - `JWT_SECRET` = Güvenli bir secret key
5. **Deploy** tab'ında deploy et

### Seçenek 3: Railway

1. **https://railway.app** adresine git
2. New Project > GitHub repository seç
3. Ayarları yapılandır

## 🔧 Netlify'da Environment Variable Ayarla

Backend deploy edildikten sonra:

1. **Netlify Dashboard'a git:**
   - https://app.netlify.com/sites/worfe-vip

2. **Site settings** > **Environment variables**

3. **Add variable:**
   - **Key:** `REACT_APP_API_URL`
   - **Value:** Backend URL'iniz (örn: `https://worfe-vip-backend.onrender.com/api`)
   - **Scopes:** Production, Deploy previews, Branch deploys (hepsini seç)

4. **Save**

5. **Deploy settings** > **Trigger deploy** > **Clear cache and deploy site**

## 📋 Kontrol Listesi

- [ ] Backend deploy edildi (Render/Heroku/Railway)
- [ ] Backend URL alındı
- [ ] Netlify'da `REACT_APP_API_URL` environment variable eklendi
- [ ] Netlify'da yeni deploy yapıldı
- [ ] Site test edildi (giriş yapılabiliyor mu?)

## 🚀 Hızlı Test

Backend deploy edildikten sonra:

1. Backend URL'ini test et: `https://your-backend-url.com/api/auth/verify`
2. Netlify'da environment variable'ı ayarla
3. Yeni deploy yap
4. Siteyi test et

## ⚠️ Önemli Notlar

- Backend URL'i `/api` ile bitmeli (örn: `https://worfe-vip-backend.onrender.com/api`)
- Environment variable değişikliklerinden sonra mutlaka yeni deploy yapılmalı
- Backend'de CORS ayarları yapılmalı (worfe.vip domain'ine izin verilmeli)

## 🔗 Backend CORS Ayarları

Eğer backend'de CORS hatası alıyorsanız, `server/index.js` dosyasında CORS ayarlarını kontrol edin:

```javascript
app.use(cors({
  origin: ['https://worfe.vip', 'https://worfe-vip.netlify.app'],
  credentials: true
}));
```

