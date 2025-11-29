# Game State Persistence - Testing Guide

## Testing the Resume Feature

### Test 1: Basic Resume Functionality

1. **Start the game**
   - Open the app in a browser
   - Should show the initial fork selection (no resume dialog yet)

2. **Play for a bit**
   - Select a path (category)
   - Answer a few questions (get at least 3-5 points and a streak)
   - Let the auto-save trigger (waits 5 seconds after path selection)

3. **Close the app**
   - Close the browser tab or navigate away

4. **Reopen the app**
   - Navigate back to the game
   - **Expected**: Resume Dialog should appear showing:
     - Your previous points
     - Your previous streak
     - Number of checkpoints answered
   - Click **"Resume Game"**
   - **Expected**: Game continues from exactly where you left off
     - Same points displayed
     - Same streak
     - Same path/category selected
     - Same position on the path

### Test 2: New Game Button

1. **Have a saved game** (follow Test 1 steps 1-3)

2. **Reopen the app**
   - Resume Dialog appears

3. **Click "New Game"**
   - **Expected**: 
     - Dialog closes
     - Game resets completely
     - Points = 0
     - Streak = 0
     - No path selected yet
     - Fresh fork selection shown

4. **Verify localStorage was cleared**
   - Open browser DevTools (F12)
   - Go to Application → Storage → Local Storage
   - Search for `wordwalker-game-state` key
   - **Expected**: Key should be deleted

### Test 3: Auto-Save Verification

1. **Start a new game**
   - Select a path
   - Answer a question correctly

2. **Monitor localStorage**
   - Open DevTools (F12)
   - Application → Local Storage → [your domain]
   - Watch the `wordwalker-game-state` value

3. **Wait 5 seconds**
   - **Expected**: The stored value should update with new points/streak

4. **Answer more questions**
   - Watch localStorage update every 5 seconds
   - Points and streak should increment in saved state

### Test 4: Sound Preferences Persist

1. **Start a game** with any settings
   - Adjust volume slider
   - Toggle sound on/off
   - Close the app

2. **Reopen the app**
   - Click "Resume"
   - **Expected**: Sound settings preserved
     - Volume level same
     - Sound enabled/disabled state same

### Test 5: Question Deduplication Works

1. **Resume a game**
   - Click "Resume" to restore previous session
   - Continue playing in the same category

2. **Answer multiple questions**
   - **Expected**: Should never see same question twice in current category walk
   - All questions asked should be marked as used

3. **Complete the category**
   - Keep answering questions until all in that category are used
   - Next checkpoint should trigger next fork selection

### Test 6: Multiple Save/Resume Cycles

1. **Save, close, resume**
   - Play → Points: 100, Streak: 5
   - Close app
   - Reopen and resume
   - **Expected**: Points = 100, Streak = 5

2. **Play more, save again**
   - Answer more questions
   - Points: 150, Streak: 8
   - Close app

3. **Reopen and verify new state saved**
   - Resume
   - **Expected**: Points = 150, Streak = 8

### Test 7: Edge Cases

#### 7a: No Internet After Close
- Save a game
- Close the app
- Go offline
- Reopen app
- **Expected**: Should still resume (localStorage doesn't need internet)

#### 7b: Clear Cache and Resume
- Save a game
- Clear browser cache/cookies (but NOT localStorage, depending on browser)
- Reopen app
- **Expected**: Should still have saved state (localStorage usually survives cache clear)

#### 7c: Private/Incognito Mode
- Open app in private/incognito window
- Play and save
- Close window
- Reopen private window
- **Expected**: May not persist (localStorage behavior varies in private mode)

### Test 8: Mobile Device Testing

1. **On iOS Safari**
   - Play and save
   - Swipe up to close app
   - Reopen app
   - **Expected**: Resume dialog appears

2. **On Android Chrome**
   - Play and save
   - Go home (don't close completely)
   - Click app again
   - **Expected**: Game continues (or shows resume on full app restart)

3. **Responsiveness**
   - Resume dialog should fit well on small screens
   - Buttons should be easily tappable (44px minimum height)
   - Text should be readable

## Manual Testing Checklist

### Before Release
- [ ] Resume dialog appears on app reopen when saved game exists
- [ ] Resume button correctly restores all game state
- [ ] New Game button clears state and resets game
- [ ] Auto-save triggers every 5 seconds
- [ ] localStorage correctly stores and retrieves state
- [ ] No console errors when resuming
- [ ] Sound settings persist across sessions
- [ ] Questions don't repeat after resume
- [ ] Completed categories still marked as complete
- [ ] UI is responsive on mobile devices
- [ ] Build passes without errors: `yarn build`

### Verification Commands (DevTools Console)

```javascript
// Check if saved state exists
localStorage.getItem('wordwalker-game-state')

// Parse and view the saved state
JSON.parse(localStorage.getItem('wordwalker-game-state'))

// Manually clear saved state
localStorage.removeItem('wordwalker-game-state')

// Check storage size
JSON.stringify(localStorage.getItem('wordwalker-game-state')).length

// Listen for storage changes (from other tabs)
window.addEventListener('storage', (e) => {
  if (e.key === 'wordwalker-game-state') {
    console.log('Game state changed in another tab:', e.newValue);
  }
});
```

## Debugging Tips

### Resume Dialog Not Appearing
1. Check `hasCheckedSavedState` in component state
2. Verify `localStorage` contains `wordwalker-game-state` key
3. Check browser console for errors in `loadGameState()`
4. Verify component mounted (check React DevTools)

### State Not Restoring Correctly
1. Check console for errors in `convertLoadedState()`
2. Verify Set conversion worked: `usedQuestionIds` should be a Set, not Array
3. Compare saved vs. restored values in DevTools
4. Check if Sets properly converted from Arrays

### Auto-Save Not Working
1. Verify `selectedPath` is set (auto-save only runs after path selected)
2. Check that interval is created: `autosaveTimerRef.current !== null`
3. Monitor localStorage - should update every 5 seconds
4. Check for JavaScript errors in console

### Performance Issues
1. Check localStorage size - shouldn't exceed ~1KB
2. Verify interval cleanup on unmount
3. Monitor CPU during auto-save cycle
4. Profile with DevTools Performance tab

## Metrics to Validate

After implementation, verify:
- **localStorage size**: < 2KB per save
- **Auto-save frequency**: Every 5 seconds ±500ms
- **Resume time**: < 100ms to restore state
- **Memory impact**: < 1MB additional memory
- **No memory leaks**: Intervals properly cleared on unmount
