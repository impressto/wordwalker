# Flash Cards Configuration

This directory contains flash card configurations for each category.

## Feature Flag

**To enable/disable flash cards globally**, edit `index.js`:

```javascript
export const FLASH_CARDS_ENABLED = true;  // Enable flash cards
export const FLASH_CARDS_ENABLED = false; // Disable flash cards
```

When `FLASH_CARDS_ENABLED` is `false`, the `hasFlashCards()` function will return `false` for all categories, effectively disabling the feature across the entire app.

## Quick Start

To add flash cards for a new category:

1. **Create config file**: `{category}.js`
2. **Define card mappings**: Link card indices to question IDs
3. **Import in index.js**: Add to `flashCardsConfigByCategory`
4. **Update component**: Import questions/translations in `FlashCardsDialog.jsx`

## File Structure

- `index.js` - Main entry point with helper functions and defaults
- `food.js` - Food category flash cards (example implementation)
- `animals.js.template` - Template for creating new categories
- `{category}.js` - Additional category configurations

## Configuration Format

```javascript
export const {category}FlashCardsConfig = {
  totalCards: 10,
  spriteWidth: 3600,
  spriteHeight: 240,
  canvasWidth: 360,
  canvasHeight: 240,
  
  // Required: Maps card index to question ID
  cards: [
    { questionId: '{category}_001' },
    { questionId: '{category}_002' },
    // ... 8 more
  ],
  
  // Optional: Override text styling
  text: {
    spanish: { fontSize: 30, color: '#333' },
    english: { fontSize: 20, color: '#666' },
  },
  
  // Optional: Override diamond animation
  diamond: {
    animationSpeed: 0.01,
    size: 45,
  },
};
```

## See Also

- `docs/FLASH-CARDS-CONFIG-STRUCTURE.md` - Complete documentation
- `docs/FLASH-CARDS-TEXT-RENDERING.md` - Text rendering details
- `docs/FLASH-CARDS-QUICK-REF.md` - Quick reference guide
