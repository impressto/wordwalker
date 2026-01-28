# Questions Directory

This directory contains all WordWalker learning questions organized by category.

## Structure

```
questions/
├── categories.js          # Category definitions and metadata
├── index.js              # Main index that combines all questions
├── food.js               # Food & drink questions (~155 questions)
├── shopping.js           # Shopping & clothing questions
├── entertainment.js      # Entertainment & hobbies questions
├── accommodation.js      # Accommodation & lodging questions
├── transportation.js     # Transportation & travel questions
├── directions.js         # Directions & navigation questions
├── emergencies.js        # Emergency & health questions
├── greetings.js          # Greetings & conversations questions
├── numbers.js            # Numbers, colors & time questions
├── grammar.js            # Grammar & verb conjugation questions (~50 questions)
├── beach.js              # Beach & activities questions
├── animals.js            # Animal names & characteristics questions (~60 questions)
├── people.js             # People & relationships questions (NEW)
├── daily_routines.js     # Daily routines & reflexive verbs (NEW)
└── restaurant.js         # Restaurant & dining questions (NEW)
```

## Adding New Questions

### 1. Add to Existing Category

Edit the appropriate category file (e.g., `food.js`) and add your question:

```javascript
{
  id: 'food_156',
  emoji: '🥗',
  question: '¿Qué ensalada es muy popular?',
  options: ['la ensalada César', 'la ensalada griega', 'la ensalada Caprese'],
  correctAnswer: 'la ensalada César',
  hint: 'Named after Caesar Cardini, invented in Mexico',
  points: 10,
  category: 'food',
  difficulty: 'medium',
},
```

### 2. Create New Category

1. Add category definition to `categories.js`:
```javascript
new_category: {
  id: 'new_category',
  name: 'New Category',
  displayName: 'Nueva Categoría',
  emoji: '🎯',
  description: 'Description of the new category',
},
```

2. Create new category file (e.g., `new_category.js`):
```javascript
/**
 * New Category Questions
 * Category: new_category
 */

export const new_categoryQuestions = [
  {
    id: 'new_category_001',
    emoji: '🎯',
    question: 'Your question here?',
    options: ['option1', 'option2', 'option3'],
    correctAnswer: 'option1',
    hint: 'Your hint here',
    points: 5,
    category: 'new_category',
    difficulty: 'easy',
  },
  // ... more questions
];
```

3. Import in `index.js`:
```javascript
import { new_categoryQuestions } from './new_category.js';

export { new_categoryQuestions };

export const questions = [
  // ... existing categories
  ...new_categoryQuestions,
];
```

## Question Structure

Each question must include:

- **id**: Unique identifier (format: `category_###`)
- **emoji**: Unicode emoji character
- **question**: The question text in Spanish
- **options**: Array of 3-4 possible answers
- **correctAnswer**: The correct answer (must match one option exactly)
- **hint**: Helpful cultural or linguistic context
- **points**: Points awarded (5=easy, 10=medium, 15=hard)
- **category**: Must match a category ID
- **difficulty**: 'easy', 'medium', or 'hard'

## Benefits of This Structure

✅ **Better Performance**: Smaller files load and parse faster
✅ **Easier Maintenance**: Find and update questions quickly
✅ **Better Organization**: Logical separation by topic
✅ **Team Collaboration**: Multiple people can work on different categories
✅ **Selective Loading**: Can potentially lazy-load categories in future
✅ **Cleaner Git History**: Changes to one category don't affect others

## Testing

After adding questions, test with:

```bash
yarn build
yarn dev
```

Navigate to the category in the game to verify your questions appear correctly.
