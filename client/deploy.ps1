# Firebase Deployment Script for Windows PowerShell
# Run this script to build and deploy your PWA to Firebase Hosting

Write-Host "🚀 Starting Firebase Deployment..." -ForegroundColor Cyan

# Step 1: Build the application
Write-Host "`n📦 Building application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Please fix errors and try again." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed successfully!" -ForegroundColor Green

# Step 2: Check if user is logged in
Write-Host "`n🔐 Checking Firebase authentication..." -ForegroundColor Yellow
firebase projects:list | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Not logged in to Firebase. Please run: firebase login" -ForegroundColor Yellow
    Write-Host "   Or run: npm run firebase:login" -ForegroundColor Yellow
    exit 1
}

# Step 3: Deploy to Firebase
Write-Host "`n🚀 Deploying to Firebase Hosting..." -ForegroundColor Yellow
firebase deploy --only hosting

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Deployment successful!" -ForegroundColor Green
    Write-Host "🌐 Your PWA is now live at:" -ForegroundColor Cyan
    Write-Host "   https://khatabook-4b57a.web.app" -ForegroundColor White
    Write-Host "   https://khatabook-4b57a.firebaseapp.com" -ForegroundColor White
} else {
    Write-Host "`n❌ Deployment failed!" -ForegroundColor Red
    exit 1
}



