# WordWalker - PWA Quick Start Guide

## What You've Got Now

Your WordWalker app is now a fully functional Progressive Web App (PWA) with:

✅ **Offline Support** - Works without internet after first load
✅ **Install Button** - Users can install the app on their device
✅ **Auto-Updates** - Checks for updates every 60 seconds
✅ **Smart Caching** - Separate caches for assets, images, and audio
✅ **Black Background** - Matches your index.php design
✅ **Volume Control** - Top-left slider with sound toggle

## How to Test It

### 1. Build the App
```bash
yarn build
```

### 2. Test Locally
```bash
# Serve the dist folder
cd dist
python -m http.server 8000
# Or use any local server
```

### 3. Open in Browser
- Visit `http://localhost:8000`
- Open DevTools (F12)
- Go to Application tab

### 4. Check Service Worker
- **Application > Service Workers** - should show "activated and running"
- **Application > Cache Storage** - should show 4 caches with your assets

### 5. Test Offline
- **Check "Offline" box** in Service Workers section
- **Reload the page** - should still work!
- **Uncheck "Offline"** to go back online

### 6. Test Installation
- Look for "Install App" button in bottom-right corner
- OR use browser menu: "Install WordWalker"
- Should open as standalone app

## Deployment Checklist

Before deploying to production:

- [ ] Update version in `package.json`
- [ ] Update `CACHE_NAME` in `public/service-worker.js` to match version
- [ ] Replace placeholder icons with real 192x192 and 512x512 icons
- [ ] Run `yarn build`
- [ ] Upload `dist/` folder to server
- [ ] Upload `index.php` to server
- [ ] Upload `package.json` to server
- [ ] Verify HTTPS is enabled (required for PWA)
- [ ] Test on actual device

## File Paths to Verify

The service worker expects these paths (update if your deployment structure differs):

```
/wordwalker/dist/                    # Base path
/wordwalker/dist/index.html
/wordwalker/index.php
/wordwalker/dist/manifest.json
/wordwalker/dist/service-worker.js
/wordwalker/dist/assets/*.js
/wordwalker/dist/assets/*.css
/wordwalker/dist/images/*
/wordwalker/dist/audio/*
```

## Updating the App

When you make changes:

1. **Update version in `package.json`** (e.g., from 1.0.0 to 1.0.1)
2. **Update `CACHE_NAME` in `service-worker.js`**:
   ```javascript
   const CACHE_NAME = 'wordwalker-v1.0.1';
   ```
3. **Build**: `yarn build`
4. **Deploy** updated files
5. **Users will auto-update** within 60 seconds

## Troubleshooting

### Service Worker Won't Register
- Must use HTTPS (or localhost for testing)
- Check browser console for errors
- Clear site data in DevTools > Application > Clear storage

### Assets Not Loading Offline
- Check DevTools > Application > Cache Storage
- Verify files are actually cached
- Check service worker console logs

### Install Button Not Showing
- Must meet PWA criteria (manifest + service worker + HTTPS)
- Won't show if already installed
- Some browsers don't support PWA installation

### Old Version Keeps Loading
- Update both `package.json` AND `service-worker.js` versions
- Clear cache in DevTools > Application > Clear storage
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

## Features Added

### 1. Volume Control (Top Left)
- Sound toggle button with icon
- Volume slider (0-100%)
- Persists to localStorage
- Background music auto-starts on interaction

### 2. Install Prompt (Bottom Right)
- Shows install button when available
- Handles beforeinstallprompt event
- Auto-hides when app is installed

### 3. Service Worker Caching
- **Core Cache**: HTML, manifest, PHP
- **Assets Cache**: JS and CSS bundles
- **Images Cache**: All game images
- **Audio Cache**: All sound effects and music

### 4. Auto-Update System
- Checks for updates every 60 seconds
- Logs to console when update is available
- Can auto-reload on update (currently disabled)

## Next Steps

1. **Create Real Icons**: Replace placeholder icons with your WordWalker branding
2. **Test on Real Devices**: iOS, Android, different browsers
3. **Add Screenshots**: Update manifest.json with app screenshots
4. **Optimize Images**: Compress images for faster loading
5. **Add Shortcuts**: Add quick actions to manifest.json

## Resources

- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Lighthouse PWA Audit](https://developers.google.com/web/tools/lighthouse)

Enjoy your offline-capable WordWalker PWA! 🎉
