# Flash Cards Configuration Structure

## Overview
Flash card configurations are now organized in individual files per category, similar to the questions structure. Each category has its own configuration file in `src/config/flash-cards/`.

## Feature Flag

Flash cards can be globally enabled or disabled using the `FLASH_CARDS_ENABLED` constant in `src/config/flash-cards/index.js`:

```javascript
export const FLASH_CARDS_ENABLED = true;  // Enable flash cards
export const FLASH_CARDS_ENABLED = false; // Disable flash cards (useful for testing)
```

When set to `false`, the `hasFlashCards()` function returns `false` for all categories, preventing flash cards from appearing even if a category has them configured. This is useful for:
- Testing the app without flash cards
- Temporarily disabling the feature during development
- A/B testing with and without flash cards

## Directory Structure
```
src/config/flash-cards/
├── index.js              # Main entry point with helper functions
├── food.js               # Food category flash cards config
├── animals.js.template   # Template for new categories
└── [category].js         # Additional category configs
```

## Files

### `index.js`
Central configuration file that:
- Imports all category configs
- Provides default configuration
- Exports helper functions (`getFlashCardConfig`, `getFlashCardData`, etc.)
- Manages deep merging of default and category-specific settings

### Category Files (e.g., `food.js`)
Each category file exports a config object with:
- Sprite sheet dimensions
- Card-to-question mappings
- Optional text styling overrides
- Optional diamond animation overrides

## Creating a New Category

### Step 1: Create the Config File
Create a new file `src/config/flash-cards/{category}.js`:

```javascript
/**
 * Flash Cards Configuration - {Category} Category
 */

export const {category}FlashCardsConfig = {
  totalCards: 10,
  spriteWidth: 3600,
  spriteHeight: 240,
  canvasWidth: 360,
  canvasHeight: 240,
  
  cards: [
    { questionId: '{category}_001' },
    { questionId: '{category}_002' },
    // ... 8 more
  ],
};
```

### Step 2: Import in `index.js`
Add import and registration:

```javascript
// At the top
import { animalsFlashCardsConfig } from './animals.js';

// In flashCardsConfigByCategory
export const flashCardsConfigByCategory = {
  food: foodFlashCardsConfig,
  animals: animalsFlashCardsConfig,  // Add here
};
```

### Step 3: Update FlashCardsDialog Component
Import the questions and translations:

```javascript
// Add imports
import { plantsAnimalsQuestions } from '../config/questions/plants_animals';
import { plantsAnimalsAnswerTranslations } from '../config/translations/answers/plants_animals';

// Update data selection logic
const questionsData = category === 'food' ? foodQuestions 
                    : category === 'animals' ? animalsQuestions 
                    : [];
const answerTranslations = category === 'food' ? foodAnswerTranslations
                          : category === 'plants_animals' ? plantsAnimalsAnswerTranslations
                          : {};
```

## Configuration Options

### Required Fields
```javascript
{
  totalCards: 10,           // Number of cards
  spriteWidth: 3600,        // Sprite sheet width
  spriteHeight: 240,        // Sprite sheet height
  canvasWidth: 360,         // Display width
  canvasHeight: 240,        // Display height
  cards: [                  // Card mappings
    { questionId: 'food_001' },
    // ...
  ],
}
```

### Optional Overrides

#### Text Styling
```javascript
text: {
  spanish: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#2c5f2d',
    maxWidth: 300,
    lineHeight: 1.3,
  },
  english: {
    fontSize: 20,
    color: '#666',
  },
  verticalSpacing: 20,
  topMargin: 70,
}
```

#### Diamond Animation
```javascript
diamond: {
  animationSpeed: 0.01,
  fadeMin: 0.3,
  fadeMax: 1.0,
  size: 50,
  positionX: 35,
  positionY: 35,
}
```

#### Sprite Adjustments
```javascript
offsetX: 5,        // Horizontal offset
offsetY: 0,        // Vertical offset
cardSpacing: 2,    // Space between cards in sprite
```

## Helper Functions

### `getFlashCardConfig(category)`
Returns merged configuration for a category with defaults applied.

```javascript
const config = getFlashCardConfig('food');
// Returns full config with defaults merged
```

### `getFlashCardData(category, cardIndex, questionsData, answerTranslations)`
Gets Spanish text, English translation, and emoji for a specific card.

```javascript
const cardData = getFlashCardData('food', 0, foodQuestions, foodAnswerTranslations);
// Returns: { spanish: 'la sandía', english: 'the watermelon', emoji: '🍉' }
```

### `getCardSourceRect(cardIndex, config)`
Calculates sprite sheet coordinates for a card.

```javascript
const rect = getCardSourceRect(0, config);
// Returns: { x: 0, y: 0, width: 360, height: 240 }
```

### `hasFlashCards(category)`
Check if a category has flash cards configured.

```javascript
if (hasFlashCards('food')) {
  // Show flash cards
}
```

### `getFlashCardCategories()`
Get array of all categories with flash cards.

```javascript
const categories = getFlashCardCategories();
// Returns: ['food', 'animals', ...]
```

## Selecting Cards for a Category

When choosing which vocabulary items to feature in flash cards:

1. **Pick popular/useful items**: Common words learners will use frequently
2. **Balance difficulty**: Mix easy and medium difficulty items
3. **Visual variety**: Choose items that work well with different images
4. **Thematic coherence**: Select items that represent the category well

Example for food category:
- Basic fruits: watermelon, banana, apple, orange, pineapple
- Popular dishes: pizza, hamburger, taco
- Common items: chicken, ice cream

## Benefits of This Structure

1. **Organized**: Each category has its own file, easy to find and edit
2. **Modular**: Add new categories without modifying core config
3. **Maintainable**: Similar to questions structure, familiar pattern
4. **Flexible**: Each category can override defaults as needed
5. **Scalable**: Easy to add many categories

## Example: Complete Food Configuration

```javascript
// src/config/flash-cards/food.js
export const foodFlashCardsConfig = {
  totalCards: 10,
  spriteWidth: 3600,
  spriteHeight: 240,
  canvasWidth: 360,
  canvasHeight: 240,
  
  cards: [
    { questionId: 'food_001' }, // la sandía
    { questionId: 'food_002' }, // el plátano
    { questionId: 'food_003' }, // la manzana
    { questionId: 'food_004' }, // la naranja
    { questionId: 'food_009' }, // la piña
    { questionId: 'food_036' }, // la pizza
    { questionId: 'food_037' }, // la hamburguesa
    { questionId: 'food_039' }, // el taco
    { questionId: 'food_043' }, // el pollo
    { questionId: 'food_069' }, // el helado
  ],
  
  text: {
    spanish: {
      fontSize: 28,
      color: '#2c5f2d', // Green for food theme
    },
  },
};
```

## Migration Notes

The old `flashCardsConfig.js` file has been replaced with the new structure. The API remains the same - `getFlashCardConfig()` and related functions work identically, just imported from `config/flash-cards/index.js` instead of `config/flashCardsConfig.js`.
