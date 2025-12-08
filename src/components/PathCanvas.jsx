import { useEffect, useRef, useState } from 'react';
import { getRandomQuestionByCategory, getRandomUnusedQuestionByCategory, shuffleOptions, getAllCategoryIds, getCategoryById } from '../config/questions';
import { isCategoryCompleted, addCorrectAnswer, addToCorrectFirstTry, addUsedQuestion, addToFirstTryByCategory } from '../utils/questionTracking';
import { generateNewForkCategories, initializeForkCategories, extractCategoryIds } from '../utils/categoryRotation';
import { translations } from '../config/translations/answers/index';
import { questionTranslations } from '../config/translations';
import gameSettings, { getStreakColor, getTranslationBoxDuration } from '../config/gameSettings';
import { getTheme } from '../config/parallaxThemes';
import { getSpriteSheetConfig } from '../config/characterConfig';
import { setActiveTheme } from '../utils/themeManager';
import SoundManager from '../utils/soundManager';
import { loadGameState, saveGameState, clearGameState, hasSavedGameState, convertLoadedState } from '../utils/gameStatePersistence';
import { useCharacterAndTheme } from '../hooks/useCharacterAndTheme';
import { useAnswerHandling } from '../hooks/useAnswerHandling';
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
  const offsetRef = useRef(-300); // Start scrolled back so fork appears more centered initially
  const velocityRef = useRef(0); // Current scroll velocity for smooth acceleration/deceleration
  const targetOffsetRef = useRef(null); // Target offset for smooth camera panning (null = no target)
  const animationFrameRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showChoice, setShowChoice] = useState(false);
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
  const [showSearch, setShowSearch] = useState(false); // Show search dialog
  const [isSearchPaused, setIsSearchPaused] = useState(false); // Track if paused by search
  const [showCheckpointHint, setShowCheckpointHint] = useState(false); // Show hint popup when checkpoint is clicked
  
  // Volume control state
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(() => {
    return parseFloat(localStorage.getItem('wordwalker-volume') || '0.7');
  });
  const [musicEnabled, setMusicEnabled] = useState(() => {
    return localStorage.getItem('wordwalker-music-enabled') !== 'false';
  });
  
  // Game state persistence
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [hasCheckedSavedState, setHasCheckedSavedState] = useState(false);
  const [savedStats, setSavedStats] = useState(null);
  const autosaveTimerRef = useRef(null);
  
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
    // Initialize with current theme to avoid preloading wrong theme sounds
    soundManagerRef.current = new SoundManager(currentTheme);
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
        soundManagerRef.current.startBackgroundMusic();
        setAudioInitialized(true);
      }
    };

    // Listen for first user interaction to start background music
    document.addEventListener('click', initializeAudio, { once: true });
    document.addEventListener('touchstart', initializeAudio, { once: true });
    document.addEventListener('keydown', initializeAudio, { once: true });

    return () => {
      document.removeEventListener('click', initializeAudio);
      document.removeEventListener('touchstart', initializeAudio);
      document.removeEventListener('keydown', initializeAudio);
    };
  }, [audioInitialized, soundEnabled, volume]);

  // Update sound manager volume when sound is toggled or volume changes
  useEffect(() => {
    if (soundManagerRef.current) {
      const effectiveVolume = soundEnabled ? volume : 0;
      soundManagerRef.current.setMasterVolume(effectiveVolume);
      
      // Only start/stop background music if audio has been initialized by user interaction
      if (audioInitialized) {
        if (soundEnabled && volume > 0) {
          soundManagerRef.current.startBackgroundMusic();
        } else {
          soundManagerRef.current.stopBackgroundMusic();
        }
      }
    }
  }, [soundEnabled, volume, audioInitialized]);

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
        if (soundManagerRef.current && audioInitialized && soundEnabled && volume > 0) {
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
      if (soundManagerRef.current && audioInitialized && soundEnabled && volume > 0) {
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

  // Handle background music pause/resume when search dialog opens/closes
  useEffect(() => {
    if (showSearch) {
      // Search dialog opened - pause background music
      if (soundManagerRef.current) {
        soundManagerRef.current.stopBackgroundMusic();
      }
    } else {
      // Search dialog closed - resume background music if enabled
      if (soundManagerRef.current && audioInitialized && soundEnabled && volume > 0) {
        soundManagerRef.current.startBackgroundMusic();
      }
    }
  }, [showSearch, audioInitialized, soundEnabled, volume]);

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
  }, [totalPoints, streak, selectedPath, checkpointsAnswered, usedQuestionIds, completedCategories, forkCategories, presentedCategories, soundEnabled, volume, musicEnabled, correctFirstTryIds, correctAnswersByCategory]);

  // Handle resume game
  const handleResumeGame = () => {
    const loadedState = loadGameState();
    if (loadedState) {
      const convertedState = convertLoadedState(loadedState);
      setTotalPoints(convertedState.totalPoints);
      setStreak(convertedState.streak);
      setSelectedPath(convertedState.selectedPath);
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
    setShowResumeDialog(false);
  };

  useEffect(() => {
    // Get base path for assets (handles subdirectory deployments)
    const basePath = import.meta.env.BASE_URL || '/';
    
    // Get current theme configuration
    const theme = getTheme(currentTheme);
    const themePath = `${basePath}images/themes/${theme.imagePath}/`;
    
    // Load parallax-layer2 image (grass)
    const parallaxLayer2 = new Image();
    parallaxLayer2.src = `${themePath}parallax-layer2.png`;
    parallaxLayer2.onload = () => {
      setParallaxLayer2Image(parallaxLayer2);
    };
    
    // Only load path images if theme uses them
    if (theme.usePathImages !== false) {
      // Load path image
      const path = new Image();
      path.src = `${themePath}path.png`;
      path.onload = () => {
        setPathImage(path);
      };
      
      // Load path fork image
      const pathFork = new Image();
      pathFork.src = `${themePath}path-fork.png`;
      pathFork.onload = () => {
        setPathForkImage(pathFork);
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
      setParallaxLayer6Image(parallaxLayer6);
    };
    
    // Load parallax-layer1 image (foreground layer)
    const parallaxLayer1 = new Image();
    parallaxLayer1.src = `${themePath}parallax-layer1.png`;
    parallaxLayer1.onload = () => {
      setParallaxLayer1Image(parallaxLayer1);
    };
    
    // Load parallax-layer4 image (mid-distant layer)
    const parallaxLayer4 = new Image();
    parallaxLayer4.src = `${themePath}parallax-layer4.png`;
    parallaxLayer4.onload = () => {
      setParallaxLayer4Image(parallaxLayer4);
    };
    
    // Load parallax-layer5 image (far layer)
    const parallaxLayer5 = new Image();
    parallaxLayer5.src = `${themePath}parallax-layer5.png`;
    parallaxLayer5.onload = () => {
      setParallaxLayer5Image(parallaxLayer5);
    };
    
    // Load parallax-layer3 image (bushes layer)
    const parallaxLayer3 = new Image();
    parallaxLayer3.src = `${themePath}parallax-layer3.png`;
    parallaxLayer3.onload = () => {
      setParallaxLayer3Image(parallaxLayer3);
    };
    
    // Load parallax-layer7 image (rear layer at infinite distance, no parallax)
    const parallaxLayer7 = new Image();
    parallaxLayer7.src = `${themePath}parallax-layer7.png`;
    parallaxLayer7.onload = () => {
      setParallaxLayer7Image(parallaxLayer7);
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

    const drawScene = () => {
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
      // Move 100 pixels higher and drawn on top of above-horizon rectangle
      ctx.fillStyle = theme.canvasColors.belowHorizon;
      ctx.fillRect(0, height * 0.5 - 100, width, height * 0.5 + 100);
      
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
        const layer5Y = getLayerY(horizonY - layer5Height * 0.3 - 30, 'layer5'); // Slightly overlap with layer 6
        
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
        const layer4Y = getLayerY(horizonY - 15, 'layer4');
        
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
        const layer3Y = getLayerY(pathTop - layer3Height * 0.5 - 20, 'layer3'); // Overlap slightly with path area
        
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
          if (showChoice && !selectedPath && tileScreenX >= forkScreenX) {
            continue; // Skip tiles that would be covered by the fork
          }
          
          // Draw straight path with 1-pixel overlap to prevent vertical hairlines
          ctx.drawImage(pathImage, tileX - tileOverlap, pathTop, tileSize + tileOverlap, pathHeight);
        }
        
        // Draw fork at fixed screen position with right edge aligned to canvas right edge
        if (showChoice && !selectedPath) {
          ctx.drawImage(pathForkImage, forkScreenX, pathTop, tileSize, pathHeight);
        }
      }
      
      // Draw learning checkpoint (emoji on path) if path has been selected and not answered
      if (selectedPath && !questionAnswered) {
        const checkpointScreenX = checkpointPositionRef.current - scrollPos;
        
        // Draw checkpoint emoji if it's visible on screen
        if (checkpointScreenX < width && checkpointScreenX > -100) {
          const checkpointY = pathTop + (pathBottom - pathTop) * 0.5 - 30; // Positioned on the path, moved up 15 pixels
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
          
          // Draw glow layers (subtle pulsing effect)
          for (let i = 3; i > 0; i--) {
            const glowSize = checkpointSize * (1 + i * 0.2 * pulseIntensity); // Reduced from 0.3 to 0.2
            ctx.globalAlpha = fadeOpacity * 0.3 * pulseIntensity / i; // Reduced from 0.4 to 0.3
            ctx.fillStyle = '#FFD700'; // Gold color for hint indicator
            ctx.font = `${glowSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const emojiToDisplay = currentQuestion ? currentQuestion.emoji : '❓';
            ctx.fillText(emojiToDisplay, checkpointScreenX, checkpointY);
          }
          
          // Draw main emoji
          ctx.globalAlpha = fadeOpacity;
          ctx.fillStyle = 'black';
          ctx.font = `${checkpointSize}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // Display the current question's emoji (should always be loaded now)
          const emojiToDisplay = currentQuestion ? currentQuestion.emoji : '❓';
          ctx.fillText(emojiToDisplay, checkpointScreenX, checkpointY);
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
        if (distanceFromPerson <= 120 && distanceFromPerson > -50 && !showQuestion && currentQuestion) {
          setIsPaused(true);
          setShowQuestion(true);
          
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
      
      // Draw streak diamond behind the walker if streak is active
      if (streak > 0) {
        // Update diamond glow animation (smooth fade in/out)
        if (!isPaused || isVictoryAnimation) {
          diamondGlowRef.current += 0.02; // Speed of glow animation
        }
        
        // Calculate glow intensity using sine wave for smooth pulsing (0 to 1)
        const glowIntensity = (Math.sin(diamondGlowRef.current) + 1) / 2;
        
        // Position diamond behind and to the left of the walker
        const diamondX = personX - 35; // 35 pixels to the left of walker
        const diamondY = personY;
        const diamondSize = 25; // Base size of diamond
        
        drawStreakDiamond(diamondX, diamondY, diamondSize, glowIntensity, streak);
      }
      
      if (walkerSpriteSheet) {
        // Update animation frame
        // Allow animation to continue during victory animation, when actually moving, or during preview mode
        // Stop animating when velocity is very low (nearly stopped)
        const isMoving = velocityRef.current > 0.5;
        if ((isMoving && !isPaused) || isVictoryAnimation || isPreviewMode) {
          walkerFrameCounterRef.current++;
          
          // Change frame every 6 loops for walking animation (slowed 20%), every 12 loops for slower victory animation
          const frameInterval = isVictoryAnimation ? 12 : 6;
          if (walkerFrameCounterRef.current % frameInterval === 0) {
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
          // When stopped, reset to first frame of walking animation for idle pose
          walkerFrameRef.current = 0;
        }
        
        // Calculate which row to use (walking or victory)
        const currentRow = isVictoryAnimation ? spriteConfig.victoryRow : spriteConfig.walkingRow;
        
        // Calculate source position in sprite sheet
        const sourceX = walkerFrameRef.current * spriteConfig.frameWidth;
        const sourceY = currentRow * spriteConfig.frameHeight;
        
        // Calculate size to draw on canvas (scaled appropriately)
        const drawWidth = 80;  // Adjust size as needed
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
        const walkerY = personY - drawHeight / 2 + bounceOffset;
        
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

    const animate = () => {
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
        
        // Target speed and inertia parameters
        const targetSpeed = 4; // Maximum scroll speed (increased from 3 for faster gameplay)
        const acceleration = 0.15; // How quickly to speed up
        const deceleration = 0.2; // How quickly to slow down
        
        // Apply smooth camera panning if we have a target offset (for fork repositioning)
        if (targetOffsetRef.current !== null) {
          const cameraSpeed = 8; // Speed at which camera pans to target (higher = faster)
          const distanceToTarget = targetOffsetRef.current - offsetRef.current;
          
          // If we're very close to target, snap to it
          if (Math.abs(distanceToTarget) < 1) {
            offsetRef.current = targetOffsetRef.current;
          } else {
            // Smoothly move toward target
            offsetRef.current += distanceToTarget / cameraSpeed;
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
          
          // Apply velocity to offset
          offsetRef.current += velocityRef.current;
        }
      } else {
        // Fallback if canvas not available
        if (targetOffsetRef.current !== null) {
          // Smooth panning (no walker movement)
          const cameraSpeed = 8;
          const distanceToTarget = targetOffsetRef.current - offsetRef.current;
          if (Math.abs(distanceToTarget) < 1) {
            offsetRef.current = targetOffsetRef.current;
          } else {
            offsetRef.current += distanceToTarget / cameraSpeed;
          }
          velocityRef.current = 0;
        } else {
          // Normal movement
          const targetSpeed = 4;
          const acceleration = 0.15;
          const deceleration = 0.2;
          
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
          // so just apply velocity normally
          offsetRef.current += velocityRef.current;
        }
      }
      
      drawScene();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Start animation
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [parallaxLayer2Image, pathImage, pathForkImage, parallaxLayer6Image, parallaxLayer1Image, parallaxLayer4Image, parallaxLayer5Image, parallaxLayer3Image, walkerSpriteSheet, isPaused, showChoice, showQuestion, selectedPath, questionAnswered, isVictoryAnimation, currentTheme, isPreviewMode]);

  // Helper function to load a new question for the current checkpoint
  const loadNewQuestion = (category) => {
    const question = getRandomUnusedQuestionByCategory(category, usedQuestionIds, correctAnswersByCategory);
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
      if (isCategoryCompleted(category, updatedUsedIds)) {
        setCompletedCategories(prev => new Set([...prev, category]));
      }
    }
  };

  // Use the answer handling hook
  const { handleAnswerChoice } = useAnswerHandling({
    // Current state
    currentQuestion,
    firstAttempt,
    incorrectAnswers,
    hintUsed,
    streak,
    checkpointsAnswered,
    checkpointsPerCategory,
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
    
    // Callbacks
    loadNewQuestion,
    soundManagerRef,
  });

  const handlePathChoice = (choice) => {
    // Play choice sound
    if (soundManagerRef.current) {
      soundManagerRef.current.playChoice();
    }
    
    // choice can now be either a categoryId directly or a choice key
    // If it's a choice key (choice1, choice2, etc.), look it up in forkCategories
    // Otherwise, treat it as a categoryId directly
    const category = forkCategories[choice] || choice;
    
    setSelectedPath(choice);
    setShowChoice(false);
    setIsPaused(false);
    setCheckpointsAnswered(0); // Reset checkpoint counter for new category
    setUsedQuestionIds({}); // Reset used questions for new category
    
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
    
    // Load the first question immediately so the correct emoji appears
    loadNewQuestion(category);
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
        selectedPath={selectedPath}
        forkCategories={forkCategories}
        checkpointsAnswered={checkpointsAnswered}
        checkpointsPerCategory={checkpointsPerCategory}
        getCategoryById={getCategoryById}
        onOpenShop={handleOpenShop}
        hasAffordablePurchase={hasAffordablePurchase(totalPoints)}
      />

      <canvas
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

      {/* Path Choice Dialog Component */}
      {showChoice && (
        <PathChoiceDialog
          forkCategories={forkCategories}
          getCategoryById={getCategoryById}
          onPathChoice={handlePathChoice}
          onOpenShop={handleOpenShop}
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
            questionTranslation={questionTranslations[currentQuestion.id]}
          />
        </div>
      )}

      {/* Translation Overlay Component */}
      {showTranslation && currentQuestion && (
        <TranslationOverlay 
          currentQuestion={currentQuestion} 
          firstAttempt={firstAttempt}
          streak={streak}
          hintUsed={hintUsed}
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
    </div>
  );
};

export default PathCanvas;
