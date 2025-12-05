# Answer Translations Directory

This directory contains category-based answer translation files for the WordWalker application. Each file maps Spanish words/phrases (correct answers from questions) to their English translations.

## Structure

```
answer-translations/
├── index.js              # Main export - aggregates all translations
├── accommodation.js      # Accommodation category translations
├── animals.js           # Animals category translations
├── beach.js             # Beach & Activities translations
├── daily_routines.js    # Daily Routines translations
├── directions.js        # Directions translations
├── emergencies.js       # Emergencies translations
├── entertainment.js     # Entertainment translations
├── food.js              # Food category translations
├── grammar.js           # Grammar translations
├── greetings.js         # Greetings & Conversations translations
├── numbers.js           # Numbers, Colors & Time translations
├── people.js            # People & Relationships translations
├── restaurant.js        # Restaurant translations
├── shopping.js          # Shopping translations
├── transportation.js    # Transportation translations
└── weather.js           # Weather translations
```

## Usage

### Import All Translations

The most common usage - imports the complete translations object:

```javascript
import { translations } from '../config/answer-translations';

// Use it to get English translation for Spanish answer
const english = translations['la manzana']; // Returns: 'apple'
```

### Import Specific Category

For performance optimization or when you only need one category:

```javascript
import { foodAnswerTranslations } from '../config/answer-translations/food';

const english = foodAnswerTranslations['la manzana']; // Returns: 'apple'
```

### Helper Functions

The index.js also exports utility functions:

```javascript
import { getTranslation, hasTranslation } from '../config/answer-translations';

// Get a translation
const english = getTranslation('la manzana'); // Returns: 'apple' or undefined

// Check if translation exists
if (hasTranslation('la manzana')) {
  // Translation exists
}
```

## File Format

Each category file follows this structure:

```javascript
/**
 * [Category Name] Category Answer Translations
 * Auto-generated from answer-translations.js
 * Category: [category_id]
 * Total translations: [count]
 */

export const [category]AnswerTranslations = {
  "spanish_word": "english_translation",
  "otra_palabra": "another_word",
  // ...
};
```

## Maintenance

### Adding New Translations

When adding new questions to a category:

1. Add the question to the appropriate file in `src/config/questions/`
2. Run the extraction script to update translations:
   ```bash
   node extract-translations.js
   ```
3. The script will automatically extract correct answers and update translation files

### Manual Additions

If you need to manually add translations:

1. Open the appropriate category file (e.g., `food.js`)
2. Add the translation in alphabetical order:
   ```javascript
   "nueva palabra": "new word",
   ```
3. Update the total count in the file header comment
4. The index.js will automatically include it

## Differences from Hint Translations

⚠️ **Important**: This directory is separate from `src/config/translations/`

- **`src/config/answer-translations/`** (this directory)
  - Maps **correct answers** to English
  - Used by: TranslationOverlay, SearchDialog, PathCanvas
  - Shows translation after answering correctly
  - Used in the dictionary search feature

- **`src/config/translations/`** (different directory)
  - Maps **full questions** to English
  - Used by: QuestionDialog hint feature
  - Shows hint when user clicks "Show Hint"

Both directories use the same category structure but serve different purposes.

## Benefits of This Structure

1. **Smaller File Sizes**: Each category file is only 2-5 KB instead of one massive 100+ KB file
2. **Better Organization**: Easy to find and update translations for specific categories
3. **Maintainability**: Clear separation of concerns by category
4. **Performance**: Potential for future lazy-loading by category
5. **Backward Compatible**: The index.js maintains the same API as the original answer-translations.js

## Statistics

- **Total Categories**: 16
- **Total Translations**: 1,697
- **Average per Category**: ~106 translations
- **Largest Category**: Numbers (180 translations)
- **Smallest Category**: Daily Routines (3 translations)

## Migration Notes

The original `answer-translations.js` (3,191 lines) has been split into:
- 16 category files (average ~100 lines each)
- 1 index file (67 lines)
- Total: ~1,767 lines organized into 17 files

This represents a more maintainable structure while preserving all functionality.
