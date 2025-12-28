# Netlify Otomatik Deployment Script
# GitHub repository'sinden Netlify'e otomatik deploy

Write-Host "=== Netlify Otomatik Deployment ===" -ForegroundColor Cyan
Write-Host ""

# Netlify token kontrolü
$netlifyToken = Read-Host "Netlify API token'ınızı girin (https://app.netlify.com/user/applications)"

if ([string]::IsNullOrWhiteSpace($netlifyToken)) {
    Write-Host "Token gerekli! İptal ediliyor." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Build yapılıyor..." -ForegroundColor Cyan
Set-Location client

# Build
npm install --silent
if ($LASTEXITCODE -ne 0) {
    Write-Host "npm install hatası!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build hatası!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..
Write-Host "Build başarılı!" -ForegroundColor Green
Write-Host ""

# Netlify API ile site oluştur
Write-Host "Netlify'da site oluşturuluyor..." -ForegroundColor Cyan

$headers = @{
    'Authorization' = "Bearer $netlifyToken"
    'Content-Type' = 'application/json'
}

# Site oluştur
$siteData = @{
    name = "worfe-vip"
} | ConvertTo-Json

try {
    $siteResponse = Invoke-RestMethod -Uri "https://api.netlify.com/api/v1/sites" -Method Post -Headers $headers -Body $siteData -ErrorAction Stop
    
    Write-Host ""
    Write-Host "=== Site Oluşturuldu! ===" -ForegroundColor Green
    Write-Host "Site URL: $($siteResponse.url)" -ForegroundColor Green
    Write-Host "Site ID: $($siteResponse.id)" -ForegroundColor Green
    Write-Host ""
    
    # GitHub ile bağla
    Write-Host "GitHub repository bağlanıyor..." -ForegroundColor Cyan
    
    $repoData = @{
        repo = @{
            provider = "github"
            repo = "Efekose7/worfe-vip"
            branch = "main"
            dir = "client"
            cmd = "npm install && npm run build"
        }
    } | ConvertTo-Json -Depth 10
    
    try {
        $repoResponse = Invoke-RestMethod -Uri "https://api.netlify.com/api/v1/sites/$($siteResponse.id)/build" -Method Post -Headers $headers -Body $repoData -ErrorAction Stop
        Write-Host "GitHub bağlantısı başarılı!" -ForegroundColor Green
    } catch {
        Write-Host "GitHub bağlantısı atlandı (manuel yapılabilir)" -ForegroundColor Yellow
    }
    
    # Deploy
    Write-Host ""
    Write-Host "Deploy yapılıyor..." -ForegroundColor Cyan
    
    # Build klasörünü zip'le ve deploy et
    $zipFile = "build.zip"
    if (Test-Path $zipFile) { Remove-Item $zipFile }
    
    Compress-Archive -Path "client\build\*" -DestinationPath $zipFile -Force
    
    $deployHeaders = @{
        'Authorization' = "Bearer $netlifyToken"
    }
    
    $deployResponse = Invoke-RestMethod -Uri "https://api.netlify.com/api/v1/sites/$($siteResponse.id)/deploys" -Method Post -Headers $deployHeaders -InFile $zipFile -ContentType "application/zip"
    
    Remove-Item $zipFile
    
    Write-Host ""
    Write-Host "=== Deploy Başarılı! ===" -ForegroundColor Green
    Write-Host "Site URL: $($siteResponse.url)" -ForegroundColor Green
    Write-Host "Deploy URL: $($deployResponse.url)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Sonraki adımlar:" -ForegroundColor Cyan
    Write-Host "1. Netlify dashboard'da custom domain ekle: worfe.vip" -ForegroundColor Yellow
    Write-Host "2. Porkbun'da DNS ayarlarını yap" -ForegroundColor Yellow
    
} catch {
    Write-Host ""
    Write-Host "=== Hata! ===" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "Token geçersiz veya süresi dolmuş!" -ForegroundColor Yellow
    } elseif ($_.Exception.Response.StatusCode -eq 422) {
        Write-Host "Site zaten var olabilir. Mevcut siteyi kullanın." -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Manuel deploy için:" -ForegroundColor Yellow
    Write-Host "netlify login" -ForegroundColor White
    Write-Host "netlify deploy --prod --dir=client/build" -ForegroundColor White
}

Write-Host ""
Write-Host "=== Script Tamamlandı ===" -ForegroundColor Cyan

