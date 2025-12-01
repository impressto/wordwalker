# Parallax Themes System - Developer Checklist

## Installation & Setup Checklist

### ✅ Phase 1: Verify Installation (5 minutes)

- [ ] **Verify files created:**
  ```bash
  ls src/config/parallaxThemes.js
  ls src/utils/themeManager.js
  ```

- [ ] **Verify documentation created:**
  ```bash
  ls docs/PARALLAX-THEMES*.md
  ls docs/HONG-KONG-THEME-SETUP.md
  ls docs/THEME-SELECTOR-EXAMPLES.md
  ```

- [ ] **Run build:**
  ```bash
  npm run build
  ```
  Should complete without errors

- [ ] **Check no TypeScript/ESLint errors:**
  ```bash
  npm run lint
  ```

### ✅ Phase 2: Test Default Theme (10 minutes)

- [ ] **Start dev server:**
  ```bash
  npm run dev
  ```

- [ ] **Load application in browser**

- [ ] **Verify default theme loads:**
  - Default forest background visible
  - All layers rendering correctly
  - No console errors

- [ ] **Test parallax effect:**
  - Walker moves down path
  - Layers scroll at different speeds
  - Foreground moves faster than background

- [ ] **Check localStorage persistence:**
  ```javascript
  // In browser console:
  localStorage.getItem('wordwalker-current-theme');
  // Should return 'default'
  ```

### ✅ Phase 3: Test Hong Kong Theme (15 minutes)

- [ ] **Verify theme files exist:**
  ```bash
  ls public/images/themes/hong-kong/
  # Should show 9 PNG files
  ```

- [ ] **Switch to Hong Kong theme:**
  ```javascript
  // In browser console:
  localStorage.setItem('wordwalker-current-theme', 'hong-kong');
  window.location.reload();
  ```

- [ ] **Verify theme loads:**
  - Hong Kong images appear
  - No console 404 errors for images
  - Game remains playable

- [ ] **Check layer alignment:**
  - Look for gaps between layers
  - Look for overlapping layers
  - Note any misalignments for tuning

- [ ] **Test parallax:**
  - Move walker and observe layer movement
  - Ensure smooth scrolling
  - Check depth perception looks natural

- [ ] **Switch back to default:**
  ```javascript
  localStorage.setItem('wordwalker-current-theme', 'default');
  window.location.reload();
  ```

## Configuration Checklist

### ✅ Phase 4: Verify Theme Configuration (10 minutes)

- [ ] **Check default theme config:**
  ```javascript
  import { getTheme } from './src/config/parallaxThemes.js';
  const theme = getTheme('default');
  console.log(theme);
  // Should have all required properties
  ```

- [ ] **Check Hong Kong theme config:**
  ```javascript
  const theme = getTheme('hong-kong');
  console.log(theme);
  // Should have same structure as default
  ```

- [ ] **Verify theme validation:**
  ```javascript
  import { validateTheme } from './src/utils/themeManager.js';
  
  const defaultResult = validateTheme('default');
  console.log('Default valid:', defaultResult.isValid);
  
  const hkResult = validateTheme('hong-kong');
  console.log('Hong Kong valid:', hkResult.isValid);
  
  const invalidResult = validateTheme('non-existent');
  console.log('Invalid valid:', invalidResult.isValid);
  // Last one should be false
  ```

- [ ] **Get themes list:**
  ```javascript
  import { getThemesList } from './src/utils/themeManager.js';
  const themes = getThemesList();
  console.log('Available themes:', themes);
  // Should have at least 2 themes
  ```

## Feature Testing Checklist

### ✅ Phase 5: Test All Features (20 minutes)

- [ ] **Theme switching works:**
  - Switch from default → Hong Kong → default multiple times
  - Verify game responds correctly each time
  - No flickering or visual glitches

- [ ] **Persistence works:**
  - Set theme to Hong Kong
  - Reload page (with F5)
  - Hong Kong theme persists
  - Set theme to default
  - Reload page
  - Default theme persists

- [ ] **Multiple browser tabs:**
  - Open game in tab 1
  - Open same game in tab 2
  - Change theme in tab 1
  - Reload tab 2
  - New theme appears in tab 2

- [ ] **Mobile/Responsive:**
  - Test in portrait orientation
  - Test in landscape orientation
  - Verify parallax works in both
  - Layers position correctly in both

- [ ] **Error handling:**
  - Try to set invalid theme:
    ```javascript
    localStorage.setItem('wordwalker-current-theme', 'invalid-theme');
    window.location.reload();
    // Should fall back to default, no crash
    ```

- [ ] **Console shows no errors:**
  - Open DevTools console (F12)
  - Switch themes multiple times
  - No error messages
  - No red X icons in console

## Documentation Checklist

### ✅ Phase 6: Verify Documentation (10 minutes)

- [ ] **Main documentation exists:**
  - [ ] `PARALLAX-THEMES-OVERVIEW.md` - Readable and complete
  - [ ] `PARALLAX-THEMES-QUICK-REF.md` - Clear and concise
  - [ ] `PARALLAX-THEMES.md` - Detailed and comprehensive

- [ ] **Setup documentation exists:**
  - [ ] `HONG-KONG-THEME-SETUP.md` - Complete with examples
  - [ ] `THEME-SELECTOR-EXAMPLES.md` - Multiple UI examples provided

- [ ] **Implementation documentation exists:**
  - [ ] `PARALLAX-THEMES-IMPLEMENTATION.md` - Architecture explained
  - [ ] `DOCS-INDEX.md` - Updated with theme info

- [ ] **All documents are readable:**
  - [ ] No broken links
  - [ ] Code examples are valid
  - [ ] Instructions are clear

## Next Features Checklist

### ⭕ Phase 7: Plan Next Phase (Optional)

Choose one of the following phases:

#### Option A: Tune Hong Kong Theme
- [ ] Identify layer position misalignments
- [ ] Adjust `layerPositions` values in config
- [ ] Document final tuning values
- [ ] See: `docs/HONG-KONG-THEME-SETUP.md` → "Tuning Process"

#### Option B: Create Additional Theme
- [ ] Create new folder: `public/images/themes/new-theme/`
- [ ] Add 9 PNG image files
- [ ] Add theme config to `src/config/parallaxThemes.js`
- [ ] Tune layer positions
- [ ] Test thoroughly
- [ ] See: `docs/PARALLAX-THEMES.md` → "Creating a New Theme"

#### Option C: Add Theme Selection UI
- [ ] Choose UI style: Dropdown, Grid, or Carousel
- [ ] Copy component code from `docs/THEME-SELECTOR-EXAMPLES.md`
- [ ] Add CSS styling
- [ ] Integrate into game UI
- [ ] Test user interactions
- [ ] See: `docs/THEME-SELECTOR-EXAMPLES.md`

## Production Checklist

### ✅ Phase 8: Production Readiness (15 minutes)

- [ ] **Code quality:**
  - [ ] No console errors or warnings
  - [ ] No TypeScript errors
  - [ ] ESLint passing
  - [ ] Tests passing (if any)

- [ ] **Build verification:**
  ```bash
  npm run build
  # Should complete successfully
  # dist/ folder created with no errors
  ```

- [ ] **Asset optimization:**
  - [ ] All theme images are PNG format
  - [ ] Image sizes optimized for web
  - [ ] Total assets reasonable size

- [ ] **Performance:**
  - [ ] Game still runs smooth with new theme
  - [ ] No lag during theme switching
  - [ ] Memory usage reasonable
  - [ ] No memory leaks (check DevTools)

- [ ] **Service Worker (PWA):**
  - [ ] Service worker updated with Hong Kong images:
    ```javascript
    // In public/service-worker.js:
    // Add Hong Kong theme images to CORE_ASSETS
    ```
  - [ ] PWA still works offline
  - [ ] New theme available when offline (if cached)

- [ ] **Mobile testing:**
  - [ ] Test on actual mobile device if possible
  - [ ] Touch interactions work
  - [ ] Responsive design intact
  - [ ] Orientation changes handled

- [ ] **Cross-browser testing:**
  - [ ] Chrome: ✓
  - [ ] Firefox: ✓
  - [ ] Safari: ✓
  - [ ] Edge: ✓

## Deployment Checklist

### ✅ Phase 9: Ready to Deploy

- [ ] **All checklist items above are complete**
- [ ] **Version bumped if needed**
- [ ] **CHANGELOG updated**
- [ ] **Git commit ready:**
  ```bash
  git add src/config/parallaxThemes.js
  git add src/utils/themeManager.js
  git add src/components/PathCanvas.jsx
  git add src/config/gameSettings.js
  git add docs/
  git add public/images/themes/hong-kong/
  git commit -m "feat: Add parallax themes system with Hong Kong theme"
  ```
- [ ] **Pushed to repository**
- [ ] **Ready for production deployment**

## Quick Reference

### Commands to Run

```bash
# Verify build
npm run build

# Lint check
npm run lint

# Test theme in console
localStorage.setItem('wordwalker-current-theme', 'hong-kong');
window.location.reload();

# Validate theme config
import { validateTheme } from './src/utils/themeManager.js';
console.log(validateTheme('hong-kong'));

# Get all themes
import { getThemesList } from './src/utils/themeManager.js';
console.log(getThemesList());
```

### File Locations

```
Core:
  src/config/parallaxThemes.js
  src/utils/themeManager.js
  src/components/PathCanvas.jsx (modified)

Docs:
  docs/PARALLAX-THEMES-OVERVIEW.md
  docs/PARALLAX-THEMES-QUICK-REF.md
  docs/PARALLAX-THEMES.md
  docs/PARALLAX-THEMES-IMPLEMENTATION.md
  docs/HONG-KONG-THEME-SETUP.md
  docs/THEME-SELECTOR-EXAMPLES.md
  docs/DOCS-INDEX.md (modified)

Assets:
  public/images/themes/hong-kong/
  public/images/themes/default/
```

## Troubleshooting Quick Guide

| Issue | Solution |
|-------|----------|
| Theme not loading | Check folder name matches `imagePath` in config |
| Images not found | Verify files exist in `public/images/themes/theme-id/` |
| Layers misaligned | Adjust `layerPositions` in theme config |
| Build fails | Run `npm install` to ensure dependencies installed |
| Console errors | Check browser console (F12) for specific errors |
| Theme won't switch | Verify `setActiveTheme()` called and `currentTheme` in dependencies |

## Success Criteria

✅ **System is ready when:**

- Default theme works identically to before (no regression)
- Hong Kong theme loads and renders
- Theme switching works smoothly
- localStorage persistence works
- Documentation is complete and clear
- No console errors
- Builds successfully
- All tests pass

---

**Status:** Ready to begin testing! 🚀

**Start with:** Phase 1 - Verify Installation (5 minutes)

**Current Time Estimate:** 90-120 minutes total for full testing

