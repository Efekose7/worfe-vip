# Netlify Deployment Script
# Bu script Netlify'a otomatik deploy yapar

Write-Host "=== Netlify Deployment Script ===" -ForegroundColor Cyan
Write-Host ""

# Netlify token kontrolü
$netlifyToken = $env:NETLIFY_AUTH_TOKEN

if (-not $netlifyToken) {
    Write-Host "Netlify token bulunamadı!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Netlify token almak için:" -ForegroundColor Yellow
    Write-Host "1. https://app.netlify.com/user/applications adresine git" -ForegroundColor White
    Write-Host "2. 'New access token' tıkla" -ForegroundColor White
    Write-Host "3. Token adı: 'worfe-vip-deployment'" -ForegroundColor White
    Write-Host "4. Token'ı kopyala" -ForegroundColor White
    Write-Host ""
    Write-Host "Token'ı şu şekilde kullan:" -ForegroundColor Yellow
    Write-Host '$env:NETLIFY_AUTH_TOKEN="your-token-here"; .\netlify-deploy.ps1' -ForegroundColor White
    Write-Host ""
    Write-Host "VEYA manuel olarak:" -ForegroundColor Yellow
    Write-Host "netlify login" -ForegroundColor White
    Write-Host "netlify deploy --prod --dir=client/build" -ForegroundColor White
    exit 1
}

Write-Host "Netlify token bulundu!" -ForegroundColor Green
Write-Host ""

# Netlify CLI ile login
Write-Host "Netlify'e login olunuyor..." -ForegroundColor Cyan
$env:NETLIFY_AUTH_TOKEN = $netlifyToken

# Site oluşturma (eğer yoksa)
Write-Host ""
Write-Host "Site oluşturuluyor..." -ForegroundColor Cyan

# Önce build yap
Write-Host ""
Write-Host "Build yapılıyor..." -ForegroundColor Cyan
Set-Location client
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build hatası! npm install başarısız." -ForegroundColor Red
    Set-Location ..
    exit 1
}

npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build hatası! npm run build başarısız." -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..

Write-Host ""
Write-Host "Build başarılı!" -ForegroundColor Green
Write-Host ""

# Netlify API ile site oluştur
Write-Host "Netlify API ile site oluşturuluyor..." -ForegroundColor Cyan

$headers = @{
    'Authorization' = "Bearer $netlifyToken"
    'Content-Type' = 'application/json'
}

# Site bilgileri
$siteData = @{
    name = "worfe-vip"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://api.netlify.com/api/v1/sites" -Method Post -Headers $headers -Body $siteData
    
    Write-Host ""
    Write-Host "=== Site Oluşturuldu! ===" -ForegroundColor Green
    Write-Host "Site URL: $($response.url)" -ForegroundColor Green
    Write-Host "Site ID: $($response.id)" -ForegroundColor Green
    Write-Host ""
    
    # Deploy
    Write-Host "Deploy yapılıyor..." -ForegroundColor Cyan
    
    # Netlify CLI ile deploy
    $deployResult = netlify deploy --prod --dir=client/build --auth=$netlifyToken 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "=== Deploy Başarılı! ===" -ForegroundColor Green
        Write-Host $deployResult
    } else {
        Write-Host ""
        Write-Host "=== Deploy Hatası ===" -ForegroundColor Red
        Write-Host $deployResult
        Write-Host ""
        Write-Host "Manuel deploy için:" -ForegroundColor Yellow
        Write-Host "netlify deploy --prod --dir=client/build" -ForegroundColor White
    }
    
} catch {
    Write-Host ""
    Write-Host "=== Hata! ===" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Site zaten var olabilir veya token geçersiz olabilir." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Manuel deploy için:" -ForegroundColor Yellow
    Write-Host "1. netlify login" -ForegroundColor White
    Write-Host "2. netlify deploy --prod --dir=client/build" -ForegroundColor White
}

Write-Host ""
Write-Host "=== Script Tamamlandı ===" -ForegroundColor Cyan

