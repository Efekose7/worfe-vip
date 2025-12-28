# WORFE VIP

Premium Hacker Tools & Security Resources Platform

## 🚀 Hızlı Başlangıç

### Backend Deploy (Render.com)

1. https://render.com > New Web Service
2. GitHub repo: `worfe-vip`
3. Root Directory: `server`
4. Build: `npm install`
5. Start: `node index.js`
6. Env Vars: `JWT_SECRET`, `NODE_ENV=production`

### Frontend Deploy (Netlify)

1. https://app.netlify.com > Add new site
2. GitHub repo: `worfe-vip`
3. Base directory: `client`
4. Build: `npm install && npm run build`
5. Publish: `client/build`
6. Env Var: `REACT_APP_API_URL` = Backend URL (örn: `https://worfe-vip-backend.onrender.com/api`)

## 📝 Notlar

- Backend URL'i `/api` ile bitmeli
- CORS ayarları worfe.vip için yapılandırıldı
- Environment variable değişikliklerinden sonra yeni deploy gerekli
