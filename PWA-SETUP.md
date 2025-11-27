# WordWalk PWA Setup

## Required Assets for Hosting

When deploying WordWalk to your hosting server, ensure the following files are available:

### Icon Files (in `public/` folder - copied to `dist/` during build)
- `icon.png` - Main app icon
- `icon-192x192.png` - 192x192 PWA icon
- `icon-512x512.png` - 512x512 PWA icon

### PWA Configuration
- `manifest.json` - PWA manifest for installability
- `service-worker.js` - Service worker for offline support

### Audio Files (hosted separately)
Update the `baseUrl` in `src/soundManager.js` to point to your audio hosting location:
- `correct.mp3` - Correct answer sound
- `wrong.mp3` - Wrong answer sound
- `streak.mp3` - Streak bonus sound
- `victory.mp3` - Victory animation sound
- `choice.mp3` - Path selection sound
- `background.mp3` (optional) - Background music

## Build and Deploy

1. **Build the project:**
   ```bash
   yarn build
   ```

2. **Deploy files:**
   - Upload the entire `dist/` folder to your web server
   - Upload `index.php` to the root of your WordWalk directory
   - Ensure `package.json` is accessible (used for version cache busting)

3. **Icon Setup:**
   Before deploying, replace the placeholder icon files in `public/` with actual WordWalk icons:
   - Create a 192x192 PNG icon
   - Create a 512x512 PNG icon
   - Create a main icon (any size, typically 512x512)
   
4. **Audio Setup:**
   - Host your audio files on your server (e.g., at `https://impressto.ca/wordwalk/audio/`)
   - Update `src/soundManager.js` line 4 with the correct URL
   - Rebuild the project after updating the audio URL

## Cache Busting

The `index.php` file automatically reads the version from `package.json` and appends it as a query parameter to all asset URLs for cache busting. Increment the version in `package.json` when you make updates.

## PWA Features

- **Offline Support:** Service worker caches essential assets
- **Installable:** Users can install WordWalk as a standalone app
- **Fullscreen:** Runs in fullscreen mode on mobile devices
- **Mobile Optimized:** Prevents scrolling and provides native app-like experience
