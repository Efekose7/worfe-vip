# Render.com Service Oluşturma Script
Write-Host "=== Render.com Service Oluşturma ===" -ForegroundColor Cyan
Write-Host ""

$renderToken = Read-Host "Render.com API token'ınızı girin (https://dashboard.render.com/account/api-keys)"

if ([string]::IsNullOrWhiteSpace($renderToken)) {
    Write-Host "Token gerekli! İptal ediliyor." -ForegroundColor Red
    Write-Host ""
    Write-Host "Token almak için:" -ForegroundColor Yellow
    Write-Host "1. https://dashboard.render.com/account/api-keys adresine git" -ForegroundColor White
    Write-Host "2. 'New API Key' tıkla" -ForegroundColor White
    Write-Host "3. Token'ı kopyala" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "Render.com'da servis oluşturuluyor..." -ForegroundColor Cyan

$headers = @{
    'Authorization' = "Bearer $renderToken"
    'Content-Type' = 'application/json'
    'Accept' = 'application/json'
}

# Önce owner'ı al
try {
    $ownerResponse = Invoke-RestMethod -Uri "https://api.render.com/v1/owners" -Method Get -Headers $headers
    $ownerId = $ownerResponse[0].owner.id
    Write-Host "Owner ID: $ownerId" -ForegroundColor Green
} catch {
    Write-Host "Owner bilgisi alınamadı: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# GitHub repo bilgisi
$repo = "Efekose7/worfe-vip"

# Service oluştur
$serviceData = @{
    type = "web_service"
    name = "worfe-vip-backend"
    ownerId = $ownerId
    repo = $repo
    branch = "main"
    rootDir = "server"
    buildCommand = "npm install"
    startCommand = "node index.js"
    planId = "starter"  # Free plan
    envVars = @(
        @{
            key = "NODE_ENV"
            value = "production"
        },
        @{
            key = "JWT_SECRET"
            value = "worfe_vip_secret_key_2024_secure"
        }
    )
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "https://api.render.com/v1/services" -Method Post -Headers $headers -Body $serviceData
    
    Write-Host ""
    Write-Host "=== Servis Oluşturuldu! ===" -ForegroundColor Green
    Write-Host "Service ID: $($response.service.id)" -ForegroundColor Green
    Write-Host "Service URL: $($response.service.serviceDetails.url)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Deploy başlatılıyor..." -ForegroundColor Cyan
    
    # Deploy başlat
    $deployData = @{
        clearBuildCache = $true
    } | ConvertTo-Json
    
    $deployResponse = Invoke-RestMethod -Uri "https://api.render.com/v1/services/$($response.service.id)/deploys" -Method Post -Headers $headers -Body $deployData
    
    Write-Host ""
    Write-Host "=== Deploy Başlatıldı! ===" -ForegroundColor Green
    Write-Host "Deploy ID: $($deployResponse.deploy.id)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Backend URL: $($response.service.serviceDetails.url)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Sonraki adım:" -ForegroundColor Cyan
    Write-Host "Netlify'da REACT_APP_API_URL = $($response.service.serviceDetails.url)/api" -ForegroundColor Yellow
    
} catch {
    Write-Host ""
    Write-Host "=== Hata! ===" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Manuel oluşturma için:" -ForegroundColor Yellow
    Write-Host "1. https://dashboard.render.com/new/web-service" -ForegroundColor White
    Write-Host "2. GitHub repo: Efekose7/worfe-vip" -ForegroundColor White
    Write-Host "3. Root Directory: server" -ForegroundColor White
    Write-Host "4. Build: npm install" -ForegroundColor White
    Write-Host "5. Start: node index.js" -ForegroundColor White
}

Write-Host ""
Write-Host "=== Script Tamamlandı ===" -ForegroundColor Cyan

