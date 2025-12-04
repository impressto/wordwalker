# Question Translations - Modular Structure

## Overview

The question translations have been refactored from a single large file into a modular structure organized by category. This makes the codebase more maintainable and easier to navigate.

## Directory Structure

```
src/config/
├── question-translations.js       # OLD: Original monolithic file (1684 lines)
└── translations/                   # NEW: Modular structure
    ├── index.js                   # Main export - combines all categories
    ├── people.js                  # People & Relationships translations
    ├── food.js                    # Food & Dining translations
    ├── shopping.js                # Shopping & Clothing translations
    ├── entertainment.js           # Entertainment & Hobbies translations
    ├── accommodation.js           # Hotels & Lodging translations
    ├── transportation.js          # Travel & Transport translations
    ├── directions.js              # Directions & Navigation translations
    ├── emergencies.js             # Emergency & Health translations
    ├── greetings.js               # Greetings & Conversations translations
    ├── numbers.js                 # Numbers, Colors & Time translations
    ├── grammar.js                 # Grammar translations
    ├── beach.js                   # Beach & Activities translations
    └── animals.js                 # Animals translations
```

## Usage

### Importing Translations

```javascript
// Import all translations (recommended for most use cases)
import { questionTranslations, getQuestionTranslation } from './config/translations/index.js';

// Get a translation
const translation = getQuestionTranslation("¿Cómo se dice \"father\" en español?");
// Returns: "How do you say 'father' in Spanish?"

// Import specific category (for optimization or specific features)
import { peopleTranslations } from './config/translations/people.js';
```

### Adding a New Category

1. Create a new file: `src/config/translations/{category}.js`
2. Export translations object:
```javascript
export const {category}Translations = {
  "¿Spanish question?": "English translation",
  // ... more translations
};
```
3. Import in `src/config/translations/index.js`:
```javascript
import { {category}Translations } from './{category}.js';

export const questionTranslations = {
  ...{category}Translations,
  // ... other categories
};
```

## Migration Status

### ✅ **Completed:** (156 translations)
- `animals.js` - 64 translations (Domestic, Wild, Birds, Marine Life, Insects)
- `beach.js` - 43 translations (Beach Items, Water Activities, Marine Life)
- `people.js` - 100 translations (Family, Professions, Physical Descriptions, Personality, Age)

### ⏳ **In Progress:** (~1,500 translations remaining)

Files created with TODO markers - ready for content extraction:
- `food.js` - ~200-300 translations needed
- `shopping.js` - ~150-200 translations needed
- `entertainment.js` - ~100-150 translations needed
- `accommodation.js` - ~150-200 translations needed
- `transportation.js` - ~100 translations needed
- `directions.js` - ~50 translations needed
- `emergencies.js` - ~50 translations needed
- `greetings.js` - ~50 translations needed
- `numbers.js` - ~100 translations needed
- `grammar.js` - ~100 translations needed
- `daily_routines.js` - TBD
- `restaurant.js` - TBD

### 📋 **Next Steps:**
1. Follow the **MIGRATION-GUIDE.md** for detailed instructions
2. Extract one category at a time using keyword search
3. Test after each category completion
4. Update all imports throughout codebase once complete
5. Remove old `question-translations.js` file

## Migration Script

A migration script is provided to help automate the extraction:

```bash
cd src/config
node migrate-translations.js
```

This script will:
1. Parse the old `question-translations.js` file
2. Detect categories using pattern matching
3. Generate individual category files
4. Report statistics on extracted translations

**Note:** Manual review is recommended after running the script to ensure correct categorization.

## Benefits

1. **Maintainability**: Each category is ~100-200 lines instead of 1600+ lines
2. **Organization**: Easy to find and edit translations for specific categories
3. **Performance**: Potential for code splitting and lazy loading
4. **Collaboration**: Multiple developers can work on different categories simultaneously
5. **Clarity**: Clear separation of concerns matches the question structure

## Backward Compatibility

The new `translations/index.js` maintains the same API as the old file:
- `questionTranslations` object
- `getQuestionTranslation(question)` function
- `hasQuestionTranslation(question)` function

Simply update imports from:
```javascript
import { questionTranslations } from './config/question-translations.js';
```

To:
```javascript
import { questionTranslations } from './config/translations/index.js';
```

## File Size Comparison

- **Before**: 1 file × 1684 lines = 1684 lines total
- **After**: ~13 files × ~130 lines average = Better organized, easier to maintain

Each category file is now a manageable size that fits comfortably on one screen.
