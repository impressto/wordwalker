# Hong Kong Theme - Setup & Tuning Guide

## Current Status

✅ **Hong Kong theme is pre-configured and ready to use!**

The Hong Kong theme configuration has been added to the system with initial positioning values based on the default forest theme. You can now test it and fine-tune the layer positions.

## Quick Test

### Test 1: Load Hong Kong Theme

```javascript
// In browser console:
localStorage.setItem('wordwalker-current-theme', 'hong-kong');
window.location.reload();
```

### Test 2: Check Theme Config

```javascript
// In browser console:
import { getTheme } from './src/config/parallaxThemes.js';
const theme = getTheme('hong-kong');
console.log(theme);
```

## What You'll See

When Hong Kong theme loads:
- Background images from `public/images/themes/hong-kong/`
- Layer positioning from the configuration
- Parallax effect as you move the walker

## Tuning Layer Positions

If layers don't align perfectly with your Hong Kong images, adjust `layerPositions` values:

### Location: `src/config/parallaxThemes.js`

```javascript
'hong-kong': {
  name: 'Hong Kong Harbor',
  description: 'Urban harbor landscape',
  imagePath: 'hong-kong',
  layerPositions: {
    layer1: 0,      // Foreground - adjust if needed
    layer2: 0,      // Street level - adjust if needed
    layer3: -20,    // Buildings/structures - USUALLY NEEDS ADJUSTMENT
    layer4: -15,    // Mid-distant buildings - USUALLY NEEDS ADJUSTMENT
    layer5: -30,    // Distant buildings - USUALLY NEEDS ADJUSTMENT
    layer6: 0,      // Background buildings - adjust if needed
    layer7: 0,      // Sky - usually OK
  },
  // ... rest of config
},
```

## Tuning Process

### Step 1: Observe Alignment

Run the game with Hong Kong theme and look for:
- **Gaps between layers** - layers too far apart
- **Overlaps** - layers too close together
- **Misaligned horizons** - background doesn't start at right height

### Step 2: Identify Problem Layers

Note which layers have gaps or overlaps.

### Step 3: Adjust in Small Increments

For each problem layer, adjust `layerPositions` by ±5 to ±10 pixels:

```javascript
// If layer 3 (buildings) has a 15px gap above it, move it up:
layer3: -20,  // was 0, moved up 20px

// If layer 4 overlaps layer 3 too much, move it up less:
layer4: -10,  // was -15, moved down 5px

// If layer 5 (distant) is too low, move it up more:
layer5: -40,  // was -30, moved up 10px more
```

### Step 4: Test & Iterate

Reload game and observe the changes. Repeat until aligned properly.

### Step 5: Document Final Values

Once aligned, save the working values in `parallaxThemes.js`.

## Example Adjustment Workflow

**Initial observation:** Layer 3 has 20px gap between it and layer 4

**Step 1:** Increase layer3's upward movement
```javascript
layer3: -20,  // ← was: 0
```

**Step 2:** Check result - looks better but now overlaps layer 4

**Step 3:** Increase layer4's upward movement too
```javascript
layer4: -20,  // ← was: -15
```

**Step 4:** Check result - still overlaps

**Step 5:** Move layer5 to give more space
```javascript
layer5: -35,  // ← was: -30
```

**Final:** All layers aligned properly ✅

## Parallax Speeds

Current speeds are copied from the default theme. If your Hong Kong artwork has different depth, you might adjust speeds:

```javascript
layerSpeeds: {
  layer1: 0.8,   // Foreground (closest) - fast movement
  layer2: 0.6,   // Street level
  layer3: 0.5,   // Buildings
  layer4: 0.4,   // Mid-distant buildings
  layer5: 0.3,   // Far buildings
  layer6: 0.15,  // Background (very slow)
  layer7: 0.0,   // Sky (no movement)
},
```

Adjust if parallax movement feels unnatural for your artwork.

## Screen Positioning

If your Hong Kong artwork has a different horizon or path position, adjust:

```javascript
positioning: {
  horizonY: 0.35,        // Horizon at 35% from top - adjust if needed
  pathTopOffset: 0.55,   // Path starts at 55% from top - adjust if needed
  pathTopAdditional: 90, // Plus 90 pixels - adjust if needed
},
```

## Switching Between Themes

### In Code

```javascript
import { setActiveTheme } from '../utils/themeManager';

// Switch to Hong Kong
setActiveTheme('hong-kong');

// Switch back to default
setActiveTheme('default');
```

### Via localStorage

```javascript
// Test Hong Kong
localStorage.setItem('wordwalker-current-theme', 'hong-kong');

// Test Default
localStorage.setItem('wordwalker-current-theme', 'default');

// Always reload page after changing
window.location.reload();
```

## Comparison: Default vs Hong Kong

| Aspect | Default | Hong Kong |
|--------|---------|-----------|
| Setting | Forest | Urban Harbor |
| Layer 6 | Mountains | Buildings |
| Layer 5 | Far trees | Distant buildings |
| Layer 4 | Mid trees | Mid buildings |
| Layer 3 | Bushes | Structures |
| Layer 2 | Grass | Street/pavement |
| Layer 1 | Foreground trees | Foreground elements |

## Image Files Needed

For Hong Kong theme in `public/images/themes/hong-kong/`:

```
parallax-layer1.png     - Foreground urban elements
parallax-layer2.png     - Street/ground level
parallax-layer3.png     - Structures/railings
parallax-layer4.png     - Mid-distance buildings
parallax-layer5.png     - Far distance buildings
parallax-layer6.png     - Background buildings/skyline
parallax-layer7.png     - Sky background
path.png                - Walking path on street
path-fork.png           - Path fork for choices
```

## Troubleshooting

### Theme not loading
- Check that all files exist in `public/images/themes/hong-kong/`
- Check browser console for image loading errors
- Verify file names match exactly (case-sensitive)

### Layers misaligned
- Use the tuning process above
- Start with small adjustments (±5px)
- Test after each change
- Check layer order is correct (see Layer Order section)

### Parallax looks wrong
- Check `layerSpeeds` values are between 0.0 and 1.0
- Verify layer 7 (sky) is always 0.0
- Test on different screen sizes and orientations

### Path not visible
- Check `path.png` and `path-fork.png` exist
- Verify `positioning` values place path at reasonable height
- Ensure path images tile seamlessly horizontally

## Advanced: Comparing Layer Images

Use browser dev tools to inspect rendered theme:

```javascript
// In console while Hong Kong theme is loaded:
const images = document.querySelectorAll('canvas');
console.log('Canvas size:', images[0].width, 'x', images[0].height);

// Or manually check network tab for loaded images
// Should see requests to: /wordwalker/dist/images/themes/hong-kong/*
```

## Keyboard Testing (Optional)

Add temporary keyboard shortcuts to quickly test themes:

```javascript
// In PathCanvas.jsx, in the animate() function or effect:
document.addEventListener('keydown', (e) => {
  if (e.key === 'd') setCurrentTheme('default');
  if (e.key === 'h') setCurrentTheme('hong-kong');
});
```

Then press 'd' to switch to default, 'h' to switch to Hong Kong during gameplay.

## Next Steps

1. ✅ **Test** - Load Hong Kong theme and observe
2. 🔧 **Tune** - Adjust layer positions as needed
3. 📝 **Document** - Save final positioning values
4. 🎨 **Enhance** - Add UI for theme selection (see THEME-SELECTOR-EXAMPLES.md)
5. 🚀 **Deploy** - Push to production

## Reference

- Full guide: `PARALLAX-THEMES.md`
- Quick ref: `PARALLAX-THEMES-QUICK-REF.md`
- API ref: See `themeManager.js` for available functions

