# Persistent Question Tracking - Implementation Testing Guide

## Overview
This document describes how to test the new persistent question tracking system that prevents players from getting questions they've already answered correctly.

## How It Works

### Data Flow
1. Player answers a question correctly on first attempt
2. Question ID is added to `correctAnswersByCategory[category]` array
3. This data is auto-saved to localStorage every 5 seconds
4. When loading a new question, `getRandomUnusedQuestionByCategory()` filters out:
   - Questions already asked in current session (`usedQuestionIds`)
   - Questions answered correctly in past sessions (`correctAnswersByCategory`)
5. Player resumes or starts new game → previously correct questions won't appear

### Storage Structure
```javascript
// Before this implementation:
localStorage['wordwalker-game-state'] = {
  totalPoints: 150,
  streak: 5,
  usedQuestionIds: ['food_001', 'food_045'],  // Reset each session
  correctFirstTryIds: ['food_001'],            // Only for display
}

// After this implementation:
localStorage['wordwalker-game-state'] = {
  totalPoints: 150,
  streak: 5,
  usedQuestionIds: ['food_001', 'food_045'],  // Resets per session
  correctFirstTryIds: ['food_001'],            // Resets per session
  correctAnswersByCategory: {                  // ← NEW: Persists across sessions
    food: ['food_001', 'food_047', 'food_089'],
    shopping: ['shopping_012', 'shopping_045'],
    entertainment: ['entertainment_024'],
  }
}
```

---

## Manual Testing Checklist

### Test 1: Basic Persistence Across Sessions
**Objective:** Verify that correctly answered questions don't repeat

**Steps:**
1. Open the game
2. Select **Food** category
3. Answer 5 questions correctly on first try
   - Note the question IDs shown in console (check DevTools)
   - Example: food_001, food_047, food_089, food_102, food_120
4. **Close the browser completely** (force quit if needed)
5. **Reopen the application**
6. Select **Food** again
7. **Expected:** None of the 5 previously answered questions appear
8. Answer 5 more different questions

**How to Verify:**
- Open DevTools Console (F12 or Cmd+Shift+I)
- Look for question IDs in the console logs
- Or check localStorage directly:
  ```javascript
  JSON.parse(localStorage['wordwalker-game-state']).correctAnswersByCategory
  ```

---

### Test 2: Category Isolation
**Objective:** Verify that mastered questions only disappear from their own category

**Steps:**
1. Play **Food** category, get 5 questions correct
   - E.g., food_001, food_047, food_089, food_102, food_120 ✓
2. Play **Shopping** category, get 3 questions correct
   - E.g., shopping_012, shopping_045, shopping_067 ✓
3. Close and reopen the game
4. Select **Shopping** again
   - **Expected:** food_* questions don't appear (wrong category anyway)
   - **Expected:** The 3 shopping questions (012, 045, 067) don't appear
5. Select **Food** again
   - **Expected:** The 5 food questions (001, 047, 089, 102, 120) don't appear
   - **Expected:** Can still get other food questions

**Verification:**
```javascript
// In console, after loading game:
const state = JSON.parse(localStorage['wordwalker-game-state']);
console.log('Food correct answers:', state.correctAnswersByCategory.food);
console.log('Shopping correct answers:', state.correctAnswersByCategory.shopping);
```

---

### Test 3: New Game Preserves Learning
**Objective:** Verify that starting a new game keeps the correct answers history

**Steps:**
1. Play and answer some questions correctly
   - E.g., in Food: food_001, food_047 ✓
2. Click "New Game" (or "Start Fresh" if prompted)
3. **Expected:** Score resets to 0, streak resets to 0
4. Select **Food** category again
5. **Expected:** food_001 and food_047 don't appear
6. **But** other Food questions are still available

**Verification:**
```javascript
// After new game:
const state = JSON.parse(localStorage['wordwalker-game-state']);
console.log('Total Points:', state.totalPoints); // Should be 0
console.log('Correct answers preserved:', state.correctAnswersByCategory.food);
// Should still have ['food_001', 'food_047']
```

---

### Test 4: Resume Game Works With Correct Answers
**Objective:** Verify resume functionality works with new tracking

**Steps:**
1. Play and answer 3 questions correctly
   - E.g., food_001, food_047, food_089 ✓
2. Leave the game (don't start new game)
3. Refresh or close/reopen within a reasonable time
4. When prompted: Click "Resume Game"
5. **Expected:** Previous session stats shown
6. Continue playing in same category
7. **Expected:** Previously correct questions (001, 047, 089) don't appear
8. Answer more questions correctly

---

### Test 5: Multiple Categories Simultaneously
**Objective:** Verify tracking works across multiple categories in same session

**Steps:**
1. Play **Food** → Answer 3 questions correctly (e.g., food_001, food_047, food_089)
2. At fork, switch to **Shopping** → Answer 3 questions correctly (e.g., shopping_012, shopping_045, shopping_067)
3. At fork, switch back to **Food**
4. **Expected:** food_001, food_047, food_089 don't appear (already correct)
5. **But:** other food questions are available
6. Answer 2 more correctly (e.g., food_102, food_120)
7. Close game completely
8. Reopen and go to **Food**
9. **Expected:** All 5 (001, 047, 089, 102, 120) are now hidden
10. **But** other food questions still available

**Verification:**
```javascript
const state = JSON.parse(localStorage['wordwalker-game-state']);
console.log(state.correctAnswersByCategory);
// Should show:
// {
//   food: ['food_001', 'food_047', 'food_089', 'food_102', 'food_120'],
//   shopping: ['shopping_012', 'shopping_045', 'shopping_067']
// }
```

---

### Test 6: Storage Size Verification
**Objective:** Verify storage doesn't grow excessively

**Steps:**
1. Check initial storage size:
   ```javascript
   const state = localStorage['wordwalker-game-state'];
   console.log('Storage size:', state.length, 'bytes');
   console.log('Storage size (KB):', (state.length / 1024).toFixed(2), 'KB');
   ```

2. Answer 50 more questions correctly across multiple categories

3. Check storage size again:
   ```javascript
   const state = localStorage['wordwalker-game-state'];
   console.log('Storage size:', state.length, 'bytes');
   ```

4. **Expected:** Only ~200-300 bytes increase for each question (~6 bytes per ID + separators)
   - 50 questions ≈ 300-500 bytes additional

5. Answer 100 more questions (total 150)

6. **Expected:** Total should be under 10 KB
   - 150 questions ≈ 3-4 KB worst case

---

### Test 7: Edge Case - All Questions Mastered
**Objective:** Verify behavior when all questions in a category are answered correctly

**Steps:**
1. Get the question count for a small category
   - Beach has ~15 questions
   - Emergency has ~15 questions

2. Answer ALL questions in Beach category correctly
   - Should be ~15 questions total

3. At fork, select Beach again

4. **Expected:** System shows all questions again (falls back to showing previously correct)
   - Log message: "All questions in category Beach have been mastered..."

5. Can still play and get points (for streak/replay)

---

### Test 8: Browser DevTools Verification

**Check localStorage structure:**
```javascript
// In browser console:
const state = JSON.parse(localStorage['wordwalker-game-state']);

// View entire structure
console.table(state);

// View just correct answers by category
console.table(state.correctAnswersByCategory);

// Count total mastered questions
const total = Object.values(state.correctAnswersByCategory)
  .reduce((sum, arr) => sum + arr.length, 0);
console.log('Total questions mastered:', total);

// Check specific category
console.log('Food questions mastered:', state.correctAnswersByCategory.food);
```

---

## Debugging Tips

### If questions are still repeating:
1. Clear localStorage and start fresh:
   ```javascript
   localStorage.removeItem('wordwalker-game-state');
   location.reload();
   ```

2. Check if question IDs are being tracked:
   ```javascript
   const state = JSON.parse(localStorage['wordwalker-game-state']);
   console.log('Correct answers:', state.correctAnswersByCategory);
   // Should see something like: { food: ['food_001', 'food_047'], ... }
   ```

3. Verify questions have `category` property:
   - Open `src/config/questions.js`
   - Check that each question has `category: 'food'` (or whatever category)

### If storage isn't updating:
1. Check that autosave interval is working:
   - Look for console logs every 5 seconds
   - Or manually trigger: `setInterval(() => console.log('tick'), 5000)`

2. Verify save function is being called:
   - Open DevTools → Network tab
   - Look for localStorage updates (won't show in network, but will show in Application tab)

3. Check Application tab in DevTools:
   - DevTools → Application → Local Storage
   - Verify `wordwalker-game-state` exists
   - Check if `correctAnswersByCategory` field is present

---

## Performance Expectations

### Storage Usage
- Per question ID: ~6-12 bytes (e.g., "food_001")
- 100 mastered questions: ~2-3 KB
- 500 mastered questions: ~10-15 KB
- **Status:** ✅ Well under 5MB limit

### Lookup Performance
- Filtering questions: <1ms for each question
- With 1000 questions: <100ms worst case
- **Status:** ✅ Negligible impact

### Auto-save Performance
- Runs every 5 seconds
- Serializes state to JSON: <1ms
- **Status:** ✅ No noticeable lag

---

## Success Criteria

✅ **All tests pass when:**
1. Questions answered correctly don't repeat in same category
2. Correct answers persist across browser sessions
3. Data doesn't interfere with other categories
4. Storage doesn't exceed 50KB for typical gameplay
5. No noticeable performance degradation
6. Resume feature works with correct answer tracking

---

**Last Updated:** December 3, 2025
**Implementation Status:** ✅ Complete
