import { useEffect, useRef, useState } from 'react';
import { getRandomQuestionByCategory, getRandomUnusedQuestionByCategory, getUnmasteredQuestionCount, shuffleOptions, getAllCategoryIds, getCategoryById, preloadAllCategories } from '../config/questionsLoader';
import { isCategoryCompleted, addCorrectAnswer, addToCorrectFirstTry, addUsedQuestion, addToFirstTryByCategory, getCategoryCorrectAnswerCount, getCategoryQuestionCount } from '../utils/questionTracking';
import { generateNewForkCategories, initializeForkCategories, extractCategoryIds } from '../utils/categoryRotation';
import { getTranslationsObject, preloadAllTranslations } from '../config/translationsLoader';
import gameSettings, { getStreakColor, getTranslationBoxDuration } from '../config/gameSettings';
import { getTheme } from '../config/parallaxThemes';
import { getSpriteSheetConfig, getCharacterById } from '../config/characterConfig';
import { setActiveTheme } from '../utils/themeManager';
import SoundManager from '../utils/soundManager';
import { isEmojiSvg, getEmojiSvgPath } from '../utils/emojiUtils.jsx';
import { loadGameState, saveGameState, clearGameState, hasSavedGameState, convertLoadedState } from '../utils/gameStatePersistence';
import { useCharacterAndTheme } from '../hooks/useCharacterAndTheme';
import { useAnswerHandling } from '../hooks/useAnswerHandling';
import { initializeDataLayer, trackCategorySelection, trackQuestionAnswer, trackCategoryCompletion } from '../utils/gtm';
import ScoreDisplay from './ScoreDisplay';
import PathChoiceDialog from './PathChoiceDialog';
import QuestionDialog from './QuestionDialog';
import TranslationOverlay from './TranslationOverlay';
import SearchDialog from './SearchDialog';
import ResumeDialog from './ResumeDialog';
import InstallPrompt from './InstallPrompt';
import CharacterShop from './CharacterShop';
import CheckpointHintPopup from './CheckpointHintPopup';
import LoadingScreen from './LoadingScreen';
import VolumeControl from './VolumeControl';
import TopLogo from './TopLogo';
import SearchButton from './SearchButton';
import FlashCardsOfferDialog from './FlashCardsOfferDialog';
import FlashCardsDialog from './FlashCardsDialog';

const PathCanvas = () => {
  // Character and theme management hook
  const {
    currentCharacter,
    setCurrentCharacter,
    ownedCharacters,
    setOwnedCharacters,
    showCharacterShop,
    setShowCharacterShop,
    walkerVariants,
    getWalkerSpriteSheet,
    currentTheme,
    setCurrentTheme,
    ownedThemes,
    setOwnedThemes,
    handleOpenCharacterShop,
    handleCloseCharacterShop,
    handlePurchaseCharacter,
    handleSelectCharacter,
    handlePurchaseTheme,
    handleSelectTheme,
    hasAffordablePurchase,
  } = useCharacterAndTheme();

  const canvasRef = useRef(null);
  const [parallaxLayer2Image, setParallaxLayer2Image] = useState(null); // Grass
  const [pathImage, setPathImage] = useState(null);
  const [pathForkImage, setPathForkImage] = useState(null);
  const [parallaxLayer6Image, setParallaxLayer6Image] = useState(null); // Mountains
  const [parallaxLayer1Image, setParallaxLayer1Image] = useState(null); // Foreground layer
  const [parallaxLayer4Image, setParallaxLayer4Image] = useState(null); // Mid-distant layer
  const [parallaxLayer5Image, setParallaxLayer5Image] = useState(null); // Far layer
  const [parallaxLayer3Image, setParallaxLayer3Image] = useState(null); // Bushes layer
  const [parallaxLayer7Image, setParallaxLayer7Image] = useState(null); // Rear layer (infinite distance, no parallax)
  const [walkerSpriteSheet, setWalkerSpriteSheet] = useState(null); // Walker sprite sheet
  const [isLoading, setIsLoading] = useState(true); // Track if assets are still loading
  const emojiImageCache = useRef({}); // Cache for loaded SVG emoji images
  const offsetRef = useRef(-300); // Start scrolled back so fork appears more centered initially
  const velocityRef = useRef(0); // Current scroll velocity for smooth acceleration/deceleration
  const targetOffsetRef = useRef(null); // Target offset for smooth camera panning (null = no target)
  const animationFrameRef = useRef(null);
  const lastTimeRef = useRef(0); // Track last frame time for delta-time based animation
  const frameAccumulatorRef = useRef(0); // Accumulator for sprite frame timing
  const [isPaused, setIsPaused] = useState(false);
  const [showChoice, setShowChoice] = useState(false);
  const [isIdleAnimationMode, setIsIdleAnimationMode] = useState(false); // Walker animates while dialog is open (after 30s)
  const [selectedPath, setSelectedPath] = useState(null);
  const [showQuestion, setShowQuestion] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionAnswered, setQuestionAnswered] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [firstAttempt, setFirstAttempt] = useState(true);
  const [incorrectAnswers, setIncorrectAnswers] = useState([]); // Track incorrect answer attempts
  const [showTranslation, setShowTranslation] = useState(false); // Show English translation after correct answer
  const [showHint, setShowHint] = useState(false); // Show hint after wrong answer
  const [hintUsed, setHintUsed] = useState(false); // Track if hint was used for current question
  const [streak, setStreak] = useState(0); // Track consecutive correct answers
  const [maxStreakInCategory, setMaxStreakInCategory] = useState(0); // Track highest streak achieved in current category
  const [showSearch, setShowSearch] = useState(false); // Show search dialog
  const [isSearchPaused, setIsSearchPaused] = useState(false); // Track if paused by search
  const [showCheckpointHint, setShowCheckpointHint] = useState(false); // Show hint popup when checkpoint is clicked
  
  // Game mode state: 'multichoice' or 'flashcard'
  const [gameMode, setGameMode] = useState('multichoice');
  
  // Flash cards state
  const [showFlashCardsOffer, setShowFlashCardsOffer] = useState(false);
  const [showFlashCards, setShowFlashCards] = useState(false);
  const [categoryForFlashCards, setCategoryForFlashCards] = useState(null);
  const [streakAtCompletion, setStreakAtCompletion] = useState(0);
  
  // Volume control state
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(() => {
    return parseFloat(localStorage.getItem('wordwalker-volume') || '0.7');
  });
  const [musicEnabled, setMusicEnabled] = useState(() => {
    const saved = localStorage.getItem('wordwalker-music-enabled');
    return saved === 'true'; // Default to false, only true if explicitly saved
  });
  
  // Game state persistence
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [hasCheckedSavedState, setHasCheckedSavedState] = useState(false);
  const [savedStats, setSavedStats] = useState(null);
  const autosaveTimerRef = useRef(null);
  const [isJustResumed, setIsJustResumed] = useState(false); // Track if game was just resumed (for emergency stop)
  
  // Walker sprite animation state
  const walkerFrameRef = useRef(0); // Current frame index
  const walkerFrameCounterRef = useRef(0); // Counter for frame timing
  
  // Streak diamond glow animation state
  const diamondGlowRef = useRef(0); // Glow animation progress (0 to 1)
  const [isVictoryAnimation, setIsVictoryAnimation] = useState(false); // Toggle between walk/victory
  const victoryAnimationCounterRef = useRef(0); // How long to show victory animation
  
  // Checkpoint fade-in animation
  const checkpointFadeStartTimeRef = useRef(null); // Track when checkpoint starts fading in
  const checkpointFadeDuration = 500; // 500ms fade-in duration
  
  // Get sprite sheet configuration from character config
  const spriteConfig = getSpriteSheetConfig();
  
  // Checkpoint cycling - track how many checkpoints answered in current category
  const [checkpointsAnswered, setCheckpointsAnswered] = useState(0);
  const checkpointsPerCategory = gameSettings.persistence.checkpointsPerCategory;
  
  // Dynamic checkpoint limit - frozen when category is selected
  const [currentCheckpointLimit, setCurrentCheckpointLimit] = useState(checkpointsPerCategory);
  
  // Track total questions in current category (for progress display)
  const [currentCategoryTotalQuestions, setCurrentCategoryTotalQuestions] = useState(0);
  
  // Track used question IDs to prevent duplicates within a category walk
  const [usedQuestionIds, setUsedQuestionIds] = useState({});
  
  // Track globally completed categories (categories where all questions have been asked)
  const [completedCategories, setCompletedCategories] = useState(new Set());
  
  // Track questions answered correctly on first try (globally across all categories)
  const [correctFirstTryIds, setCorrectFirstTryIds] = useState({});
  
  // Track questions answered correctly by category - persists across sessions
  const [correctAnswersByCategory, setCorrectAnswersByCategory] = useState({});
  
  // Track previously presented categories to ensure variety in category selection
  const [presentedCategories, setPresentedCategories] = useState(new Set());
  
  // Fork path categories - randomly select 4 different categories for each fork
  const [forkCategories, setForkCategories] = useState(() => {
    const initialCategories = initializeForkCategories();
    // Initialize presented categories with the first set
    setPresentedCategories(new Set(extractCategoryIds(initialCategories)));
    return initialCategories;
  });
  
  // Learning checkpoint configuration
  const checkpointPositionRef = useRef(3500); // Position of first checkpoint after fork
  const checkpointSpacing = 400; // Distance between checkpoints (~3 seconds at 120 px/sec)
  
  // Path configuration
  const pathSegments = useRef([
    { type: 'straight', startX: 0, length: 800 },
    { type: 'fork', startX: 800, length: 400, branches: ['upper', 'lower'] }
  ]);
  
  // Fork appears after 1 second of walking
  // At 3 pixels per frame * 60 fps = 180 pixels/second
  // Plus canvas width to ensure it scrolls into view from the right
  // Using 400 pixels = ~2-3 seconds to scroll into view from right edge
  const forkPositionRef = useRef(400); // When fork appears (in pixels from start)

  // Track if checkpoint sound has been played for current checkpoint
  const checkpointSoundPlayedRef = useRef(false);

  // Track checkpoint bounds for click detection
  const checkpointBoundsRef = useRef({ x: 0, y: 0, size: 0 });
  
  // Track if user came from a URL parameter (to skip showing path choice on flash cards close)
  const [openedFromUrl, setOpenedFromUrl] = useState(false);

  // Easter egg - preview mode when walker is held
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [questionDialogOpacity, setQuestionDialogOpacity] = useState(1);
  const walkerPressTimerRef = useRef(null);
  const walkerPressStartRef = useRef(null);
  const walkerBoundsRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const previewStateSnapshotRef = useRef(null); // Store state before preview mode

  // Initialize sound manager
  const soundManagerRef = useRef(null);
  const [audioInitialized, setAudioInitialized] = useState(false);
  
  useEffect(() => {
    // Initialize GTM data layer with experiment data
    initializeDataLayer();
    
    // Initialize with current theme to avoid preloading wrong theme sounds
    soundManagerRef.current = new SoundManager(currentTheme);
    
    // Preload all questions and translations for offline support
    // This runs in background and doesn't block initial render
    preloadAllCategories().catch(err => console.warn('Failed to preload questions:', err));
    preloadAllTranslations().catch(err => console.warn('Failed to preload translations:', err));
    
    return () => {
      // Cleanup sound manager when component unmounts
      if (soundManagerRef.current) {
        soundManagerRef.current.stopBackgroundMusic();
      }
    };
  }, []); // Only run once on mount - theme changes handled by separate useEffect

  // Initialize audio on first user interaction
  useEffect(() => {
    const initializeAudio = () => {
      if (!audioInitialized && soundManagerRef.current && soundEnabled && volume > 0) {
        // Only start background music if musicEnabled is true
        if (musicEnabled) {
          soundManagerRef.current.startBackgroundMusic();
        }
        setAudioInitialized(true);
      }
    };

    // Listen for first user interaction to initialize audio
    document.addEventListener('click', initializeAudio, { once: true });
    document.addEventListener('touchstart', initializeAudio, { once: true });
    document.addEventListener('keydown', initializeAudio, { once: true });

    return () => {
      document.removeEventListener('click', initializeAudio);
      document.removeEventListener('touchstart', initializeAudio);
      document.removeEventListener('keydown', initializeAudio);
    };
  }, [audioInitialized, soundEnabled, volume, musicEnabled]);

  // Update sound manager volume when sound is toggled or volume changes
  useEffect(() => {
    if (soundManagerRef.current) {
      const effectiveVolume = soundEnabled ? volume : 0;
      soundManagerRef.current.setMasterVolume(effectiveVolume);
      
      // Only start/stop background music if audio has been initialized by user interaction
      if (audioInitialized) {
        if (soundEnabled && volume > 0 && musicEnabled) {
          soundManagerRef.current.startBackgroundMusic();
        } else {
          soundManagerRef.current.stopBackgroundMusic();
        }
      }
    }
  }, [soundEnabled, volume, audioInitialized, musicEnabled]);

  // Save volume to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('wordwalker-volume', volume.toString());
  }, [volume]);

  // Save music enabled state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('wordwalker-music-enabled', musicEnabled.toString());
  }, [musicEnabled]);

  // Update sound manager music enabled state when it changes
  useEffect(() => {
    if (soundManagerRef.current && audioInitialized) {
      soundManagerRef.current.setMusicEnabled(musicEnabled);
    }
  }, [musicEnabled, audioInitialized]);

  // Update sound manager theme when current theme changes
  useEffect(() => {
    if (soundManagerRef.current) {
      soundManagerRef.current.setTheme(currentTheme);
    }
  }, [currentTheme]);

  // Handle page visibility, minimize, and window blur events to stop background music
  useEffect(() => {
    // Handle visibility change (tab switch, minimize, etc.)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden - stop background music
        if (soundManagerRef.current) {
          soundManagerRef.current.stopBackgroundMusic();
        }
      } else {
        // Page is visible again - resume background music if enabled
        if (soundManagerRef.current && audioInitialized && soundEnabled && volume > 0 && musicEnabled) {
          soundManagerRef.current.startBackgroundMusic();
        }
      }
    };

    // Handle window blur (user switches windows/tabs)
    const handleWindowBlur = () => {
      if (soundManagerRef.current) {
        soundManagerRef.current.stopBackgroundMusic();
      }
    };

    // Handle window focus (user comes back)
    const handleWindowFocus = () => {
      if (soundManagerRef.current && audioInitialized && soundEnabled && volume > 0 && musicEnabled) {
        soundManagerRef.current.startBackgroundMusic();
      }
    };

    // Handle before unload (page close, reload, navigation)
    const handleBeforeUnload = () => {
      if (soundManagerRef.current) {
        soundManagerRef.current.stopBackgroundMusic();
      }
    };

    // Handle page hide (browser minimize on some platforms)
    const handlePageHide = () => {
      if (soundManagerRef.current) {
        soundManagerRef.current.stopBackgroundMusic();
      }
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);

    // Cleanup event listeners
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [audioInitialized, soundEnabled, volume]);

  // Handle URL parameters to open specific categories (for SEO deep linking)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    const modeParam = urlParams.get('mode') || 'flashcard'; // Default to flashcard for direct links
    
    if (categoryParam && !showChoice && !showFlashCards && !selectedPath) {
      // Validate category exists
      const categoryData = getCategoryById(categoryParam);
      if (categoryData) {
        // Set up the category for flash cards
        setCategoryForFlashCards(categoryParam);
        setStreakAtCompletion(0);
        setShowFlashCards(true);
        setIsPaused(true);
        setOpenedFromUrl(true); // Track that we opened from URL
        
        // Update URL to remove parameters (clean state after opening)
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, '', cleanUrl);
      }
    }
  }, []); // Only run once on mount

  // Handle background music pause/resume when search dialog opens/closes
  useEffect(() => {
    if (showSearch) {
      // Search dialog opened - pause background music
      if (soundManagerRef.current) {
        soundManagerRef.current.stopBackgroundMusic();
      }
    } else {
      // Search dialog closed - resume background music if enabled
      if (soundManagerRef.current && audioInitialized && soundEnabled && volume > 0 && musicEnabled) {
        soundManagerRef.current.startBackgroundMusic();
      }
    }
  }, [showSearch, audioInitialized, soundEnabled, volume, musicEnabled]);

  // Check for saved game state on component mount
  useEffect(() => {
    if (!hasCheckedSavedState && hasSavedGameState()) {
      const loadedState = loadGameState();
      if (loadedState) {
        const statsToSet = {
          totalPoints: loadedState.totalPoints,
          streak: loadedState.streak,
          checkpointsAnswered: loadedState.checkpointsAnswered,
          correctFirstTryIds: loadedState.correctFirstTryIds || [],
          correctAnswersByCategory: loadedState.correctAnswersByCategory || {},
        };
        setSavedStats(statsToSet);
      }
      setShowResumeDialog(true);
      setHasCheckedSavedState(true);
    } else {
      setHasCheckedSavedState(true);
    }
  }, [hasCheckedSavedState]);

  // Auto-save game state periodically
  useEffect(() => {
    // Only auto-save if game has started (path selected)
    if (!selectedPath) return;

    autosaveTimerRef.current = setInterval(() => {
      const gameState = {
        totalPoints,
        streak,
        maxStreakInCategory,
        selectedPath,
        checkpointsAnswered,
        usedQuestionIds,
        completedCategories,
        forkCategories,
        presentedCategories,
        soundEnabled,
        volume,
        musicEnabled,
        correctFirstTryIds,
        correctAnswersByCategory,
        offsetRef: offsetRef.current,
      };
      saveGameState(gameState);
    }, 5000); // Auto-save every 5 seconds

    return () => {
      if (autosaveTimerRef.current) {
        clearInterval(autosaveTimerRef.current);
      }
    };
  }, [totalPoints, streak, maxStreakInCategory, selectedPath, checkpointsAnswered, usedQuestionIds, completedCategories, forkCategories, presentedCategories, soundEnabled, volume, musicEnabled, correctFirstTryIds, correctAnswersByCategory]);

  // Preload SVG emoji images when question changes
  useEffect(() => {
    if (currentQuestion && isEmojiSvg(currentQuestion.emoji)) {
      const svgPath = getEmojiSvgPath(currentQuestion.emoji, currentQuestion.category);
      console.log(`Loading SVG emoji for question ${currentQuestion.id}: ${svgPath}`);
      
      // Only load if not already in cache
      if (!emojiImageCache.current[svgPath]) {
        const img = new Image();
        img.onload = () => {
          emojiImageCache.current[svgPath] = img;
          console.log(`✓ Successfully preloaded SVG emoji: ${svgPath}`);
          // Force a re-render by updating a dummy state or trigger canvas redraw
          // The canvas animation loop will pick up the loaded image
        };
        img.onerror = (error) => {
          console.error(`✗ Failed to preload emoji SVG: ${svgPath}`, error);
          console.error(`  Question ID: ${currentQuestion.id}, Category: ${currentQuestion.category}`);
          emojiImageCache.current[svgPath] = null;
        };
        img.src = svgPath;
      } else {
        console.log(`✓ SVG emoji already cached: ${svgPath}`);
      }
    }
  }, [currentQuestion]);

  // Handle resume game
  const handleResumeGame = () => {
    const loadedState = loadGameState();
    if (loadedState) {
      const convertedState = convertLoadedState(loadedState);
      setTotalPoints(convertedState.totalPoints);
      setStreak(convertedState.streak);
      setMaxStreakInCategory(convertedState.maxStreakInCategory || 0);
      // Don't restore selectedPath - let the user choose category again when resuming
      // This fixes a bug where the choice dialog wouldn't show when resuming
      setSelectedPath(null);
      setCheckpointsAnswered(convertedState.checkpointsAnswered);
      setUsedQuestionIds(convertedState.usedQuestionIds);
      setCompletedCategories(convertedState.completedCategories);
      setForkCategories(convertedState.forkCategories);
      setPresentedCategories(convertedState.presentedCategories || new Set());
      setSoundEnabled(convertedState.soundEnabled);
      setVolume(convertedState.volume);
      setMusicEnabled(convertedState.musicEnabled !== undefined ? convertedState.musicEnabled : true);
      setCorrectFirstTryIds(convertedState.correctFirstTryIds);
      setCorrectAnswersByCategory(convertedState.correctAnswersByCategory);
      
      // Restore scroll position and calculate next checkpoint
      offsetRef.current = convertedState.offsetRef || 0;
      
      // Reset velocity and target to ensure smooth forward movement from restored position
      velocityRef.current = 0;
      targetOffsetRef.current = null;
      
      // Recalculate checkpoint position based on how many checkpoints have been answered
      const nextCheckpointIndex = convertedState.checkpointsAnswered;
      checkpointPositionRef.current = forkPositionRef.current + 1500 + (nextCheckpointIndex * checkpointSpacing);
      
      // Reset checkpoint fade animation to trigger it fresh
      checkpointFadeStartTimeRef.current = null;
      checkpointSoundPlayedRef.current = false;
      
      // Set flag to indicate game was just resumed (for emergency stop safeguard)
      setIsJustResumed(true);
      
      // Pause the game on resume so animation doesn't start until user selects a category
      setIsPaused(true);
      
      // Position camera to show fork and trigger the choice dialog
      // We'll use a small delay to ensure the canvas is ready
      // Skip showing choice dialog if flash cards are already showing (from URL parameter)
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          offsetRef.current = forkPositionRef.current - (canvas.width * 0.75);
        }
        // Only show choice dialog if not showing flash cards
        if (!showFlashCards) {
          setShowChoice(true);
        }
      }, 100);
      
      setShowResumeDialog(false);
    }
  };

  // Handle new game
  const handleNewGame = () => {
    // Load current correctAnswersByCategory before clearing state
    const loadedState = loadGameState();
    const persistedCorrectAnswers = loadedState?.correctAnswersByCategory || {};
    
    clearGameState();
    setTotalPoints(0);
    setStreak(0);
    setMaxStreakInCategory(0);
    setSelectedPath(null);
    setCheckpointsAnswered(0);
    setUsedQuestionIds({});
    setCompletedCategories(new Set());
    setPresentedCategories(new Set());
    setCorrectFirstTryIds({});
    setCorrectAnswersByCategory(persistedCorrectAnswers); // Preserve learned questions
    
    // Generate fresh fork categories for new game
    const freshCategories = initializeForkCategories();
    setForkCategories(freshCategories);
    setPresentedCategories(new Set(extractCategoryIds(freshCategories)));
    
    setShowQuestion(false);
    setCurrentQuestion(null);
    setQuestionAnswered(false);
    setFirstAttempt(true);
    setIncorrectAnswers([]);
    setShowTranslation(false);
    setShowHint(false);
    setHintUsed(false);
    setShowChoice(false);
    setIsPaused(false);
    setIsJustResumed(false); // Clear the just-resumed flag
    setShowResumeDialog(false);
  };

  useEffect(() => {
    // Track whether this effect is still active (for cleanup)
    let isMounted = true;
    
    // Get base path for assets (handles subdirectory deployments)
    const basePath = import.meta.env.BASE_URL || '/';
    
    // Get current theme configuration
    const theme = getTheme(currentTheme);
    const themePath = `${basePath}images/themes/${theme.imagePath}/`;
    
    // Load parallax-layer2 image (grass)
    const parallaxLayer2 = new Image();
    parallaxLayer2.src = `${themePath}parallax-layer2.png`;
    parallaxLayer2.onload = () => {
      if (isMounted) {
        setParallaxLayer2Image(parallaxLayer2);
      }
    };
    
    // Only load path images if theme uses them
    if (theme.usePathImages !== false) {
      // Load path image
      const path = new Image();
      path.src = `${themePath}path.png`;
      path.onload = () => {
        if (isMounted) {
          setPathImage(path);
        }
      };
      
      // Load path fork image
      const pathFork = new Image();
      pathFork.src = `${themePath}path-fork.png`;
      pathFork.onload = () => {
        if (isMounted) {
          setPathForkImage(pathFork);
        }
      };
    } else {
      // Clear path images if theme doesn't use them
      setPathImage(null);
      setPathForkImage(null);
    }
    
    // Load parallax-layer6 image (mountains)
    const parallaxLayer6 = new Image();
    parallaxLayer6.src = `${themePath}parallax-layer6.png`;
    parallaxLayer6.onload = () => {
      if (isMounted) {
        setParallaxLayer6Image(parallaxLayer6);
      }
    };
    
    // Load parallax-layer1 image (foreground layer)
    const parallaxLayer1 = new Image();
    parallaxLayer1.src = `${themePath}parallax-layer1.png`;
    parallaxLayer1.onload = () => {
      if (isMounted) {
        setParallaxLayer1Image(parallaxLayer1);
      }
    };
    
    // Load parallax-layer4 image (mid-distant layer)
    const parallaxLayer4 = new Image();
    parallaxLayer4.src = `${themePath}parallax-layer4.png`;
    parallaxLayer4.onload = () => {
      if (isMounted) {
        setParallaxLayer4Image(parallaxLayer4);
      }
    };
    
    // Load parallax-layer5 image (far layer)
    const parallaxLayer5 = new Image();
    parallaxLayer5.src = `${themePath}parallax-layer5.png`;
    parallaxLayer5.onload = () => {
      if (isMounted) {
        setParallaxLayer5Image(parallaxLayer5);
      }
    };
    
    // Load parallax-layer3 image (bushes layer)
    const parallaxLayer3 = new Image();
    parallaxLayer3.src = `${themePath}parallax-layer3.png`;
    parallaxLayer3.onload = () => {
      if (isMounted) {
        setParallaxLayer3Image(parallaxLayer3);
      }
    };
    
    // Load parallax-layer7 image (rear layer at infinite distance, no parallax)
    const parallaxLayer7 = new Image();
    parallaxLayer7.src = `${themePath}parallax-layer7.png`;
    parallaxLayer7.onload = () => {
      if (isMounted) {
        setParallaxLayer7Image(parallaxLayer7);
      }
    };
    
    // Cleanup function to prevent setting state with stale images
    return () => {
      isMounted = false;
    };
  }, [currentTheme]);

  // Update walker sprite sheet when current character changes or variants load
  useEffect(() => {
    const spriteSheet = getWalkerSpriteSheet();
    if (spriteSheet) {
      setWalkerSpriteSheet(spriteSheet);
    }
  }, [currentCharacter, walkerVariants, getWalkerSpriteSheet]);

  // Check if all critical assets are loaded
  useEffect(() => {
    // Get current theme configuration
    const theme = getTheme(currentTheme);
    
    // Consider loading complete based on whether theme uses path images
    const criticalAssetsLoaded = theme.usePathImages !== false
      ? pathImage && pathForkImage && walkerSpriteSheet  // Need path images
      : walkerSpriteSheet;  // Don't need path images
    
    if (criticalAssetsLoaded && isLoading) {
      setIsLoading(false);
    }
  }, [pathImage, pathForkImage, walkerSpriteSheet, isLoading, currentTheme]);

  // Adjust camera position when choice dialog is shown/hidden
  // When dialog is visible AND animation is paused, smoothly pan the fork to the right side
  useEffect(() => {
    if (showChoice && isPaused) {
      const canvas = canvasRef.current;
      if (canvas) {
        const width = canvas.width;
        // Set target offset for smooth animation to position fork at 75% across the screen
        targetOffsetRef.current = forkPositionRef.current - (width * 0.75);
      }
    } else {
      // Clear target when dialog closes
      targetOffsetRef.current = null;
    }
  }, [showChoice, isPaused]);

  // Start idle animation mode after 30 seconds of path choice dialog being open
  // This keeps user engaged by showing walker animation in the background
  useEffect(() => {
    let idleAnimationTimer;
    
    if (showChoice && isPaused) {
      // Reset idle mode when dialog opens
      setIsIdleAnimationMode(false);
      
      // Start timer for 5 seconds
      idleAnimationTimer = setTimeout(() => {
        // console.log('⏰ Enabling idle animation mode after 5s on path choice dialog');
        setIsIdleAnimationMode(true);
      }, 5000); // 5 seconds
    } else {
      // Reset when dialog closes or game resumes
      setIsIdleAnimationMode(false);
    }
    
    return () => {
      if (idleAnimationTimer) {
        clearTimeout(idleAnimationTimer);
      }
    };
  }, [showChoice, isPaused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Helper function to draw the streak diamond with glow effect
    const drawStreakDiamond = (x, y, size, glowIntensity, streak) => {
      // Determine diamond color based on streak level using game settings
      const diamondColor = getStreakColor(streak);
      
      ctx.save();
      
      // Draw outer glow layers (multiple layers for better glow effect)
      const glowLayers = 5;
      for (let i = glowLayers; i > 0; i--) {
        const layerSize = size + (i * 8 * glowIntensity);
        const layerAlpha = (glowIntensity * 0.15) / i;
        
        ctx.globalAlpha = layerAlpha;
        ctx.fillStyle = diamondColor;
        ctx.beginPath();
        ctx.moveTo(x, y - layerSize / 2);
        ctx.lineTo(x + layerSize / 2, y);
        ctx.lineTo(x, y + layerSize / 2);
        ctx.lineTo(x - layerSize / 2, y);
        ctx.closePath();
        ctx.fill();
      }
      
      // Draw main diamond with higher opacity
      ctx.globalAlpha = 0.7 + (glowIntensity * 0.3);
      ctx.fillStyle = diamondColor;
      ctx.beginPath();
      ctx.moveTo(x, y - size / 2);
      ctx.lineTo(x + size / 2, y);
      ctx.lineTo(x, y + size / 2);
      ctx.lineTo(x - size / 2, y);
      ctx.closePath();
      ctx.fill();
      
      // Add inner highlight for sparkle effect
      ctx.globalAlpha = 0.9 * glowIntensity;
      ctx.fillStyle = '#FFFFFF';
      const highlightSize = size * 0.4;
      ctx.beginPath();
      ctx.moveTo(x, y - highlightSize / 2);
      ctx.lineTo(x + highlightSize / 2, y);
      ctx.lineTo(x, y + highlightSize / 2);
      ctx.lineTo(x - highlightSize / 2, y);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
    };
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = window.innerHeight;
    };

    const drawScene = (deltaTime = 0.016667) => {
      const width = canvas.width;
      const height = canvas.height;
      
      // Clear canvas for new frame
      ctx.clearRect(0, 0, width, height);
      
      // Get current theme configuration
      const theme = getTheme(currentTheme);
      
      // Define horizon line (eye level) - positioned based on theme
      const horizonY = height * theme.positioning.horizonY;
      
      // Helper function to get layer Y position with theme offset
      const getLayerY = (baseY, layerId) => {
        return baseY + (theme.layerPositions[layerId] || 0);
      };
      
      // Helper function to get layer speed from theme
      const getLayerSpeed = (layerId) => {
        return theme.layerSpeeds[layerId] || gameSettings.parallax.layerSpeeds[layerId];
      };
      
      // Draw parallax layer 7 (rear layer at infinite distance - no parallax effect)
      // Drawn first so it appears behind everything else
      if (parallaxLayer7Image) {
        const layer7Width = parallaxLayer7Image.width; // 600px
        const layer7Height = parallaxLayer7Image.height; // 300px
        
        // Layer 7 does not move (infinite distance, no parallax)
        // Scale to cover full canvas width + bleed on mobile
        const scale = (width * 1.2) / layer7Width; // 1.2x scale allows bleeding on edges
        const scaledHeight = layer7Height * scale;
        const xOffset = -(scaledHeight * 0.1); // Center with slight offset
        const layer7Y = getLayerY(0, 'layer7');
        ctx.drawImage(parallaxLayer7Image, xOffset, layer7Y, width * 1.2, scaledHeight);
      } else {
        // Fallback: if layer 7 is not loaded yet, draw theme colors for above and below horizon
        // First, fill entire canvas with above-horizon color as a safeguard
        ctx.fillStyle = theme.canvasColors.aboveHorizon;
        ctx.fillRect(0, 0, width, height);
        
        // Then draw below-horizon color on top with overlap to prevent gaps from subpixel rendering
        const skyBottom = horizonY - 20;
        ctx.fillStyle = theme.canvasColors.belowHorizon;
        ctx.fillRect(0, skyBottom - 2, width, height - skyBottom + 2);
      }
      
      // Fill bottom portion with theme below-horizon color to avoid white showing behind parallax trees
      // Use configurable belowHorizonStart from theme (defaults to 0.4 = 40% down from top)
      const belowHorizonStart = theme.positioning.belowHorizonStart || 0.4;
      const belowHorizonY = height * belowHorizonStart;
      ctx.fillStyle = theme.canvasColors.belowHorizon;
      ctx.fillRect(0, belowHorizonY, width, height - belowHorizonY);
      
      // Draw mountains at the horizon (tiled horizontally with parallax)
      if (parallaxLayer6Image) {
        const layer6Width = parallaxLayer6Image.width;
        const layer6Height = parallaxLayer6Image.height;
        
        // Parallax effect - layer 6 moves based on config (far distance - very slow)
        const layer6Speed = getLayerSpeed('layer6');
        const layer6ScrollOffset = (offsetRef.current * layer6Speed) % layer6Width;
        
        // Calculate how many tiles needed to cover the width
        const layer6TilesNeeded = Math.ceil(width / layer6Width) + 2;
        
        // Position layer 6 at the horizon with theme offset
        const layer6Y = getLayerY(horizonY - layer6Height, 'layer6');
        
        // Draw layer 6 tiles horizontally
        for (let i = -1; i < layer6TilesNeeded; i++) {
          const x = i * layer6Width - layer6ScrollOffset;
          ctx.drawImage(parallaxLayer6Image, x, layer6Y, layer6Width, layer6Height);
        }
      }


      
      // Draw parallax layer 5 (far layer) - between layer 6 and layer 4
      // Drawn after grass so it appears in front
      if (parallaxLayer5Image) {
        const layer5Width = parallaxLayer5Image.width;
        const layer5Height = parallaxLayer5Image.height;
        
        // Parallax effect - layer 5 moves based on config
        const layer5Speed = getLayerSpeed('layer5');
        const layer5ScrollOffset = (offsetRef.current * layer5Speed) % layer5Width;
        
        // Calculate how many tiles needed
        const layer5TilesNeeded = Math.ceil(width / layer5Width) + 2;
        
        // Position layer 5 at horizon with theme offset
        const layer5Y = getLayerY(horizonY - layer5Height * 0.3, 'layer5'); // Slightly overlap with layer 6
        
        // Draw layer 5 tiles horizontally
        for (let i = -1; i < layer5TilesNeeded; i++) {
          const x = i * layer5Width - layer5ScrollOffset;
          ctx.drawImage(parallaxLayer5Image, x, layer5Y, layer5Width, layer5Height);
        }
      }
      
      // Draw parallax layer 4 (midcan we br-distant layer)
      if (parallaxLayer4Image) {
        const layer4Width = parallaxLayer4Image.width;
        const layer4Height = parallaxLayer4Image.height;
        
        // Parallax effect - layer 4 moves based on config
        const layer4Speed = getLayerSpeed('layer4');
        const layer4ScrollOffset = (offsetRef.current * layer4Speed) % layer4Width;
        
        // Calculate how many tiles needed
        const layer4TilesNeeded = Math.ceil(width / layer4Width) + 2;
        
        // Position layer 4 with theme offset
        const layer4Y = getLayerY(horizonY, 'layer4');
        
        // Draw layer 4 tiles horizontally
        for (let i = -1; i < layer4TilesNeeded; i++) {
          const x = i * layer4Width - layer4ScrollOffset;
          ctx.drawImage(parallaxLayer4Image, x, layer4Y, layer4Width, layer4Height);
        }
      }
      
      // Define path area based on theme positioning
      const pathTop = height * theme.positioning.pathTopOffset + theme.positioning.pathTopAdditional; // Where path starts (behind)
      const pathBottom = height * 0.75 + theme.positioning.pathTopAdditional; // Where path ends (in front)
      const pathHeight = pathBottom - pathTop;
      
      // Path-specific vertical offset (independent of layer positioning)
      const pathYOffset = theme.positioning.pathYOffset ?? 0;
      
      // Draw parallax layer 3 (bushes) - before layer 2 so layer 2 appears in front
      if (parallaxLayer3Image) {
        const layer3Width = parallaxLayer3Image.width;
        const layer3Height = parallaxLayer3Image.height;
        
        // Parallax effect - layer 3 moves based on config
        const layer3Speed = getLayerSpeed('layer3');
        const layer3ScrollOffset = (offsetRef.current * layer3Speed) % layer3Width;
        
        // Calculate how many tiles needed
        const layer3TilesNeeded = Math.ceil(width / layer3Width) + 2;
        
        // Position layer 3 just above the path with theme offset
        const layer3Y = getLayerY(pathTop - layer3Height * 0.5, 'layer3'); // Overlap slightly with path area
        
        // Draw layer 3 tiles horizontally
        for (let i = -1; i < layer3TilesNeeded; i++) {
          const x = i * layer3Width - layer3ScrollOffset;
          ctx.drawImage(parallaxLayer3Image, x, layer3Y, layer3Width, layer3Height);
        }
      }
      
      // Draw parallax layer 2 (grass) for entire area (path + foreground) - single unified tile
      if (parallaxLayer2Image) {
        const tileWidth = parallaxLayer2Image.width;
        const layer2Speed = getLayerSpeed('layer2');
        const scrollOffset = (offsetRef.current * layer2Speed) % tileWidth;
        
        // Draw layer 2 tiles - repeat horizontally, stretch vertically from pathTop to bottom
        // Layer 2 always fills from pathTop to bottom of canvas
        // stretchFactor controls the image aspect ratio (1.0 = no distortion)
        const stretchFactor = theme.layer2StretchFactor ?? 1.0;
        const offsetY = theme.layer2OffsetY ?? 0;
        const startY = pathTop + offsetY;
        const totalLayer2Height = height - startY;  // Always fill to bottom of screen
        const tilesX = Math.ceil(width / tileWidth) + 1;
        
        for (let col = -1; col < tilesX; col++) {
          const x = col * tileWidth - scrollOffset;
          const y = startY;
          ctx.drawImage(parallaxLayer2Image, x, y, tileWidth, totalLayer2Height);
        }
      }
      
      // Draw the path using tiled images (on top of grass)
      
      // Person position (fixed on screen)
      const personX = width * 0.4;
      
      // Calculate current scroll position and fork position
      const scrollPos = offsetRef.current;
      const forkScreenX = forkPositionRef.current - scrollPos;
      
      // Show choice when fork's left edge reaches the screen
      const shouldShowChoice = forkScreenX <= width && forkScreenX > 0 && !selectedPath;
      
      if (shouldShowChoice && !isPaused && !showChoice) {
        setIsPaused(true);
        // Immediately reposition camera to show fork on the right side
        offsetRef.current = forkPositionRef.current - (width * 0.75);
        
        // Delay showing dialog to allow canvas to render first and avoid visual flash
        setTimeout(() => {
          setShowChoice(true);
        }, 50); // Slight delay to ensure canvas updates before dialog appears
      }
      
      // Draw path tiles
      if (pathImage && pathForkImage) {
        const tileSize = 240; // Both images are 240x240
        const tileOverlap = 1; // 1-pixel overlap to prevent vertical hairlines
        const pathScrollOffset = scrollPos % tileSize;
        
        // Calculate fork screen position - shift right 10px to spill over canvas edge
        const forkScreenX = width - tileSize + 10;
        
        // Calculate how many tiles we need
        const tilesNeeded = Math.ceil(width / tileSize) + 2;
        
        // Draw straight path tiles and fork (only show fork when dialog is visible)
        for (let i = -1; i < tilesNeeded; i++) {
          const tileX = i * tileSize - pathScrollOffset;
          
          // Calculate the world position for the left edge of this tile
          const tileWorldStartX = scrollPos + tileX;
          const tileWorldEndX = tileWorldStartX + tileSize;
          
          // Check if this tile is on screen
          const tileScreenX = tileX;
          const tileScreenRight = tileScreenX + tileSize;
          const tileOnScreen = tileScreenRight > 0 && tileScreenX < width;
          
          if (!tileOnScreen) continue; // Skip tiles not on screen
          
          // Skip drawing the tile if fork is visible and this tile would be covered by the fork
          if (showChoice && !selectedPath && !isIdleAnimationMode && tileScreenX >= forkScreenX) {
            continue; // Skip tiles that would be covered by the fork
          }
          
          // Draw straight path with 1-pixel overlap to prevent vertical hairlines
          ctx.drawImage(pathImage, tileX - tileOverlap, pathTop + pathYOffset, tileSize + tileOverlap, pathHeight);
        }
        
        // Draw fork at fixed screen position with right edge aligned to canvas right edge
        // Hide fork during idle animation mode to show continuous path scrolling
        if (showChoice && !selectedPath && !isIdleAnimationMode) {
          ctx.drawImage(pathForkImage, forkScreenX, pathTop + pathYOffset, tileSize, pathHeight);
        }
      }
      
      // Draw learning checkpoint (emoji on path) if path has been selected and not answered
      // AND there's a valid question to display
      if (selectedPath && !questionAnswered && currentQuestion) {
        const checkpointScreenX = checkpointPositionRef.current - scrollPos;
        
        // Get character config to access yOffset for checkpoint positioning
        const characterData = getCharacterById(currentCharacter);
        const characterYOffset = characterData?.yOffset || 0; // Default to 0 if not found
        
        // Draw checkpoint emoji if it's visible on screen
        if (checkpointScreenX < width && checkpointScreenX > -100) {
          // Use theme's configurable checkpoint position (0.0 = top, 0.5 = center, 1.0 = bottom)
          const checkpointYPosition = theme.positioning.checkpointYPosition ?? 0.5;
          const checkpointY = pathTop + (pathBottom - pathTop) * checkpointYPosition - 30 + characterYOffset;
          const checkpointSize = 60;
          
          // Initialize fade-in start time if not set
          if (checkpointFadeStartTimeRef.current === null) {
            checkpointFadeStartTimeRef.current = Date.now();
          }
          
          // Calculate fade-in opacity (when coming into view)
          const fadeElapsed = Date.now() - checkpointFadeStartTimeRef.current;
          const fadeOpacity = Math.min(fadeElapsed / checkpointFadeDuration, 1);
          
          ctx.save();
          
          // Add pulsing glow effect to indicate clickability
          const pulseTime = Date.now() / 1000; // Convert to seconds
          const pulseIntensity = (Math.sin(pulseTime * 2) + 1) / 2; // 0 to 1
          
          const emojiToDisplay = currentQuestion ? currentQuestion.emoji : '❓';
          
          // Check if emoji is an SVG/PNG file
          if (currentQuestion && isEmojiSvg(emojiToDisplay)) {
            const svgPath = getEmojiSvgPath(emojiToDisplay, currentQuestion.category);
            
            // Get cached image (should be preloaded by useEffect)
            const emojiImg = emojiImageCache.current[svgPath];
            
            // Draw SVG/PNG image if loaded and ready
            if (emojiImg && emojiImg.complete && emojiImg.naturalWidth > 0) {
              // PNG images (150x150px) need to be rendered larger to match text emoji size
              // Apply 1.4x scale for PNG images to appear similar to regular emojis
              const isPng = emojiToDisplay.endsWith('.png');
              const imageScale = isPng ? 1.4 : 1.0;
              const scaledSize = checkpointSize * imageScale;
              
              // Draw glow layers for image
              for (let i = 3; i > 0; i--) {
                const glowSize = scaledSize * (1 + i * 0.2 * pulseIntensity);
                ctx.globalAlpha = fadeOpacity * 0.3 * pulseIntensity / i;
                ctx.shadowColor = '#FFD700';
                ctx.shadowBlur = 20 * i;
                ctx.drawImage(
                  emojiImg,
                  checkpointScreenX - glowSize / 2,
                  checkpointY - glowSize / 2,
                  glowSize,
                  glowSize
                );
              }
              
              // Draw main image
              ctx.globalAlpha = fadeOpacity;
              ctx.shadowColor = 'transparent';
              ctx.shadowBlur = 0;
              ctx.drawImage(
                emojiImg,
                checkpointScreenX - scaledSize / 2,
                checkpointY - scaledSize / 2,
                scaledSize,
                scaledSize
              );
            } else {
              // Fallback to question mark while loading
              ctx.globalAlpha = fadeOpacity;
              ctx.fillStyle = 'black';
              ctx.font = `${checkpointSize}px Arial`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('❓', checkpointScreenX, checkpointY);
            }
          } else {
            // Regular emoji - draw as text
            // Draw glow layers (subtle pulsing effect)
            for (let i = 3; i > 0; i--) {
              const glowSize = checkpointSize * (1 + i * 0.2 * pulseIntensity);
              ctx.globalAlpha = fadeOpacity * 0.3 * pulseIntensity / i;
              ctx.fillStyle = '#FFD700';
              ctx.font = `${glowSize}px Arial`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(emojiToDisplay, checkpointScreenX, checkpointY);
            }
            
            // Draw main emoji
            ctx.globalAlpha = fadeOpacity;
            ctx.fillStyle = 'black';
            ctx.font = `${checkpointSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(emojiToDisplay, checkpointScreenX, checkpointY);
          }
          
          ctx.restore();
          
          // Store checkpoint bounds for click detection
          checkpointBoundsRef.current = {
            x: checkpointScreenX,
            y: checkpointY,
            size: checkpointSize,
            visible: true
          };
        } else {
          // Mark checkpoint as not visible
          checkpointBoundsRef.current.visible = false;
        }
        
        // Check if checkpoint is just to the right of the person - trigger question dialog
        // Show question when checkpoint is within ~120px to the right of person (matches stopping distance)
        const distanceFromPerson = checkpointScreenX - personX;
        if (distanceFromPerson <= 120 && distanceFromPerson > -50 && !showQuestion && !showFlashCards && currentQuestion) {
          setIsPaused(true);
          
          // Check game mode and show appropriate dialog
          if (gameMode === 'flashcard') {
            // Show flash cards instead of question dialog
            // Get the actual category from selectedPath
            const category = forkCategories[selectedPath] || selectedPath;
            const categoryData = getCategoryById(category);
            
            // Track category selection in GTM
            if (categoryData) {
              trackCategorySelection(category, categoryData.displayName);
            }
            
            setCategoryForFlashCards(category);
            setStreakAtCompletion(streak);
            setShowFlashCards(true);
          } else {
            // Show regular question dialog
            setShowQuestion(true);
          }
          
          // Play checkpoint sound if not already played for this checkpoint
          if (!checkpointSoundPlayedRef.current && soundManagerRef.current) {
            soundManagerRef.current.playChoice();
            checkpointSoundPlayedRef.current = true;
          }
        }
      } else {
        // No checkpoint to show - mark as not visible
        checkpointBoundsRef.current.visible = false;
      }
      
      // Draw walking person using sprite sheet animation
      // Position roughly in the middle-left of the path (personX already defined above)
      const personY = pathTop + (pathBottom - pathTop) * 0.5 - 50; // Middle of the path vertically, moved up 50 pixels
      
      // Get character config to access scale and offset properties for positioning calculations
      const characterData = getCharacterById(currentCharacter);
      const characterScale = characterData?.scale || 1.0; // Default to 1.0 if not found
      const characterYOffset = characterData?.yOffset || 0; // Default to 0 if not found
      
      // Draw streak diamond behind the walker if streak is active
      if (streak > 0) {
        // Update diamond glow animation (smooth fade in/out)
        // Continue animation during victory, idle mode, or when not paused
        if (!isPaused || isVictoryAnimation || isIdleAnimationMode) {
          diamondGlowRef.current += 0.02; // Speed of glow animation
        }
        
        // Calculate glow intensity using sine wave for smooth pulsing (0 to 1)
        const glowIntensity = (Math.sin(diamondGlowRef.current) + 1) / 2;
        
        // Position diamond behind and to the left of the walker
        const diamondX = personX - 35; // 35 pixels to the left of walker
        // Adjust diamond Y position based on character scale and Y offset to keep it properly aligned
        const diamondY = personY + characterYOffset;
        const diamondSize = 25; // Base size of diamond
        
        drawStreakDiamond(diamondX, diamondY, diamondSize, glowIntensity, streak);
      }
      
      if (walkerSpriteSheet) {
        // Update animation frame using time-based accumulation
        // This ensures consistent animation speed regardless of monitor refresh rate
        const isMoving = velocityRef.current > 0.5;
        // Allow animation when: moving & not paused, OR victory animation, OR preview mode, 
        // OR idle animation mode (walker animates while path choice dialog is open for 30+ seconds)
        if ((isMoving && !isPaused) || isVictoryAnimation || isPreviewMode || isIdleAnimationMode) {
          // Accumulate time for sprite frame changes
          frameAccumulatorRef.current += deltaTime * 1000; // Convert to milliseconds
          
          // Frame interval in milliseconds (at 60fps, 6 frames = ~100ms, 12 frames = ~200ms)
          // Use slightly slower animation (150ms) during idle mode for a relaxed feel
          const frameIntervalMs = isVictoryAnimation ? 200 : (isIdleAnimationMode ? 150 : 100);
          
          if (frameAccumulatorRef.current >= frameIntervalMs) {
            frameAccumulatorRef.current -= frameIntervalMs; // Subtract instead of reset for accuracy
            
            if (isVictoryAnimation) {
              // Victory animation (slower, more obvious)
              walkerFrameRef.current = (walkerFrameRef.current + 1) % spriteConfig.totalFrames;
              
              // Count how many frames of victory animation have played
              victoryAnimationCounterRef.current++;
              
              // After playing all 6 frames of victory animation, switch back to walking
              if (victoryAnimationCounterRef.current >= spriteConfig.totalFrames) {
                setIsVictoryAnimation(false);
                victoryAnimationCounterRef.current = 0;
                walkerFrameRef.current = 0;
              }
            } else {
              // Walking animation
              walkerFrameRef.current = (walkerFrameRef.current + 1) % spriteConfig.totalFrames;
            }
          }
        } else {
          // When stopped at checkpoint, use the rightmost (6th) frame for idle pose
          walkerFrameRef.current = 5; // Frame 5 is the 6th frame (0-indexed)
          frameAccumulatorRef.current = 0; // Reset accumulator when stopped
        }
        
        // Calculate which row to use (walking or victory)
        const currentRow = isVictoryAnimation ? spriteConfig.victoryRow : spriteConfig.walkingRow;
        
        // Calculate source position in sprite sheet
        const sourceX = walkerFrameRef.current * spriteConfig.frameWidth;
        const sourceY = currentRow * spriteConfig.frameHeight;
        
        // Calculate size to draw on canvas (scaled appropriately)
        const baseDrawWidth = 80;  // Base size
        const drawWidth = baseDrawWidth * characterScale;  // Apply character-specific scale
        const drawHeight = (spriteConfig.frameHeight / spriteConfig.frameWidth) * drawWidth;
        
        // Add bounce effect during victory animation
        let bounceOffset = 0;
        if (isVictoryAnimation) {
          // Create a bounce up and down based on current frame
          // Frames 0-2: jump up (0 -> -20 pixels)
          // Frames 3-5: come down (-20 -> 0 pixels)
          const bounceProgress = walkerFrameRef.current / (spriteConfig.totalFrames - 1);
          bounceOffset = -20 * Math.sin(bounceProgress * Math.PI); // Smooth sine wave bounce
        }
        
        // Calculate walker position
        const walkerX = personX - drawWidth / 2 + 10;
        const walkerY = personY - drawHeight / 2 + bounceOffset + characterYOffset; // Apply Y-offset
        
        // Draw the current frame from sprite sheet
        ctx.drawImage(
          walkerSpriteSheet,
          sourceX, sourceY,                    // Source position in sprite sheet
          spriteConfig.frameWidth,             // Source width
          spriteConfig.frameHeight,            // Source height
          walkerX,                             // Destination X (centered + 10px right)
          walkerY,                             // Destination Y (centered + bounce)
          drawWidth,                           // Destination width
          drawHeight                           // Destination height
        );
        
        // Update walker bounds for click detection (Easter egg)
        walkerBoundsRef.current = {
          x: walkerX,
          y: walkerY,
          width: drawWidth,
          height: drawHeight
        };
      }
      // Note: No fallback emoji - wait for sprite sheet to load for cleaner appearance
      
      // Draw parallax layer 1 (foreground layer) - in front of everything
      // Only render in portrait mode to avoid visual clutter in landscape
      const isPortrait = height > width;
      if (parallaxLayer1Image && isPortrait) {
        const layer1Width = parallaxLayer1Image.width;
        const layer1Height = parallaxLayer1Image.height;
        const layer1Speed = getLayerSpeed('layer1');
        const layer1ScrollOffset = (offsetRef.current * layer1Speed) % layer1Width;
        const layer1TilesNeeded = Math.ceil(width / layer1Width) + 2;
        const layer1Y = getLayerY(height - layer1Height, 'layer1');
        
        for (let i = -1; i < layer1TilesNeeded; i++) {
          const x = i * layer1Width - layer1ScrollOffset;
          ctx.drawImage(
            parallaxLayer1Image,
            x,
            layer1Y,
            layer1Width,
            layer1Height
          );
        }
      }
    };

    const animate = (currentTime) => {
      // Calculate delta time for frame-rate independent animation
      // This ensures consistent animation speed on 60Hz, 144Hz, and other refresh rates
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
      }
      const deltaTime = Math.min((currentTime - lastTimeRef.current) / 1000, 0.1); // Cap at 100ms to prevent huge jumps
      lastTimeRef.current = currentTime;
      
      // Delta multiplier: scales frame-based values to time-based
      // At 60fps, each frame is ~16.67ms, so deltaTime would be ~0.01667s
      // We normalize to 60fps as the baseline (deltaMultiplier = 1 at 60fps)
      const deltaMultiplier = deltaTime * 60;
      
      // Calculate if fork is fully visible on screen
      const canvas = canvasRef.current;
      if (canvas) {
        const scrollPos = offsetRef.current;
        const forkScreenX = forkPositionRef.current - scrollPos;
        const forkTileSize = 240;
        
        // Check if choice dialog should be shown
        // Stop when fork's LEFT edge reaches the screen, ensuring the right edge never comes into view
        const shouldStopForChoice = forkScreenX <= canvas.width && forkScreenX > 0 && !selectedPath;
        
        // Check if checkpoint is approaching (to start decelerating early)
        const personX = canvas.width * 0.4;
        const checkpointScreenX = checkpointPositionRef.current - scrollPos;
        const distanceToCheckpoint = checkpointScreenX - personX;
        const shouldStopForCheckpoint = selectedPath && !questionAnswered && distanceToCheckpoint <= 120 && distanceToCheckpoint > 0;
        
        // Target speed and inertia parameters (now time-based)
        const targetSpeed = 4; // Maximum scroll speed in pixels per frame at 60fps
        const acceleration = 0.15 * deltaMultiplier; // Scale acceleration by delta time
        const deceleration = 0.2 * deltaMultiplier; // Scale deceleration by delta time
        
        // During idle animation mode, skip camera panning and use continuous scroll
        if (isIdleAnimationMode) {
          // During idle animation mode, use a slow constant scroll speed for parallax effect
          // This creates gentle background movement while walker animates in place
          const idleScrollSpeed = 1.5; // Slower than normal walking speed
          velocityRef.current = idleScrollSpeed;
          offsetRef.current += velocityRef.current * deltaMultiplier;
        } else if (targetOffsetRef.current !== null) {
          // Apply smooth camera panning if we have a target offset (for fork repositioning)
          const cameraSpeed = 8; // Speed at which camera pans to target (higher = faster)
          const distanceToTarget = targetOffsetRef.current - offsetRef.current;
          
          // If we're very close to target, snap to it
          if (Math.abs(distanceToTarget) < 1) {
            offsetRef.current = targetOffsetRef.current;
          } else {
            // Smoothly move toward target (use deltaMultiplier for consistent pan speed)
            offsetRef.current += (distanceToTarget / cameraSpeed) * deltaMultiplier;
          }
          
          // Keep velocity at zero while panning to prevent walker animation
          velocityRef.current = 0;
        } else {
          // Determine if walker should be moving (normal gameplay or preview mode)
          const shouldMove = (!isPaused && (!shouldStopForChoice || selectedPath) && !shouldStopForCheckpoint) || isPreviewMode;
          
          // Apply inertia - gradually change velocity toward target
          if (shouldMove) {
            // Accelerate toward target speed
            if (velocityRef.current < targetSpeed) {
              velocityRef.current = Math.min(velocityRef.current + acceleration, targetSpeed);
            }
          } else {
            // Decelerate toward zero
            if (velocityRef.current > 0) {
              velocityRef.current = Math.max(velocityRef.current - deceleration, 0);
            }
          }
          
          // Apply velocity to offset (scale by deltaMultiplier for consistent movement speed)
          offsetRef.current += velocityRef.current * deltaMultiplier;
        }
      } else {
        // Fallback if canvas not available
        if (isIdleAnimationMode) {
          // During idle animation mode, use a slow constant scroll speed for parallax effect
          const idleScrollSpeed = 1.5;
          velocityRef.current = idleScrollSpeed;
          offsetRef.current += velocityRef.current * deltaMultiplier;
        } else if (targetOffsetRef.current !== null) {
          // Smooth panning (no walker movement)
          const cameraSpeed = 8;
          const distanceToTarget = targetOffsetRef.current - offsetRef.current;
          if (Math.abs(distanceToTarget) < 1) {
            offsetRef.current = targetOffsetRef.current;
          } else {
            offsetRef.current += (distanceToTarget / cameraSpeed) * deltaMultiplier;
          }
          velocityRef.current = 0;
        } else {
          // Normal movement (idle animation mode already handled above)
          const targetSpeed = 4;
          const acceleration = 0.15 * deltaMultiplier;
          const deceleration = 0.2 * deltaMultiplier;
          
          if (!isPaused || isPreviewMode) {
            if (velocityRef.current < targetSpeed) {
              velocityRef.current = Math.min(velocityRef.current + acceleration, targetSpeed);
            }
          } else {
            if (velocityRef.current > 0) {
              velocityRef.current = Math.max(velocityRef.current - deceleration, 0);
            }
          }
          
          // Note: In this fallback case, we don't have shouldStopForCheckpoint,
          // so just apply velocity normally (scale by deltaMultiplier)
          offsetRef.current += velocityRef.current * deltaMultiplier;
        }
      }
      
      drawScene(deltaTime);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Start animation with requestAnimationFrame to get proper timestamp
    lastTimeRef.current = 0; // Reset for fresh start
    frameAccumulatorRef.current = 0; // Reset frame accumulator
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [parallaxLayer2Image, pathImage, pathForkImage, parallaxLayer6Image, parallaxLayer1Image, parallaxLayer4Image, parallaxLayer5Image, parallaxLayer3Image, walkerSpriteSheet, isPaused, showChoice, showQuestion, selectedPath, questionAnswered, isVictoryAnimation, currentTheme, isPreviewMode, isIdleAnimationMode]);

  // Helper function to load a new question for the current checkpoint
  // Returns true if a question was loaded, false if no questions are available (category complete)
  const loadNewQuestion = async (category) => {
    const question = await getRandomUnusedQuestionByCategory(category, usedQuestionIds, correctAnswersByCategory);
    if (question) {
      const shuffledOptions = shuffleOptions(question.options);
      setCurrentQuestion({
        ...question,
        options: shuffledOptions
      });
      // Add this question ID to the used questions by category
      setUsedQuestionIds(prev => addUsedQuestion(question.id, category, prev));
      // Reset hint when loading new question
      setShowHint(false);
      setHintUsed(false);
      
      // Check if this category is now completed (all questions have been used)
      // Note: We create a temporary updated state to check completion
      const updatedUsedIds = addUsedQuestion(question.id, category, usedQuestionIds);
      if (await isCategoryCompleted(category, updatedUsedIds)) {
        setCompletedCategories(prev => new Set([...prev, category]));
      }
      return true; // Question was loaded successfully
    } else {
      // No questions available - category is completed
      // This can happen when only a few questions remain and they've all been mastered
      console.log(`No questions available for category: ${category}. Completing category.`);
      setCompletedCategories(prev => new Set([...prev, category]));
      // Clear any invalid question state
      setCurrentQuestion(null);
      return false; // No question available, category should be completed
    }
  };

  // Handle closing question dialog
  const handleCloseQuestion = () => {
    setShowQuestion(false);
    setCurrentQuestion(null);
    setQuestionAnswered(false);
    setFirstAttempt(true);
    setIncorrectAnswers([]);
    setShowTranslation(false);
    setShowHint(false);
    setHintUsed(false);
    setShowChoice(true); // Return to path choice
  };

  // Use the answer handling hook
  const { handleAnswerChoice, answeredQuestionRef } = useAnswerHandling({
    // Current state
    currentQuestion,
    firstAttempt,
    incorrectAnswers,
    hintUsed,
    streak,
    maxStreakInCategory,
    checkpointsAnswered,
    checkpointsPerCategory: currentCheckpointLimit,
    defaultCheckpointLimit: checkpointsPerCategory,
    selectedPath,
    forkCategories,
    completedCategories,
    presentedCategories,
    isPreviewMode,
    
    // State setters
    setIsPreviewMode,
    setQuestionDialogOpacity,
    setShowTranslation,
    setShowHint,
    setCorrectFirstTryIds,
    setCorrectAnswersByCategory,
    setTotalPoints,
    setStreak,
    setMaxStreakInCategory,
    setIsVictoryAnimation,
    setCheckpointsAnswered,
    setQuestionAnswered,
    setShowQuestion,
    setIsPaused,
    setFirstAttempt,
    setIncorrectAnswers,
    setHintUsed,
    setCompletedCategories,
    setSelectedPath,
    setCurrentQuestion,
    setForkCategories,
    setPresentedCategories,
    setShowChoice,
    setShowFlashCardsOffer,
    setCategoryForFlashCards,
    setStreakAtCompletion,
    setCurrentCheckpointLimit,
    
    // Refs
    walkerFrameRef,
    victoryAnimationCounterRef,
    walkerPressTimerRef,
    offsetRef,
    forkPositionRef,
    checkpointPositionRef,
    checkpointSpacing,
    checkpointFadeStartTimeRef,
    checkpointSoundPlayedRef,
    canvasRef,
    
    // Callbacks
    loadNewQuestion,
    soundManagerRef,
  });

  const handlePathChoice = async (choice, mode = 'multichoice') => {
    // Play choice sound
    if (soundManagerRef.current) {
      soundManagerRef.current.playChoice();
    }
    
    // Store the selected game mode
    setGameMode(mode);
    
    // choice can now be either a categoryId directly or a choice key
    // If it's a choice key (choice1, choice2, etc.), look it up in forkCategories
    // Otherwise, treat it as a categoryId directly
    const category = forkCategories[choice] || choice;
    const categoryData = getCategoryById(category);
    
    // Track category selection in GTM (for multichoice mode)
    if (mode !== 'flashcard' && categoryData) {
      trackCategorySelection(category, categoryData.displayName);
    }
    
    setSelectedPath(choice);
    setShowChoice(false);
    setIsIdleAnimationMode(false); // Reset idle animation mode when user makes a choice
    
    setIsJustResumed(false); // Clear the just-resumed flag once user selects a path
    setCheckpointsAnswered(0); // Reset checkpoint counter for new category
    setUsedQuestionIds({}); // Reset used questions for new category
    setMaxStreakInCategory(0); // Reset max streak for new category
    
    // Calculate and set the checkpoint limit for this category
    // Set the limit to the number of unmastered questions so user continues until all are mastered
    const masteredIds = correctAnswersByCategory[category] || [];
    const unmasteredCount = await getUnmasteredQuestionCount(category, masteredIds);
    // Use the actual unmastered count - user continues until all questions are mastered
    const categoryCheckpointLimit = unmasteredCount > 0 ? unmasteredCount : checkpointsPerCategory;
    
    // Get total question count for progress display
    const totalQuestions = await getCategoryQuestionCount(category);
    setCurrentCategoryTotalQuestions(totalQuestions);
    
    setCurrentCheckpointLimit(categoryCheckpointLimit);
    
    // Position the first checkpoint to appear centered when walker stops
    // Walker stops 120px before checkpoint, walker is at 30% of screen
    // So checkpoint should be at 30% + 120px = roughly 50% for centered appearance
    const canvas = canvasRef.current;
    if (canvas) {
      checkpointPositionRef.current = offsetRef.current + canvas.width * 0.5 + 95; // Center (50%) + 95px offset (35 + 60 adjustment)
    } else {
      // Fallback if canvas not available
      checkpointPositionRef.current = offsetRef.current + 1000;
    }
    
    // Reset fade-in timer for new checkpoint
    checkpointFadeStartTimeRef.current = null;
    
    // Reset checkpoint sound flag for first checkpoint
    checkpointSoundPlayedRef.current = false;
    
    // In flashcard mode, show flash cards immediately
    if (mode === 'flashcard') {
      // Show flash cards immediately without walking or emoji
      setCategoryForFlashCards(category);
      setStreakAtCompletion(streak);
      setShowFlashCards(true);
      return;
    }
    
    // Load the first question immediately so the correct emoji appears
    const questionLoaded = await loadNewQuestion(category);
    
    // If no questions are available in this category, immediately show completion
    if (!questionLoaded) {
      console.log('⚠️ No questions available in selected category, showing category choice again');
      setIsPaused(true);
      setShowChoice(true);
      setSelectedPath(null);
      return;
    }
    
    // In multichoice mode, unpause to start walker movement (after question is loaded)
    setIsPaused(false);
  };


  const handleSearchClick = () => {
    // Pause the game if it's not already paused by something else
    if (!isPaused) {
      setIsPaused(true);
      setIsSearchPaused(true);
    }
    setShowSearch(true);
  };

  const handleSearchClose = () => {
    setShowSearch(false);
    // Only resume if we were the ones who paused it
    if (isSearchPaused) {
      setIsPaused(false);
      setIsSearchPaused(false);
    }
  };

  const handleHintClick = () => {
    if (!currentQuestion || hintUsed) return;
    
    // Mark hint as used
    setHintUsed(true);
    setShowHint(true);
    
    // Play a sound for hint reveal
    if (soundManagerRef.current) {
      soundManagerRef.current.playChoice(); // Reuse choice sound or add a new hint sound
    }
  };

  // Character and theme shop handlers with pause management
  const handleOpenShop = () => {
    handleOpenCharacterShop();
    setIsPaused(true);
  };

  const handleCloseShop = () => {
    handleCloseCharacterShop();
    setIsPaused(false);
  };

  const handlePurchaseCharacterWrapper = (characterId, cost) => {
    handlePurchaseCharacter(characterId, cost, totalPoints, setTotalPoints);
  };

  const handlePurchaseThemeWrapper = (themeId, cost) => {
    handlePurchaseTheme(themeId, cost, totalPoints, setTotalPoints);
  };

  // Flash cards handlers
  const handleFlashCardsAccept = () => {
    setShowFlashCardsOffer(false);
    setShowFlashCards(true);
  };

  const handleFlashCardsDecline = () => {
    setShowFlashCardsOffer(false);
    // Continue to category selector
    // Pause immediately (should already be paused, but be explicit)
    setIsPaused(true);
    
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        offsetRef.current = forkPositionRef.current - (canvas.width * 0.75);
      }
      setShowChoice(true);
    }, 100);
  };

  const handleFlashCardsComplete = () => {
    setShowFlashCards(false);
    
    // Check if we're in flashcard mode as part of the game flow
    if (gameMode === 'flashcard' && selectedPath) {
      // Resume game and move to next checkpoint (similar to question flow)
      setIsPaused(false);
      setCheckpointsAnswered(prev => prev + 1);
      
      // Position next checkpoint
      const canvas = canvasRef.current;
      if (canvas) {
        checkpointPositionRef.current = offsetRef.current + canvas.width * 0.5 + 95;
      }
      checkpointFadeStartTimeRef.current = null;
      checkpointSoundPlayedRef.current = false;
      
      // Check if category is complete
      if (checkpointsAnswered + 1 >= currentCheckpointLimit) {
        // Category completed, return to fork
        setTimeout(() => {
          if (canvas) {
            offsetRef.current = forkPositionRef.current - (canvas.width * 0.75);
          }
          setIsPaused(true);
          setShowChoice(true);
          setSelectedPath(null);
        }, 100);
      }
    } else {
      // Debug mode or original flow - continue to category selector
      // Pause immediately to stop walker movement
      setIsPaused(true);
      
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          offsetRef.current = forkPositionRef.current - (canvas.width * 0.75);
        }
        setShowChoice(true);
      }, 100);
    }
  };

  const handleFlashCardsClose = () => {
    // User clicked close button
    setShowFlashCards(false);
    
    // If opened from URL, don't show path choice - just close
    if (openedFromUrl) {
      setOpenedFromUrl(false); // Reset the flag
      setIsPaused(false); // Unpause the game
      // Don't show path choice dialog - user can use category selector if they want
    } else {
      // Normal flow - return to path choice dialog
      setIsPaused(true);
      
      // Return to fork/category selection
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          offsetRef.current = forkPositionRef.current - (canvas.width * 0.75);
        }
        setShowChoice(true);
        setSelectedPath(null);
      }, 100);
    }
  };

  // Debug handler to open flash cards directly from category selector
  const handleDebugOpenFlashCards = () => {
    // Set default values for testing
    setCategoryForFlashCards('food');
    setStreakAtCompletion(streak || 5); // Use current streak or default to 5
    setShowChoice(false);
    setIsIdleAnimationMode(false); // Reset idle animation mode
    setShowFlashCards(true);
  };

  // Check if coordinates are over checkpoint
  const isOverCheckpoint = (canvasX, canvasY) => {
    const bounds = checkpointBoundsRef.current;
    
    // Allow clicking checkpoint even when question dialog is shown (removed showQuestion check)
    if (!bounds.visible || !currentQuestion || !selectedPath || questionAnswered) {
      return false;
    }
    
    // Use larger hit area - 1.5x the emoji size for easier clicking
    const hitAreaSize = bounds.size * 1.5;
    const halfSize = hitAreaSize / 2;
    const distanceX = Math.abs(canvasX - bounds.x);
    const distanceY = Math.abs(canvasY - bounds.y);
    
    return distanceX <= halfSize && distanceY <= halfSize;
  };

  // Handle canvas click to detect checkpoint clicks
  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Emergency stop: if game was just resumed and animation is running, stop and show category selector
    if (isJustResumed && !selectedPath && !showChoice && !isPaused) {
      // Stop the animation
      setIsPaused(true);
      velocityRef.current = 0;
      
      // Position camera to show fork on the right side
      offsetRef.current = forkPositionRef.current - (canvas.width * 0.75);
      
      // Show the choice dialog
      setTimeout(() => {
        setShowChoice(true);
      }, 50);
      
      return; // Don't process other click handlers
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const clickX = (event.clientX - rect.left) * scaleX;
    const clickY = (event.clientY - rect.top) * scaleY;

    if (isOverCheckpoint(clickX, clickY)) {
      // Checkpoint was clicked - show hint popup
      setShowCheckpointHint(true);
      
      // Play a subtle sound effect
      if (soundManagerRef.current) {
        soundManagerRef.current.playChoice();
      }
    }
  };

  // Handle canvas mouse move to update cursor
  const handleCanvasMouseMove = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const mouseX = (event.clientX - rect.left) * scaleX;
    const mouseY = (event.clientY - rect.top) * scaleY;

    if (isOverCheckpoint(mouseX, mouseY)) {
      canvas.style.cursor = 'pointer';
    } else {
      canvas.style.cursor = 'default';
    }
  };

  // Check if coordinates are over walker (Easter egg)
  const isOverWalker = (canvasX, canvasY) => {
    const bounds = walkerBoundsRef.current;
    if (!bounds.width || !bounds.height) return false;
    
    return (
      canvasX >= bounds.x &&
      canvasX <= bounds.x + bounds.width &&
      canvasY >= bounds.y &&
      canvasY <= bounds.y + bounds.height
    );
  };

  // Handle walker press start (mouse/touch)
  const handleWalkerPressStart = (canvasX, canvasY) => {
    // Only activate if there's a question dialog showing
    if (!showQuestion || !currentQuestion) return;
    
    if (isOverWalker(canvasX, canvasY)) {
      walkerPressStartRef.current = Date.now();
      
      // Set timer to activate preview mode after 5 seconds
      walkerPressTimerRef.current = setTimeout(() => {
        // Capture current state before entering preview mode
        previewStateSnapshotRef.current = {
          offset: offsetRef.current,
          velocity: velocityRef.current,
          checkpointPosition: checkpointPositionRef.current,
          isPaused: isPaused
        };
        
        setIsPreviewMode(true);
        // Fade out question dialog
        let opacity = 1;
        const fadeInterval = setInterval(() => {
          opacity -= 0.05;
          if (opacity <= 0) {
            opacity = 0;
            clearInterval(fadeInterval);
          }
          setQuestionDialogOpacity(opacity);
        }, 20); // Smooth fade over ~400ms
      }, 5000);
    }
  };

  // Handle walker press end (mouse/touch release)
  const handleWalkerPressEnd = () => {
    // Clear timer if still waiting
    if (walkerPressTimerRef.current) {
      clearTimeout(walkerPressTimerRef.current);
      walkerPressTimerRef.current = null;
    }
    
    // If in preview mode, exit it and restore state
    if (isPreviewMode) {
      // Restore state from snapshot
      if (previewStateSnapshotRef.current) {
        offsetRef.current = previewStateSnapshotRef.current.offset;
        velocityRef.current = previewStateSnapshotRef.current.velocity;
        checkpointPositionRef.current = previewStateSnapshotRef.current.checkpointPosition;
        // Note: isPaused will remain as-is since we're in a question dialog context
        
        // Clear the snapshot
        previewStateSnapshotRef.current = null;
      }
      
      setIsPreviewMode(false);
      
      // Fade question dialog back in
      let opacity = 0;
      const fadeInterval = setInterval(() => {
        opacity += 0.05;
        if (opacity >= 1) {
          opacity = 1;
          clearInterval(fadeInterval);
        }
        setQuestionDialogOpacity(opacity);
      }, 20); // Smooth fade over ~400ms
    }
    
    walkerPressStartRef.current = null;
  };

  // Handle mouse down on canvas
  const handleCanvasMouseDown = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    handleWalkerPressStart(x, y);
  };

  // Handle mouse up on canvas
  const handleCanvasMouseUp = () => {
    handleWalkerPressEnd();
  };

  // Handle touch start on canvas
  const handleCanvasTouchStart = (event) => {
    const canvas = canvasRef.current;
    if (!canvas || event.touches.length === 0) return;

    // Emergency stop: if game was just resumed and animation is running, stop and show category selector
    if (isJustResumed && !selectedPath && !showChoice && !isPaused) {
      // Prevent default touch behavior
      event.preventDefault();
      
      // Stop the animation
      setIsPaused(true);
      velocityRef.current = 0;
      
      // Position camera to show fork on the right side
      offsetRef.current = forkPositionRef.current - (canvas.width * 0.75);
      
      // Show the choice dialog
      setTimeout(() => {
        setShowChoice(true);
      }, 50);
      
      return; // Don't process other touch handlers
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const touch = event.touches[0];
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;

    handleWalkerPressStart(x, y);
  };

  // Handle touch end on canvas
  const handleCanvasTouchEnd = () => {
    handleWalkerPressEnd();
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (walkerPressTimerRef.current) {
        clearTimeout(walkerPressTimerRef.current);
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {/* Loading Screen Overlay */}
      <LoadingScreen isLoading={isLoading} />
      
      {/* Volume Control - Top Left */}
      <VolumeControl 
        soundEnabled={soundEnabled}
        volume={volume}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onVolumeChange={setVolume}
        musicEnabled={musicEnabled}
        onToggleMusic={() => setMusicEnabled(!musicEnabled)}
      />

      {/* Top Logo */}
      <TopLogo onClick={() => setShowResumeDialog(true)} />

      {/* Search Button - Top Right */}
      <SearchButton onClick={handleSearchClick} />

      {/* Score Display Component */}
      <ScoreDisplay
        totalPoints={totalPoints}
        streak={streak}
        onOpenShop={handleOpenShop}
        hasAffordablePurchase={hasAffordablePurchase(totalPoints)}
      />

      <canvas
        id="main-canvas"
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseDown={handleCanvasMouseDown}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        onTouchStart={handleCanvasTouchStart}
        onTouchEnd={handleCanvasTouchEnd}
        onTouchCancel={handleCanvasTouchEnd}
        style={{
          display: 'block',
          width: '100%',
          height: '100vh',
          margin: 0,
          padding: 0,
          cursor: 'default',
        }}
      />
      
      {/* Resume Dialog Component */}
      {showResumeDialog && (
        <ResumeDialog
          onResume={handleResumeGame}
          onNewGame={handleNewGame}
          savedStats={savedStats}
        />
      )}

      {/* Path Choice Dialog Component - Only show after canvas assets are loaded */}
      {showChoice && !isLoading && (
        <PathChoiceDialog
          forkCategories={forkCategories}
          getCategoryById={getCategoryById}
          onPathChoice={handlePathChoice}
          onOpenShop={handleOpenShop}
          onOpenFlashCards={handleDebugOpenFlashCards}
          currentCategory={selectedPath ? (forkCategories[selectedPath] || selectedPath) : null}
          correctAnswersByCategory={correctAnswersByCategory}
          completedCategories={completedCategories}
        />
      )}

      {/* Question Dialog Component */}
      {showQuestion && currentQuestion && (
        <div style={{ opacity: questionDialogOpacity, transition: 'opacity 0.4s ease' }}>
          <QuestionDialog
            currentQuestion={currentQuestion}
            showTranslation={showTranslation}
            showHint={showHint}
            hintUsed={hintUsed}
            firstAttempt={firstAttempt}
            incorrectAnswers={incorrectAnswers}
            onAnswerChoice={handleAnswerChoice}
            onHintClick={handleHintClick}
            questionTranslation={currentQuestion.translation}
            onClose={handleCloseQuestion}
            gameMode={gameMode}
            categoryProgress={{
              answered: getCategoryCorrectAnswerCount(
                forkCategories[selectedPath] || selectedPath,
                correctAnswersByCategory
              ),
              total: currentCategoryTotalQuestions
            }}
          />
        </div>
      )}

      {/* Translation Overlay Component */}
      {showTranslation && answeredQuestionRef.current && (
        <TranslationOverlay 
          currentQuestion={answeredQuestionRef.current} 
          firstAttempt={firstAttempt}
          streak={streak}
          hintUsed={hintUsed}
          volume={volume}
        />
      )}

      {/* Checkpoint Hint Popup Component */}
      {showCheckpointHint && (
        <CheckpointHintPopup
          currentQuestion={currentQuestion}
          onClose={() => setShowCheckpointHint(false)}
        />
      )}

      {/* Search Dialog Component */}
      <SearchDialog
        isOpen={showSearch}
        onClose={handleSearchClose}
      />

      {/* Character Shop Component */}
      {showCharacterShop && (
        <CharacterShop
          totalPoints={totalPoints}
          ownedCharacters={ownedCharacters}
          currentCharacter={currentCharacter}
          onPurchase={handlePurchaseCharacterWrapper}
          onSelectCharacter={handleSelectCharacter}
          ownedThemes={ownedThemes}
          currentTheme={currentTheme}
          onPurchaseTheme={handlePurchaseThemeWrapper}
          onSelectTheme={handleSelectTheme}
          onClose={handleCloseShop}
          streak={streak}
          correctFirstTryIds={correctFirstTryIds}
          correctAnswersByCategory={correctAnswersByCategory}
        />
      )}

      {/* Install PWA Prompt */}
      <InstallPrompt />

      {/* Flash Cards Offer Dialog */}
      {showFlashCardsOffer && (
        <FlashCardsOfferDialog
          streak={streakAtCompletion}
          onAccept={handleFlashCardsAccept}
          onDecline={handleFlashCardsDecline}
        />
      )}

      {/* Flash Cards Dialog */}
      {showFlashCards && categoryForFlashCards && (
        <FlashCardsDialog
          category={categoryForFlashCards}
          streak={streakAtCompletion}
          onComplete={handleFlashCardsComplete}
          onClose={handleFlashCardsClose}
          currentTheme={currentTheme}
          volume={volume}
        />
      )}
    </div>
  );
};

export default PathCanvas;
