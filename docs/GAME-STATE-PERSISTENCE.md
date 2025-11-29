# Game State Persistence Feature

## Overview
WordWalker now automatically saves game progress and allows users to resume their previous game session when they reopen the app, or start a fresh game.

## How It Works

### Automatic Saving
- Game state is **automatically saved every 5 seconds** while playing (once a path has been selected)
- Saved data includes:
  - Total points earned
  - Current streak count
  - Selected path category
  - Checkpoints answered in current category
  - Used question IDs (to prevent duplicates)
  - Completed categories (globally)
  - Fork categories available
  - Sound and volume settings

### Resume Dialog
When users reopen the game:
1. The app checks if a saved game exists
2. If one does, a **Resume Dialog** appears showing:
   - Previous points
   - Previous streak
   - Progress (checkpoints answered)
3. User can choose to:
   - **Resume Game** - Continue from where they left off
   - **New Game** - Start fresh (clears saved state)

### Storage
- Uses browser's `localStorage` API
- Data is stored under key: `'wordwalker-game-state'`
- Persists across browser sessions
- Automatically cleaned up when user starts a new game

## Files Added

### `/src/utils/gameStatePersistence.js`
Utility functions for managing game state:
- `loadGameState()` - Retrieve saved state from localStorage
- `saveGameState(gameState)` - Save game state to localStorage
- `clearGameState()` - Delete saved state
- `hasSavedGameState()` - Check if saved state exists
- `convertLoadedState(loadedState)` - Restore Sets from Arrays (JSON serialization fix)
- `extractGameState(componentState)` - Extract persistable data from component state

### `/src/components/ResumeDialog.jsx`
React component for the resume dialog UI:
- Shows previous game stats
- Provides Resume and New Game buttons
- Fully responsive design
- Smooth slide-up animation

### `/src/components/ResumeDialog.css`
Styling for the resume dialog:
- Gradient background overlay
- Modern card design with backdrop blur
- Responsive button layout
- Mobile-friendly

## Integration in PathCanvas

### New State Variables
```javascript
const [showResumeDialog, setShowResumeDialog] = useState(false);
const [hasCheckedSavedState, setHasCheckedSavedState] = useState(false);
const autosaveTimerRef = useRef(null);
```

### Key Effects

**1. Resume Check (on mount)**
```javascript
useEffect(() => {
  if (!hasCheckedSavedState && hasSavedGameState()) {
    setShowResumeDialog(true);
    setHasCheckedSavedState(true);
  }
}, [hasCheckedSavedState]);
```

**2. Auto-save Interval**
```javascript
useEffect(() => {
  if (!selectedPath) return; // Only save after path selected
  
  autosaveTimerRef.current = setInterval(() => {
    const gameState = { /* ... */ };
    saveGameState(gameState);
  }, 5000);
  
  return () => clearInterval(autosaveTimerRef.current);
}, [totalPoints, streak, selectedPath, checkpointsAnswered, ...]);
```

### Handler Functions

**`handleResumeGame()`**
- Loads saved state from localStorage
- Converts Sets back from Arrays
- Restores all game state variables
- Closes resume dialog

**`handleNewGame()`**
- Clears saved state from localStorage
- Resets all game variables to initial state
- Clears UI dialogs
- Ready for fresh game

## User Experience Flow

```
User opens app
    ↓
Check for saved game
    ↓
    ├─ Saved game exists → Show Resume Dialog
    │   ├─ User clicks "Resume" → Restore state → Continue playing
    │   └─ User clicks "New Game" → Clear state → Start fresh
    │
    └─ No saved game → Show initial fork selection
```

## Data Persistence Details

### What Gets Saved
- ✅ Points and streak
- ✅ Progress through current category
- ✅ Questions already asked (prevents repetition)
- ✅ Completed categories (never re-offered)
- ✅ Available categories for forks
- ✅ Sound preferences

### What Doesn't Get Saved
- ❌ Image assets (reloaded on app start)
- ❌ Audio context (reinitializes)
- ❌ Canvas rendering state
- ❌ Temporary UI states (hints, translations shown during session)

### Why?
These items don't need to be saved because:
- Assets are resources, not game state
- Audio context reinitializes safely on user interaction
- UI states are ephemeral and reset naturally
- Keeping saves lightweight improves performance

## JSON Serialization

Since Sets cannot be directly serialized to JSON:
- Before saving: Convert Sets to Arrays
- After loading: Convert Arrays back to Sets

Example:
```javascript
// Before save
{ usedQuestionIds: Set(123, 456, 789) }

// After serialization
{ usedQuestionIds: [123, 456, 789] }

// After loading
{ usedQuestionIds: Set(123, 456, 789) }
```

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers
- Works with localStorage limit of ~5-10MB per domain

## Technical Notes

### Auto-save Interval
- Saves every 5 seconds during active play
- No save while paused or in dialogs
- Interval clears on component unmount

### Resume Dialog Timing
- Shows immediately on app load if saved game exists
- Only shows once (tracked via `hasCheckedSavedState`)
- Non-blocking - user can close by selecting option

### Performance Impact
- Minimal - only saves ~1KB of JSON every 5 seconds
- No impact on game rendering
- Runs in background without interrupting gameplay

## Future Enhancements

Possible improvements:
- Multiple save slots
- Cloud sync (Firebase, etc.)
- Timestamp of last save
- Detailed progress statistics
- Recovery from corrupted saves
- Export/import saves
