# Flash Cards Configuration Migration Summary

## Overview
Flash card configurations have been reorganized into a modular structure similar to the questions configuration. Each category now has its own configuration file.

## New Structure

### Directory Layout
```
src/config/flash-cards/
├── index.js              # Main entry point with utilities
├── food.js               # Food category configuration
├── animals.js.template   # Template for new categories
└── README.md             # Quick reference
```

### Key Files

#### `index.js`
- Exports `defaultFlashCardsConfig` with default settings
- Exports `flashCardsConfigByCategory` mapping categories to configs
- Provides helper functions:
  - `getFlashCardConfig(category)` - Get merged config
  - `getFlashCardData(category, cardIndex, questions, translations)` - Get card data
  - `getCardSourceRect(cardIndex, config)` - Calculate sprite position
  - `hasFlashCards(category)` - Check if category has flash cards
  - `getFlashCardCategories()` - List all flash card categories

#### `food.js`
- Exports `foodFlashCardsConfig`
- Maps 10 cards to question IDs
- Includes text and diamond configuration
- Featured words: watermelon, banana, apple, orange, pineapple, pizza, hamburger, taco, chicken, ice cream

#### `animals.js.template`
- Template for creating new category configurations
- Shows all available options
- Includes helpful comments

## Migration Changes

### Before (Old Structure)
```javascript
// src/config/flashCardsConfig.js
import { getFlashCardConfig } from '../config/flashCardsConfig';

// All categories in one file
export const flashCardsConfig = {
  default: { /* settings */ },
  food: { /* food config */ },
  // More categories would clutter this file
};
```

### After (New Structure)
```javascript
// src/config/flash-cards/index.js
import { getFlashCardConfig } from '../config/flash-cards';

// Individual category files
import { foodFlashCardsConfig } from './food.js';
import { animalsFlashCardsConfig } from './animals.js';

export const flashCardsConfigByCategory = {
  food: foodFlashCardsConfig,
  animals: animalsFlashCardsConfig,
};
```

## Component Updates

### FlashCardsDialog.jsx
Changed import from:
```javascript
import { getFlashCardConfig } from '../config/flashCardsConfig';
```

To:
```javascript
import { getFlashCardConfig } from '../config/flash-cards';
```

**Note**: The API remains identical - no other changes needed in the component!

## Benefits

### 1. Better Organization
- Each category in its own file
- Easier to find and edit specific category configs
- Follows same pattern as questions configuration

### 2. Scalability
- Easy to add new categories without modifying core files
- Clear separation of concerns
- Reduced file size per configuration

### 3. Maintainability
- Changes to one category don't affect others
- Template file makes it easy to create new categories
- Consistent structure across all category configs

### 4. Developer Experience
- README in the folder provides quick reference
- Template file shows all available options
- Clear documentation of the structure

## Adding a New Category

### 1. Create the Config File
Copy the template and customize:
```bash
cp src/config/flash-cards/animals.js.template src/config/flash-cards/shopping.js
```

Edit `shopping.js`:
```javascript
export const shoppingFlashCardsConfig = {
  totalCards: 10,
  cards: [
    { questionId: 'shopping_001' },
    // ... more cards
  ],
};
```

### 2. Register in index.js
```javascript
import { shoppingFlashCardsConfig } from './shopping.js';

export const flashCardsConfigByCategory = {
  food: foodFlashCardsConfig,
  shopping: shoppingFlashCardsConfig, // Add here
};
```

### 3. Update FlashCardsDialog.jsx
```javascript
import { shoppingQuestions } from '../config/questions/shopping';
import { shoppingAnswerTranslations } from '../config/translations/answers/shopping';

const questionsData = category === 'food' ? foodQuestions 
                    : category === 'shopping' ? shoppingQuestions 
                    : [];
const answerTranslations = category === 'food' ? foodAnswerTranslations
                          : category === 'shopping' ? shoppingAnswerTranslations
                          : {};
```

## Configuration Options Reference

### Required Fields
- `totalCards`: Number of cards (typically 10)
- `spriteWidth`: Sprite sheet width in pixels
- `spriteHeight`: Sprite sheet height in pixels
- `canvasWidth`: Display canvas width
- `canvasHeight`: Display canvas height
- `cards`: Array of `{ questionId }` objects

### Optional Overrides
All optional fields inherit from `defaultFlashCardsConfig` if not specified:

- `offsetX`, `offsetY`: Sprite alignment adjustments
- `cardSpacing`: Spacing between cards in sprite
- `text.spanish`: Spanish text styling (fontSize, color, etc.)
- `text.english`: English text styling
- `text.verticalSpacing`: Space between Spanish and English
- `text.topMargin`: Top margin for text
- `diamond.*`: Diamond animation settings

## Backward Compatibility

The old `flashCardsConfig.js` file can be safely deleted as all functionality has been moved to the new structure. The API surface remains the same:

- ✅ `getFlashCardConfig(category)` - Works identically
- ✅ `getFlashCardData(...)` - Works identically  
- ✅ `getCardSourceRect(...)` - Works identically
- ✅ Component imports - Just update the import path

## Documentation

### New Docs
- `docs/FLASH-CARDS-CONFIG-STRUCTURE.md` - Complete configuration guide
- `src/config/flash-cards/README.md` - Quick reference in the code

### Updated Docs
- `docs/FLASH-CARDS-TEXT-RENDERING.md` - Still valid, mentions new path

### Templates
- `src/config/flash-cards/animals.js.template` - Category template

## Testing

Verify the migration:
1. Run the app
2. Play the food category
3. Maintain a streak
4. Complete the category
5. Flash cards should appear with text overlays
6. All 10 cards should display correctly

## Next Steps

To add flash cards to other categories:
1. Create a config file using the template
2. Select 10 representative vocabulary items
3. Register in `index.js`
4. Update `FlashCardsDialog.jsx` with questions/translations
5. Test thoroughly

## Summary

The flash cards configuration is now organized, scalable, and easy to maintain. The modular structure makes it simple to add new categories while keeping the codebase clean and organized.
