# Flash Cards Content Directory

This directory contains independent flash card content for each category.

## Structure

Each category has its own file that exports an array of flash card objects:

```
src/config/flashCards/
├── food.js              # Food category cards
├── animals.template.js  # Template for animals category
└── README.md           # This file
```

## Card Format

Each card object contains:

```javascript
{
  spanish: 'el perro',        // Spanish text
  english: 'the dog',         // English translation
  object: 'el perro.svg',     // Object image filename
  emotion: 'happy.png',       // Character emotion (optional)
  background: 'blue.png',     // Background image (optional)
  character: 'maria',         // Character name (optional)
}
```

### Required Fields
- `spanish` - The Spanish vocabulary word/phrase
- `english` - The English translation
- `object` - Filename of the object image in `public/images/flash-cards/objects/`

### Optional Fields
- `emotion` - Overrides default emotion (defaults to `happy.png`)
- `background` - Overrides default background (defaults to `purple.png`)
- `character` - Overrides default character (defaults to `emma`)

## Adding a New Category

1. **Create the card content file:**
   ```bash
   cp src/config/flashCards/animals.template.js src/config/flashCards/yourcategory.js
   ```

2. **Edit the file with your cards:**
   ```javascript
   export const yourCategoryFlashCards = [
     { 
       spanish: 'word',
       english: 'translation',
       object: 'image.svg',
       emotion: 'happy.png',
     },
     // ... more cards
   ];
   ```

3. **Import in flashCardsConfig.js:**
   ```javascript
   import { yourCategoryFlashCards } from './flashCards/yourcategory.js';
   ```

4. **Add to cards object:**
   ```javascript
   cards: {
     food: foodFlashCards,
     yourcategory: yourCategoryFlashCards, // Add this
   }
   ```

5. **Create object images:**
   - Add SVG or PNG files to `public/images/flash-cards/objects/`
   - Filenames should match the `object` field in your cards

## Available Emotions

Character emotions available in `public/images/flash-cards/characters/emma/`:
- `angry.png` - Angry expression
- `confused.png` - Confused/puzzled expression
- `happy.png` - Happy/joyful expression (default)
- `pleased.png` - Pleased/satisfied expression
- `excited.png` - Excited/enthusiastic expression
- `calm.png` - Calm/peaceful expression
- `neutral.png` - Neutral/no emotion expression
- `sad.png` - Sad/unhappy expression
- `anxious.png` - Anxious/worried expression
- `afraid.png` - Afraid/scared expression
- `determined.png` - Determined/focused expression
- `hurt.png` - Hurt/pained expression
- `surprised.png` - Surprised/shocked expression
- `disgusted.png` - Disgusted/repulsed expression

## Example: Food Category

```javascript
export const foodFlashCards = [
  { 
    spanish: 'la sandía',
    english: 'the watermelon',
    object: 'la sandía.svg',
    emotion: 'pleased.png',
  },
  { 
    spanish: 'el plátano',
    english: 'the banana',
    object: 'el plátano.svg',
    emotion: 'happy.png',
  },
  // ... 8 more cards
];
```

## Benefits of Independent Cards

✅ **No dependencies** - Cards don't rely on question data  
✅ **Simple structure** - Just Spanish, English, and images  
✅ **Easy to maintain** - All content in one place per category  
✅ **Flexible** - Can have different cards than game questions  
✅ **Reusable** - Card content can be used in other contexts  

## Notes

- Flash cards are completely independent from game questions
- You can have different vocabulary in flash cards vs. game questions
- Card order determines display order (no randomization)
- All text and translations are self-contained in the card data
