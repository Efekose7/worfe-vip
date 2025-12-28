# Netlify Deployment - Adım Adım Rehber

## ✅ GitHub Tamamlandı!

Repository başarıyla oluşturuldu ve kodlar push edildi:
- **Repository URL:** https://github.com/Efekose7/worfe-vip
- **Branch:** main

## 🚀 Netlify Deployment Adımları

### 1. Netlify'a Giriş Yap

1. **https://app.netlify.com** adresine git
2. **Sign up** veya **Log in** tıkla
3. **GitHub** ile giriş yap (Efekose7 hesabı ile)

### 2. Yeni Site Oluştur

1. Dashboard'da **Add new site** butonuna tıkla
2. **Import an existing project** seçeneğini seç
3. **GitHub** seçeneğini tıkla
4. İlk kez bağlıyorsanız Netlify'e GitHub erişim izni ver
5. Repository listesinden **worfe-vip** seç

### 3. Build Ayarlarını Yapılandır

**ÖNEMLİ:** Aşağıdaki ayarları yapın:

#### Basic build settings:
- **Base directory:** `client`
- **Build command:** `npm install && npm run build`
- **Publish directory:** `client/build`

#### Environment variables (Deploy settings > Environment variables):
- **Key:** `REACT_APP_API_URL`
- **Value:** Backend URL'iniz (örn: `https://your-backend.herokuapp.com/api` veya `https://your-backend.render.com/api`)

**Not:** Eğer backend henüz deploy edilmediyse, şimdilik local URL bırakabilirsiniz, sonra güncellersiniz.

### 4. Deploy Et

1. **Deploy site** butonuna tıkla
2. İlk build başlayacak (2-5 dakika sürebilir)
3. Build tamamlandığında site URL'i alacaksınız: `https://random-name-12345.netlify.app`

### 5. Custom Domain Ekle (worfe.vip)

1. Netlify dashboard'da sitenize tıkla
2. **Domain settings** sekmesine git
3. **Add custom domain** butonuna tıkla
4. Domain adını yaz: `worfe.vip`
5. **Verify** butonuna tıkla

Netlify size iki seçenek sunacak:

#### Seçenek A: Netlify Nameserver Kullan (Önerilen - Daha Kolay)

1. Netlify size nameserver'ları gösterecek (genellikle şunlar gibi):
   ```
   dns1.p01.nsone.net
   dns2.p01.nsone.net
   dns3.p01.nsone.net
   dns4.p01.nsone.net
   ```

2. **Porkbun'a git:**
   - https://porkbun.com/account/login
   - Domain yönetim paneline git
   - **worfe.vip** domain'ini seç
   - **Nameservers** bölümüne git
   - Netlify'nin verdiği nameserver'ları ekle:
     ```
     dns1.p01.nsone.net
     dns2.p01.nsone.net
     dns3.p01.nsone.net
     dns4.p01.nsone.net
     ```
   - **Save** tıkla

3. Netlify'da **Verify DNS configuration** butonuna tıkla
4. DNS yayılımı 24-48 saat sürebilir, genellikle birkaç saat içinde aktif olur

#### Seçenek B: Porkbun Nameserver Kullan (Mevcut DNS Ayarlarını Koru)

1. Netlify size DNS kayıtlarını gösterecek:
   - **A Record:** `@` → IP adresi (örn: `75.2.60.5`)
   - **CNAME:** `www` → Netlify site URL'i

2. **Porkbun'a git:**
   - https://porkbun.com/account/login
   - Domain yönetim paneline git
   - **worfe.vip** domain'ini seç
   - **DNS Records** bölümüne git
   - Şu kayıtları ekle/güncelle:
     - **A Record:**
       - Name: `@` (veya boş)
       - Type: `A`
       - Value: Netlify'nin verdiği IP adresi
       - TTL: `600`
     - **CNAME Record:**
       - Name: `www`
       - Type: `CNAME`
       - Value: Netlify site URL'i (örn: `random-name-12345.netlify.app`)
       - TTL: `600`

3. Netlify'da **Verify DNS configuration** butonuna tıkla

### 6. SSL Sertifikası

Netlify otomatik olarak SSL sertifikası sağlar:
- DNS ayarları doğrulandıktan sonra otomatik olarak başlar
- Genellikle birkaç saat içinde aktif olur
- **Domain settings** > **HTTPS** bölümünden durumu kontrol edebilirsiniz

### 7. Site Ayarları (Opsiyonel)

#### Redirects (www → non-www veya tersi)

**Domain settings** > **Domain management** bölümünden:
- `www.worfe.vip` → `worfe.vip` redirect ekleyebilirsiniz

#### Build & deploy settings

**Site settings** > **Build & deploy** bölümünden:
- **Continuous Deployment:** Açık (her push'ta otomatik deploy)
- **Deploy notifications:** Email veya Slack bildirimleri ekleyebilirsiniz

## ✅ Kontrol Listesi

- [ ] Netlify'da site oluşturuldu
- [ ] Build başarılı
- [ ] Custom domain eklendi (worfe.vip)
- [ ] DNS ayarları yapıldı (Porkbun'da)
- [ ] DNS doğrulandı (Netlify'da)
- [ ] SSL sertifikası aktif
- [ ] Site erişilebilir (worfe.vip)
- [ ] Environment variables ayarlandı

## 🔍 DNS Yayılımını Kontrol Et

DNS ayarlarının yayıldığını kontrol etmek için:
- https://dnschecker.org adresine git
- Domain: `worfe.vip` yaz
- Record type: `A` veya `NS` seç
- **Check** tıkla

Tüm lokasyonlarda doğru IP/nameserver görünüyorsa DNS yayılmış demektir.

## 🐛 Sorun Giderme

### Build Hatası
- Netlify build loglarını kontrol et
- Local'de test et: `cd client && npm install && npm run build`
- Environment variables'ı kontrol et

### DNS Sorunları
- DNS yayılımı 24-48 saat sürebilir
- Porkbun'da nameserver/DNS kayıtlarının doğru olduğundan emin ol
- Netlify'da DNS doğrulama durumunu kontrol et

### SSL Sorunları
- DNS doğrulandıktan sonra birkaç saat bekleyin
- Netlify dashboard'da SSL durumunu kontrol edin
- Eğer sorun devam ederse Netlify support'a başvurun

## 📞 Yardım

- **Netlify Docs:** https://docs.netlify.com
- **Netlify Support:** https://www.netlify.com/support
- **Porkbun Support:** https://porkbun.com/support

## 🎉 Başarılı Deployment Sonrası

Site yayına girdikten sonra:
1. Google Search Console'a sitemap gönderin: `https://worfe.vip/sitemap.xml`
2. Google Analytics ekleyin (opsiyonel)
3. Site performansını izleyin (Netlify Analytics)
4. Backend URL'ini güncelleyin (eğer backend deploy edildiyse)

