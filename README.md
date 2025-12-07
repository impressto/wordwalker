
![logoscreen](https://github.com/user-attachments/assets/038ca3b7-e58b-4411-921e-2007735e8d9b)

# WordWalker 🚶‍♂️📚

**Learn Spanish vocabulary while walking through beautiful landscapes!**

WordWalker is a gamified Spanish language learning application that transforms vocabulary practice into an engaging journey. Answer multiple-choice questions while traveling along an interactive scrolling road, earning points and streaks along the way.

**Live Site:** https://impressto.ca/wordwalker/

---

## 🎮 Core Features

### **Gamified Learning Experience**
- **Scrolling Road Visualization** - Watch your character walk along a canvas-based road as you progress
- **8 Vocabulary Categories** - Focus on topics that matter: Food 🍎, Shopping 🛍️, Entertainment 🎭, Transportation 🚌, Directions 🧭, Emergencies 🚨, Beach 🏖️, and Accommodation 🏨
- **530+ Spanish-English Questions** - Diverse, curated vocabulary with contextual hints
- **Multiple-Choice Quiz Format** - 3 answer options per question with immediate visual feedback

### **Engagement & Motivation**
- **Scoring System** - Earn 10 base points per correct answer
- **Streak Bonuses** - Consecutive correct answers unlock multipliers (2x at 3 streak, 3x at 5, 5x at 7)
- **Sound Effects & Animations** - Audio feedback for correct/incorrect answers and streak milestones
- **Character Shop** - Unlock and purchase different walking characters with points earned
- **Theme Shop** - Buy and switch between stunning parallax themes (4 themes available: Forest, Hong Kong, Jamaica, Día de los Muertos)
- **Visual Feedback** - Emoji illustrations, animations, and progress tracking

### **Learning Support**
- **Strategic Hint System** - Get English translations of Spanish questions at a cost
  - Using hints reduces points earned (half points for correct, or lose points for incorrect)
  - Creates a risk-reward decision for strategic gameplay
- **Contextual Hints** - Get hints for incorrect answers to reinforce learning
- **Translation Overlay** - See Spanish-English translations after answering to reinforce vocabulary
- **Category Selection** - Choose your learning path at "fork junctions" in the road
- **Question Mastery Tracking** - Your correctly answered questions are tracked and persist across games
- **Duplicate Prevention** - No repeated questions within a single category walk

### **Progressive Web App (PWA)**
- **Offline Gameplay** - Play anywhere with no internet connection
- **Installable** - Install as a native-like app on mobile and desktop
- **Auto-Save** - Game state automatically saves every 5 seconds
- **Smart Resume Feature** - Pick up where you left off with progress protection
- **New Game Protection** - Confirmation dialog prevents accidental progress loss for experienced players (20+ mastered questions)

---

### Screenshots

**Default Forest (Free)** - Northern countryside with paths winding past deciduous and conifer forests and snow-tipped hills. The air smells of pine and damp earth, a mountain stream runs clear beside you, and the only sounds are distant crows, rustling trees, and your own footsteps.

![scene](https://github.com/user-attachments/assets/b6a78562-74bc-4838-8bce-92770f6c9ce7)

--------------------------------------------------------------
**Jamaica Beach (300 pts)** - Tropical paradise with soft stretches beside calm turquoise water. Warm breeze and loungers line the shore. Light reggae music drifts from a nearby bar.

![scene](https://github.com/user-attachments/assets/8e1dd765-7b85-4847-b818-98e78933da5d)

--------------------------------------------------------------
**Hong Kong Harbor (150 pts)** - One of the liveliest, most colorful urban landscapes in the city with a mix of food, culture, noise, and music from bustling markets.

![scene](https://github.com/user-attachments/assets/8c1983d3-2c18-470b-8cb7-216db2491fc0)

--------------------------------------------------------------
**Día de los Muertos (500 pts)** - Mexican village celebration traditionally celebrated in early November. The multi-day holiday involves family and friends gathering to pay respects and remember loved ones who have passed.

![scene](https://github.com/user-attachments/assets/d8112f3f-f662-465e-9b8d-46a97ab2c383)

--------------------------------------------------------------
## 🚀 Build Your Own Version

WordWalker is built for educators, language teachers, and hobbyists who want to learn by doing.  Customize the app for any language, edit images and audio assets, modify game mechanics, or expand the question  while developing practical skills in web development, digital media, and language learning.  It's a multi-level learning platform disguised as a game.


### Prerequisites
- **Node.js** 16+ and **npm** or **yarn**
- A modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd wordwalker

# Install dependencies
npm install
# or
yarn install
```

### Development

```bash
# Start development server with hot module replacement
npm run dev
# or
yarn dev
```

The app will be available at `http://localhost:5173/`

### Production Build

```bash
# Build optimized production bundle
npm run build
# or
yarn build
```

The build includes a service worker that gets copied to the root directory for PWA functionality.

### Preview Production Build Locally

```bash
npm run preview
# or
yarn preview
```

---

## 📁 Project Structure

```
wordwalker/
├── src/
│   ├── components/           # React components
│   │   ├── PathCanvas.jsx                    # Main game canvas and logic
│   │   ├── QuestionDialog.jsx                # Question display with hint system
│   │   ├── PathChoiceDialog.jsx              # Category selection at forks
│   │   ├── CharacterShop.jsx                 # Character & theme shop with tabs
│   │   ├── ScoreDisplay.jsx                  # Score and points display
│   │   ├── ResumeDialog.jsx                  # Smart game resume dialog
│   │   ├── NewGameConfirmationDialog.jsx     # Progress protection for new games
│   │   ├── CheckpointHintPopup.jsx           # Checkpoint progress hints
│   │   └── ...
│   ├── config/               # Game configuration
│   │   ├── questions.js                     # 530+ questions database
│   │   ├── characterConfig.js               # Character shop items
│   │   ├── themeShopConfig.js               # Theme shop items & pricing
│   │   ├── parallaxThemes.js                # Visual theme rendering configs
│   │   └── gameSettings.js                  # Game parameters
│   ├── utils/                # Utility functions
│   │   ├── gameStatePersistence.js          # Auto-save & resume logic
│   │   ├── questionTracking.js              # Question mastery tracking
│   │   ├── soundManager.js                  # Audio management
│   │   ├── themeManager.js                  # Theme utilities
│   │   └── ...
│   ├── hooks/                # Custom React hooks
│   │   └── useCharacterAndTheme.js          # Character & theme state
│   ├── App.jsx               # Root component
│   └── main.jsx              # Entry point
├── public/                   # Static files & PWA assets
│   ├── manifest.json        # PWA manifest
│   ├── service-worker.js    # Offline caching strategy
│   ├── images/              # Game assets, sprites, themes
│   │   ├── themes/          # 4 parallax theme sets
│   │   └── walkers/         # Character sprites
│   └── audio/               # Sound effects & theme music
├── docs/                     # Comprehensive documentation
│   ├── THEME-SHOP-GUIDE.md              # Theme shop implementation
│   ├── HINT-SYSTEM.md                   # Hint system mechanics
│   ├── NEW-GAME-CONFIRMATION-FEATURE.md # Progress protection
│   ├── PWA-QUICKSTART.md                # PWA setup guide
│   ├── DEPLOYMENT-SCRIPTS.md            # Deployment automation
│   └── ...
├── deploy.sh                 # Automated deployment script
├── vite.config.js            # Vite configuration
├── eslint.config.js          # Linting rules
├── package.json              # Dependencies & scripts
└── index.php                 # Server entry point (for subdirectory hosting)
```

---

## 🎯 How It Works

1. **Start/Resume Game** - App loads and checks for previous session; resume your progress or start fresh
2. **Select Category** - Choose a vocabulary category at the first fork (Food, Shopping, etc.)
3. **Answer Questions** - View emoji-illustrated questions and select the correct answer
   - **Use Hints Strategically** - Click the hint button to see English translations (reduces points earned)
4. **Earn Points** - Get 10 base points per correct answer, plus streak bonuses
5. **Choose Path** - After 10 questions, select your next category at a new fork
6. **Visit Character Shop** - Use accumulated points to:
   - **Buy Characters** - Unlock new walking character sprites
   - **Buy Themes** - Purchase stunning parallax landscape themes (Hong Kong, Jamaica, Día de los Muertos)
7. **Track Progress** - Questions you answer correctly are mastered and tracked across sessions
8. **Resume Anytime** - Close the app and resume your exact progress later (protected by smart confirmation dialogs)

---

## 🛠️ Technology Stack

- **React 19** - Modern UI framework with fast refresh and hooks
- **Vite 7** - Lightning-fast build tool and dev server
- **Canvas API** - High-performance 2D graphics for parallax scrolling landscapes
- **LocalStorage API** - Client-side game state and progress persistence
- **Service Worker** - Offline caching and PWA support with auto-updates
- **Web Audio API** - Sound effects and themed background music

---

## 🔧 Configuration

### Game Settings
Edit `src/config/gameSettings.js` to adjust:
- Checkpoint spacing and scrolling speed
- Point values and streak multipliers
- Hint system costs and penalties
- Audio settings defaults
- Question mastery thresholds

### Adding New Questions
1. Edit `src/config/questions.js` to add new questions
2. Update translation files in `src/config/translations/` if needed
3. Rebuild: `npm run build`

### Theme Shop Customization
Edit `src/config/themeShopConfig.js` to:
- Add new themes with custom costs
- Modify theme names and descriptions
- Configure theme thumbnails
See `docs/THEME-SHOP-GUIDE.md` for complete implementation details.

### Visual Theme Configuration
Parallax rendering is configured in `src/config/parallaxThemes.js`. 
See `docs/PARALLAX-THEMES-OVERVIEW.md` and `docs/PARALLAX-THEMES-QUICK-REF.md` for detailed theming guides.

### Character Shop Customization
Edit `src/config/characterConfig.js` to add or modify character options.
See `docs/CHARACTER-SHOP.md` for details.

---

## 📱 PWA Features

WordWalker is a Progressive Web App that works offline:

- **Install Prompt** - Appears on first visit, allows installation to home screen
- **Offline Mode** - All game assets are cached; play without internet
- **Auto-Updates** - Checks for updates every 60 seconds
- **Responsive Design** - Optimized for mobile (portrait) and desktop

To test PWA features:
1. Build the project: `npm run build`
2. Deploy to HTTPS (required for PWA)
3. Open in Chrome/Firefox and look for install prompt

See `docs/PWA-QUICKSTART.md` for PWA implementation details.

---

## 💾 Game State & Persistence

WordWalker automatically saves your progress with intelligent protection:

- **Auto-Save** - Game state saves every 5 seconds to localStorage
- **Smart Resume Dialog** - When you reopen the app, see your progress and choose to resume or start fresh
- **New Game Protection** - Confirmation dialog for experienced players (20+ mastered questions) prevents accidental progress loss
- **Persisted Data:**
  - Current score and streak
  - Progress on current category walk
  - **Question mastery tracking** - Questions you've answered correctly (persists across games)
  - Character selection and ownership
  - Theme selection and ownership
  - Volume settings
  - Hint usage history

See `docs/GAME-STATE-PERSISTENCE.md`, `docs/PERSISTENCE-QUICK-REF.md`, and `docs/TESTING-PERSISTENCE.md` for technical details.

---

## 📚 Documentation

Comprehensive guides are available in the `docs/` directory:

### Core Documentation
- **[spec-document.md](docs/spec-document.md)** - Complete feature specification and implementation details
- **[README.md](docs/README.md)** - Documentation index and overview

### Feature Guides
- **[THEME-SHOP-GUIDE.md](docs/THEME-SHOP-GUIDE.md)** - Theme shop implementation and customization
- **[CHARACTER-SHOP.md](docs/CHARACTER-SHOP.md)** - Character system implementation
- **[HINT-SYSTEM.md](docs/HINT-SYSTEM.md)** - Hint system mechanics and strategy
- **[NEW-GAME-CONFIRMATION-FEATURE.md](docs/NEW-GAME-CONFIRMATION-FEATURE.md)** - Progress protection system

### Theme & Visual Customization
- **[PARALLAX-THEMES-OVERVIEW.md](docs/PARALLAX-THEMES-OVERVIEW.md)** - Comprehensive theming guide
- **[PARALLAX-THEMES-QUICK-REF.md](docs/PARALLAX-THEMES-QUICK-REF.md)** - Quick reference for theme configuration
- **[THEME-SELECTOR-EXAMPLES.md](docs/THEME-SELECTOR-EXAMPLES.md)** - Theme implementation examples

### Persistence & State Management
- **[GAME-STATE-PERSISTENCE.md](docs/GAME-STATE-PERSISTENCE.md)** - Technical persistence details
- **[PERSISTENCE-QUICK-REF.md](docs/PERSISTENCE-QUICK-REF.md)** - Quick reference guide
- **[TESTING-PERSISTENCE.md](docs/TESTING-PERSISTENCE.md)** - Testing guide for persistence

### PWA & Deployment
- **[PWA-QUICKSTART.md](docs/PWA-QUICKSTART.md)** - PWA setup and offline features
- **[PWA-IMPLEMENTATION-SUMMARY.md](docs/PWA-IMPLEMENTATION-SUMMARY.md)** - PWA architecture
- **[PWA-OFFLINE-ARCHITECTURE.md](docs/PWA-OFFLINE-ARCHITECTURE.md)** - Offline capabilities
- **[DEPLOYMENT-SCRIPTS.md](docs/DEPLOYMENT-SCRIPTS.md)** - Deployment automation
- **[PWA-DEPLOYMENT-CHECKLIST.md](docs/PWA-DEPLOYMENT-CHECKLIST.md)** - Pre-deployment checklist
- **[DEPLOYMENT-READY.md](docs/DEPLOYMENT-READY.md)** - Deployment readiness guide

### Testing & Development
- **[TESTING-GUIDE.md](docs/TESTING-GUIDE.md)** - Comprehensive testing guide
- **[CONTENT-TRACKER.md](docs/CONTENT-TRACKER.md)** - Content and asset tracking

---

## 🚢 Deployment

### Automated Deployment (Recommended)

```bash
./deploy.sh
```

The automated deployment script:
- Prompts for version bump (patch/minor/major)
- Updates `package.json` and `service-worker.js` versions
- Builds the optimized production bundle
- Verifies version consistency
- Provides deployment checklist and testing instructions

### Check PWA Status

```bash
./check-pwa.sh
```

Validates PWA requirements:
- Version consistency across files
- Presence of required files
- Service worker configuration
- Manifest settings
- Asset availability

### Manual Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Upload contents of `dist/` directory to your web server

3. Ensure HTTPS is enabled (required for PWA)

4. Configure server to serve `index.html` for subdirectory hosting (if needed)

See `docs/DEPLOYMENT-SCRIPTS.md`, `docs/PWA-DEPLOYMENT-CHECKLIST.md`, and `docs/DEPLOYMENT-READY.md` for detailed deployment information.

---

## 🐛 Development & Debugging

### Linting
```bash
npm run lint
```

### Service Worker Debugging
Open `sw-debug.html` in your browser to inspect service worker status and caching behavior.

### Testing PWA
Run `./check-pwa.sh` to validate PWA requirements:
- Manifest presence and validity
- Service worker registration
- Version consistency
- Asset availability

### Testing Features
See `docs/TESTING-GUIDE.md` for comprehensive testing procedures, including:
- Persistence testing
- Theme shop testing
- Hint system testing
- Character shop testing
- PWA offline capabilities

---

## 📊 Game Statistics

**Current Version:** 1.4.2

**Content:**
- **8 Categories** with unique emoji icons
- **530+ Questions** carefully curated for learners
- **530+ Contextual Hints** to support learning
- **4 Visual Themes** - Forest (free), Hong Kong (150 pts), Jamaica (300 pts), Día de los Muertos (500 pts)
- **Multiple Characters** - Unlockable character sprites for customization
- **Multi-language Support:** Spanish-English vocabulary

**Key Features:**
- Strategic hint system with risk-reward mechanics
- Question mastery tracking across game sessions
- Smart progress protection for experienced players
- Tabbed shop interface (Characters & Themes)
- Theme purchasing and switching system

**Performance:**
- Optimized for 60 FPS parallax canvas animation
- Minimal bundle size with efficient caching
- Fast load times even on slow connections (offline via PWA)
- Auto-save every 5 seconds

---

## 🎓 Learning Approach

WordWalker uses proven language learning techniques:

- **Gamification** - Points, streaks, character and theme rewards maintain motivation
- **Visual Learning** - Emoji illustrations and stunning parallax themes create memorable associations
- **Contextual Learning** - Categories focus on real-world scenarios (travel, dining, emergencies, etc.)
- **Strategic Decision-Making** - Hint system teaches cost-benefit analysis and builds confidence
- **Progress Tracking** - Question mastery system tracks learning across sessions
- **Spaced Repetition** - Hints and translations reinforce vocabulary
- **Immediate Feedback** - Correct/incorrect answers instantly show results with visual and audio cues
- **Immersive Environments** - Four distinct cultural themes (Forest, Hong Kong, Jamaica, Día de los Muertos) enhance engagement

---

## 🤝 Contributing

Found a bug or have a feature idea? 

1. Check the `docs/spec-document.md` for known issues and planned features
2. Review comprehensive documentation in the `docs/` directory for implementation details
3. Report issues or suggestions through your project management system

### Recent Major Updates
- **v1.4.x** - Theme shop system, strategic hint mechanics, question mastery tracking
- **v1.3.x** - New game confirmation dialog, improved persistence, checkpoint hints
- **v1.2.x** - PWA implementation, offline support, auto-save system
- **v1.1.x** - Character shop, parallax themes, audio system

---

## 📄 License

This project is licensed under the GNU General Public License v3.0 (GPLv3).
You may use, modify, and distribute this software under the terms of the GPLv3.
Commercial proprietary use is strictly prohibited.
See the LICENSE file for details.


## 🙋 Support

For questions or issues:
- Check the comprehensive documentation in the `docs/` folder
- Review the specification document for feature details
- See deployment guides for hosting questions

---

## 🎉 Enjoy Learning!

Start your vocabulary learning journey at https://impressto.ca/wordwalker/ - ¡Bienvenido! 🚶‍♂️📚
