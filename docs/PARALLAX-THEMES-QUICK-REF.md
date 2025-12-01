# Parallax Themes Quick Reference

## Quick Start

### 1. Add Theme Images

Create folder: `public/images/themes/your-theme/`

Required files:
```
parallax-layer1.png (foreground)
parallax-layer2.png (grass)
parallax-layer3.png (mid-layer)
parallax-layer4.png (mid-distant)
parallax-layer5.png (far)
parallax-layer6.png (background)
parallax-layer7.png (sky)
path.png
path-fork.png
```

### 2. Add Theme Config

Edit `src/config/parallaxThemes.js`:

```javascript
'your-theme': {
  name: 'Display Name',
  description: 'Short description',
  imagePath: 'your-theme',
  layerPositions: {
    layer1: 0, layer2: 0, layer3: -20, layer4: -15,
    layer5: -30, layer6: 0, layer7: 0,
  },
  layerSpeeds: {
    layer1: 0.8, layer2: 0.6, layer3: 0.5, layer4: 0.4,
    layer5: 0.3, layer6: 0.15, layer7: 0.0,
  },
  positioning: {
    horizonY: 0.35,
    pathTopOffset: 0.55,
    pathTopAdditional: 90,
  },
},
```

### 3. Switch Themes in Code

```javascript
import { setActiveTheme } from '../utils/themeManager';

setActiveTheme('your-theme');
```

## Key Concepts

### Layer Positions
- **Positive value** = move layer down
- **Negative value** = move layer up
- Use to align layers for your artwork

Example: Layer 3 needs to move up 20px
```javascript
layer3: -20,  // Moves up 20 pixels
```

### Layer Speeds (Parallax)
- **0.0** = Static (sky)
- **0.5** = Medium parallax
- **0.8** = Fast parallax (foreground)
- **1.0** = Moves exactly with walker

```javascript
layer7: 0.0,   // Sky doesn't move
layer6: 0.15,  // Mountains move slowly
layer2: 0.6,   // Grass moves faster
layer1: 0.8,   // Foreground moves fastest
```

### Positioning
- **`horizonY`** = Where horizon line appears (0.35 = 35% from top)
- **`pathTopOffset`** = Path position (0.55 = 55% from top)
- **`pathTopAdditional`** = Extra pixel offset (usually 90px)

## Theme List

Get all available themes:
```javascript
import { getThemesList } from '../utils/themeManager';

const themes = getThemesList();
// [
//   { id: 'default', name: 'Default Forest', description: '...' },
//   { id: 'hong-kong', name: 'Hong Kong Harbor', description: '...' },
// ]
```

## Get Current Theme

```javascript
import { getTheme } from '../config/parallaxThemes';

const theme = getTheme('your-theme');
console.log(theme.name);           // 'Display Name'
console.log(theme.layerPositions); // { layer1: 0, ... }
console.log(theme.layerSpeeds);    // { layer1: 0.8, ... }
```

## Validate Theme

```javascript
import { validateTheme } from '../utils/themeManager';

const result = validateTheme('your-theme');
if (result.isValid) {
  console.log('Theme is valid');
} else {
  console.error('Invalid:', result.messages);
}
```

## In React

Component automatically uses current theme:
```javascript
const [currentTheme, setCurrentTheme] = useState(() => {
  return localStorage.getItem('wordwalker-current-theme') || 'default';
});

// Change theme
const handleThemeChange = (themeId) => {
  setCurrentTheme(themeId);  // Auto-re-renders with new theme
};
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Theme not loading | Check folder name matches `imagePath` |
| Layers misaligned | Adjust `layerPositions` values |
| Missing images | Ensure all 9 image files exist |
| Parallax wrong | Check `layerSpeeds` values (0.0-1.0) |
| Theme not switching | Add `currentTheme` to useEffect dependency |

## Layer Order (Front to Back)

```
Layer 1 ← Foreground (closest)
Layer 2 ← Grass/Street
Layer 3 ← Bushes/Shrubs
Layer 4 ← Mid-distant trees/buildings
Layer 5 ← Far distance trees/buildings
Layer 6 ← Mountains/background buildings
Layer 7 ← Sky (farthest)
```

## Default Theme Values

```javascript
layerPositions: { layer1: 0, layer2: 0, layer3: -20, layer4: -15, 
                  layer5: -30, layer6: 0, layer7: 0 }

layerSpeeds: { layer1: 0.8, layer2: 0.6, layer3: 0.5, layer4: 0.4,
               layer5: 0.3, layer6: 0.15, layer7: 0.0 }

positioning: { horizonY: 0.35, pathTopOffset: 0.55, pathTopAdditional: 90 }
```

## Files to Edit

- `src/config/parallaxThemes.js` - Add theme definitions
- `src/config/gameSettings.js` - Set default theme (optional)
- Component using themes - Import and use `getTheme()`, `setActiveTheme()`
- `public/service-worker.js` - Cache new theme images

## API Quick Reference

```javascript
// Get theme config
getTheme(themeId)

// Get all theme IDs
getThemeIds()

// Check if theme exists
themeExists(themeId)

// Set active theme (localStorage)
setActiveTheme(themeId)

// Get active theme ID
getActiveTheme()

// Get current theme config
getCurrentThemeConfig()

// Get themes as array for UI
getThemesList()

// Validate theme
validateTheme(themeId)
```

