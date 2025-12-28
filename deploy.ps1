# WORFE VIP - Deployment Script
# Bu script GitHub'a push ve deployment işlemlerini yapar

Write-Host "=== WORFE VIP Deployment Script ===" -ForegroundColor Cyan
Write-Host ""

# GitHub repository URL'i
$repoName = Read-Host "GitHub repository adını girin (örn: worfe-vip)"

if ([string]::IsNullOrWhiteSpace($repoName)) {
    $repoName = "worfe-vip"
    Write-Host "Varsayılan repository adı kullanılıyor: $repoName" -ForegroundColor Yellow
}

$repoUrl = "https://github.com/Efekose7/$repoName.git"

Write-Host ""
Write-Host "Repository URL: $repoUrl" -ForegroundColor Green
Write-Host ""

# Git remote kontrolü
Write-Host "Git remote kontrol ediliyor..." -ForegroundColor Cyan
$currentRemote = git remote -v 2>$null

if ($currentRemote -match "origin") {
    Write-Host "Mevcut remote bulundu. Güncelleniyor..." -ForegroundColor Yellow
    git remote set-url origin $repoUrl
} else {
    Write-Host "Yeni remote ekleniyor..." -ForegroundColor Cyan
    git remote add origin $repoUrl
}

Write-Host ""
Write-Host "Branch adı kontrol ediliyor..." -ForegroundColor Cyan
$currentBranch = git branch --show-current

if ($currentBranch -ne "main") {
    Write-Host "Branch 'main' olarak değiştiriliyor..." -ForegroundColor Yellow
    git branch -M main
}

Write-Host ""
Write-Host "Değişiklikler kontrol ediliyor..." -ForegroundColor Cyan
$status = git status --porcelain

if ($status) {
    Write-Host "Yeni değişiklikler bulundu. Commit ediliyor..." -ForegroundColor Yellow
    git add .
    git commit -m "Update: SEO optimizations and latest changes"
}

Write-Host ""
Write-Host "=== GitHub'a Push İşlemi ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "ÖNEMLİ: GitHub artık şifre ile push kabul etmiyor!" -ForegroundColor Red
Write-Host "Personal Access Token kullanmanız gerekiyor." -ForegroundColor Red
Write-Host ""
Write-Host "Token oluşturmak için: https://github.com/settings/tokens" -ForegroundColor Yellow
Write-Host ""

$push = Read-Host "Push işlemini başlatmak istiyor musunuz? (E/H)"

if ($push -eq "E" -or $push -eq "e" -or $push -eq "Y" -or $push -eq "y") {
    Write-Host ""
    Write-Host "Push işlemi başlatılıyor..." -ForegroundColor Cyan
    Write-Host "Username: Efekose7" -ForegroundColor Yellow
    Write-Host "Password: (Personal Access Token'ınızı girin)" -ForegroundColor Yellow
    Write-Host ""
    
    git push -u origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "=== Başarılı! ===" -ForegroundColor Green
        Write-Host "Kodlar GitHub'a yüklendi!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Sonraki adımlar:" -ForegroundColor Cyan
        Write-Host "1. Netlify'da yeni site oluştur" -ForegroundColor Yellow
        Write-Host "2. GitHub repository'yi bağla" -ForegroundColor Yellow
        Write-Host "3. Build ayarlarını yapılandır (DEPLOYMENT_GUIDE.md'ye bak)" -ForegroundColor Yellow
        Write-Host "4. Porkbun DNS ayarlarını yap" -ForegroundColor Yellow
    } else {
        Write-Host ""
        Write-Host "=== Hata! ===" -ForegroundColor Red
        Write-Host "Push işlemi başarısız oldu." -ForegroundColor Red
        Write-Host "Lütfen GitHub Personal Access Token oluşturun." -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "Push işlemi iptal edildi." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Manuel push için:" -ForegroundColor Cyan
    Write-Host "git push -u origin main" -ForegroundColor White
}

Write-Host ""
Write-Host "=== Script Tamamlandı ===" -ForegroundColor Cyan

