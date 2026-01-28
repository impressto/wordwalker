# Theme Shop Feature - Implementation Guide

## Overview

The Theme Shop is an in-game purchasing system that allows players to buy different parallax themes with earned points. The default forest theme is free, while other themes (like Hong Kong Harbor) can be purchased using game points.

## How It Works

### For Players

1. **Open Character Shop** - Click the character shop button in the game
2. **Navigate to Themes Tab** - Click the "Themes" tab to see available themes
3. **Purchase Themes** - If you have enough points, click "Buy for [cost]" to purchase a theme
4. **Select Theme** - Once owned, click "Select" to switch to that theme
5. **Theme Persists** - Your selected theme is saved automatically

### Points System

- **Earn Points** - By answering questions correctly in the game
- **Spend Points** - Purchase new themes in the shop
- **Points Display** - See your available points at the top of the shop

## Configuration

### Adding/Modifying Themes

Edit `src/config/themeShopConfig.js`:

```javascript
const themeShopConfig = {
  themes: [
    {
      id: 'default',
      name: 'Default Forest',
      description: 'Original forest landscape',
      cost: 0,  // Free theme
      thumbnail: 'scene.jpg',
    },
    {
      id: 'hong-kong',
      name: 'Hong Kong Harbor',
      description: 'Urban harbor landscape',
      cost: 150,  // Purchase cost in points
      thumbnail: 'scene.jpg',
    },
    // Add more themes here
  ],
};
```

### Required Image Files

For each theme, you need:
1. **Thumbnail image** - `public/images/themes/{themeId}/scene.jpg`
   - Used in the shop display
   - Recommended size: 400x300px or similar aspect ratio
   - Shows preview of the theme scene
   
2. **Theme images** - `public/images/themes/{themeId}/parallax-layer1.png` through `layer7.png` and `path.png`, `path-fork.png`
   - Already configured in `src/config/parallaxThemes.js`

## File Structure

### New Files
- **`src/config/themeShopConfig.js`** - Theme shop configuration (costs, names, descriptions)

### Modified Files
- **`src/components/CharacterShop.jsx`** - Added tab navigation and theme grid
- **`src/components/CharacterShop.css`** - Added tab and theme card styles
- **`src/components/PathCanvas.jsx`** - Added theme purchase/selection handlers and state

### Configuration Files (No Changes Needed)
- **`src/config/parallaxThemes.js`** - Contains rendering configuration (no changes needed)
- **`src/utils/themeManager.js`** - Contains utility functions (no changes needed)

## Component Props

### CharacterShop Component

**New Props:**
```javascript
{
  // Theme-related props
  ownedThemes: string[],              // Array of theme IDs player owns
  currentTheme: string,               // Currently selected theme ID
  onPurchaseTheme: (themeId, cost) => void,  // Purchase handler
  onSelectTheme: (themeId) => void,   // Select handler
  
  // Existing character props
  totalPoints: number,
  ownedCharacters: string[],
  currentCharacter: string,
  onPurchase: (charId, cost) => void,
  onSelectCharacter: (charId) => void,
  onClose: () => void,
}
```

## Data Persistence

### localStorage Keys

- **`wordwalker-owned-themes`** - Array of purchased theme IDs
  ```javascript
  JSON.parse(localStorage.getItem('wordwalker-owned-themes'))
  // Returns: ['default', 'hong-kong']
  ```

- **`wordwalker-current-theme`** - Currently selected theme ID
  ```javascript
  localStorage.getItem('wordwalker-current-theme')
  // Returns: 'hong-kong'
  ```

### Data Structure

```javascript
// Initial state (first time)
{
  ownedThemes: ['default'],
  currentTheme: 'default',
}

// After purchasing Hong Kong theme
{
  ownedThemes: ['default', 'hong-kong'],
  currentTheme: 'hong-kong',
}
```

## Adding a New Theme

### Step 1: Create Theme Images
```bash
mkdir public/images/themes/my-theme
# Add parallax-layer1.png through layer7.png
# Add path.png and path-fork.png
# Add scene.jpg (shop thumbnail)
```

### Step 2: Add to parallaxThemes.js
```javascript
'my-theme': {
  name: 'My Theme',
  description: 'My theme description',
  imagePath: 'my-theme',
  layerPositions: { /* ... */ },
  layerSpeeds: { /* ... */ },
  positioning: { /* ... */ },
}
```

See: `docs/PARALLAX-THEMES.md` for detailed positioning help

### Step 3: Add to themeShopConfig.js
```javascript
{
  id: 'my-theme',
  name: 'My Theme',
  description: 'My theme description',
  cost: 200,  // Set purchase cost
  thumbnail: 'scene.jpg',
}
```

### Step 4: Create Thumbnail
- Create or find an appropriate scene image
- Save as `public/images/themes/my-theme/scene.jpg`
- Recommended: 400x300px or larger

### Step 5: Update Service Worker (if using PWA)
In `public/service-worker.js`, add theme images to cache:
```javascript
const CORE_ASSETS = [
  // ... existing assets
  '/wordwalker/dist/images/themes/my-theme/scene.jpg',
  '/wordwalker/dist/images/themes/my-theme/parallax-layer1.png',
  // ... other layers
];
```

## UI/UX Features

### Shop Tabs
- **Characters Tab** - Browse and buy characters
- **Themes Tab** - Browse and buy themes
- Easy switching between tabs with visual feedback

### Theme Cards
Shows for each theme:
- **Thumbnail** - Visual preview of the theme
- **Name** - Theme display name
- **Description** - Short description of the theme
- **Cost** - Purchase price in points
- **Status Badge** - Shows "Free", "Owned", or points needed

### Action Buttons
- **"Free"** - Default theme (no button action needed)
- **"Buy for X"** - Available if you have enough points
- **"Select"** - Available if you already own the theme
- **"✓ Selected"** - Shows current active theme
- **"Need X more"** - Shown if you can't afford it

### Visual Feedback
- **Unaffordable** - Cards fade out if you can't afford them
- **Selected** - Green highlight for current theme
- **Hover** - Blue border and shadow on hover
- **Active Tab** - Blue underline shows active tab

## Point Costs

Recommended point costs for themes:
- **Default**: 0 (Always free)
- **Hong Kong**: 150-200 (Unique urban setting)
- **Mountain**: 175-225 (High altitude scenery)
- **Beach**: 150-200 (Tropical setting)
- **Space**: 250+ (Advanced/premium theme)

Consider:
- Player progression (earned points by level)
- Visual uniqueness
- Complexity of theme artwork

## Gameplay Integration

### Earning Points
Points are earned from:
- Correct answers: Base points (configurable in gameSettings.js)
- Streak bonuses: Extra points for consecutive correct answers

### Spending Strategy
Players might purchase themes to:
- Customize their gameplay experience
- Visually reward their progress
- Try different environments

## Testing the Feature

### Manual Testing

1. **Test Purchase:**
   ```javascript
   // In console:
   localStorage.setItem('wordwalker-totalPoints', '300');
   window.location.reload();
   // Open shop → Themes tab → Should be able to buy Hong Kong
   ```

2. **Test Persistence:**
   ```javascript
   // Purchase a theme, then:
   window.location.reload();
   // Theme should still be owned and selected
   ```

3. **Test Affordability:**
   ```javascript
   // Set low points:
   localStorage.setItem('wordwalker-totalPoints', '50');
   window.location.reload();
   // Hong Kong theme should show "Need 100 more"
   ```

### Browser DevTools

Check localStorage after each action:
```javascript
// View all shop-related data
JSON.parse(localStorage.getItem('wordwalker-owned-themes'))
localStorage.getItem('wordwalker-current-theme')
localStorage.getItem('wordwalker-totalPoints')
```

## Troubleshooting

### Themes don't appear in shop
- Check `themeShopConfig.js` - is the theme listed?
- Verify `src/config/parallaxThemes.js` has matching theme ID
- Check browser console for errors

### Thumbnail not showing
- Verify file exists: `public/images/themes/{themeId}/scene.jpg`
- Check image path in themeShopConfig (should be just filename)
- Verify file is properly formatted JPG

### Can't purchase theme
- Check you have enough points
- Verify theme cost is set in themeShopConfig
- Check that onPurchaseTheme handler is called
- Verify points are being deducted from totalPoints

### Theme doesn't switch
- Verify handleSelectTheme is called
- Check currentTheme state updates
- Verify setActiveTheme() from parallaxThemes works
- Check browser console for errors

## Future Enhancements

Possible improvements:
1. **Theme Unlock Progression** - Unlock themes after reaching milestones
2. **Seasonal Themes** - Different themes for seasons/holidays
3. **Bundle Discounts** - Buy multiple themes for reduced price
4. **Preview Mode** - Try theme before purchasing
5. **Theme Ratings** - Players rate themes
6. **Community Themes** - User-created and shared themes
7. **Limited Time Themes** - Time-limited seasonal themes
8. **Achievement Themes** - Free themes for completing challenges

## API Reference

### themeShopConfig.js Functions

```javascript
import { getShopThemes, getShopTheme, getThemeCost } from '../config/themeShopConfig';

// Get all themes
const themes = getShopThemes();

// Get specific theme
const theme = getShopTheme('hong-kong');
// Returns: { id: 'hong-kong', name: '...', cost: 150, ... }

// Get theme cost
const cost = getThemeCost('hong-kong');
// Returns: 150
```

### PathCanvas.jsx Handlers

```javascript
// Purchase theme with points
handlePurchaseTheme(themeId, cost)
// - Deducts cost from totalPoints
// - Adds theme to ownedThemes
// - Automatically selects new theme

// Select owned theme
handleSelectTheme(themeId)
// - Sets currentTheme
// - Updates localStorage
// - Applies theme rendering changes
```

## Summary

The Theme Shop seamlessly integrates theme purchasing with the existing character shop. Players earn points through gameplay and spend them on both characters and themes, providing meaningful progression and customization options.

