# Parallax Themes System

## Overview

The Parallax Themes system allows WordWalker to support multiple scene backgrounds with different parallax configurations. This enables you to create themes for different locations (e.g., forest, Hong Kong harbor, mountain village) where the vertical positioning of parallax layers differs.

## Architecture

### Core Files

1. **`src/config/parallaxThemes.js`** - Theme definitions and configurations
2. **`src/utils/themeManager.js`** - Theme management utilities
3. **`src/config/gameSettings.js`** - Global game settings (includes current theme)
4. **`src/components/PathCanvas.jsx`** - Main rendering component (uses theme configuration)

### Theme Structure

Each theme defines:

```javascript
{
  name: 'Display Name',                    // Theme name for UI
  description: 'Short description',        // Description for UI
  imagePath: 'folder-name',                // Subfolder in public/images/themes/
  layerPositions: {
    layer1: 0,   // Y-offset for foreground (pixels)
    layer2: 0,   // Y-offset for grass/street (pixels)
    layer3: -20, // Y-offset for mid-layer (pixels)
    layer4: -15, // Y-offset for mid-distant (pixels)
    layer5: -30, // Y-offset for far layer (pixels)
    layer6: 0,   // Y-offset for background (pixels)
    layer7: 0,   // Y-offset for sky (pixels)
  },
  layerSpeeds: {
    layer1: 0.8,   // Parallax speed (0.0 = static, 1.0 = moves with walker)
    layer2: 0.6,
    layer3: 0.5,
    layer4: 0.4,
    layer5: 0.3,
    layer6: 0.15,
    layer7: 0.0,   // Sky typically static
  },
  positioning: {
    horizonY: 0.35,        // Horizon line as proportion of screen height
    pathTopOffset: 0.55,   // Path start as proportion of screen height
    pathTopAdditional: 90, // Additional pixel offset for path
  },
}
```

## Creating a New Theme

### Step 1: Create Theme Folder

Create a new folder in `public/images/themes/`:

```
public/images/themes/
├── default/
│   ├── parallax-layer1.png
│   ├── parallax-layer2.png
│   ├── ... (layers 3-7)
│   ├── path.png
│   └── path-fork.png
└── hong-kong/
    ├── parallax-layer1.png
    ├── parallax-layer2.png
    ├── ... (layers 3-7)
    ├── path.png
    └── path-fork.png
```

**Required image files per theme:**
- `parallax-layer1.png` - Foreground layer
- `parallax-layer2.png` - Grass/midground layer
- `parallax-layer3.png` - Mid layer (bushes, shrubs)
- `parallax-layer4.png` - Mid-distant layer
- `parallax-layer5.png` - Far layer
- `parallax-layer6.png` - Background (mountains, buildings)
- `parallax-layer7.png` - Sky/rear static background
- `path.png` - Walking path
- `path-fork.png` - Path fork for choices

### Step 2: Add Theme Configuration

Edit `src/config/parallaxThemes.js` and add your theme:

```javascript
'my-theme': {
  name: 'My Theme Name',
  description: 'My Theme Description',
  imagePath: 'my-theme',  // Must match folder name
  layerPositions: {
    layer1: 0,
    layer2: 0,
    layer3: -20,   // Adjust based on artwork
    layer4: -15,   // Adjust based on artwork
    layer5: -30,   // Adjust based on artwork
    layer6: 0,
    layer7: 0,
  },
  layerSpeeds: {
    layer1: 0.8,
    layer2: 0.6,
    layer3: 0.5,
    layer4: 0.4,
    layer5: 0.3,
    layer6: 0.15,
    layer7: 0.0,
  },
  positioning: {
    horizonY: 0.35,        // Adjust horizon line if needed
    pathTopOffset: 0.55,   // Adjust path position if needed
    pathTopAdditional: 90, // Adjust if needed
  },
},
```

### Step 3: Fine-tune Positioning

The positioning values might need tweaking based on your artwork:

- **`layerPositions[layerX]`** - Positive values move layer down, negative move up. Use these when your artwork layers don't align with the default positions.
- **`horizonY`** - Where the horizon line appears (0.35 = 35% from top)
- **`pathTopOffset`** and **`pathTopAdditional`** - Adjust if your theme has a different path position

Run the game and observe how layers align. Adjust small increments (±5 to ±20 pixels typically).

## Using Themes in Code

### Switching Themes Programmatically

```javascript
import { setActiveTheme, getThemesList } from '../utils/themeManager';

// Switch to a theme
setActiveTheme('hong-kong');

// Get list of available themes
const themes = getThemesList();
// Returns: [
//   { id: 'default', name: 'Default Forest', description: '...' },
//   { id: 'hong-kong', name: 'Hong Kong Harbor', description: '...' },
// ]

// Validate a theme before applying
import { validateTheme } from '../utils/themeManager';
const validation = validateTheme('my-theme');
if (validation.isValid) {
  setActiveTheme('my-theme');
} else {
  console.error('Invalid theme:', validation.messages);
}
```

### In React Components

The `PathCanvas` component automatically uses the current theme from localStorage:

```javascript
const [currentTheme, setCurrentTheme] = useState(() => {
  return localStorage.getItem('wordwalker-current-theme') || gameSettings.parallax.currentTheme;
});
```

To change theme and have it apply immediately:

```javascript
const handleThemeChange = (newThemeId) => {
  setCurrentTheme(newThemeId);  // Updates state
  // Component re-renders with new theme automatically
};
```

### Theme Configuration Object

Get the current active theme configuration:

```javascript
import { getTheme } from '../config/parallaxThemes';

const currentTheme = getTheme('hong-kong');
console.log(currentTheme.name);           // 'Hong Kong Harbor'
console.log(currentTheme.layerPositions); // { layer1: 0, layer2: 0, ... }
console.log(currentTheme.layerSpeeds);    // { layer1: 0.8, layer2: 0.6, ... }
```

## Image Requirements

### Image Dimensions

Typical dimensions for each layer (can vary by theme):
- Most layers: 1200-1600px wide × 300-400px tall
- `parallax-layer2.png` (grass): Should tile seamlessly horizontally
- `path.png`: 240×240px (tiles seamlessly)
- `path-fork.png`: 240×240px (tiles seamlessly)

### Seamless Tiling

Layer images should be designed to tile seamlessly:
- Left and right edges should connect smoothly when repeated
- Use transparent backgrounds where needed for proper layering

### Parallax Layer Order (Front to Back)

1. **Layer 7** - Sky (static background, infinite distance)
2. **Layer 6** - Mountains/background buildings
3. **Layer 5** - Far distance trees/structures
4. **Layer 4** - Mid-distant trees/structures
5. **Layer 3** - Bushes/shrubs (just above path)
6. **Layer 2** - Grass/street (at path level)
7. **Layer 1** - Foreground elements (closest to camera)

## Testing Themes

1. **Verify theme loads:**
   ```javascript
   localStorage.setItem('wordwalker-current-theme', 'your-theme');
   ```
   Then reload the page and check browser console for any errors.

2. **Check alignment:**
   Look for gaps or overlaps between layers. Adjust `layerPositions` values.

3. **Check parallax speeds:**
   Ensure layer movement feels natural (slower for distant layers).

4. **Test on multiple devices:**
   Check portrait and landscape orientations on different screen sizes.

## Layer Position Tuning Guide

When adding a new theme, use this process to find correct `layerPositions` values:

1. **Start with zeros:** Set all `layerPositions[layerX]: 0`
2. **Load game and observe:** Note which layers have gaps or overlap
3. **Adjust incrementally:** ±5-10 pixels at a time
4. **Document final values:** Save working values in your theme config

Example for Hong Kong theme where buildings align differently:

```javascript
layerPositions: {
  layer1: 0,      // Foreground looks fine
  layer2: 0,      // Grass level is correct
  layer3: -15,    // Buildings start 15px higher
  layer4: -20,    // Mid buildings 20px higher
  layer5: -25,    // Far buildings 25px higher
  layer6: 0,      // Background buildings OK
  layer7: 0,      // Sky is fine
}
```

## Service Worker Caching

When adding new themes, update the Service Worker to cache the new image files:

In `public/service-worker.js`, add your theme images to the appropriate cache array:

```javascript
const CORE_ASSETS = [
  // ... existing assets
  // Hong Kong theme
  '/wordwalker/dist/images/themes/hong-kong/parallax-layer1.png',
  '/wordwalker/dist/images/themes/hong-kong/parallax-layer2.png',
  // ... other layers
];
```

## Troubleshooting

### Theme not loading
- Check that folder name in `public/images/themes/` matches `imagePath` in config
- Verify all 9 image files are present in the theme folder
- Check browser console for image loading errors

### Layers misaligned
- Adjust `layerPositions` values (see tuning guide above)
- Check image dimensions match expected sizes
- Verify images tile seamlessly

### Parallax looks wrong
- Check `layerSpeeds` values (0.0 = static, higher = faster movement)
- Ensure values range from 0.0 to 1.0
- Layer 7 should always be 0.0

### Theme switches but doesn't render
- Add `currentTheme` to the `useEffect` dependency array in PathCanvas
- Verify theme validation passes using `validateTheme()`
- Check that all image files exist and paths are correct

## Default Theme Values Reference

```javascript
layerPositions: {
  layer1: 0,
  layer2: 0,
  layer3: -20,
  layer4: -15,
  layer5: -30,
  layer6: 0,
  layer7: 0,
},
layerSpeeds: {
  layer1: 0.8,   // Foreground moves with walker
  layer2: 0.6,   // Grass layer
  layer3: 0.5,   // Mid layer
  layer4: 0.4,   // Mid-distant
  layer5: 0.3,   // Far layer
  layer6: 0.15,  // Mountains (very slow movement)
  layer7: 0.0,   // Sky (no movement)
},
positioning: {
  horizonY: 0.35,        // Horizon at 35% from top
  pathTopOffset: 0.55,   // Path starts at 55% from top
  pathTopAdditional: 90, // Plus 90 pixels down
},
```

## Future Enhancements

Possible future improvements to the theme system:

- **Theme preview UI** - Show thumbnail of each theme in settings
- **Dynamic theme switching UI** - Add theme selector to game menu
- **Per-category themes** - Different themes for different question categories
- **Time-based themes** - Change themes based on time of day/season
- **Custom theme uploads** - Allow users to create custom themes
- **Theme animations** - Transition effects when switching themes
- **Difficulty themes** - Different visual themes for difficulty levels

