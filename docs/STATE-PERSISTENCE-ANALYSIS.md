# Game State Persistence & Question Tracking Analysis

## Current Implementation

### Storage Method
**Currently Using:** `localStorage` (browser-based persistent storage)
- **Storage Key:** `'wordwalker-game-state'`
- **Auto-save Interval:** Every 5 seconds
- **Storage Limit:** ~5-10MB per domain (browser dependent)

### Data Structure

The game currently saves this state structure:

```javascript
{
  totalPoints: number,
  streak: number,
  selectedPath: string,
  checkpointsAnswered: number,
  usedQuestionIds: Array<string>,              // ← All questions asked in current session
  correctFirstTryIds: Array<string>,           // ← Questions answered correctly on first try
  completedCategories: Array<string>,
  forkCategories: Array<string>,
  soundEnabled: boolean,
  volume: number,
  offsetRef: number,
  velocityRef: number,
  walkerFrameRef: number
}
```

### How Questions Are Tracked Now

1. **All Questions Used This Session:** `usedQuestionIds` (Set)
   - Added when question is presented: `setUsedQuestionIds(prev => new Set([...prev, question.id]))`
   - Used to prevent duplicates: `getRandomUnusedQuestionByCategory(category, usedQuestionIds)`
   - Reset when player completes category: `setUsedQuestionIds(new Set())`

2. **Correct First Try:** `correctFirstTryIds` (Set)
   - Added only if answer is correct on first attempt: `setCorrectFirstTryIds(prev => new Set([...prev, currentQuestion.id]))`
   - Shows in resume dialog for scoring reference

### Current Problem

**The game does NOT prevent players from getting questions they previously answered correctly across different sessions.** Here's why:

- `usedQuestionIds` is **reset when starting a new game** (line 387)
- `usedQuestionIds` is **reset for each new category** (line 1100)
- `correctFirstTryIds` is tracked but **only used for display, not for filtering**

When a player resumes or starts fresh:
```javascript
setUsedQuestionIds(new Set()); // Clears all tracking
setCorrectFirstTryIds(new Set()); // Clears all correct answers
```

So they can get the exact same questions again, defeating the learning purpose.

---

## Recommended Solution

### Option A: Category-Based Tracking (Recommended ✅)

Store correct answers grouped by category (similar to your suggestion):

```javascript
// Storage structure
{
  ...existing fields...,
  correctAnswersByCategory: {
    food: ['food_001', 'food_047', 'food_089'],
    shopping: ['shopping_012', 'shopping_045'],
    entertainment: ['entertainment_024'],
    accommodation: ['accommodation_003', 'accommodation_007'],
    // ... etc
  }
}
```

**Advantages:**
- ✅ More efficient filtering (only check relevant category)
- ✅ Easier to display "Questions Mastered in Category X"
- ✅ Minimal storage overhead
- ✅ Can implement category-specific learning stats
- ✅ Scales well even with 1000+ questions

**Storage Analysis:**
- Average ID string length: ~12 characters (e.g., "food_001")
- JSON overhead: ~1.5x the raw data
- 100 questions answered correctly ≈ 2KB
- 1000 questions answered correctly ≈ 20KB
- Multiple sessions preserved ≈ 50-100KB total

**Well within the 5-10MB localStorage limit** ✅

### Option B: All Questions Globally (Alternative)

```javascript
{
  ...existing fields...,
  allCorrectAnswerIds: ['food_001', 'food_047', 'shopping_012', ...]
}
```

**Disadvantages:**
- Requires scanning entire array on every question
- Loses category context for analytics
- Less organized for future features

### Option C: Separate Storage Keys (Not Recommended)

Storing `localStorage['wordwalker-correct-answers']` separately would require managing multiple keys and could lead to sync issues.

---

## Implementation Plan

### Step 1: Update Persistence Structure

**File:** `src/utils/gameStatePersistence.js`

```javascript
export const saveGameState = (gameState) => {
  try {
    const serializableState = {
      ...gameState,
      usedQuestionIds: Array.from(gameState.usedQuestionIds || []),
      completedCategories: Array.from(gameState.completedCategories || []),
      correctFirstTryIds: Array.from(gameState.correctFirstTryIds || []),
      correctAnswersByCategory: gameState.correctAnswersByCategory || {}, // ← NEW
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializableState));
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
};

export const convertLoadedState = (loadedState) => {
  if (!loadedState) return null;

  return {
    ...loadedState,
    usedQuestionIds: new Set(loadedState.usedQuestionIds || []),
    completedCategories: new Set(loadedState.completedCategories || []),
    correctFirstTryIds: new Set(loadedState.correctFirstTryIds || []),
    correctAnswersByCategory: loadedState.correctAnswersByCategory || {}, // ← NEW
  };
};
```

### Step 2: Add Helper Functions

**New utility function:**

```javascript
// src/utils/questionTracking.js

/**
 * Add a correctly answered question to the category history
 * @param {string} questionId - The question ID
 * @param {string} category - The category name
 * @param {Object} correctAnswersByCategory - Current tracking object
 * @returns {Object} Updated tracking object
 */
export const addCorrectAnswer = (questionId, category, correctAnswersByCategory = {}) => {
  const updatedTracking = { ...correctAnswersByCategory };
  
  if (!updatedTracking[category]) {
    updatedTracking[category] = [];
  }
  
  // Avoid duplicates
  if (!updatedTracking[category].includes(questionId)) {
    updatedTracking[category].push(questionId);
  }
  
  return updatedTracking;
};

/**
 * Get all questions already answered correctly in a category
 * @param {string} category - The category name
 * @param {Object} correctAnswersByCategory - Tracking object
 * @returns {Array} Array of question IDs
 */
export const getCorrectAnswersInCategory = (category, correctAnswersByCategory = {}) => {
  return correctAnswersByCategory[category] || [];
};

/**
 * Check if a specific question was answered correctly before
 * @param {string} questionId - The question ID
 * @param {string} category - The category name
 * @param {Object} correctAnswersByCategory - Tracking object
 * @returns {boolean}
 */
export const isQuestionAnsweredCorrectly = (questionId, category, correctAnswersByCategory = {}) => {
  const categoryAnswers = correctAnswersByCategory[category] || [];
  return categoryAnswers.includes(questionId);
};
```

### Step 3: Update Question Loading

**File:** `src/components/PathCanvas.jsx`

Modify `getRandomUnusedQuestionByCategory` to filter out previously correct answers:

```javascript
// In src/config/questions.js
export const getRandomUnusedQuestionByCategory = (
  category, 
  usedQuestionIds = new Set(),
  correctAnswersByCategory = {} // ← NEW parameter
) => {
  const categoryQuestions = getQuestionsByCategory(category);
  const correctlyAnswered = correctAnswersByCategory[category] || [];
  
  // Filter out used questions AND previously correct questions
  const availableQuestions = categoryQuestions.filter(q => 
    !usedQuestionIds.has(q.id) && 
    !correctlyAnswered.includes(q.id)
  );
  
  if (availableQuestions.length === 0) {
    return null; // Category fully mastered or no new questions
  }
  
  return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
};
```

### Step 4: Update Answer Handler

**File:** `src/components/PathCanvas.jsx`

When a question is answered correctly on first try:

```javascript
if (firstAttempt && isCorrect) {
  // ... existing code ...
  
  // Add to category history
  setCorrectAnswersByCategory(prev => 
    addCorrectAnswer(currentQuestion.id, currentQuestion.category, prev)
  );
}
```

---

## Storage Efficiency Analysis

### Current Implementation
- Stores: `usedQuestionIds` (resets per session) + `correctFirstTryIds` (resets on new game)
- **Issue:** Duplicated learnings across sessions = wasted learnings

### Proposed Implementation
- Stores: `correctAnswersByCategory` (permanent, grows with learning)
- Sample data (100 correct answers):
  ```json
  {
    "food": ["food_001", "food_047", "food_089", "food_102", ...], // ~50 questions
    "shopping": ["shopping_012", "shopping_045", ...], // ~30 questions
    "entertainment": ["entertainment_024", ...], // ~20 questions
  }
  ```
  
- **Approximate sizes:**
  - 100 questions: ~2-3 KB
  - 500 questions: ~10-15 KB
  - 1000 questions: ~20-30 KB
  - Even with 5 players on same device: ~150 KB

**Verdict:** ✅ **No storage concerns** - Well under 5MB limit

---

## Migration Strategy

For existing players with saved games:

```javascript
// During state conversion
export const convertLoadedState = (loadedState) => {
  if (!loadedState) return null;

  // Migrate old correctFirstTryIds to new structure
  let correctAnswersByCategory = loadedState.correctAnswersByCategory || {};
  
  // If they have old-style tracking, preserve it
  if (loadedState.correctFirstTryIds?.length > 0) {
    // You'd need to map these back to their categories
    // For now, start fresh with new session
    correctAnswersByCategory = {};
  }

  return {
    ...loadedState,
    usedQuestionIds: new Set(loadedState.usedQuestionIds || []),
    completedCategories: new Set(loadedState.completedCategories || []),
    correctFirstTryIds: new Set(loadedState.correctFirstTryIds || []),
    correctAnswersByCategory,
  };
};
```

---

## Behavior Changes

### Before
- Player answers Food→Q1 correctly ✅
- Player leaves
- Player returns → Can get Food→Q1 again ❌

### After
- Player answers Food→Q1 correctly ✅
- Player leaves
- Player returns → Will never get Food→Q1 again ✅
- Player can see "You've mastered 47 questions in Food" 📊

---

## Recommendations Summary

| Aspect | Status | Recommendation |
|--------|--------|-----------------|
| **Current Storage** | ✅ Works | Keep localStorage (5-10MB limit) |
| **Storage Method** | ✅ Efficient | Implement category-based tracking |
| **Tracking Scope** | ❌ Session-only | Expand to persist across sessions |
| **Overload Risk** | ✅ None | 1000 questions ≈ 30KB |
| **Implementation** | ⏰ Todo | 2-3 hours of coding |

### Key Points
1. **Don't worry about overload** - Even 10,000 questions would only be ~300KB
2. **Category-based is better** - Enables learning analytics later
3. **Permanent tracking > session tracking** - More educational value
4. **Backward compatible** - Old saves still work, just start fresh

---

**Ready to implement?** I can create the updated files with these changes! 🚀
