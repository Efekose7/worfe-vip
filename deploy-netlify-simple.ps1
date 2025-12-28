# Basit Netlify Deployment Script
# Netlify CLI kullanarak deploy yapar

Write-Host "=== Netlify Deployment ===" -ForegroundColor Cyan
Write-Host ""

# Build kontrolü
if (-not (Test-Path "client\build")) {
    Write-Host "Build yapılıyor..." -ForegroundColor Cyan
    Set-Location client
    npm install --silent
    npm run build
    Set-Location ..
}

Write-Host "Build hazır!" -ForegroundColor Green
Write-Host ""

# Netlify CLI ile deploy
Write-Host "Netlify'e deploy yapılıyor..." -ForegroundColor Cyan
Write-Host ""
Write-Host "NOT: İlk kez deploy yapıyorsanız, Netlify'e login olmanız gerekecek." -ForegroundColor Yellow
Write-Host ""

# Netlify CLI ile deploy
netlify deploy --prod --dir=client/build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=== Deploy Başarılı! ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Sonraki adımlar:" -ForegroundColor Cyan
    Write-Host "1. Netlify dashboard'da custom domain ekle: worfe.vip" -ForegroundColor Yellow
    Write-Host "2. Porkbun'da DNS ayarlarını yap" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "=== Deploy Hatası ===" -ForegroundColor Red
    Write-Host ""
    Write-Host "Çözüm:" -ForegroundColor Yellow
    Write-Host "1. netlify login (ilk kez)" -ForegroundColor White
    Write-Host "2. netlify init (site oluştur)" -ForegroundColor White
    Write-Host "3. netlify deploy --prod --dir=client/build" -ForegroundColor White
}

