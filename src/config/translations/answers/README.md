# Answer Translations Directory

This directory contains category-based answer translation files for the WordWalker application. Each file maps Spanish words/phrases (correct answers from questions) to their English translations.

## Structure

```
translations/answers/
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

### ⭐ Recommended: Category-Aware Translation (NEW)

The best way to get translations - automatically handles words with different meanings across categories:

```javascript
import { getCategoryTranslation } from '../config/translations/answers';

// Get translation with category context
const kiwiFruit = getCategoryTranslation('el kiwi', 'food'); // Returns: 'the kiwi'
const kiwiBird = getCategoryTranslation('el kiwi', 'plants_animals'); // Returns: 'the kiwi bird'

// Works with any question object
const english = getCategoryTranslation(question.correctAnswer, question.category);
```

**Benefits:**
- ✅ Correctly handles words with multiple meanings (e.g., "el kiwi" as fruit vs. bird)
- ✅ Only loads translations for the specific category (performance)
- ✅ Prevents conflicts from merged translations
- ✅ Falls back gracefully if category not found

### Import All Translations (Legacy)

For dictionary/search features that need to search across all categories:

```javascript
import { translations } from '../config/translations/answers';

// Use it to get English translation for Spanish answer
const english = translations['la manzana']; // Returns: 'the apple'
```

⚠️ **Note:** When the same Spanish word appears in multiple categories with different meanings, the combined object will only have one translation (whichever category is merged last).

### Import Specific Category

For performance optimization or when you only need one category:

```javascript
import { foodAnswerTranslations } from '../config/translations/answers/food';

const english = foodAnswerTranslations['la manzana']; // Returns: 'the apple'
```

### Access Category Map

Get all translations organized by category:

```javascript
import { translationsByCategory } from '../config/translations/answers';

const foodTranslations = translationsByCategory.food;
const animalTranslations = translationsByCategory.plants_animals;
```

### Helper Functions (Legacy)

```javascript
import { getTranslation, hasTranslation } from '../config/translations/answers';

// Get a translation (uses combined translations object)
const english = getTranslation('la manzana'); // Returns: 'the apple' or undefined

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
 * Auto-generated
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

### Handling Duplicate Keys Across Categories

Some Spanish words have different meanings in different categories:

| Spanish | Category | English |
|---------|----------|---------|
| el kiwi | food | the kiwi |
| el kiwi | plants_animals | the kiwi bird |

**Solution:** Use `getCategoryTranslation()` which looks up translations by category first, ensuring the correct translation is returned based on context.

**Known Duplicates:**
- `el kiwi`: food (fruit) vs. plants_animals (bird)

When adding new translations, check for potential duplicates and document them here.

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

⚠️ **Important**: This directory is separate from the hint translations in the parent `translations/` directory

- **`src/config/translations/answers/`** (this directory)
  - Maps **correct answers** to English
  - Used by: TranslationOverlay, SearchDialog, PathCanvas
  - Shows translation after answering correctly
  - Used in the dictionary search feature

- **`src/config/translations/`** (parent directory - hint translations)
  - Maps **full questions** to English
  - Used by: QuestionDialog hint feature
  - Shows hint when user clicks "Show Hint"

Both use the same category structure but serve different purposes.

## Benefits of This Structure

1. **Smaller File Sizes**: Each category file is only 2-5 KB instead of one massive 100+ KB file
2. **Better Organization**: Easy to find and update translations for specific categories
3. **Maintainability**: Clear separation of concerns by category
4. **Performance**: Potential for future lazy-loading by category
5. **Unified Interface**: The index.js provides a simple API for accessing all translations

## Statistics

- **Total Categories**: 16
- **Total Translations**: 1,697
- **Average per Category**: ~106 translations
- **Largest Category**: Numbers (180 translations)
- **Smallest Category**: Daily Routines (3 translations)

## Migration Notes

Answer translations have been organized into category-based files:
- 16 category files (average ~100 lines each)
- 1 index file (67 lines)
- Total: ~1,767 lines organized into 17 files

This represents a more maintainable structure while preserving all functionality.
