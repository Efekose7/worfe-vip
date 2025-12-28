# WORFE VIP - Hızlı Başlangıç Rehberi

## 🚀 Hızlı Deployment Adımları

### 1. GitHub Repository Oluştur (2 dakika)

1. **https://github.com/new** adresine git
2. Repository adı: `worfe-vip`
3. Description: "WORFE VIP - Premium Hacker Tools Platform"
4. **Public** veya **Private** seç
5. **Initialize this repository with a README** ❌ İŞARETLEME
6. **Create repository** tıkla

### 2. GitHub'a Push Et (1 dakika)

**Seçenek A: PowerShell Script ile (Önerilen)**

```powershell
.\deploy.ps1
```

Script size adım adım yol gösterecek.

**Seçenek B: Manuel Komutlar**

```bash
git remote add origin https://github.com/Efekose7/worfe-vip.git
git branch -M main
git push -u origin main
```

**⚠️ ÖNEMLİ:** GitHub şifre ile push kabul etmiyor! Personal Access Token gerekli:

1. **https://github.com/settings/tokens** adresine git
2. **Generate new token (classic)** tıkla
3. Token adı: `worfe-vip-deployment`
4. Scopes: **repo** işaretle
5. **Generate token** tıkla ve token'ı kopyala
6. Push sırasında şifre yerine bu token'ı kullan

### 3. Netlify Deployment (3 dakika)

1. **https://app.netlify.com** adresine git
2. GitHub ile giriş yap
3. **Add new site** > **Import an existing project**
4. Repository'yi seç: `worfe-vip`
5. **Configure build:**
   - **Base directory:** `client`
   - **Build command:** `npm install && npm run build`
   - **Publish directory:** `client/build`
6. **Environment variables** ekle:
   - `REACT_APP_API_URL` = Backend URL'iniz
7. **Deploy site** tıkla

### 4. Porkbun DNS Ayarları (5 dakika)

#### Seçenek A: Netlify Nameserver Kullan (Önerilen)

1. Netlify dashboard'da **Domain settings** > **Custom domains**
2. **Add custom domain** > `worfe.vip` yaz
3. Netlify size nameserver'ları gösterecek
4. Porkbun'a git > Domain yönetimi
5. **Nameservers** bölümünde şunları ayarla:
   ```
   dns1.p03.nsone.net
   dns2.p03.nsone.net
   dns3.p03.nsone.net
   dns4.p03.nsone.net
   ```

#### Seçenek B: Porkbun Nameserver Kullan

1. Netlify dashboard'da **Domain settings** > **Custom domains**
2. **Add custom domain** > `worfe.vip` yaz
3. Netlify size DNS kayıtlarını gösterecek
4. Porkbun'da DNS kayıtlarını ekle:
   - **A Record:** `@` → Netlify IP (genellikle `75.2.60.5`)
   - **CNAME:** `www` → Netlify site URL'i

### 5. SSL Sertifikası (Otomatik)

Netlify otomatik olarak SSL sertifikası sağlar. DNS ayarları tamamlandıktan sonra birkaç saat içinde aktif olur.

## ✅ Kontrol Listesi

- [ ] GitHub repository oluşturuldu
- [ ] Kodlar GitHub'a push edildi
- [ ] Netlify'da site oluşturuldu
- [ ] Build başarılı
- [ ] Custom domain eklendi (worfe.vip)
- [ ] DNS ayarları yapıldı
- [ ] SSL sertifikası aktif
- [ ] Site erişilebilir

## 🔧 Sorun Giderme

### Build Hatası
- Netlify build loglarını kontrol et
- Local'de `cd client && npm install && npm run build` çalıştır

### DNS Sorunları
- DNS yayılımı 24-48 saat sürebilir
- https://dnschecker.org ile kontrol et

### Push Hatası
- Personal Access Token kullandığınızdan emin ol
- Token'ın `repo` scope'una sahip olduğunu kontrol et

## 📞 Yardım

Detaylı bilgi için `DEPLOYMENT_GUIDE.md` dosyasına bakın.

