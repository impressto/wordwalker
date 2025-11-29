# WordWalker - Specification Document

> **🤖 AI Coding Agent Notice:** This is a LIVING DOCUMENT that should be updated whenever project changes are made. When implementing new features, fixing bugs, or making architectural changes, please update the relevant sections of this specification to maintain accuracy and completeness. This ensures the documentation stays synchronized with the actual codebase and helps future development efforts.

*Comprehensive technical specification for WordWalker*  
*Last Updated: November 29, 2025*  
*Version: 1.1.0*  
*Status: Production*

## 📋 Project Overview

**Project Name:** WordWalker  
**Description:** WordWalker is a gamified Spanish language learning application that presents vocabulary learning as a journey along a scrolling road. Users answer multiple-choice questions in emoji-illustrated quiz format while traveling through different category paths (food, shopping, entertainment, etc.). The game emphasizes engagement through visual feedback, streak bonuses, scoring systems, and contextual hints to support learning.

**Production URL:** https://impressto.ca/wordwalker/

**Target Users:** 
- Spanish language learners (beginners to intermediate level)
- Travelers preparing for Spanish-speaking destinations
- Visual learners who prefer gamified interfaces
- Mobile and desktop users seeking engaging vocabulary practice
- Self-paced learners looking for category-based learning experiences

**Business Value:** 
- Provides an engaging approach to vocabulary learning that reduces monotony
- Increases learner engagement through gamification (scores, streaks, visual feedback)
- Creates memorable learning through emoji associations and contextual hints
- Allows learners to focus on relevant categories based on travel or interest needs
- Free, accessible language learning tool requiring no authentication

**Success Metrics:** 
- Questions answered correctly (accuracy rate)
- Category walks completed
- Average streak length per session
- Time spent per category walk (10 questions)
- Return visitor rate
- Mobile vs desktop usage patterns

**Project Scope:**  
**In Scope:**
✅ Canvas-based scrolling road visualization with animated travel
✅ 8 vocabulary categories with 530+ total questions
✅ Multiple-choice quiz system with emoji illustrations
✅ Category selection at path forks
✅ Contextual hint system for incorrect answers
✅ Score tracking and streak bonuses
✅ Visual feedback (animations, notifications)
✅ Duplicate question prevention within walks
✅ Translation overlay for learning reinforcement
✅ Responsive design for desktop and mobile
✅ Static deployment (no backend required)
✅ Game state persistence with auto-save every 5 seconds
✅ Resume functionality for interrupted games
✅ Offline gameplay with Service Worker PWA support

**Out of Scope:**
- User authentication and account management
- Multi-language support (currently Spanish-English only)
- Social features and leaderboards
- Advanced analytics and learning insights
- Audio pronunciation features
- User progress persistence across devices/browsers (currently single-device only)

**Constraints:**
- Must run smoothly on canvas at 60 FPS
- Static emoji-based illustrations (no custom artwork required)
- Deployed as static site in subdirectory (/wordwalker/)
- LocalStorage only for temporary session state
- Must work on both desktop and mobile browsers
- No backend infrastructure or database

## ⚙️ Technical Requirements

### Architecture Overview
**System Architecture:** Single-page Application (SPA) with client-side rendering and HTML5 Canvas  
**Architectural Patterns:** React component-based architecture with canvas rendering layer, React hooks for state management  
**Integration Approach:** Static content deployment with no backend dependencies  
**Data Flow:** User interactions → React state updates → Canvas re-render → Visual feedback → Score/progress updates

**Implemented Architecture:**
- **Canvas Layer:** Scrolling road animation with checkpoint nodes, fork junctions, and visual feedback
- **React Components:** PathCanvas (main game), QuestionDialog (quiz UI), ScoreDisplay, StreakBonusNotification, TranslationOverlay, ResumeDialog
- **State Management:** React useState/useRef hooks for game state, localStorage for persistence, no external state library needed
- **Content System:** Static JavaScript configuration files for questions and translations
- **Sound System:** Web Audio API for feedback sounds (correct, wrong, choice, streak)
- **Persistence Layer:** gameStatePersistence utility module for save/load/resume operations

### Technology Stack Decisions

#### Frontend Technology
**Chosen:** React 18.3.1 with Vite 7.2.4, JavaScript (ES6+), HTML5 Canvas API  
**Rationale:** React provides excellent component architecture while allowing direct canvas manipulation. Vite offers lightning-fast development with HMR and optimized production builds. Canvas API provides smooth 60 FPS scrolling animations and custom visual effects.  
**Consequences:**
- *Positive:* Fast development and build times, excellent tooling, performant canvas rendering, simple state management with hooks, small bundle size (339 KB / 92 KB gzipped)
- *Negative:* Canvas accessibility requires semantic HTML layer, limited to client-side logic only
- *Implementation:* PathCanvas component manages canvas lifecycle with useEffect, requestAnimationFrame for smooth scrolling

#### Backend Technology  
**Chosen:** None - Pure static deployment via PHP wrapper  
**Rationale:** All game logic and content handled client-side. No user accounts or server-side persistence needed for MVP. Deployed in subdirectory using index.php wrapper for clean URL handling.  
**Consequences:**
- *Positive:* Zero backend costs, instant deployment, no API dependencies, works anywhere
- *Negative:* No cross-device progress sync, content changes require rebuild/redeploy
- *Implementation:* Vite builds to `/dist` subdirectory, PHP index.php serves built assets with proper base path configuration

#### Database Technology
**Chosen:** None - All content in static JavaScript modules  
**Rationale:** Questions and translations stored in `src/config/questions.js` and `src/config/translations.js`. No runtime database needed.  
**Consequences:**
- *Positive:* Instant content access, no latency, offline-capable, version controlled content
- *Negative:* Content updates require code changes and redeployment
- *Implementation:* 530+ questions exported as JavaScript objects with proper categorization

#### Infrastructure & Deployment
**Chosen:** Static hosting on impressto.ca via subdirectory deployment  
**Rationale:** Simple Apache/Nginx hosting with PHP wrapper for clean URLs. Git-based deployment to production server.  
**Consequences:**
- *Positive:* Simple deployment, fast CDN performance, standard HTTPS
- *Negative:* Manual deployment process (no CI/CD pipeline)
- *Implementation:* 
  - Vite config: `base: '/wordwalker/dist/'`
  - Production structure: `/wordwalker/index.php` → `/wordwalker/dist/*`
  - Asset paths correctly resolve in subdirectory context

### System Requirements  
**Achieved Performance:** 
- Initial load time: < 2 seconds on broadband
- Canvas rendering: 60 FPS steady (3 pixels/frame scroll)
- Bundle size: 339.13 kB JS (92.37 kB gzipped)
- Smooth animations and transitions
- Emoji-based assets load instantly (no external images)
- Auto-save mechanism: Every 5 seconds during gameplay (non-blocking)
- State restoration: < 50ms from localStorage

**Scalability:** 
- Supports unlimited concurrent users (static hosting)
- 8 learning categories implemented
- 530+ questions across all categories
- Extensible architecture for additional categories
- Persistence handles any game state size (< 50 KB typical)

**Security:** 
- HTTPS enabled on production domain
- React's built-in XSS protection
- No user data collection or storage
- Content Security Policy ready

**Compatibility - Verified:** 
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Android)
- Touch and mouse input fully supported
- Responsive design: 320px mobile to 2560px+ desktop

**Availability:** 
- Hosted on reliable web server
- Static assets cached by browser
- No external API dependencies

### Development Environment  
**Implemented:**
- Version Control: Git
- Build Tool: Vite 7.2.4 with fast HMR
- Package Manager: npm
- Development Server: `npm run dev` (instant HMR)
- Production Build: `npm run build` (optimized output)
- Code Quality: ESLint configuration

### Cross-Cutting Concerns
**Logging Strategy:** Console logging for debugging, React error boundaries prevent crashes  
**Error Handling:** Graceful fallbacks for missing audio, safe emoji rendering, try-catch blocks around critical logic  
**Security Implementation:** React escaping, safe content loading, no eval() or innerHTML usage  
**Performance Optimization:** RequestAnimationFrame for animations, efficient canvas clearing, minimal re-renders via React.memo patterns  
**Monitoring & Observability:** Browser console logging, React DevTools compatibility  

## 🎯 Functional Requirements

### Core Game Mechanics

#### Scrolling Road Visualization
**Priority:** Critical ✅ IMPLEMENTED  
**User Story:** As a language learner, I want to see my journey as a scrolling road so that learning feels like forward progress  
**Acceptance Criteria:**
- [x] Canvas renders a scrolling road that moves upward
- [x] Road scrolls at 3 pixels per frame (60 FPS)
- [x] Checkpoints appear as nodes along the road
- [x] Fork points allow category selection
- [x] Smooth scrolling animation with requestAnimationFrame
- [x] Responsive canvas adapts to screen size
- [x] Visual feedback for progress (road behind represents progress made)

**Business Rules:**
- Road scrolls continuously during category walks
- 10 checkpoints (questions) per category walk
- Fork appears after completing a category
- User cannot skip checkpoints

**Implementation Details:**
- PathCanvas component manages scrolling offset via useRef
- Road segments drawn with alternating grass borders
- Checkpoint spacing: 400px initial, 600px subsequent
- Fork junction spacing: 600px after category completion

---

#### Category-Based Learning System
**Priority:** Critical ✅ IMPLEMENTED  
**User Story:** As a language learner, I want to choose vocabulary categories relevant to my needs so that I can focus on useful topics  
**Acceptance Criteria:**
- [x] 8 vocabulary categories implemented:
  - 🍎 Food (155 questions)
  - 🛍️ Shopping (150 questions)
  - 🎭 Entertainment (150 questions)
  - 🚌 Transportation (15 questions)
  - 🧭 Directions (15 questions)
  - 🚨 Emergencies (15 questions)
  - 🏖️ Beach (15 questions)
  - 🏨 Accommodation (15 questions)
- [x] Each category has unique emoji icon
- [x] Categories selectable at fork junctions
- [x] PathChoiceDialog modal for category selection
- [x] Just-completed category excluded from next fork choices
- [x] Visual category indicators on fork paths

**Business Rules:**
- Minimum 10 questions required per category for viable walk
- Categories organized by real-world use cases (travel, daily life)
- Completed category cannot be immediately repeated

**Implementation Details:**
- Questions stored in `src/config/questions.js`
- Category metadata in categories array with id, name, emoji, color
- `getRandomUnusedQuestionByCategory()` prevents duplicates within walk
- Fork logic randomly selects 2-3 categories excluding previous

---

#### Multiple-Choice Quiz System
**Priority:** Critical ✅ IMPLEMENTED  
**User Story:** As a language learner, I want to answer multiple-choice questions so that I can test my vocabulary knowledge  
**Acceptance Criteria:**
- [x] Questions display with emoji illustration
- [x] Spanish question text with 3 answer options
- [x] Immediate visual feedback (green=correct, red=wrong)
- [x] Sound effects for correct/incorrect answers
- [x] Score increases on correct answers (+10 points base)
- [x] Translation overlay shows after answering
- [x] Duplicate questions prevented within same category walk
- [x] Questions have varied formats (not just "¿Qué es esto?")

**Business Rules:**
- Each question worth 10 base points
- Streak bonuses add additional points (see Streak System)
- All questions must have exactly 3 options
- Correct answer randomly positioned among options

**Implementation Details:**
- QuestionDialog component renders modal UI
- `handleAnswerChoice()` processes selection and updates state
- Set-based tracking of used question IDs per category
- Questions include: id, emoji, question, options[], correctAnswer, hint, points, category, difficulty

---

### Learning Support Features

#### Contextual Hint System
**Priority:** High ✅ IMPLEMENTED  
**User Story:** As a language learner, I want helpful hints when I answer incorrectly so that I can learn without frustration  
**Acceptance Criteria:**
- [x] Hint appears after wrong answer
- [x] Hints are contextual, not just translations
- [x] Each question has custom hint text
- [x] Hints provide learning clues without giving away answer
- [x] 530+ questions all have custom hints
- [x] Automated hint generation script created for scalability

**Business Rules:**
- Hints shown only after incorrect answer
- Hints reset when new question loads
- Hints educational, not punishing

**Implementation Details:**
- `showHint` state in PathCanvas
- Set to `true` on wrong answer, `false` on new question
- QuestionDialog displays hint conditionally
- `add-hints.js` Node script for bulk hint generation
- Hint patterns: emoji clues, category clues, characteristic descriptions

---

#### Translation Overlay
**Priority:** High ✅ IMPLEMENTED  
**User Story:** As a language learner, I want to see English translations after answering so that I reinforce my learning  
**Acceptance Criteria:**
- [x] Translation overlay appears after each answer
- [x] Shows Spanish word and English translation
- [x] Auto-closes after 2 seconds
- [x] Visually distinct overlay design
- [x] Translations for 530+ vocabulary terms

**Business Rules:**
- Translation shown regardless of correct/incorrect answer
- Reinforces learning through repetition
- Supports both correct answer learning and mistake correction

**Implementation Details:**
- TranslationOverlay component
- Translations stored in `src/config/translations.js`
- Spanish-to-English mapping object
- Automatic fadeout animation

---

### Gamification & Engagement

#### Scoring System
**Priority:** High ✅ IMPLEMENTED  
**User Story:** As a language learner, I want to earn points for correct answers so that I feel motivated and accomplished  
**Acceptance Criteria:**
- [x] Base score: 10 points per correct answer
- [x] Streak multipliers increase points (x2, x3, x5)
- [x] Score displayed prominently in UI
- [x] Score persists during session
- [x] Visual score update animations

**Business Rules:**
- Only correct answers earn points
- Streak multipliers apply automatically
- Score resets not implemented (session-based)

**Implementation Details:**
- ScoreDisplay component shows current score
- `score` state in PathCanvas
- Score calculation: base (10) + streak bonus
- Animated score increases

---

#### Streak Bonus System
**Priority:** High ✅ IMPLEMENTED  
**User Story:** As a language learner, I want to earn streak bonuses for consecutive correct answers so that I'm motivated to maintain focus  
**Acceptance Criteria:**
- [x] Streak counter tracks consecutive correct answers
- [x] Streak broken on wrong answer
- [x] Bonus notifications at milestones:
  - 🔥 3 streak = 2x multiplier
  - 🔥🔥 5 streak = 3x multiplier  
  - 🔥🔥🔥 7 streak = 5x multiplier
- [x] Visual streak bonus notification
- [x] Sound effect for streak achievements

**Business Rules:**
- Streak starts at 0
- Increments only on correct answers
- Resets to 0 on wrong answer
- Multiplier applies to current question score

**Implementation Details:**
- `streak` state in PathCanvas
- StreakBonusNotification component for visual feedback
- Streak thresholds: 3, 5, 7 for special bonuses
- `streak.mp3` sound plays on milestone achievements

---

### Audio Feedback System
**Priority:** Medium ✅ IMPLEMENTED  
**User Story:** As a language learner, I want audio feedback for my actions so that the experience feels more engaging  
**Acceptance Criteria:**
- [x] Correct answer sound (positive tone)
- [x] Wrong answer sound (gentle negative tone)
- [x] Streak achievement sound (celebration)
- [x] Choice selection sound (UI feedback)
- [x] Sounds managed by centralized SoundManager
- [x] Graceful fallback if audio fails to load

**Business Rules:**
- Sounds enhance but don't distract
- No mute option implemented (future enhancement)
- Audio errors don't break game functionality

**Implementation Details:**
- `soundManager.js` with Web Audio API
- Preloaded sound files in `/public/audio/`
- Try-catch blocks prevent audio errors from crashing game
- Sounds: correct.mp3, wrong.mp3, streak.mp3, choice.mp3

---

### User Interface Components

#### Responsive Design
**Priority:** High ✅ IMPLEMENTED  
**User Story:** As a language learner, I want to use the app on my phone or computer so that I can learn anywhere  
**Acceptance Criteria:**
- [x] Mobile-optimized interface (320px+)
- [x] Desktop-optimized interface (1024px+)
- [x] Tablet support (768px-1023px)
- [x] Touch-friendly button sizes
- [x] Responsive canvas that fills viewport
- [x] Responsive font sizes and UI elements
- [x] No horizontal scrolling on mobile

**Business Rules:**
- Must maintain usability across all screen sizes
- Touch targets minimum 44x44px
- Canvas adapts to available space

**Implementation Details:**
- CSS media queries for breakpoints
- Canvas sized via window dimensions
- Touch events for mobile, mouse events for desktop
- Flexbox layouts for responsive components

---

## 🔒 Non-Functional Requirements

**Performance Requirements - ACHIEVED:**
- Page load time: < 2 seconds on broadband ✅
- Canvas rendering: 60 FPS steady ✅
- Bundle size: 339 KB (92 KB gzipped) ✅
- Interaction response: Instant (< 50ms) ✅
- Smooth scrolling animation ✅
- No lag during gameplay ✅

**Security Requirements - IMPLEMENTED:**
- HTTPS only in production ✅
- Content Security Policy ready ✅
- React XSS protection (built-in escaping) ✅
- No user data collection ✅
- No sensitive data storage ✅

**Usability Requirements - IMPLEMENTED:**
- Intuitive quiz interface ✅
- Clear visual feedback for all actions ✅
- Emoji-based visual learning ✅
- Browser support: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+) ✅
- Mobile support: iOS 14+, Android Chrome 90+ ✅
- Touch-friendly interface ✅
- No tutorial required (self-explanatory design) ✅

**Reliability Requirements - ACHIEVED:**
- Stable canvas rendering ✅
- Graceful audio fallbacks ✅
- Error boundaries prevent crashes ✅
- No external API dependencies ✅
- Offline gameplay after initial load ✅
- Automatic state preservation and recovery ✅
- Game state never lost due to browser crash/page reload ✅

## 🛣️ Implementation History

### ✅ Completed - Production Release (November 2025)
**Status:** Live at https://impressto.ca/wordwalker/

**Implemented Features:**
- ✅ Canvas-based scrolling road visualization
- ✅ 8 vocabulary categories with 530+ total questions
- ✅ Multiple-choice quiz system with emoji illustrations
- ✅ Contextual hint system (530+ custom hints)
- ✅ Scoring system with base points (10 per correct answer)
- ✅ Streak bonus system (2x, 3x, 5x multipliers)
- ✅ Translation overlay for vocabulary reinforcement
- ✅ Audio feedback system (correct, wrong, streak, choice sounds)
- ✅ Duplicate question prevention within category walks
- ✅ Category exclusion logic (completed category not immediately repeated)
- ✅ Responsive design (mobile + desktop)
- ✅ PathChoiceDialog for category selection at forks
- ✅ Visual animations and transitions
- ✅ Game state persistence with auto-save (every 5 seconds)
- ✅ Resume functionality for interrupted games
- ✅ Resume dialog component with previous stats display
- ✅ PWA Service Worker for offline support
- ✅ Production deployment with subdirectory configuration

**Content Library - 530+ Questions:**
- 🍎 **Food:** 155 questions (fruits, vegetables, dishes, drinks, desserts, proteins, condiments, international cuisine)
- 🛍️ **Shopping:** 150 questions (clothing, accessories, store actions, sizes, materials, footwear, jewelry)
- 🎭 **Entertainment:** 150 questions (musical instruments, sports, movies, hobbies, games, dance)
- 🚌 **Transportation:** 15 questions (vehicles, tickets, stations)
- 🧭 **Directions:** 15 questions (locations, navigation, landmarks)
- 🚨 **Emergencies:** 15 questions (medical, safety, help services)
- 🏖️ **Beach:** 15 questions (beach activities, nature, weather)
- 🏨 **Accommodation:** 15 questions (lodging, hotel amenities)

**Technical Achievements:**
- Sub-2-second load times
- 60 FPS canvas rendering
- 92 KB gzipped bundle
- Zero runtime errors
- Cross-browser compatibility verified
- Mobile-responsive throughout

**Development Milestones:**
1. Initial MVP with basic scrolling road
2. Quiz system implementation
3. Category expansion (food 20→155 questions)
4. Hint system implementation
5. Automated hint generation tooling
6. Shopping expansion (20→150 questions)
7. Entertainment expansion (20→150 questions)
8. Game state persistence implementation (auto-save, resume dialog)
9. Resume functionality and UI components
10. PWA offline support verification and documentation
11. Production deployment and optimization
12. Performance tuning (scroll speed, fork spacing)

---

### Game State Persistence & Auto-Save
**Priority:** High ✅ IMPLEMENTED  
**User Story:** As a language learner, I want my progress automatically saved so that I can continue where I left off if I accidentally close the app  
**Acceptance Criteria:**
- [x] Game state auto-saved every 5 seconds during active gameplay
- [x] Saved state includes: score, streak, checkpoints, category, used questions
- [x] State persisted to localStorage (device-local storage)
- [x] No network required for persistence (works offline)
- [x] Auto-save non-blocking (doesn't impact gameplay performance)
- [x] Graceful handling of localStorage quota exceeded
- [x] Clear indication of save status in debug/logging

**Business Rules:**
- Save interval: 5 seconds during active gameplay
- Save location: Browser localStorage under key "wordwalker_game_state"
- State persists for browser session and across page reloads
- Offline-capable: No network dependency
- Single-device only: localStorage is device-local

**Technical Specifications:**
- Save interval: 5000ms (5 seconds)
- Max state size: < 50 KB typical (well under 5 MB localStorage limit)
- Save includes: 
  - Current score and streak
  - Checkpoints answered in current category
  - Current category ID
  - Used question IDs (Set converted to array)
  - Scroll offset for visual continuity
  - Timestamp for debugging

**Implementation Details:**
- `gameStatePersistence.js` utility module with 6+ functions
- `saveGameState(gameState)`: Saves current state to localStorage
- `loadGameState()`: Retrieves saved state from localStorage
- `hasSavedGameState()`: Checks if valid saved state exists
- `clearGameState()`: Removes saved state
- `convertLoadedState(loadedState)`: Converts saved data back to runtime types
- Auto-save effect in PathCanvas: 5-second setInterval + cleanup on unmount

---

### Resume Functionality
**Priority:** High ✅ IMPLEMENTED  
**User Story:** As a language learner, I want to choose whether to resume my interrupted game or start fresh so that I have control over my learning session  
**Acceptance Criteria:**
- [x] Resume dialog appears on app load if saved game exists
- [x] Shows previous game stats (score, streak, checkpoints)
- [x] Two button options: "Resume Game" or "Start New Game"
- [x] Resume restores exact game state (offset, questions, category)
- [x] Start new game clears all previous state
- [x] Beautiful UI matching app aesthetic
- [x] Mobile-responsive resume dialog
- [x] Smooth state transition when resuming

**Business Rules:**
- Resume only available if saved game exists AND is less than 30 days old
- Resume shows user's previous progress (encouraging continuation)
- Clear option always available to start fresh session
- No penalties for choosing to start new game

**Technical Specifications:**
- Dialog shown conditionally on PathCanvas mount
- Display elements: Previous score, streak count, checkpoints answered
- Save timestamp included in state for staleness checks
- ResumeDialog component: Standalone, reusable, responsive

**Implementation Details:**
- `ResumeDialog.jsx` component: Modal with gradient styling, resume/new game buttons
- `ResumeDialog.css`: Responsive styling with animations
- Resume check: `if (hasSavedGameState() && !isStale()) { showResumeDialog() }`
- Resume handler: `handleResumeGame()` restores all state from localStorage
- New game handler: `handleNewGame()` clears state and starts fresh

---



**Potential Features for V2:**
- User authentication and progress persistence
- Cross-device sync via backend
- Additional language pairs (French, Italian, German)
- Audio pronunciation for vocabulary
- Advanced statistics and learning analytics
- Custom category creation
- Difficulty levels and adaptive learning
- Social features (leaderboards, sharing)
- Achievement badges and rewards
- Spaced repetition algorithm
- Dark mode theme
- Sound settings (mute, volume control)
- Extended game state retention (30+ days with cloud sync)
- Learning streak preservation across devices

**Technical Debt & Improvements:**
- Accessibility enhancements (ARIA labels, screen reader support)
- Unit test coverage
- E2E test suite
- Performance monitoring integration
- CI/CD pipeline setup
- Content management system for easier question updates
- Backend API for dynamic content
- Database for user progress

---

## 🔌 API Specifications

*Note: Current version (V1) uses static content with no backend. API specifications below are for future V2 implementation.*

### Future API Endpoints (V2+)

#### Authentication
**Method:** POST  
**URL:** `/api/auth/login`  
**Description:** User authentication  
**Status:** Not implemented

---

#### Get Questions by Category
**Method:** GET  
**URL:** `/api/questions/{category}`  
**Description:** Retrieve questions for a specific category  
**Status:** Not implemented (currently static in questions.js)

---

#### Save User Progress
**Method:** POST  
**URL:** `/api/user/progress`  
**Description:** Save user's learning progress across devices  
**Status:** Not implemented

---

*Additional API endpoints will be specified when backend development begins in V2.*

---

## 📝 Technical Implementation Notes

### Current Architecture (V1 Production)

#### Component Structure
```
src/
├── App.jsx                          # Root component
├── main.jsx                         # React entry point
├── soundManager.js                  # Web Audio API wrapper
├── utils/
│   └── gameStatePersistence.js      # State persistence utility functions
├── components/
│   ├── PathCanvas.jsx              # Main game canvas component
│   ├── PathChoiceDialog.jsx        # Category selection modal
│   ├── QuestionDialog.jsx          # Quiz interface
│   ├── ResumeDialog.jsx            # Resume game dialog (NEW)
│   ├── ScoreDisplay.jsx            # Score UI
│   ├── StreakBonusNotification.jsx # Streak milestone alerts
│   ├── TranslationOverlay.jsx      # Vocabulary translation display
│   ├── ResumeDialog.css            # Resume dialog styling (NEW)
│   └── SearchDialog.css            # Search dialog styling
├── config/
│   ├── questions.js                # 530+ question database
│   ├── question-translations.js    # Translated question text
│   ├── answer-translations.js      # Translated answers
│   ├── gameSettings.js             # Game configuration
│   └── translations.js             # Spanish-English mappings
└── assets/
    ├── audio/
    │   ├── correct.mp3
    │   ├── wrong.mp3
    │   ├── streak.mp3
    │   └── choice.mp3
    └── images/
        └── themes/
            └── default/
```

#### Game State Management
```javascript
// PathCanvas.jsx - Primary state
const [score, setScore] = useState(0);
const [streak, setStreak] = useState(0);
const [checkpointsAnswered, setCheckpointsAnswered] = useState(0);
const [currentQuestion, setCurrentQuestion] = useState(null);
const [showQuestion, setShowQuestion] = useState(false);
const [showHint, setShowHint] = useState(false);
const [showTranslation, setShowTranslation] = useState(false);
const [currentTranslation, setCurrentTranslation] = useState(null);
const [showPathChoice, setShowPathChoice] = useState(false);
const [currentCategory, setCurrentCategory] = useState(null);
const [previousCategory, setPreviousCategory] = useState(null);
const [usedQuestionIds, setUsedQuestionIds] = useState(new Set());
const [streakNotification, setStreakNotification] = useState(null);
const [showResumeDialog, setShowResumeDialog] = useState(false);

// Refs for animation
const offsetRef = useRef(0);
const checkpointPositionsRef = useRef([]);
const forkPositionsRef = useRef([]);

// Auto-save effect (every 5 seconds)
useEffect(() => {
  const autoSaveInterval = setInterval(() => {
    if (showQuestion) {
      const gameState = {
        score,
        streak,
        checkpointsAnswered,
        currentCategory,
        usedQuestionIds: Array.from(usedQuestionIds),
        offsetRef: offsetRef.current,
        timestamp: Date.now()
      };
      saveGameState(gameState);
    }
  }, 5000);

  return () => clearInterval(autoSaveInterval);
}, [score, streak, checkpointsAnswered, currentCategory, usedQuestionIds, showQuestion]);

// Resume dialog check on mount
useEffect(() => {
  if (hasSavedGameState()) {
    setShowResumeDialog(true);
  }
}, []);
```

#### Canvas Rendering Loop
```javascript
// 60 FPS animation loop
useEffect(() => {
  const animate = () => {
    // Scroll road upward
    offsetRef.current += 3; // 3 pixels per frame
    
    // Check for checkpoint collision
    if (reachedCheckpoint()) {
      showQuizQuestion();
    }
    
    // Check for fork collision
    if (reachedFork()) {
      showCategorySelection();
    }
    
    // Clear and redraw canvas
    ctx.clearRect(0, 0, width, height);
    drawRoad();
    drawCheckpoints();
    drawForks();
    
    requestAnimationFrame(animate);
  };
  
  animate();
}, [dependencies]);
```

#### Resume Handler Functions
```javascript
// PathCanvas.jsx - Resume and new game handlers
const handleResumeGame = () => {
  const savedState = loadGameState();
  if (savedState) {
    // Restore all game state
    setScore(savedState.score);
    setStreak(savedState.streak);
    setCheckpointsAnswered(savedState.checkpointsAnswered);
    setCurrentCategory(savedState.currentCategory);
    setUsedQuestionIds(savedState.usedQuestionIds);
    offsetRef.current = savedState.offsetRef;
    setShowResumeDialog(false);
    setShowQuestion(true);
  }
};

const handleNewGame = () => {
  // Clear saved state and start fresh
  clearGameState();
  setScore(0);
  setStreak(0);
  setCheckpointsAnswered(0);
  setCurrentCategory(null);
  setPreviousCategory(null);
  setUsedQuestionIds(new Set());
  setShowResumeDialog(false);
  offsetRef.current = 0;
};
```

#### Question Selection Algorithm
```javascript
function getRandomUnusedQuestionByCategory(category) {
  // Filter by category
  const categoryQuestions = questions.filter(q => q.category === category);
  
  // Filter out already used questions in this walk
  const unusedQuestions = categoryQuestions.filter(
    q => !usedQuestionIds.has(q.id)
  );
  
  // Random selection from unused
  const randomIndex = Math.floor(Math.random() * unusedQuestions.length);
  const question = unusedQuestions[randomIndex];
  
  // Mark as used
  usedQuestionIds.add(question.id);
  
  return question;
}
```

#### Scoring Calculation
```javascript
function calculateScore(isCorrect, currentStreak) {
  if (!isCorrect) return 0;
  
  const basePoints = 10;
  let multiplier = 1;
  
  // Streak bonuses
  if (currentStreak >= 7) multiplier = 5;
  else if (currentStreak >= 5) multiplier = 3;
  else if (currentStreak >= 3) multiplier = 2;
  
  return basePoints * multiplier;
}
```

#### Production Deployment Configuration
```javascript
// vite.config.js
export default {
  base: '/wordwalker/dist/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
}
```

```php
// index.php (production wrapper)
<?php
$indexPath = __DIR__ . '/dist/index.html';
if (file_exists($indexPath)) {
    readfile($indexPath);
} else {
    http_response_code(404);
    echo "WordWalker not found";
}
?>
```

### Persistence Layer

#### gameStatePersistence.js Module
**Location:** `src/utils/gameStatePersistence.js`  
**Purpose:** Centralized utility for game state save/load operations  
**Dependencies:** None (uses browser localStorage API only)

**Core Functions:**

```javascript
// Save current game state to localStorage
export function saveGameState(gameState) {
  try {
    const stateWithTimestamp = {
      ...gameState,
      timestamp: Date.now()
    };
    localStorage.setItem('wordwalker_game_state', JSON.stringify(stateWithTimestamp));
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
}

// Load game state from localStorage
export function loadGameState() {
  try {
    const saved = localStorage.getItem('wordwalker_game_state');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Failed to load game state:', error);
    return null;
  }
}

// Clear saved game state
export function clearGameState() {
  try {
    localStorage.removeItem('wordwalker_game_state');
  } catch (error) {
    console.error('Failed to clear game state:', error);
  }
}

// Check if valid saved game exists
export function hasSavedGameState() {
  const saved = loadGameState();
  if (!saved) return false;
  
  // Check if saved state is less than 30 days old
  const ageInMs = Date.now() - saved.timestamp;
  const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
  
  return ageInMs < thirtyDaysInMs;
}

// Convert loaded Set data back to Set type
export function convertLoadedState(loadedState) {
  return {
    ...loadedState,
    usedQuestionIds: new Set(loadedState.usedQuestionIds || [])
  };
}

// Extract persistable state from current game
export function extractGameState(gameState) {
  return {
    score: gameState.score,
    streak: gameState.streak,
    checkpointsAnswered: gameState.checkpointsAnswered,
    currentCategory: gameState.currentCategory,
    usedQuestionIds: Array.from(gameState.usedQuestionIds),
    offsetRef: gameState.offsetRef
  };
}
```

**Storage Details:**
- **Key:** `wordwalker_game_state`
- **Format:** JSON with timestamp
- **Location:** Browser localStorage (device-local)
- **Capacity:** < 50 KB typical (well under 5 MB limit)
- **Persistence:** Across page reloads and browser sessions
- **Scope:** Single browser/device only (not synced across devices)

### Content Management

#### Question Format
```javascript
{
  id: 'food_001',
  emoji: '🍎',
  question: '¿Qué fruta roja es popular?',
  options: ['manzana', 'naranja', 'plátano'],
  correctAnswer: 'manzana',
  hint: 'It\'s red and keeps the doctor away',
  points: 10,
  category: 'food',
  difficulty: 'easy'
}
```

#### Translation Format
```javascript
{
  'manzana': 'apple',
  'naranja': 'orange',
  'plátano': 'banana'
}
```

#### Category Configuration
```javascript
const categories = [
  { id: 'food', name: 'Food', emoji: '🍎', color: '#FF6B6B' },
  { id: 'shopping', name: 'Shopping', emoji: '🛍️', color: '#4ECDC4' },
  { id: 'entertainment', name: 'Entertainment', emoji: '🎭', color: '#FFD93D' },
  { id: 'transportation', name: 'Transportation', emoji: '🚌', color: '#95E1D3' },
  { id: 'directions', name: 'Directions', emoji: '🧭', color: '#F38181' },
  { id: 'emergencies', name: 'Emergencies', emoji: '🚨', color: '#AA96DA' },
  { id: 'beach', name: 'Beach', emoji: '🏖️', color: '#FCBAD3' },
  { id: 'accommodation', name: 'Accommodation', emoji: '🏨', color: '#A8D8EA' }
];
```

### Performance Optimizations

**Implemented:**
- RequestAnimationFrame for 60 FPS rendering
- Efficient canvas clearing (only dirty regions when possible)
- Sound preloading to prevent loading delays
- Minimal re-renders via React.memo patterns
- Vite build optimization (tree-shaking, minification)
- Gzip compression (339 KB → 92 KB)

**Animation Settings:**
- Scroll speed: 3 pixels/frame (180 pixels/second at 60 FPS)
- Checkpoint spacing: 400px initial, 600px subsequent
- Fork spacing: 600px after each category completion
- Checkpoints per category: 10
- Auto-save interval: 5000ms (5 seconds) during active gameplay

### Offline Capabilities

**Progressive Web App (PWA) Support:**
The application includes a Service Worker for offline functionality:

```
public/
├── manifest.json          # PWA metadata (name, icons, start_url, etc.)
├── service-worker.js      # Offline caching and request handling
└── offline.html           # Fallback offline page
```

**Offline Features:**
- ✅ Service Worker caching strategy
- ✅ Game continues offline after initial load
- ✅ All game assets (JS, CSS, audio) cached locally
- ✅ Game state persisted locally via localStorage
- ✅ Auto-save works offline (no network required)
- ✅ Smooth gameplay without network connection

**Mechanism:**
- Service Worker caches all static assets on first load
- Subsequent visits use cached assets for instant loading
- If offline, cached version loads automatically
- Game state remains saved in localStorage throughout
- Perfectly suitable for travel/airport use cases

**Technical Details:**
- Cache strategy: Network-first with fallback to cache
- Cache lifetime: Managed by Service Worker versioning
- No backend dependencies for offline operation
- localStorage API works without network connection

### Tooling

**Automated Hint Generation:**
```javascript
// add-hints.js - Node.js script
// Adds contextual hints to questions without hints
// Pattern-based generation with category-specific clues
// Usage: node add-hints.js
```

**Build Process:**
```bash
npm run dev   # Development server with HMR
npm run build # Production build to /dist
```

**Bundle Analysis:**
- Main bundle: index.js (339 KB uncompressed, 92 KB gzipped)
- Vendor chunk: React + ReactDOM (11.21 KB)
- CSS: 1.59 KB (minimal styles, canvas-based UI)

---

## 🤖 AI Agent Instructions

**Document Status:** This is a LIVING DOCUMENT reflecting the current production state of WordWalker V1.

When updating this specification document, please:

1. **Mark features as implemented** using ✅ and update acceptance criteria checkboxes to [x]
2. **Update version numbers** when significant changes occur (currently V1.0.0)
3. **Add new features** to the "Future Enhancements" section before implementation
4. **Document technical decisions** in the Technical Implementation Notes section
5. **Update question counts** when categories are expanded
6. **Preserve production metrics** (bundle size, performance, etc.) for reference
7. **Maintain chronological accuracy** in the Implementation History section
8. **Keep API specifications** in sync if backend is added in future
9. **Update the "Last Updated" date** when making changes
10. **Preserve exact formatting** for Arcana compatibility (emojis, sections, field names)

**Format Requirements for Arcana Compatibility:**
- Section headers must use exact emoji format: `## 📋 Project Overview`
- Feature priorities must be: `**Priority:** [Critical | High | Medium | Low]`
- Implementation status: Add ✅ IMPLEMENTED after priority for completed features
- User stories must follow format: `**User Story:** As a [user], I want [action] so that [benefit]`
- Acceptance criteria must use checkbox format: `- [x]` for completed, `- [ ]` for pending
- API methods must be specified as: `**Method:** [GET | POST | PUT | DELETE]`
- All field names like **Description:**, **Request:**, **Response:** must be preserved exactly
- Maintain consistent code formatting in code blocks
- Use strikethrough ~~text~~ for deprecated/removed features

**Content Update Guidelines:**
- When adding questions, update category counts in Project Overview and Implementation History
- Document new categories with question counts, themes, and difficulty distribution
- Keep translation count synchronized with vocabulary additions
- Note any major architectural changes in Technical Implementation Notes

**Version History:**
- V0.1.0 - Initial draft specification
- V1.0.0 - Production release documentation (November 2025)
- V1.1.0 - Added game state persistence, resume functionality, and offline capabilities (November 29, 2025)

---

*This specification accurately reflects WordWalker V1.1 in production at https://impressto.ca/wordwalker/ as of November 29, 2025.*
