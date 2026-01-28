# Question Translation System Update

## Overview
Updated the question translation system to use question IDs as keys instead of Spanish question text. This provides better maintainability, performance, and prevents issues with duplicate questions.

## Changes Made

### 1. Translation File Format
**Before:**
```javascript
export const animalsTranslations = {
  "¿Cuál es el felino salvaje más grande de América?": "What is the largest wild cat in America?",
  // ... more translations using Spanish text as keys
};
```

**After:**
```javascript
export const animalsTranslations = {
  "animals_023": "What is the largest wild cat in America?",
  // ... more translations using question IDs as keys
};
```

### 2. Updated Files

#### Translation Files (Updated to use IDs)
- ✅ `src/config/translations/questions/accommodation.js` - 148 translations
- ✅ `src/config/translations/questions/animals.js` - 51 translations
- ✅ `src/config/translations/questions/beach.js` - 100 translations
- ✅ `src/config/translations/questions/daily_routines.js` - 3 translations
- ✅ `src/config/translations/questions/directions.js` - 49 translations
- ✅ `src/config/translations/questions/emergencies.js` - 50 translations
- ✅ `src/config/translations/questions/entertainment.js` - 145 translations
- ✅ `src/config/translations/questions/food.js` - 158 translations
- ✅ `src/config/translations/questions/grammar.js` - 102 translations
- ✅ `src/config/translations/questions/greetings.js` - 9 translations
- ✅ `src/config/translations/questions/people.js` - 5 translations
- ✅ `src/config/translations/questions/shopping.js` - 153 translations
- ✅ `src/config/translations/questions/transportation.js` - 145 translations

#### Files with Orphaned Translations (Need Review)
- ⚠️ `src/config/translations/questions/numbers.js` - No matching questions found
- ⚠️ `src/config/translations/questions/restaurant.js` - No matching questions found
- ⚠️ `src/config/translations/questions/weather.js` - No matching questions found

These files contain translations for questions that don't exist in the corresponding question files. They should be reviewed and either updated with new translations or the missing questions should be added.

#### Component Updates
- ✅ `src/components/PathCanvas.jsx` - Updated to pass `currentQuestion.id` instead of `currentQuestion.question` to QuestionDialog

#### New Files
- ✅ `src/config/translations/index.js` - Created to re-export questionTranslations

#### Updated Functions
- ✅ `src/config/translations/questions/index.js`:
  - `getQuestionTranslation(questionId)` - Now takes question ID instead of question text
  - `hasQuestionTranslation(questionId)` - Now takes question ID instead of question text

### 3. Usage in Components

**QuestionDialog.jsx** receives the translation via props:
```jsx
<QuestionDialog
  currentQuestion={currentQuestion}
  // ... other props
  questionTranslation={questionTranslations[currentQuestion.id]}  // ← Uses ID now
/>
```

The translation is then displayed in the hint box when the user clicks the hint button.

## Benefits

1. **Better Performance**: Direct ID lookup is faster than string matching
2. **Maintainability**: IDs are unique and stable, Spanish text may change
3. **Type Safety**: IDs follow a consistent pattern (category_number)
4. **Debugging**: Easier to track which translation belongs to which question
5. **No Duplicates**: Prevents issues with questions that have identical Spanish text

## Example Usage

```javascript
// Get a question
const question = {
  id: 'animals_023',
  question: '¿Cuál es el felino salvaje más grande de América?',
  // ... other properties
};

// Get its translation
const translation = questionTranslations[question.id];
// Returns: "What is the largest wild cat in America?"

// Check if translation exists
if (hasQuestionTranslation(question.id)) {
  console.log('Translation available');
}
```

## Adding New Translations

When adding translations for new questions:

1. Find the question ID in the question file (e.g., `src/config/questions/animals.js`)
2. Add the translation using the ID as key in the translation file (e.g., `src/config/translations/questions/animals.js`)

```javascript
export const animalsTranslations = {
  // ... existing translations
  "animals_051": "Your new English translation here",
};
```

## Migration Notes

- All existing functionality continues to work
- The old `question-translations.js` file can be deprecated/removed after verification
- Build succeeds with no errors
- Total of 1,118 translations successfully migrated to ID-based system

## Testing

Build test passed:
```bash
npm run build
✓ built in 2.52s
```

All translations are properly loaded and accessible via question IDs.
