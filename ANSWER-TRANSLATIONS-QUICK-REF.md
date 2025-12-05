# Answer Translations - Quick Reference

## 🎯 What Changed?

The large `answer-translations.js` file has been split into 16 category-based files in a new directory: `src/config/answer-translations/`

## 📁 New Structure

```
src/config/answer-translations/
├── index.js              ← Import from here
├── food.js
├── shopping.js
├── entertainment.js
└── ... (13 more categories)
```

## 🔄 How to Use

### Import (Same as Before!)

```javascript
// In your component
import { translations } from '../config/answer-translations/index';

// Use exactly as before
const english = translations['la manzana'];  // "the apple"
```

### Helper Functions (New!)

```javascript
import { getTranslation, hasTranslation } from '../config/answer-translations/index';

// Get a translation
const result = getTranslation('la manzana');  // "the apple" or undefined

// Check if exists
if (hasTranslation('la manzana')) {
  // Do something
}
```

## ✅ What Still Works

- ✅ TranslationOverlay - Shows translations after correct answer
- ✅ SearchDialog - Dictionary search feature
- ✅ PathCanvas - Answer validation
- ✅ Hint System - Question translations (separate, unchanged)

## 📝 Adding New Translations

### Method 1: Automatic (Recommended)
1. Add question to `src/config/questions/{category}.js`
2. Run: `node extract-translations.js`
3. Done! Translation file auto-updated

### Method 2: Manual
1. Open `src/config/answer-translations/{category}.js`
2. Add translation:
   ```javascript
   "nueva palabra": "new word",
   ```
3. Save

## 🔍 Finding Translations

**Before:** Search 3,191 lines in one file  
**Now:** Open category file (~100 lines), use Ctrl+F

Example: Looking for food translation?
→ Open `src/config/answer-translations/food.js` (140 translations)

## 📊 Categories

| Category | File | Translations |
|----------|------|-------------|
| Numbers | numbers.js | 180 |
| Grammar | grammar.js | 159 |
| Accommodation | accommodation.js | 147 |
| Shopping | shopping.js | 142 |
| Food | food.js | 140 |
| Transportation | transportation.js | 140 |
| Entertainment | entertainment.js | 132 |
| Greetings | greetings.js | 125 |
| People | people.js | 99 |
| Restaurant | restaurant.js | 97 |
| Weather | weather.js | 96 |
| Beach | beach.js | 90 |
| Animals | animals.js | 53 |
| Directions | directions.js | 49 |
| Emergencies | emergencies.js | 42 |
| Daily Routines | daily_routines.js | 3 |

## ⚠️ Important: Two Translation Systems

Don't confuse these two directories:

1. **`src/config/answer-translations/`** ← THIS REFACTORING
   - Maps Spanish answers → English
   - Used after correct answer
   - Dictionary search

2. **`src/config/translations/`** ← UNCHANGED
   - Maps Spanish questions → English  
   - Used for hints
   - "Show Hint" feature

## 🧪 Testing

```bash
# Run tests
node test-translations.js

# Build project
npm run build
```

## 🆘 Troubleshooting

**Import error?**
- Check path: `'../config/answer-translations/index'`
- Include `/index` in the path

**Translation not found?**
- Check if it exists in category file
- Run `node extract-translations.js` to update
- Or add manually to appropriate category file

**Old file still there?**
- Yes, `answer-translations.js` still exists as backup
- Can be safely removed after 1-2 weeks

## 📚 Documentation

- **REFACTORING-SUMMARY.md** - Complete overview
- **ANSWER-TRANSLATIONS-REFACTORING.md** - Detailed process
- **TRANSLATION-SYSTEMS-OVERVIEW.md** - Two-system explanation
- **src/config/answer-translations/README.md** - Directory guide

## ⚡ Quick Commands

```bash
# Extract translations from questions
node extract-translations.js

# Test translations
node test-translations.js

# Build project
npm run build

# Check file sizes
ls -lh src/config/answer-translations/*.js
```

## 🎉 Benefits

- ✅ Organized by category
- ✅ Smaller, manageable files
- ✅ Easier to find/edit
- ✅ Better Git diffs
- ✅ Same functionality
- ✅ Backward compatible

---

**TL;DR:** Same API, better organization, works exactly as before! 🚀
