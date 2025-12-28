# WORFE VIP

## 🚀 Render.com Servis Oluşturma

**Otomatik (Token ile):**
```powershell
.\setup-render.ps1
```

**Manuel:**
1. https://dashboard.render.com/new/web-service
2. GitHub repo: `Efekose7/worfe-vip`
3. Ayarlar:
   - Name: `worfe-vip-backend`
   - Root Directory: `server`
   - Build: `npm install`
   - Start: `node index.js`
   - Plan: Free
4. Environment Variables:
   - `JWT_SECRET` = `worfe_vip_secret_key_2024_secure`
   - `NODE_ENV` = `production`
5. Create Web Service

## 🔧 Netlify Ayarları

1. **Environment Variables:** https://app.netlify.com/sites/worfe-vip/configuration/env
   - `REACT_APP_API_URL` = `https://YOUR-BACKEND-URL.onrender.com/api`
2. **Deploy:** Deploys > Trigger deploy > Clear cache
