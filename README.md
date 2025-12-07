
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
- **Character Customization** - Unlock and select different characters with points earned
- **Visual Feedback** - Emoji illustrations, animations, and progress tracking

### **Learning Support**
- **Contextual Hints** - Get hints for incorrect answers to reinforce learning
- **Translation Overlay** - See Spanish-English translations after answering to reinforce vocabulary
- **Category Selection** - Choose your learning path at "fork junctions" in the road
- **Duplicate Prevention** - No repeated questions within a single category walk

### **Progressive Web App (PWA)**
- **Offline Gameplay** - Play anywhere with no internet connection
- **Installable** - Install as a native-like app on mobile and desktop
- **Auto-Save** - Game state automatically saves every 5 seconds
- **Resume Feature** - Pick up where you left off if interrupted

---

### Screenshots

**Northern Japanese Countryside**
Northern Japan feels cool and crisp, with paths winding past deciduous and conifer forests and snow-tipped hills. The air smells of pine and damp earth, a mountain stream runs clear beside you, and the only sounds are distant crows, rustling trees, and your own footsteps.
![scene](https://github.com/user-attachments/assets/b6a78562-74bc-4838-8bce-92770f6c9ce7)


**Jamaican Beach**
These beach usually curves in a soft stretches beside calm turquoise water.  They usually have a warm breeze, and loungers  lining the shore.  Light reggae music drifts from a nearby bar.
![scene](https://github.com/user-attachments/assets/8e1dd765-7b85-4847-b818-98e78933da5d)


**Hong Kong Market**
Hong Kong’s street markets are some of the liveliest, most colorful places in the city with a mix of food, culture, noise, and music.
![scene](https://github.com/user-attachments/assets/8c1983d3-2c18-470b-8cb7-216db2491fc0)


**Día de (los) Muertos in a Mexican Village**
A holiday traditionally celebrated in early November. The multi-day holiday involves family and friends gathering to pay respects and remember friends and family members who have died.
![scene](https://github.com/user-attachments/assets/d8112f3f-f662-465e-9b8d-46a97ab2c383)


## 🚀 Build your own version for other language - perfect of educators and hobbyists

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
│   │   ├── PathCanvas.jsx            # Main game canvas and logic
│   │   ├── QuestionDialog.jsx        # Question display modal
│   │   ├── PathChoiceDialog.jsx      # Category selection at forks
│   │   ├── CharacterShop.jsx         # Character purchasing system
│   │   ├── ScoreDisplay.jsx          # Score and points display
│   │   └── ...
│   ├── config/               # Game configuration
│   │   ├── questions.js             # 530+ questions database
│   │   ├── categories.js            # Category definitions
│   │   ├── parallaxThemes.js        # Visual themes
│   │   └── gameSettings.js          # Game parameters
│   ├── utils/                # Utility functions
│   │   ├── gameStatePersistence.js  # Auto-save & resume logic
│   │   └── ...
│   ├── hooks/                # Custom React hooks
│   ├── assets/               # Images, audio, sprites
│   ├── App.jsx               # Root component
│   └── main.jsx              # Entry point
├── public/                   # Static files & PWA manifest
│   ├── manifest.json        # PWA manifest
│   ├── service-worker.js    # Offline caching strategy
│   ├── images/              # Game assets & sprites
│   └── audio/               # Sound effects
├── docs/                     # Comprehensive documentation
├── vite.config.js            # Vite configuration
├── eslint.config.js          # Linting rules
├── package.json              # Dependencies & scripts
└── index.php                 # Server entry point (for subdirectory hosting)
```

---

## 🎯 How It Works

1. **Start Game** - App loads and checks for previous session to resume or start fresh
2. **Select Category** - Choose a vocabulary category at the first fork (Food, Shopping, etc.)
3. **Answer Questions** - View emoji-illustrated questions and select the correct answer
4. **Earn Points** - Get 10 base points per correct answer, plus streak bonuses
5. **Choose Path** - After 10 questions, select your next category at a new fork
6. **Unlock Characters** - Use accumulated points to buy character skins
7. **Resume Anytime** - Close the app and resume your exact progress later

---

## 🛠️ Technology Stack

- **React 19** - UI framework with fast refresh
- **Vite 7** - Lightning-fast build tool and dev server
- **Canvas API** - High-performance 2D graphics for scrolling road
- **LocalStorage API** - Client-side game state persistence
- **Service Worker** - Offline caching and PWA support
- **Web Audio API** - Sound effects and background music

---

## 🔧 Configuration

### Game Settings
Edit `src/config/gameSettings.js` to adjust:
- Checkpoint spacing and scrolling speed
- Point values and streak multipliers
- Audio settings defaults
- Theme configurations

### Adding New Questions
1. Edit `src/config/questions.js` to add new questions
2. Update translation files if needed
3. Rebuild: `npm run build`

### Customizing Themes & Parallax
Visual themes are configured in `src/config/parallaxThemes.js`. See `docs/PARALLAX-THEMES.md` for detailed theming guide.

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

WordWalker automatically saves your progress:

- **Auto-Save** - Game state saves every 5 seconds to localStorage
- **Resume Support** - When you reopen the app, you'll see an option to resume
- **Persisted Data:**
  - Current score and streak
  - Progress on current category walk
  - Character selection and ownership
  - Volume settings
  - Current theme selection

See `docs/GAME-STATE-PERSISTENCE.md` for technical details.

---

## 📚 Documentation

Comprehensive guides are available in the `docs/` directory:

- **[spec-document.md](docs/spec-document.md)** - Complete feature specification and implementation details
- **[PWA-QUICKSTART.md](docs/PWA-QUICKSTART.md)** - PWA setup and offline features
- **[CHARACTER-SHOP.md](docs/CHARACTER-SHOP.md)** - Character system implementation
- **[PARALLAX-THEMES.md](docs/PARALLAX-THEMES.md)** - Theme and visual customization
- **[DEPLOYMENT-SCRIPTS.md](docs/DEPLOYMENT-SCRIPTS.md)** - Deployment procedures

---

## 🚢 Deployment

### Quick Deployment

```bash
./deploy.sh
```

This script builds the project and prepares it for deployment.

### Manual Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Upload contents of `dist/` directory to your web server

3. Ensure HTTPS is enabled (required for PWA)

4. Configure server to serve `index.html` for subdirectory hosting (if needed)

See `docs/DEPLOYMENT-SCRIPTS.md` and `docs/PWA-DEPLOYMENT-CHECKLIST.md` for detailed deployment information.

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
- HTTPS configuration
- Icon sizes

---

## 📊 Game Statistics

**Current Version:** 1.3.5

**Content:**
- **8 Categories** with unique emoji icons
- **530+ Questions** carefully curated for learners
- **530+ Contextual Hints** to support learning
- **Multi-language Support:** Spanish-English vocabulary

**Performance:**
- Optimized for 60 FPS canvas animation
- Minimal bundle size with efficient caching
- Fast load times even on slow connections (offline via PWA)

---

## 🎓 Learning Approach

WordWalker uses proven language learning techniques:

- **Gamification** - Points, streaks, and character rewards maintain motivation
- **Visual Learning** - Emoji illustrations create memorable associations
- **Contextual Learning** - Categories focus on real-world scenarios (travel, dining, etc.)
- **Spaced Repetition** - Hints and translations reinforce vocabulary
- **Immediate Feedback** - Correct/incorrect answers instantly show results

---

## 🤝 Contributing

Found a bug or have a feature idea? 

1. Check the `docs/spec-document.md` for known issues and planned features
2. Report issues or suggestions through your project management system
3. See `REFACTORING-LOG.md` for recent changes and technical decisions

---

## 📄 License

[Add your license information here]

---

## 🙋 Support

For questions or issues:
- Check the comprehensive documentation in the `docs/` folder
- Review the specification document for feature details
- See deployment guides for hosting questions

---

## 🎉 Enjoy Learning!

Start your vocabulary learning journey at https://impressto.ca/wordwalker/ - ¡Bienvenido! 🚶‍♂️📚
