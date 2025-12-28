# Netlify Token Alma Rehberi

Netlify'e otomatik deploy yapmak için API token'ına ihtiyacımız var.

## Token Alma Adımları

1. **https://app.netlify.com/user/applications** adresine git
2. **New access token** butonuna tıkla
3. Token adı: `worfe-vip-deployment`
4. **Generate token** tıkla
5. Token'ı kopyala (bir daha gösterilmeyecek!)

## Token ile Deploy

Token'ı aldıktan sonra şu komutu çalıştır:

```powershell
$env:NETLIFY_AUTH_TOKEN="your-token-here"; .\netlify-auto-deploy.ps1
```

VEYA token'ı script'e girebilirsin.

## Alternatif: Netlify CLI ile Login

```powershell
netlify login
netlify deploy --prod --dir=client/build
```

