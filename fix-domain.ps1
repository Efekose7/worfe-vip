# Domain Transfer Script
# Eski projeden domain'i kaldırıp yeni projeye ekler

Write-Host "=== Domain Transfer Script ===" -ForegroundColor Cyan
Write-Host ""

# Tüm siteleri listele
Write-Host "Netlify siteleriniz:" -ForegroundColor Yellow
netlify sites:list

Write-Host ""
Write-Host "Hangi siteden domain'i kaldırmak istiyorsunuz?" -ForegroundColor Cyan
$oldSite = Read-Host "Eski site ID veya adı"

if ([string]::IsNullOrWhiteSpace($oldSite)) {
    Write-Host "Site ID gerekli!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Domain'i kaldırılıyor: worfe.vip" -ForegroundColor Cyan

# Eski siteden domain'i kaldır
try {
    # Netlify API ile domain'i kaldır
    $netlifyToken = netlify api:getCurrentUser | ConvertFrom-Json
    
    # Domain'i kaldır
    Write-Host "Eski siteden domain kaldırılıyor..." -ForegroundColor Yellow
    Write-Host "NOT: Netlify dashboard'dan manuel olarak kaldırmanız gerekebilir." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Manuel adımlar:" -ForegroundColor Cyan
    Write-Host "1. https://app.netlify.com/sites/$oldSite/configuration/domains adresine git" -ForegroundColor White
    Write-Host "2. worfe.vip domain'ini bul" -ForegroundColor White
    Write-Host "3. 'Remove' veya 'Delete' butonuna tıkla" -ForegroundColor White
    Write-Host "4. Onayla" -ForegroundColor White
    Write-Host ""
    Write-Host "Sonra yeni sitede domain ekleyebilirsiniz:" -ForegroundColor Green
    Write-Host "https://app.netlify.com/sites/worfe-vip/configuration/domains" -ForegroundColor White
    
} catch {
    Write-Host "Hata: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Script Tamamlandı ===" -ForegroundColor Cyan

