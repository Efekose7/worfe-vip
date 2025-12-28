# WORFE VIP - Deployment Rehberi

## GitHub Repository Oluşturma

### 1. GitHub'da Yeni Repository Oluştur

1. https://github.com/new adresine git
2. Repository adı: `worfe-vip` (veya istediğiniz bir isim)
3. Description: "WORFE VIP - Premium Hacker Tools & Security Resources Platform"
4. **Public** veya **Private** seç (önerilen: Private)
5. **Initialize this repository with a README** seçeneğini **İŞARETLEME**
6. **Add .gitignore** seçeneğini **İŞARETLEME**
7. **Choose a license** seçeneğini **İŞARETLEME**
8. **Create repository** butonuna tıkla

### 2. Repository'yi Local'e Bağla ve Push Et

Terminal'de şu komutları çalıştır:

```bash
git remote add origin https://github.com/Efekose7/worfe-vip.git
git branch -M main
git push -u origin main
```

**Not:** Repository adını yukarıda seçtiğiniz isimle değiştirin.

Eğer GitHub şifre sorarsa:
- Username: `Efekose7`
- Password: `efebey4434`

**Önemli:** GitHub artık şifre ile push kabul etmiyor. Personal Access Token kullanmanız gerekiyor.

### 3. GitHub Personal Access Token Oluştur

1. https://github.com/settings/tokens adresine git
2. **Generate new token** > **Generate new token (classic)** tıkla
3. Token adı: `worfe-vip-deployment`
4. Expiration: **90 days** (veya istediğiniz süre)
5. Scopes: **repo** seçeneğini işaretle
6. **Generate token** tıkla
7. Token'ı kopyala (bir daha gösterilmeyecek!)

### 4. Token ile Push Et

```bash
git push -u origin main
```

Username: `Efekose7`
Password: (yukarıda oluşturduğunuz token'ı yapıştırın)

## Netlify Deployment

### 1. Netlify'a Giriş Yap

1. https://app.netlify.com adresine git
2. GitHub ile giriş yap (Efekose7 hesabı ile)

### 2. Yeni Site Ekle

1. **Add new site** > **Import an existing project** tıkla
2. **GitHub** seçeneğini seç
3. Repository'yi seç: `worfe-vip` (veya oluşturduğunuz isim)
4. **Configure build** butonuna tıkla

### 3. Build Ayarları

**Base directory:** `client`
**Build command:** `npm install && npm run build`
**Publish directory:** `client/build`

**Environment variables:**
- `REACT_APP_API_URL` = `https://your-backend-url.com/api` (backend URL'iniz)

### 4. Deploy

1. **Deploy site** butonuna tıkla
2. İlk build tamamlanana kadar bekleyin
3. Site URL'i alın: `https://random-name.netlify.app`

## Porkbun DNS Ayarları

### 1. Porkbun'a Giriş Yap

1. https://porkbun.com/account/login adresine git
2. Domain yönetim paneline git

### 2. DNS Kayıtlarını Güncelle

Netlify'dan aldığınız site URL'ine git ve **Domain settings** > **Custom domains** bölümünden:

1. **Add custom domain** tıkla
2. Domain: `worfe.vip` yaz
3. Netlify size DNS kayıtlarını gösterecek

### 3. Porkbun'da DNS Ayarları

Porkbun DNS yönetim panelinde şu kayıtları ekle/güncelle:

**A Record:**
- Type: `A`
- Name: `@` (veya boş)
- Value: Netlify'nin verdiği IP adresi (genellikle `75.2.60.5`)

**CNAME Record:**
- Type: `CNAME`
- Name: `www`
- Value: Netlify site URL'i (örn: `random-name.netlify.app`)

**NS Records (Eğer Netlify nameserver kullanacaksanız):**
- Netlify nameserver'larını kullanmak istiyorsanız, Porkbun'da nameserver'ları değiştir:
  - `dns1.p03.nsone.net`
  - `dns2.p03.nsone.net`
  - `dns3.p03.nsone.net`
  - `dns4.p03.nsone.net`

**VEYA**

Eğer Porkbun nameserver'larını kullanmaya devam edecekseniz, sadece A ve CNAME kayıtlarını ekleyin.

### 4. SSL Sertifikası

Netlify otomatik olarak SSL sertifikası sağlar. DNS ayarları tamamlandıktan sonra birkaç saat içinde SSL aktif olur.

## Backend Deployment (Opsiyonel)

Eğer backend'i de deploy etmek istiyorsanız:

### Render.com (Önerilen)

1. https://render.com adresine git
2. **New** > **Web Service** seç
3. GitHub repository'yi bağla
4. **Root Directory:** `server`
5. **Build Command:** `npm install`
6. **Start Command:** `node index.js`
7. **Environment Variables:**
   - `JWT_SECRET` = (güvenli bir secret key)
   - `PORT` = `5000`
   - `NODE_ENV` = `production`

### Veya Heroku

1. https://heroku.com adresine git
2. Yeni app oluştur
3. GitHub repository'yi bağla
4. Deploy et

## Kontrol Listesi

- [ ] GitHub repository oluşturuldu
- [ ] Kodlar GitHub'a push edildi
- [ ] Netlify'da site oluşturuldu
- [ ] Build başarılı
- [ ] Porkbun DNS ayarları yapıldı
- [ ] SSL sertifikası aktif
- [ ] Site erişilebilir (worfe.vip)
- [ ] Backend deploy edildi (opsiyonel)
- [ ] Environment variables ayarlandı

## Sorun Giderme

### Build Hatası

- `client/package.json` dosyasını kontrol et
- `npm install` komutunu local'de çalıştır ve hataları kontrol et
- Netlify build loglarını incele

### DNS Sorunları

- DNS değişikliklerinin yayılması 24-48 saat sürebilir
- https://dnschecker.org adresinden DNS yayılımını kontrol et
- Porkbun'da nameserver'ların doğru olduğundan emin ol

### SSL Sorunları

- Netlify SSL sertifikası otomatik olarak oluşturulur
- DNS ayarları tamamlandıktan sonra birkaç saat bekleyin
- Netlify dashboard'da SSL durumunu kontrol edin

## İletişim

Sorun yaşarsanız:
1. Netlify build loglarını kontrol edin
2. DNS yayılımını kontrol edin (dnschecker.org)
3. Netlify ve Porkbun support'a başvurun

