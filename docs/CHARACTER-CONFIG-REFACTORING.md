# Character Configuration Refactoring Summary

## Overview
All game characters are now managed through a centralized configuration file instead of being hardcoded in multiple locations. This makes it **much easier to add, remove, or modify characters** in the future.

## What Changed

### 1. **New File: `src/config/characterConfig.js`** ✨
This is the single source of truth for all character data. It contains:
- **Character definitions** - name, sprite file, avatar file, cost, description
- **Sprite sheet configuration** - dimensions and frame layout (same for all characters)
- **Helper functions** for accessing character data programmatically

### 2. **Updated: `src/components/CharacterShop.jsx`**
- **Before:** Character array was hardcoded inside the component (52 lines)
- **After:** Imports from `characterConfig` using `getAllCharacters()`
- **Benefit:** Component stays clean and focused on UI logic

### 3. **Updated: `src/hooks/useCharacterAndTheme.js`**
- **Before:** Character-to-file mapping was hardcoded (6 entries)
- **After:** Imports from `characterConfig` using `getCharacterFileMap()`
- **Benefit:** Automatically stays in sync when you add/remove characters

### 4. **Updated: `src/components/PathCanvas.jsx`**
- **Before:** Sprite sheet config was hardcoded in the component
- **After:** Imports from `characterConfig` using `getSpriteSheetConfig()`
- **Benefit:** All sprite configuration in one place

## How to Add a New Character

Adding a new character now takes just 3 simple steps:

### Step 1: Create sprite files
Place your character sprite sheets in `public/images/walkers/`:
- `walker-{characterid}.png` - Main sprite sheet (1400×600px)
- `walker-{characterid}-avatar.png` - Shop avatar (displayed in character list)

**Sprite sheet format:**
- Size: 1400×600 pixels
- Layout: 2 rows × 6 columns
  - Row 1: Walking animation (6 frames)
  - Row 2: Victory animation (6 frames)
- Frame size: ~233×300 pixels per frame

### Step 2: Add to configuration
Edit `src/config/characterConfig.js` and add to the `characters` array:

```javascript
{
  id: 'my-character',           // Unique ID (lowercase, no spaces)
  name: 'My Character',          // Display name
  spriteFile: 'walker-my-character.png',      // Must match file in public/images/walkers/
  avatarFile: 'walker-my-character-avatar.png', // Shop display avatar
  cost: 100,                     // Points cost (0 for free characters)
  description: 'Character description',  // Shown in shop
}
```

### Step 3: Build and deploy
```bash
npm run build
./deploy.sh  # or your deployment command
```

That's it! The character will automatically:
- ✅ Appear in the character shop
- ✅ Load its sprite sheet
- ✅ Be purchasable/selectable
- ✅ Persist to localStorage
- ✅ Be cached in the service worker

## Example: Adding "Ninja" Character

### 1. Create files
- `public/images/walkers/walker-ninja.png` (1400×600px sprite sheet)
- `public/images/walkers/walker-ninja-avatar.png` (shop avatar)

### 2. Update `src/config/characterConfig.js`
```javascript
const characterConfig = {
  characters: [
    // ... existing characters ...
    {
      id: 'ninja',
      name: 'Ninja',
      spriteFile: 'walker-ninja.png',
      avatarFile: 'walker-ninja-avatar.png',
      cost: 95,
      description: 'A mysterious shadow warrior',
    },
  ],
  // ... rest of config
};
```

### 3. Build and test
```bash
npm run build
npm run dev  # Test locally
```

## How to Remove a Character

Simply delete the entry from the `characters` array in `src/config/characterConfig.js`. 

The character will automatically:
- ❌ Disappear from the shop
- ❌ No longer load its sprite
- ❌ Keep any purchased instances in player's localStorage (won't cause errors)

## File Reference

### Character Configuration File Structure
```javascript
characterConfig = {
  characters: [
    {
      id: string,              // Unique identifier
      name: string,            // Display name
      spriteFile: string,      // Filename in public/images/walkers/
      avatarFile: string,      // Avatar filename
      cost: number,            // Purchase cost in points
      description: string,     // Shop description
    },
    // ... more characters
  ],
  spriteSheetConfig: {
    width: 1400,
    height: 600,
    rows: 2,
    cols: 6,
    frameWidth: 233.33,
    frameHeight: 300,
    walkingRow: 0,
    victoryRow: 1,
    totalFrames: 6,
  }
}
```

### Exported Helper Functions

```javascript
// Get all characters
getAllCharacters() → Array<Character>

// Get specific character
getCharacterById(characterId) → Character | null

// Get ID-to-filename mapping for sprite loading
getCharacterFileMap() → Object

// Get sprite sheet configuration
getSpriteSheetConfig() → Object
```

## Benefits Summary

| Before | After |
|--------|-------|
| Characters hardcoded in 3+ places | Single source of truth |
| Manual sync required | Automatic updates |
| Easy to miss files | Config-based validation |
| 52 lines duplicated in component | 1 import statement |
| Error-prone character management | Scalable, maintainable system |

## Files Modified
- ✅ `src/config/characterConfig.js` - **NEW**
- ✅ `src/components/CharacterShop.jsx` - Updated to import from config
- ✅ `src/hooks/useCharacterAndTheme.js` - Updated to import character file map
- ✅ `src/components/PathCanvas.jsx` - Updated to import sprite config
- ✅ Build successful ✨

## Testing

Test the refactoring by:
1. Building the project: `npm run build`
2. Running dev server: `npm run dev`
3. Click Points display → Character Shop opens
4. Verify all 6 characters appear and are selectable/purchasable
5. Select different characters → Sprite changes correctly
6. No console errors

## Next Steps (Optional)

Future enhancements you could implement:
- Add character rarity/tier system
- Store character metadata (stats, abilities, etc.)
- Add character sorting/filtering in shop
- Create character preview in shop
- Add character sound effects
