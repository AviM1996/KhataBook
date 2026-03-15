# Firebase Hosting Deployment Guide

This guide will help you deploy your LedgerFlow PWA to Firebase Hosting.

## Prerequisites

1. **Firebase Account**: Make sure you have a Firebase account
2. **Firebase Project**: Your project `khatabook-4b57a` is already configured
3. **Node.js**: Ensure Node.js is installed

## Step 1: Install Firebase CLI

If you haven't installed Firebase CLI globally:

```bash
npm install -g firebase-tools
```

Or use it locally (recommended):
```bash
npm install --save-dev firebase-tools
```

## Step 2: Login to Firebase

```bash
firebase login
```

This will open a browser window for you to authenticate with your Google account.

## Step 3: Verify Firebase Project

Check if you're connected to the correct project:

```bash
firebase projects:list
```

Your project `khatabook-4b57a` should be listed.

## Step 4: Build Your PWA

Build the production version of your app:

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

## Step 5: Deploy to Firebase Hosting

### Option A: Build and Deploy in One Command
```bash
npm run deploy
```

### Option B: Deploy Separately
```bash
# Build first
npm run build

# Then deploy
npm run deploy:hosting
```

### Option C: Using Firebase CLI Directly
```bash
firebase deploy --only hosting
```

## Step 6: Verify Deployment

After deployment, Firebase will provide you with a hosting URL like:
```
https://khatabook-4b57a.web.app
```
or
```
https://khatabook-4b57a.firebaseapp.com
```

## PWA Features

Your PWA is configured with:
- ✅ Service Worker (auto-update)
- ✅ Web App Manifest
- ✅ Offline support
- ✅ Installable on mobile devices
- ✅ Responsive design

## Testing PWA Features

1. **Install on Mobile**: Open the deployed URL on your mobile device
2. **Add to Home Screen**: Use browser menu to "Add to Home Screen"
3. **Offline Mode**: Disable network and test if the app works offline
4. **Service Worker**: Check browser DevTools > Application > Service Workers

## Troubleshooting

### Issue: Build fails
- Check for TypeScript/ESLint errors
- Ensure all dependencies are installed: `npm install`

### Issue: Deployment fails
- Verify you're logged in: `firebase login`
- Check project configuration: `firebase use`
- Ensure build completed successfully

### Issue: PWA not working
- Check browser console for errors
- Verify manifest.json is accessible
- Check service worker registration in DevTools

### Issue: Routes not working
- Ensure `firebase.json` has the rewrite rule for SPA routing
- Verify `navigateFallback: '/index.html'` in vite.config.js

## Continuous Deployment

For automatic deployments on git push, you can set up:
1. GitHub Actions
2. Firebase GitHub integration
3. CI/CD pipeline

## Additional Commands

```bash
# View hosting status
firebase hosting:channel:list

# Preview locally
npm run preview

# Open Firebase console
firebase open hosting

# View deployment history
firebase hosting:clone
```

## Support

For more information, visit:
- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [PWA Documentation](https://web.dev/progressive-web-apps/)


