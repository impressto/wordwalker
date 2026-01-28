# WordWalker PWA Setup

## Overview

WordWalker is configured as a Progressive Web App (PWA) with offline support, installability, and native app-like experience on mobile devices.

## PWA Features

- ✅ **Offline Support:** Service worker caches essential assets for offline usage
- ✅ **Installable:** Users can install WordWalker as a standalone app on their device
- ✅ **Fullscreen Mode:** Runs in fullscreen mode on mobile devices
- ✅ **Mobile Optimized:** Prevents scrolling and provides native app-like experience
- ✅ **Auto-Update:** Service worker automatically checks for updates
- ✅ **Install Prompt:** Shows an install button when PWA installation is available
- ✅ **Multiple Cache Strategies:** Separate caching for core assets, images, and audio files

## Required Assets for Hosting

When deploying WordWalker to your hosting server, ensure the following files are available:

### Icon Files (in `public/` folder - copied to `dist/` during build)
- `icon.png` - Main app icon
- `icon-192x192.png` - 192x192 PWA icon
- `icon-512x512.png` - 512x512 PWA icon

### PWA Configuration
- `manifest.json` - PWA manifest for installability
- `service-worker.js` - Service worker for offline support and caching
- `offline.html` - Fallback page when offline and content not cached

### Audio Files (in `public/audio/` folder)
- `correct.mp3` - Correct answer sound
- `wrong.mp3` - Wrong answer sound
- `streak.mp3` - Streak bonus sound
- `victory.mp3` - Victory animation sound
- `choice.mp3` - Path selection sound
- `background.mp3` - Background music (loops)

### Image Files (in `public/images/` folder)
- `grass.png` - Grass background texture
- `path.png` - Walking path texture
- `path-fork.png` - Path fork at decision points
- `mountains.png` - Background mountains
- `trees1.png` - Foreground trees
- `trees2.png` - Mid-distance trees
- `trees3.png` - Far-distance trees
- `bushes.png` - Bushes behind path
- `walker-default.png` - Walker sprite sheet
- `wordwalk-logo.png` - App logo

## Build and Deploy

1. **Build the project:**
   ```bash
   yarn build
   ```

2. **Deploy files:**
   - Upload the entire `dist/` folder to your web server
   - Upload `index.php` to the root of your WordWalker directory
   - Ensure `package.json` is accessible (used for version cache busting)

3. **Icon Setup:**
   Before deploying, replace the placeholder icon files in `public/` with actual WordWalker icons:
   - Create a 192x192 PNG icon
   - Create a 512x512 PNG icon
   - Create a main icon (any size, typically 512x512)
   
4. **Verify PWA Setup:**
   - Open the app in Chrome/Edge
   - Open DevTools (F12) > Application tab
   - Check Manifest - should show all icons and metadata
   - Check Service Workers - should show registered service worker
   - Check Cache Storage - should show cached assets
   - Use Lighthouse to audit PWA score (should be 90+)

## Service Worker Caching Strategy

The service worker uses multiple cache strategies for optimal performance:

### Cache Names:
- `wordwalker-v1.0.0` - Core app files (HTML, manifest)
- `wordwalker-assets-v1` - JavaScript and CSS bundles
- `wordwalker-images-v1` - Image assets
- `wordwalker-audio-v1` - Audio files

### Caching Strategy:
1. **Core Assets** - Cached during installation
2. **Other Assets** - Cached on first request (cache-first strategy)
3. **Offline Fallback** - Shows offline.html when network fails

## Cache Busting

The `index.php` file automatically reads the version from `package.json` and appends it as a query parameter to all asset URLs for cache busting. 

**To force users to get new version:**
1. Increment the version in `package.json`
2. Update the `CACHE_NAME` version in `public/service-worker.js`
3. Run `yarn build`
4. Deploy updated files

## Testing Offline Functionality

1. **Open the app in Chrome/Edge**
2. **Open DevTools (F12) > Application tab**
3. **Check "Offline" checkbox** under Service Workers
4. **Reload the page** - app should still work
5. **Test features** - verify cached assets load correctly

## Install Prompt

The app includes an "Install App" button that appears:
- When the PWA installation criteria are met
- Only on devices that support PWA installation
- In the bottom-right corner of the screen

Users can also install via:
- Chrome menu > "Install WordWalker"
- Address bar install icon (mobile)
- Share menu > "Add to Home Screen" (iOS Safari)

## Troubleshooting

### Service Worker Not Registering
- Check browser console for errors
- Ensure HTTPS (required for service workers, except localhost)
- Clear browser cache and reload

### Assets Not Caching
- Check DevTools > Application > Cache Storage
- Verify file paths in service worker match actual paths
- Check service worker console logs

### Install Button Not Showing
- PWA criteria must be met (manifest, service worker, HTTPS)
- May not show if already installed
- Some browsers don't support installation (Firefox desktop)

### App Not Working Offline
- Verify service worker is active in DevTools
- Check that assets are in cache storage
- Test with DevTools offline mode first

## Browser Support

- ✅ Chrome/Edge (full PWA support)
- ✅ Safari iOS (limited PWA support, use "Add to Home Screen")
- ✅ Firefox Android (PWA support)
- ⚠️ Firefox Desktop (no install prompt, but works offline)
- ⚠️ Safari macOS (limited PWA support)

## Security Considerations

- HTTPS is required for service workers (except localhost)
- Service worker scope is limited to `/wordwalker/`
- Cache is origin-specific and isolated from other sites
