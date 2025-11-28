import { useEffect, useRef, useState } from 'react';
import { getRandomQuestionByCategory, getRandomUnusedQuestionByCategory, shuffleOptions, getAllCategoryIds, getCategoryById } from '../config/questions';
import { translations } from '../config/translations';
import SoundManager from '../soundManager';
import ScoreDisplay from './ScoreDisplay';
import PathChoiceDialog from './PathChoiceDialog';
import QuestionDialog from './QuestionDialog';
import TranslationOverlay from './TranslationOverlay';
import StreakBonusNotification from './StreakBonusNotification';
import SearchDialog from './SearchDialog';
import InstallPrompt from './InstallPrompt';

const PathCanvas = () => {
  const canvasRef = useRef(null);
  const [parallaxLayer2Image, setParallaxLayer2Image] = useState(null); // Grass
  const [pathImage, setPathImage] = useState(null);
  const [pathForkImage, setPathForkImage] = useState(null);
  const [parallaxLayer6Image, setParallaxLayer6Image] = useState(null); // Mountains
  const [parallaxLayer1Image, setParallaxLayer1Image] = useState(null); // Foreground layer
  const [parallaxLayer4Image, setParallaxLayer4Image] = useState(null); // Mid-distant layer
  const [parallaxLayer5Image, setParallaxLayer5Image] = useState(null); // Far layer
  const [parallaxLayer3Image, setParallaxLayer3Image] = useState(null); // Bushes layer
  const [walkerSpriteSheet, setWalkerSpriteSheet] = useState(null); // Walker sprite sheet
  const offsetRef = useRef(-300); // Start scrolled back so fork appears more centered initially
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
  const [streak, setStreak] = useState(0); // Track consecutive correct answers
  const [showStreakBonus, setShowStreakBonus] = useState(false); // Show streak bonus notification
  const [showSearch, setShowSearch] = useState(false); // Show search dialog
  const [isSearchPaused, setIsSearchPaused] = useState(false); // Track if paused by search
  
  // Volume control state
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(() => {
    return parseFloat(localStorage.getItem('wordwalker-volume') || '0.7');
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
  
  // Sprite sheet configuration
  const spriteConfig = {
    width: 1800,           // Total sprite sheet width
    height: 740,           // Total sprite sheet height
    rows: 2,               // 2 rows (walking, victory)
    cols: 6,               // 6 sprites per row
    frameWidth: 300,       // Each sprite is 300px wide (1800 / 6 = 300)
    frameHeight: 370,      // 740 / 2 = 370px per frame
    walkingRow: 0,         // First row is walking animation
    victoryRow: 1,         // Second row is victory animation
    totalFrames: 6,        // 6 frames per animation
  };
  
  // Checkpoint cycling - track how many checkpoints answered in current category
  const [checkpointsAnswered, setCheckpointsAnswered] = useState(0);
  const checkpointsPerCategory = 10; // Number of checkpoints before next fork
  
  // Track used question IDs to prevent duplicates within a category walk
  const [usedQuestionIds, setUsedQuestionIds] = useState(new Set());
  
  // Fork path categories - randomly select 4 different categories for each fork
  const [forkCategories, setForkCategories] = useState(() => {
    const allCategories = getAllCategoryIds();
    // Shuffle and pick first 4 categories
    const shuffled = [...allCategories].sort(() => Math.random() - 0.5);
    return {
      choice1: shuffled[0] || 'food',
      choice2: shuffled[1] || 'shopping',
      choice3: shuffled[2] || 'entertainment',
      choice4: shuffled[3] || 'accommodation'
    };
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

  // Initialize sound manager
  const soundManagerRef = useRef(null);
  const [audioInitialized, setAudioInitialized] = useState(false);
  
  useEffect(() => {
    soundManagerRef.current = new SoundManager();
    return () => {
      // Cleanup sound manager when component unmounts
      if (soundManagerRef.current) {
        soundManagerRef.current.stopBackgroundMusic();
      }
    };
  }, []);

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

  useEffect(() => {
    // Get base path for assets (handles subdirectory deployments)
    const basePath = import.meta.env.BASE_URL || '/';
    // Theme path - can be changed later based on category
    const themePath = `${basePath}images/themes/default/`;
    
    // Load parallax-layer2 image (grass)
    const parallaxLayer2 = new Image();
    parallaxLayer2.src = `${themePath}parallax-layer2.png`;
    parallaxLayer2.onload = () => {
      setParallaxLayer2Image(parallaxLayer2);
    };
    
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
    
    // Load walker sprite sheet
    const walker = new Image();
    walker.src = `${basePath}images/walker.png`;
    walker.onload = () => {
      setWalkerSpriteSheet(walker);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Helper function to draw the streak diamond with glow effect
    const drawStreakDiamond = (x, y, size, glowIntensity, streak) => {
      // Determine diamond color based on streak level
      let diamondColor;
      if (streak > 20) {
        diamondColor = '#FFFFFF'; // White
      } else if (streak > 10) {
        diamondColor = '#FFD700'; // Yellow/Gold
      } else if (streak > 5) {
        diamondColor = '#00FF7F'; // Green
      } else {
        diamondColor = '#87CEEB'; // Light blue
      }
      
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
      
      // Define horizon line (eye level) - positioned in upper third
      const horizonY = height * 0.35;
      
      // Draw sky (upper portion - navy to light blue)
      // Sky ends 20 pixels above the bottom of the mountains
      const skyBottom = horizonY - 20;
      const skyGradient = ctx.createLinearGradient(0, 0, 0, skyBottom);
      skyGradient.addColorStop(0, '#3b6499ff'); // Navy blue at top
      skyGradient.addColorStop(1, '#87CEEB'); // Light blue at bottom
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, width, skyBottom);
      
      // Draw grass base background (below sky to bottom)
      const grassBaseGradient = ctx.createLinearGradient(0, skyBottom, 0, height);
      grassBaseGradient.addColorStop(0, '#6B8E23'); // Olive drab at top
      grassBaseGradient.addColorStop(1, '#3B5323'); // Dark green at bottom
      ctx.fillStyle = grassBaseGradient;
      ctx.fillRect(0, skyBottom, width, height - skyBottom);
      
      // Draw mountains at the horizon (tiled horizontally with parallax)
      if (parallaxLayer6Image) {
        const layer6Width = parallaxLayer6Image.width;
        const layer6Height = parallaxLayer6Image.height;
        
        // Parallax effect - layer 6 moves slower than foreground (0.3x speed)
        const layer6ScrollOffset = (offsetRef.current * 0.3) % layer6Width;
        
        // Calculate how many tiles needed to cover the width
        const layer6TilesNeeded = Math.ceil(width / layer6Width) + 2;
        
        // Position layer 6 at the horizon
        const layer6Y = horizonY - layer6Height;
        
        // Draw layer 6 tiles horizontally
        for (let i = -1; i < layer6TilesNeeded; i++) {
          const x = i * layer6Width - layer6ScrollOffset;
          ctx.drawImage(parallaxLayer6Image, x, layer6Y, layer6Width, layer6Height);
        }
      }
      
      // Draw distant grass (between horizon and path) - extended to cover area above path
      const distantGrassGradient = ctx.createLinearGradient(0, horizonY, 0, height * 0.55);
      distantGrassGradient.addColorStop(0, '#6B8E23'); // Olive drab (distant)
      distantGrassGradient.addColorStop(1, '#7CB342'); // Lighter green
      ctx.fillStyle = distantGrassGradient;
      ctx.fillRect(0, horizonY, width, height * 0.55 - horizonY); // Fill from horizon to path top
      
      // Draw parallax layer 5 (far layer) - between layer 6 and layer 4
      // Drawn after grass so it appears in front
      if (parallaxLayer5Image) {
        const layer5Width = parallaxLayer5Image.width;
        const layer5Height = parallaxLayer5Image.height;
        
        // Parallax effect - layer 5 moves at 0.4x speed (slower than layer 4)
        const layer5ScrollOffset = (offsetRef.current * 0.4) % layer5Width;
        
        // Calculate how many tiles needed
        const layer5TilesNeeded = Math.ceil(width / layer5Width) + 2;
        
        // Position layer 5 at horizon - moved up additional 30 pixels
        const layer5Y = horizonY - layer5Height * 0.3 - 30; // Slightly overlap with layer 6
        
        // Draw layer 5 tiles horizontally
        for (let i = -1; i < layer5TilesNeeded; i++) {
          const x = i * layer5Width - layer5ScrollOffset;
          ctx.drawImage(parallaxLayer5Image, x, layer5Y, layer5Width, layer5Height);
        }
      }
      
      // Draw parallax layer 4 (mid-distant layer)
      if (parallaxLayer4Image) {
        const layer4Width = parallaxLayer4Image.width;
        const layer4Height = parallaxLayer4Image.height;
        
        // Parallax effect - layer 4 moves at 0.5x speed
        const layer4ScrollOffset = (offsetRef.current * 0.5) % layer4Width;
        
        // Calculate how many tiles needed
        const layer4TilesNeeded = Math.ceil(width / layer4Width) + 2;
        
        // Position layer 4
        const layer4Y = horizonY - 15;
        
        // Draw layer 4 tiles horizontally
        for (let i = -1; i < layer4TilesNeeded; i++) {
          const x = i * layer4Width - layer4ScrollOffset;
          ctx.drawImage(parallaxLayer4Image, x, layer4Y, layer4Width, layer4Height);
        }
      }
      
      // Define path area - moved down 90 pixels
      const pathTop = height * 0.55 + 90; // Where path starts (behind)
      const pathBottom = height * 0.75 + 90; // Where path ends (in front)
      const pathHeight = pathBottom - pathTop;
      
      // Draw parallax layer 2 (grass) for entire area (path + foreground) - single unified tile
      if (parallaxLayer2Image) {
        const tileWidth = parallaxLayer2Image.width;
        const scrollOffset = offsetRef.current % tileWidth;
        
        // Draw layer 2 tiles - repeat horizontally, stretch vertically from pathTop to bottom
        const totalLayer2Height = height - pathTop;
        const tilesX = Math.ceil(width / tileWidth) + 1;
        
        for (let col = -1; col < tilesX; col++) {
          const x = col * tileWidth - scrollOffset;
          const y = pathTop;
          ctx.drawImage(parallaxLayer2Image, x, y, tileWidth, totalLayer2Height);
        }
      }
      
      // Draw parallax layer 3 (bushes) - after layer 2 so bushes appear in front
      if (parallaxLayer3Image) {
        const layer3Width = parallaxLayer3Image.width;
        const layer3Height = parallaxLayer3Image.height;
        
        // Parallax effect - layer 3 moves at 0.8x speed (slower than path/layer 2)
        const layer3ScrollOffset = (offsetRef.current * 0.8) % layer3Width;
        
        // Calculate how many tiles needed
        const layer3TilesNeeded = Math.ceil(width / layer3Width) + 2;
        
        // Position layer 3 just above the path - moved up 20 pixels
        const layer3Y = pathTop - layer3Height * 0.5 - 20; // Overlap slightly with path area
        
        // Draw layer 3 tiles horizontally
        for (let i = -1; i < layer3TilesNeeded; i++) {
          const x = i * layer3Width - layer3ScrollOffset;
          ctx.drawImage(parallaxLayer3Image, x, layer3Y, layer3Width, layer3Height);
        }
      }
      
      // Draw the path using tiled images (on top of grass)
      
      // Person position (fixed on screen)
      const personX = width * 0.3;
      
      // Calculate current scroll position and fork position
      const scrollPos = offsetRef.current;
      const forkScreenX = forkPositionRef.current - scrollPos;
      
      // Show choice when fork's left edge reaches the screen
      const shouldShowChoice = forkScreenX <= width && forkScreenX > 0 && !selectedPath;
      
      if (shouldShowChoice && !isPaused && !showChoice) {
        setIsPaused(true);
        setShowChoice(true);
      }
      
      // Draw path tiles
      if (pathImage && pathForkImage) {
        const tileSize = 240; // Both images are 240x240
        const pathScrollOffset = scrollPos % tileSize;
        
        // Calculate how many tiles we need
        const tilesNeeded = Math.ceil(width / tileSize) + 2;
        
        // Draw straight path tiles before fork
        for (let i = -1; i < tilesNeeded; i++) {
          const tileX = i * tileSize - pathScrollOffset;
          
          // Calculate the world position for the left edge of this tile
          const tileWorldStartX = scrollPos + tileX;
          const tileWorldEndX = tileWorldStartX + tileSize;
          
          // Determine which tile should show the fork - the tile that contains the fork position
          const forkPosition = forkPositionRef.current;
          
          if (tileWorldEndX <= forkPosition) {
            // Tile is completely before the fork - draw straight path
            ctx.drawImage(pathImage, tileX, pathTop, tileSize, pathHeight);
          } else if (tileWorldStartX <= forkPosition && tileWorldEndX > forkPosition && !selectedPath) {
            // This tile contains the fork position and no path selected - draw fork
            ctx.drawImage(pathForkImage, tileX, pathTop, tileSize, pathHeight);
          } else if (selectedPath) {
            // Path selected - draw straight path tiles everywhere
            ctx.drawImage(pathImage, tileX, pathTop, tileSize, pathHeight);
          }
          // If no path selected and tile is after fork, don't draw anything (fork extends off screen)
        }
      }
      
      // Draw learning checkpoint (emoji on path) if path has been selected and not answered
      if (selectedPath && !questionAnswered) {
        const checkpointScreenX = checkpointPositionRef.current - scrollPos;
        
        // Draw checkpoint emoji if it's visible on screen
        if (checkpointScreenX < width && checkpointScreenX > 0) {
          const checkpointY = pathTop + (pathBottom - pathTop) * 0.5 - 25; // Positioned on the path, moved up 10 pixels
          const checkpointSize = 60;
          
          // Initialize fade-in start time if not set
          if (checkpointFadeStartTimeRef.current === null) {
            checkpointFadeStartTimeRef.current = Date.now();
          }
          
          // Calculate fade-in opacity
          const fadeElapsed = Date.now() - checkpointFadeStartTimeRef.current;
          const fadeOpacity = Math.min(fadeElapsed / checkpointFadeDuration, 1);
          
          ctx.save();
          ctx.globalAlpha = fadeOpacity;
          ctx.font = `${checkpointSize}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // Display the current question's emoji (should always be loaded now)
          const emojiToDisplay = currentQuestion ? currentQuestion.emoji : '❓';
          ctx.fillText(emojiToDisplay, checkpointScreenX, checkpointY);
          ctx.restore();
        }
        
        // Check if checkpoint is just to the right of the person - trigger question dialog
        // Show question when checkpoint is within ~100px to the right of person
        const distanceFromPerson = checkpointScreenX - personX;
        if (distanceFromPerson <= 100 && distanceFromPerson > 0 && !showQuestion && currentQuestion) {
          setIsPaused(true);
          setShowQuestion(true);
        }
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
        // Allow animation to continue during victory animation even when paused
        if (!isPaused || isVictoryAnimation) {
          walkerFrameCounterRef.current++;
          
          // Change frame every 5 loops for faster walking animation
          if (walkerFrameCounterRef.current % 5 === 0) {
            if (isVictoryAnimation) {
              // Victory animation
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
        
        // Draw the current frame from sprite sheet
        ctx.drawImage(
          walkerSpriteSheet,
          sourceX, sourceY,                    // Source position in sprite sheet
          spriteConfig.frameWidth,             // Source width
          spriteConfig.frameHeight,            // Source height
          personX - drawWidth / 2,             // Destination X (centered)
          personY - drawHeight / 2 + bounceOffset, // Destination Y (centered + bounce)
          drawWidth,                           // Destination width
          drawHeight                           // Destination height
        );
      }
      // Note: No fallback emoji - wait for sprite sheet to load for cleaner appearance
      
      // Draw parallax layer 1 (foreground layer) - in front of everything
      // Only render in portrait mode to avoid visual clutter in landscape
      const isPortrait = height > width;
      if (parallaxLayer1Image && isPortrait) {
        const layer1Width = parallaxLayer1Image.width;
        const layer1Height = parallaxLayer1Image.height;
        const layer1ScrollOffset = (offsetRef.current * 1.5) % layer1Width;
        const layer1TilesNeeded = Math.ceil(width / layer1Width) + 2;
        const layer1Y = height - layer1Height;
        
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
        
        // Update scroll offset (move right to left) only if not paused
        // Stop when choice dialog should show OR if path has been selected (then continue normally)
        if (!isPaused && (!shouldStopForChoice || selectedPath)) {
          offsetRef.current += 3; // Adjust speed as needed (increased from 2 to 3)
        }
      } else {
        // Fallback if canvas not available
        if (!isPaused) {
          offsetRef.current += 3;
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
  }, [parallaxLayer2Image, pathImage, pathForkImage, parallaxLayer6Image, parallaxLayer1Image, parallaxLayer4Image, parallaxLayer5Image, parallaxLayer3Image, walkerSpriteSheet, isPaused, showChoice, showQuestion, selectedPath, questionAnswered, isVictoryAnimation]);

  // Helper function to load a new question for the current checkpoint
  const loadNewQuestion = (category) => {
    const question = getRandomUnusedQuestionByCategory(category, usedQuestionIds);
    if (question) {
      const shuffledOptions = shuffleOptions(question.options);
      setCurrentQuestion({
        ...question,
        options: shuffledOptions
      });
      // Add this question ID to the used set
      setUsedQuestionIds(prev => new Set([...prev, question.id]));
      // Reset hint when loading new question
      setShowHint(false);
    }
  };

  const handlePathChoice = (choice) => {
    console.log(`User chose: ${choice} path`);
    
    // Play choice sound
    if (soundManagerRef.current) {
      soundManagerRef.current.playChoice();
    }
    
    setSelectedPath(choice);
    setShowChoice(false);
    setIsPaused(false);
    setCheckpointsAnswered(0); // Reset checkpoint counter for new category
    setUsedQuestionIds(new Set()); // Reset used questions for new category
    
    // Position the first checkpoint immediately visible on the right side of screen
    // offsetRef.current is current scroll position, add canvas width * 0.8 to place it on right
    const canvas = canvasRef.current;
    if (canvas) {
      checkpointPositionRef.current = offsetRef.current + canvas.width * 0.85;
    } else {
      // Fallback if canvas not available
      checkpointPositionRef.current = offsetRef.current + 1000;
    }
    
    // Reset fade-in timer for new checkpoint
    checkpointFadeStartTimeRef.current = null;
    
    // Load the first question immediately so the correct emoji appears
    const category = forkCategories[choice];
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

  const handleAnswerChoice = (answer) => {
    if (!currentQuestion) return;
    
    // Skip if this answer was already tried and was incorrect
    if (incorrectAnswers.includes(answer)) {
      return;
    }
    
    if (answer === currentQuestion.correctAnswer) {
      // Show translation and pause
      setShowTranslation(true);
      setShowHint(false); // Clear hint on correct answer
      
      // Increment streak for correct answer on first attempt
      let newStreak = streak;
      let streakBonus = 0;
      if (firstAttempt) {
        // Play correct sound only on first attempt
        if (soundManagerRef.current) {
          soundManagerRef.current.playCorrect();
        }
        
        newStreak = streak + 1;
        setStreak(newStreak);
        
        // Award base points only on first attempt
        setTotalPoints(prevPoints => prevPoints + currentQuestion.points);
        
        // Award streak bonus every 5 correct answers in a row
        if (newStreak > 0 && newStreak % 5 === 0) {
          streakBonus = 50; // Bonus points for 5-streak
          setTotalPoints(prevPoints => prevPoints + streakBonus);
          setShowStreakBonus(true);
          
          // Play streak bonus sound
          if (soundManagerRef.current) {
            soundManagerRef.current.playStreak();
          }
          
          // Hide streak bonus after 2.5 seconds (accounts for fade in/out)
          setTimeout(() => {
            setShowStreakBonus(false);
          }, 2500);
        }
      } else {
        // Correct answer on retry - no points, but play a softer sound
        if (soundManagerRef.current) {
          soundManagerRef.current.playCorrect();
        }
      }
      
      // Trigger victory animation
      setIsVictoryAnimation(true);
      walkerFrameRef.current = 0; // Start victory animation from first frame
      victoryAnimationCounterRef.current = 0;
      
      // Play victory sound
      if (soundManagerRef.current) {
        soundManagerRef.current.playVictory();
      }
      
      // Pause for 2 seconds to show the translation, then continue
      setTimeout(() => {
        setShowTranslation(false);
        
        // Increment checkpoint counter
        const newCheckpointsAnswered = checkpointsAnswered + 1;
        setCheckpointsAnswered(newCheckpointsAnswered);
        
        setQuestionAnswered(true);
        setShowQuestion(false);
        setIsPaused(false);
        setFirstAttempt(true); // Reset for next question
        setIncorrectAnswers([]); // Reset incorrect answers for next question
        
        // Check if we've completed all checkpoints for this category
        if (newCheckpointsAnswered >= checkpointsPerCategory) {
          // Reset for next fork
          setCheckpointsAnswered(0);
          setSelectedPath(null);
          setQuestionAnswered(false);
          setCurrentQuestion(null); // Clear current question
          
          // Generate new random categories for the next fork, excluding the just-completed category
          const allCategories = getAllCategoryIds();
          const currentCategory = forkCategories[selectedPath];
          const availableCategories = allCategories.filter(cat => cat !== currentCategory);
          const shuffled = [...availableCategories].sort(() => Math.random() - 0.5);
          setForkCategories({
            choice1: shuffled[0] || 'food',
            choice2: shuffled[1] || 'shopping',
            choice3: shuffled[2] || 'entertainment',
            choice4: shuffled[3] || 'accommodation'
          });
          
          // Position next fork further ahead - account for stop margin so it doesn't come too far into view
          // Adding extra distance (100px stopMargin) to compensate for the stopping point
          forkPositionRef.current = offsetRef.current + 600;
          
          // Reset checkpoint position for after next fork
          checkpointPositionRef.current = forkPositionRef.current + 1500;
        } else {
          // Move to next checkpoint in the same category
          checkpointPositionRef.current += checkpointSpacing;
          setQuestionAnswered(false); // Ready for next checkpoint
          
          // Reset fade-in timer for new checkpoint
          checkpointFadeStartTimeRef.current = null;
          
          // Load the next question immediately for the next checkpoint
          const category = forkCategories[selectedPath];
          loadNewQuestion(category);
        }
      }, 2000); // 2 second pause to show translation
    } else {
      // Wrong answer - track it, play wrong sound, reset streak on first attempt, show hint
      setIncorrectAnswers(prev => [...prev, answer]);
      
      if (soundManagerRef.current) {
        soundManagerRef.current.playWrong();
      }
      
      if (firstAttempt) {
        setStreak(0); // Reset streak on first wrong answer
      }
      setFirstAttempt(false);
      setShowHint(true); // Show hint after wrong answer
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {/* Volume Control - Top Left */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '10px 15px',
        borderRadius: '25px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
      }}>
        <button 
          onClick={() => setSoundEnabled(!soundEnabled)} 
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '24px',
            padding: '0',
            lineHeight: '1',
            filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))',
          }}
          title={soundEnabled ? 'Sound On' : 'Sound Off'}
        >
          {soundEnabled ? (volume > 0.5 ? '🔊' : volume > 0 ? '🔉' : '🔈') : '🔇'}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          disabled={!soundEnabled}
          style={{
            width: '80px',
            height: '4px',
            cursor: soundEnabled ? 'pointer' : 'not-allowed',
            opacity: soundEnabled ? 1 : 0.5,
            accentColor: '#4CAF50',
          }}
          title={`Volume: ${Math.round(volume * 100)}%`}
        />
      </div>

      {/* Top Logo */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 30,
      }}>
        <img 
          src={`${import.meta.env.BASE_URL || '/'}images/top-logo.png`}
          alt="WordWalk Logo"
          style={{
            maxWidth: '200px',
            height: 'auto',
            display: 'block',
          }}
        />
      </div>

      {/* Search Button - Top Right */}
      <button
        onClick={handleSearchClick}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 30,
          background: '#4CAF50',
          border: 'none',
          borderRadius: '50%',
          width: '56px',
          height: '56px',
          fontSize: '28px',
          cursor: 'pointer',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        }}
      >
        🔍
      </button>

      {/* Score Display Component */}
      <ScoreDisplay
        totalPoints={totalPoints}
        streak={streak}
        selectedPath={selectedPath}
        forkCategories={forkCategories}
        checkpointsAnswered={checkpointsAnswered}
        checkpointsPerCategory={checkpointsPerCategory}
        getCategoryById={getCategoryById}
      />

      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100vh',
          margin: 0,
          padding: 0,
        }}
      />
      
      {/* Path Choice Dialog Component */}
      {showChoice && (
        <PathChoiceDialog
          forkCategories={forkCategories}
          getCategoryById={getCategoryById}
          onPathChoice={handlePathChoice}
        />
      )}

      {/* Question Dialog Component */}
      {showQuestion && currentQuestion && (
        <QuestionDialog
          currentQuestion={currentQuestion}
          showTranslation={showTranslation}
          showHint={showHint}
          firstAttempt={firstAttempt}
          incorrectAnswers={incorrectAnswers}
          onAnswerChoice={handleAnswerChoice}
        />
      )}

      {/* Translation Overlay Component */}
      {showTranslation && currentQuestion && (
        <TranslationOverlay 
          currentQuestion={currentQuestion} 
          firstAttempt={firstAttempt}
        />
      )}

      {/* Streak Bonus Notification Component */}
      {showStreakBonus && (
        <StreakBonusNotification streak={streak} />
      )}

      {/* Search Dialog Component */}
      <SearchDialog
        isOpen={showSearch}
        onClose={handleSearchClose}
      />

      {/* Install PWA Prompt */}
      <InstallPrompt />
    </div>
  );
};

export default PathCanvas;
