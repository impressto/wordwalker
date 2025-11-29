# WordWalker PWA Deployment Checklist

Use this checklist to ensure your PWA is properly deployed and working.

## Pre-Deployment

- [ ] Update version in `package.json`
- [ ] Update `CACHE_NAME` in `public/service-worker.js` to match version
- [ ] Replace placeholder icons:
  - [ ] `public/icon-192x192.png`
  - [ ] `public/icon-512x512.png`
  - [ ] `public/icon.png`
- [ ] Verify all images exist in `public/images/`
- [ ] Verify all audio files exist in `public/audio/`
- [ ] Run `yarn build` successfully

## Deployment

- [ ] Upload entire `dist/` folder to server
- [ ] Upload `index.php` to WordWalker root
- [ ] Upload `package.json` to WordWalker root
- [ ] Verify HTTPS is enabled (required for PWA)
- [ ] Verify correct permissions on uploaded files

## Post-Deployment Verification

### Basic Functionality
- [ ] App loads correctly in browser
- [ ] No console errors in browser DevTools
- [ ] Background is black (from index.php)
- [ ] Game canvas displays correctly
- [ ] Walker sprite animates
- [ ] Question dialogs appear and work

### Volume Control
- [ ] Volume control appears in top-left corner
- [ ] Sound toggle button works (icon changes)
- [ ] Volume slider works (0-100%)
- [ ] Volume setting persists after reload
- [ ] Background music plays (after clicking anywhere)
- [ ] Sound effects play (correct, wrong, streak, choice)

### PWA Features
- [ ] Service Worker registers successfully
  - Open DevTools > Application > Service Workers
  - Should show "activated and running"
- [ ] Manifest loads correctly
  - Open DevTools > Application > Manifest
  - Should show app name, icons, colors
- [ ] Caches are populated
  - Open DevTools > Application > Cache Storage
  - Should show 4 caches: core, assets, images, audio
- [ ] Install prompt appears
  - Look for "Install App" button in bottom-right
  - OR install via browser menu

### Offline Functionality
- [ ] Test offline mode:
  1. Load app once (to cache assets)
  2. DevTools > Application > Service Workers
  3. Check "Offline" checkbox
  4. Reload page
  5. App should still work!
- [ ] Verify cached assets load offline
- [ ] Test navigation while offline
- [ ] Return online and verify app updates

### Installation Test
- [ ] Click "Install App" button (if shown)
- [ ] OR use browser menu > "Install WordWalker"
- [ ] App opens in standalone window
- [ ] App works correctly as installed PWA
- [ ] Icon appears on device home screen/app launcher

### Mobile Testing (if applicable)
- [ ] Test on actual mobile device
- [ ] App runs fullscreen (no browser UI)
- [ ] Touch controls work
- [ ] Swipe gestures work
- [ ] No scrolling/overscroll
- [ ] Volume control accessible
- [ ] Install works via "Add to Home Screen"
- [ ] Orientation locks to portrait

### Performance Testing
- [ ] Run Lighthouse audit in DevTools
  - Should score 90+ on PWA
  - Should score 80+ on Performance
- [ ] Check Network tab for cached responses
- [ ] Verify assets load quickly (from cache)
- [ ] Test with throttled connection

### Streak & Gameplay
- [ ] Streak requires 5 correct answers (not 3)
- [ ] Streak notification fades in smoothly
- [ ] Streak notification stays visible ~2 seconds
- [ ] Streak notification fades out smoothly
- [ ] Streak sound plays
- [ ] Streak resets on wrong answer

### Update Testing
- [ ] Increment version in `package.json`
- [ ] Update `CACHE_NAME` in service-worker.js
- [ ] Rebuild and redeploy
- [ ] Verify service worker updates
  - Should see "New Service Worker found" in console
- [ ] Reload to get new version
- [ ] Old caches are cleaned up

## Advanced Testing (Optional)

### Service Worker Testing
- [ ] Use `/pwa-test.html` to run automated tests
- [ ] Verify all 4 caches are populated
- [ ] Check service worker scope is correct
- [ ] Test manual cache clearing

### Cross-Browser Testing
- [ ] Chrome/Edge (full PWA support)
- [ ] Safari iOS (limited PWA, test "Add to Home Screen")
- [ ] Firefox Android (test PWA installation)
- [ ] Safari macOS (limited PWA support)

### Error Scenarios
- [ ] Test with slow/intermittent connection
- [ ] Test with airplane mode
- [ ] Test cache clearing and reload
- [ ] Test unregistering service worker
- [ ] Test mixed online/offline usage

## Troubleshooting

If something doesn't work, check:

1. **Service Worker Not Registering**
   - Verify HTTPS is enabled (or using localhost)
   - Check browser console for errors
   - Clear site data and reload

2. **Assets Not Caching**
   - Check DevTools > Application > Cache Storage
   - Verify file paths in service worker match actual paths
   - Check service worker console logs

3. **Install Button Not Showing**
   - Verify PWA criteria are met (manifest + SW + HTTPS)
   - Check if app is already installed
   - Some browsers don't support installation

4. **Audio Not Playing**
   - User must interact first (click, tap, key press)
   - Check volume is not at 0
   - Verify audio files exist in `dist/audio/`

5. **Offline Not Working**
   - Verify service worker is active
   - Check cache storage has assets
   - Try hard refresh (Ctrl+Shift+R)

## Support

For more information, see:
- `PWA-SETUP.md` - Comprehensive setup guide
- `PWA-QUICKSTART.md` - Quick start guide
- `PWA-IMPLEMENTATION-SUMMARY.md` - Technical details
- `pwa-test.html` - Automated testing tool

---

**Deployment Date:** ___________

**Version Deployed:** ___________

**Deployed By:** ___________

**Notes:**
