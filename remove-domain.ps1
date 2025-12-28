# Domain Kaldırma Script
# Eski "worfe" sitesinden worfe.vip domain'ini kaldırır

Write-Host "=== Domain Kaldırma Script ===" -ForegroundColor Cyan
Write-Host ""

$oldSiteId = "5312cc09-39c5-4de9-95fa-50ae90b915e9"  # worfe site ID
$newSiteId = "ca8d3d4d-b984-435c-9300-15f09a0af896"  # worfe-vip site ID
$domain = "worfe.vip"

Write-Host "Eski site: worfe ($oldSiteId)" -ForegroundColor Yellow
Write-Host "Yeni site: worfe-vip ($newSiteId)" -ForegroundColor Green
Write-Host "Domain: $domain" -ForegroundColor Cyan
Write-Host ""

Write-Host "Netlify API ile domain kaldırılıyor..." -ForegroundColor Cyan

# Netlify API token al
$token = netlify api:getCurrentUser 2>&1 | Out-String
if ($token -match "error" -or $token -match "not authenticated") {
    Write-Host "Netlify'e login olmanız gerekiyor!" -ForegroundColor Red
    Write-Host "netlify login" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "NOT: Netlify CLI ile domain kaldırma sınırlı." -ForegroundColor Yellow
Write-Host "Manuel olarak kaldırmanız gerekiyor." -ForegroundColor Yellow
Write-Host ""

Write-Host "=== Manuel Adımlar ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Eski siteden domain'i kaldır:" -ForegroundColor Yellow
Write-Host "   https://app.netlify.com/sites/worfe/configuration/domains" -ForegroundColor White
Write-Host "   - worfe.vip domain'ini bul" -ForegroundColor White
Write-Host "   - 'Remove' veya 'Delete' butonuna tıkla" -ForegroundColor White
Write-Host "   - Onayla" -ForegroundColor White
Write-Host ""
Write-Host "2. Yeni sitede domain ekle:" -ForegroundColor Green
Write-Host "   https://app.netlify.com/sites/worfe-vip/configuration/domains" -ForegroundColor White
Write-Host "   - 'Add custom domain' tıkla" -ForegroundColor White
Write-Host "   - worfe.vip yaz" -ForegroundColor White
Write-Host "   - Verify tıkla" -ForegroundColor White
Write-Host ""

Write-Host "VEYA otomatik yapmak için:" -ForegroundColor Cyan
Write-Host "netlify open:admin --site=worfe" -ForegroundColor White
Write-Host "Sonra domain settings'e git ve kaldır" -ForegroundColor White

