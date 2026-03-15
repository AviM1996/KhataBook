#!/bin/bash
# Firebase Deployment Script for Linux/Mac
# Run this script to build and deploy your PWA to Firebase Hosting

echo "🚀 Starting Firebase Deployment..."

# Step 1: Build the application
echo ""
echo "📦 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors and try again."
    exit 1
fi

echo "✅ Build completed successfully!"

# Step 2: Check if user is logged in
echo ""
echo "🔐 Checking Firebase authentication..."
firebase projects:list > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "⚠️  Not logged in to Firebase. Please run: firebase login"
    echo "   Or run: npm run firebase:login"
    exit 1
fi

# Step 3: Deploy to Firebase
echo ""
echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo "🌐 Your PWA is now live at:"
    echo "   https://khatabook-4b57a.web.app"
    echo "   https://khatabook-4b57a.firebaseapp.com"
else
    echo ""
    echo "❌ Deployment failed!"
    exit 1
fi



