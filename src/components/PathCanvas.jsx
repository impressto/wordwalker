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
import { useCanvasRenderer } from '../hooks/useCanvasRenderer';
import { useGameState } from '../hooks/useGameState';
import { useDialogHandlers } from '../hooks/useDialogHandlers';
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
  
  // Track if we should skip camera reposition when showing path choice dialog
  const skipCameraRepositionRef = useRef(false);

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
  
  // Game state persistence hook
  const {
    showResumeDialog,
    setShowResumeDialog,
    hasCheckedSavedState,
    savedStats,
    isJustResumed,
    setIsJustResumed,
    handleResumeGame,
    handleNewGame,
  } = useGameState({
    // State setters
    setTotalPoints,
    setStreak,
    setMaxStreakInCategory,
    setSelectedPath,
    setForkCategories,
    setCompletedCategories,
    setPresentedCategories,
    setUsedQuestionIds,
    setCorrectFirstTryIds,
    setCorrectAnswersByCategory,
    setSoundEnabled,
    setVolume,
    setMusicEnabled,
    setCheckpointsAnswered,
    setShowQuestion,
    setCurrentQuestion,
    setQuestionAnswered,
    setFirstAttempt,
    setIncorrectAnswers,
    setShowTranslation,
    setShowHint,
    setHintUsed,
    setShowChoice,
    setIsPaused,
    
    // Refs
    canvasRef,
    offsetRef,
    velocityRef,
    forkPositionRef,
    checkpointPositionRef,
    targetOffsetRef,
    checkpointFadeStartTimeRef,
    checkpointSoundPlayedRef,
    
    // Current state values for saving
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
    
    // Checkpoint config
    checkpointSpacing,
    
    // Flash cards state
    showFlashCards,
  });
  
  // Dialog handlers hook
  const {
    showSearch,
    isSearchPaused,
    handleSearchClick,
    handleSearchClose,
    handleOpenShop,
    handleCloseShop,
    handlePurchaseCharacterWrapper,
    handlePurchaseThemeWrapper,
    handleFlashCardsAccept,
    handleFlashCardsDecline,
    handleFlashCardsComplete,
    handleFlashCardsClose,
    handleDebugOpenFlashCards,
  } = useDialogHandlers({
    // State
    isPaused,
    setIsPaused,
    
    // Character shop handlers
    handleOpenCharacterShop,
    handleCloseCharacterShop,
    handlePurchaseCharacter,
    handlePurchaseTheme,
    
    // State setters
    setShowFlashCards,
    setShowFlashCardsOffer,
    setShowChoice,
    setSelectedPath,
    setCategoryForFlashCards,
    setStreakAtCompletion,
    setOpenedFromUrl,
    setCheckpointsAnswered,
    setIsIdleAnimationMode,
    
    // Refs
    canvasRef,
    offsetRef,
    forkPositionRef,
    checkpointPositionRef,
    checkpointFadeStartTimeRef,
    checkpointSoundPlayedRef,
    
    // Current state
    streak,
    selectedPath,
    gameMode,
    openedFromUrl,
    checkpointsAnswered,
    currentCheckpointLimit,
    totalPoints,
    setTotalPoints,
  });
  
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
      // Check if we should skip the camera reposition (e.g., when closing question dialog)
      if (skipCameraRepositionRef.current) {
        skipCameraRepositionRef.current = false; // Reset the flag
        return;
      }
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

  // Use the canvas renderer hook for drawing logic
  useCanvasRenderer({
    // Refs
    canvasRef,
    offsetRef,
    velocityRef,
    targetOffsetRef,
    animationFrameRef,
    lastTimeRef,
    frameAccumulatorRef,
    walkerFrameRef,
    victoryAnimationCounterRef,
    diamondGlowRef,
    checkpointFadeStartTimeRef,
    checkpointPositionRef,
    checkpointBoundsRef,
    checkpointSoundPlayedRef,
    forkPositionRef,
    walkerBoundsRef,
    emojiImageCache,
    soundManagerRef,
    skipCameraRepositionRef,
    
    // Images
    parallaxLayer1Image,
    parallaxLayer2Image,
    parallaxLayer3Image,
    parallaxLayer4Image,
    parallaxLayer5Image,
    parallaxLayer6Image,
    parallaxLayer7Image,
    pathImage,
    pathForkImage,
    walkerSpriteSheet,
    
    // State values
    currentTheme,
    currentCharacter,
    currentQuestion,
    selectedPath,
    forkCategories,
    isPaused,
    showChoice,
    showQuestion,
    showFlashCards,
    questionAnswered,
    isVictoryAnimation,
    isPreviewMode,
    isIdleAnimationMode,
    streak,
    gameMode,
    
    // State setters
    setIsPaused,
    setShowChoice,
    setShowQuestion,
    setShowFlashCards,
    setCategoryForFlashCards,
    setStreakAtCompletion,
    setIsVictoryAnimation,
    
    // Constants
    checkpointFadeDuration: 500,
  });

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
    setIsPaused(true); // Pause the game
    // Skip camera reposition - maintain current parallax position
    skipCameraRepositionRef.current = true;
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
