# Game State Persistence - Visual Guide

## Feature Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    WordWalker Game Session                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  User Actions (Playing)                                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Select Path → Answer Q → Answer Q → Answer Q → Close App   │
│      ↓            ↓          ↓          ↓          ↓        │
│   Points: 0    +50pts    +40pts     +30pts     CLOSED      │
│   Streak: 0    Streak:1  Streak:2   Streak:3                │
│                                                              │
│              Auto-save every 5 seconds                       │
│              ↓              ↓              ↓                 │
│          localStorage   localStorage   localStorage          │
│            Save #1        Save #2        Save #3             │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  App Reopened                                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Check localStorage → Found saved state                     │
│                          ↓                                  │
│                    Show Resume Dialog                       │
│                   ┌──────────────────┐                     │
│                   │  Welcome Back!   │                     │
│                   │  Points: 120     │                     │
│                   │  Streak: 3       │                     │
│                   │                  │                     │
│                   │ [Resume] [New]   │                     │
│                   └──────────────────┘                     │
│                        ↙             ↘                     │
│                   Resume            New Game                │
│                      ↓                 ↓                    │
│              Restore State         Clear State              │
│              Continue Game         Start Fresh              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## State Flow Diagram

```
┌──────────────────────┐
│  Component Mounts    │
└──────────┬───────────┘
           │
           ↓
  ┌────────────────────┐
  │ Check for saved    │
  │ game state         │
  │ (on load only)     │
  └────┬───────────────┘
       │
    ┌──┴──┐
    ↓     ↓
 YES      NO
    │     │
    │     └──→ [No dialog shown]
    │         Show initial fork
    │
    ↓
┌─────────────────┐
│ Show Resume     │
│ Dialog with:    │
│ - Points        │
│ - Streak        │
│ - Progress      │
└────┬────────────┘
     │
  ┌──┴──┐
  ↓     ↓
Resume New Game
  │     │
  ↓     ↓
 [A]   [B]

[A] Resume Flow:
    ├─ Load state from localStorage
    ├─ Convert Arrays → Sets
    ├─ Restore all state variables
    ├─ Close dialog
    └─ Continue from last position

[B] New Game Flow:
    ├─ Clear localStorage
    ├─ Reset all state to defaults
    ├─ Close dialog
    └─ Show fresh fork selection

Both flows then enter normal gameplay
with auto-save running every 5 seconds
```

## Data Flow - Auto-Save

```
Game State (Component)
├─ totalPoints
├─ streak
├─ selectedPath
├─ checkpointsAnswered
├─ usedQuestionIds (Set)
├─ completedCategories (Set)
├─ forkCategories
├─ soundEnabled
└─ volume
    │
    │ (every 5 seconds, if path selected)
    │
    ↓
Extract Game State
    │
    ├─ Convert Sets to Arrays
    │ (usedQuestionIds: Set → Array)
    │ (completedCategories: Set → Array)
    │
    ↓
Serialize to JSON
    │
    ↓
localStorage.setItem(
  'wordwalker-game-state',
  JSON.stringified_state
)
    │
    ↓
Persisted in Browser Storage
(survives page close/refresh)
```

## Resume Flow - Restore

```
User Reopens App
    ↓
Read from localStorage
    │
    ├─ Parse JSON
    ├─ Key: 'wordwalker-game-state'
    │
    ↓
Convert Loaded State
    │
    ├─ Convert Arrays back to Sets
    │ (usedQuestionIds: Array → Set)
    │ (completedCategories: Array → Set)
    │
    ↓
Restore to Component State
    │
    ├─ setTotalPoints(loadedState.totalPoints)
    ├─ setStreak(loadedState.streak)
    ├─ setSelectedPath(loadedState.selectedPath)
    ├─ setCheckpointsAnswered(...)
    ├─ setUsedQuestionIds(...)
    ├─ setCompletedCategories(...)
    ├─ setForkCategories(...)
    ├─ setSoundEnabled(...)
    └─ setVolume(...)
    │
    ↓
Game Ready (same state as before)
```

## Storage Timeline

```
Timeline of a Typical Session:

T=0s     ┌─ User selects path
         │  Auto-save enabled
         │
T=5s     ├─ First auto-save
         │  localStorage updated
         │
T=10s    ├─ Second auto-save
         │  Points/Streak changed
         │
T=15s    ├─ Third auto-save
         │
T=20s    │
         ├─ User answers question
         │
T=25s    ├─ Fourth auto-save
         │  (latest state saved)
         │
T=∞      └─ User closes app
             ↓
         State persists in localStorage
         Browser closed
         
         ──────────────────────
         
         User reopens browser
             ↓
         Resume dialog appears
         Last saved state shown
         User can resume or start new
```

## Component State Management

```
┌─────────────────────────────────────────────────┐
│  PathCanvas Component State                     │
├─────────────────────────────────────────────────┤
│                                                 │
│  Persisted (Auto-saved):                       │
│  ├─ totalPoints             ✓ Saved            │
│  ├─ streak                  ✓ Saved            │
│  ├─ selectedPath            ✓ Saved            │
│  ├─ checkpointsAnswered     ✓ Saved            │
│  ├─ usedQuestionIds         ✓ Saved (Set→Array)│
│  ├─ completedCategories     ✓ Saved (Set→Array)│
│  ├─ forkCategories          ✓ Saved            │
│  ├─ soundEnabled            ✓ Saved            │
│  └─ volume                  ✓ Saved            │
│                                                 │
│  NOT Persisted (Session-only):                 │
│  ├─ showResumeDialog        ✗ UI state        │
│  ├─ showChoice              ✗ UI state        │
│  ├─ showQuestion            ✗ UI state        │
│  ├─ currentQuestion         ✗ UI state        │
│  ├─ questionAnswered        ✗ UI state        │
│  ├─ showTranslation         ✗ UI state        │
│  ├─ showHint                ✗ UI state        │
│  ├─ isPaused                ✗ UI state        │
│  ├─ Refs (canvas, timing)   ✗ Runtime state   │
│  └─ Images & Audio          ✗ Resources       │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Browser Storage Comparison

```
┌───────────────────────────────────────────────────┐
│  Persistent Storage Options Compared              │
├───────────────────────────────────────────────────┤
│                                                   │
│  localStorage (✓ Used)                           │
│  ├─ Pros: Simple, ~5-10MB limit, persistent     │
│  ├─ Cons: Synchronous, no encryption            │
│  └─ Good for: Small game state data              │
│                                                   │
│  sessionStorage (alternative)                    │
│  ├─ Cleared when tab closes                      │
│  └─ Not suitable (we want persistence)           │
│                                                   │
│  IndexedDB (could use for future)                │
│  ├─ More complex API                             │
│  ├─ Larger storage limit (~50MB)                 │
│  └─ Good for: Large assets, binary data          │
│                                                   │
│  Cloud Sync (could add later)                    │
│  ├─ Firebase, AWS, etc.                          │
│  ├─ Cross-device sync                            │
│  └─ Requires backend                             │
│                                                   │
└───────────────────────────────────────────────────┘
```

## Resume Dialog Component Hierarchy

```
ResumeDialog
├─ Overlay (semi-transparent background)
└─ Dialog Container
   ├─ Title: "Welcome Back!"
   ├─ Message
   ├─ Saved Stats Display
   │  ├─ Points: [value]
   │  ├─ Streak: [value]
   │  └─ Progress: [value] checkpoints
   └─ Button Container
      ├─ Resume Button (Green)
      │  └─ onClick: handleResumeGame()
      └─ New Game Button (Red)
         └─ onClick: handleNewGame()
```

## File Structure

```
wordwalker/
├─ src/
│  ├─ utils/
│  │  └─ gameStatePersistence.js      [NEW] Core logic
│  ├─ components/
│  │  ├─ PathCanvas.jsx                [UPDATED] Integrated persistence
│  │  ├─ ResumeDialog.jsx              [NEW] Resume UI
│  │  └─ ResumeDialog.css              [NEW] Resume styling
│  └─ ... (other components)
│
├─ GAME-STATE-PERSISTENCE.md           [NEW] Feature docs
├─ TESTING-PERSISTENCE.md              [NEW] Testing guide
└─ ... (other files)
```

## Key Timings

```
Auto-save Interval: 5 seconds (after path selected)
├─ Why 5s? Good balance between frequency and performance
├─ Too fast (1s): Excessive writes, battery drain
└─ Too slow (30s+): Risk of data loss on crash

Resume Dialog: Shows only on app load
├─ Checked once per component mount
├─ Not shown on subsequent renders
└─ User must explicitly choose resume or new game

localStorage Persistence: Survives indefinitely
├─ Until user explicitly clears browser data
├─ Or until handleNewGame() is called
└─ Or until localStorage quota exceeded (rare)
```
