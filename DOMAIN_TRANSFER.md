# Domain Transfer Rehberi - worfe.vip

## 🔍 Durum

**Eski Site:** worfe (ID: 5312cc09-39c5-4de9-95fa-50ae90b915e9)
- URL: https://worfe.vip
- Domain: worfe.vip kullanıyor

**Yeni Site:** worfe-vip (ID: ca8d3d4d-b984-435c-9300-15f09a0af896)
- URL: https://worfe-vip.netlify.app
- Domain eklenmek isteniyor: worfe.vip

## ✅ Çözüm: Domain Transfer

### Adım 1: Eski Siteden Domain'i Kaldır

1. **Netlify Dashboard'a git:**
   - https://app.netlify.com/sites/worfe/configuration/domains

2. **Domain'i bul:**
   - `worfe.vip` domain'ini listede bul

3. **Domain'i kaldır:**
   - Domain'in yanındaki **"..."** menüsüne tıkla
   - **"Remove domain"** veya **"Delete"** seçeneğini tıkla
   - Onayla

**VEYA CLI ile:**
```bash
netlify open:admin --site=worfe
```
Sonra Domain settings'e git ve kaldır.

### Adım 2: Yeni Sitede Domain Ekle

1. **Netlify Dashboard'a git:**
   - https://app.netlify.com/sites/worfe-vip/configuration/domains

2. **Domain ekle:**
   - **"Add custom domain"** butonuna tıkla
   - Domain: `worfe.vip` yaz
   - **"Verify"** butonuna tıkla

3. **DNS ayarları:**
   - Netlify size nameserver'ları veya DNS kayıtlarını gösterecek
   - Porkbun'da DNS ayarlarını yap (zaten yapılmış olabilir)

### Adım 3: DNS Kontrolü

DNS ayarları zaten yapılmış olabilir (eski siteden). Eğer nameserver'lar değişmediyse, sadece Netlify'da domain'i kaldırıp yeni siteye eklemek yeterli.

## 🚀 Hızlı Yol

### Seçenek A: Netlify Dashboard (Önerilen)

1. **Eski site:** https://app.netlify.com/sites/worfe/configuration/domains
   - worfe.vip → Remove

2. **Yeni site:** https://app.netlify.com/sites/worfe-vip/configuration/domains
   - Add custom domain → worfe.vip → Verify

### Seçenek B: Netlify CLI

```bash
# Eski siteden domain'i kaldır (manuel dashboard'dan)
netlify open:admin --site=worfe

# Yeni sitede domain ekle
netlify open:admin --site=worfe-vip
```

## ⚠️ Önemli Notlar

1. **DNS ayarları:** Eğer Porkbun'da nameserver'lar Netlify'ı gösteriyorsa, sadece Netlify'da domain'i transfer etmek yeterli. DNS kayıtlarını değiştirmeye gerek yok.

2. **SSL sertifikası:** Domain transfer edildikten sonra Netlify otomatik olarak yeni SSL sertifikası oluşturacak (birkaç saat sürebilir).

3. **Downtime:** Domain transfer sırasında çok kısa bir süre (birkaç dakika) site erişilemeyebilir.

## ✅ Kontrol Listesi

- [ ] Eski siteden (worfe) domain kaldırıldı
- [ ] Yeni sitede (worfe-vip) domain eklendi
- [ ] DNS doğrulandı (Netlify'da)
- [ ] SSL sertifikası aktif (birkaç saat sonra)
- [ ] Site erişilebilir (worfe.vip)

## 🔗 Hızlı Linkler

- **Eski Site Domain Settings:** https://app.netlify.com/sites/worfe/configuration/domains
- **Yeni Site Domain Settings:** https://app.netlify.com/sites/worfe-vip/configuration/domains
- **Netlify Dashboard:** https://app.netlify.com

## 🆘 Sorun Giderme

### "Domain already in use" hatası
- Eski siteden domain'i tamamen kaldırdığınızdan emin olun
- Birkaç dakika bekleyin (DNS cache)
- Tekrar deneyin

### DNS doğrulama hatası
- Porkbun'da nameserver'ların doğru olduğundan emin olun
- DNS yayılımını kontrol edin: https://dnschecker.org

### SSL sertifikası aktif değil
- DNS doğrulandıktan sonra birkaç saat bekleyin
- Netlify otomatik olarak SSL oluşturacak

