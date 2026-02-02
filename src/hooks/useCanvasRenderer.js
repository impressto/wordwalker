import { useEffect } from 'react';
import { getTheme } from '../config/parallaxThemes';
import { getSpriteSheetConfig, getCharacterById } from '../config/characterConfig';
import { isEmojiSvg, getEmojiSvgPath } from '../utils/emojiUtils.jsx';
import gameSettings from '../config/gameSettings';
import { getCategoryById } from '../config/questionsLoader';
import { trackCategorySelection } from '../utils/gtm';

/**
 * Custom hook for canvas rendering logic including parallax layers,
 * path tiles, walker animation, checkpoints, and streak diamonds.
 * 
 * This hook handles the main animation loop and all drawing operations.
 */
export function useCanvasRenderer({
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
  checkpointFadeDuration = 500,
}) {
  const spriteConfig = getSpriteSheetConfig();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get theme configuration for colors and positioning
    const theme = getTheme(currentTheme);
    
    // Helper to get layer speed from theme config (with fallbacks for backwards compatibility)
    const getLayerSpeed = (layerName) => {
      if (theme.layerSpeeds && theme.layerSpeeds[layerName] !== undefined) {
        return theme.layerSpeeds[layerName];
      }
      // Default speeds for each layer
      const defaultSpeeds = {
        layer1: 1.2,
        layer2: 0.8,
        layer3: 0.6,
        layer4: 0.4,
        layer5: 0.2,
        layer6: 0.1,
        layer7: 0, // Rear layer doesn't move
      };
      return defaultSpeeds[layerName] || 0.5;
    };

    // Helper to get layer Y offset from theme config
    const getLayerY = (baseY, layerName) => {
      if (theme.layerPositions && theme.layerPositions[layerName] !== undefined) {
        return baseY + theme.layerPositions[layerName];
      }
      return baseY;
    };

    // Helper function to draw streak diamond with glow effect
    const drawStreakDiamond = (x, y, size, glowIntensity, currentStreak) => {
      // Diamond shape points (rotated square)
      const points = [
        { x: x, y: y - size },           // Top
        { x: x + size * 0.8, y: y },     // Right (slightly narrower)
        { x: x, y: y + size },           // Bottom
        { x: x - size * 0.8, y: y },     // Left (slightly narrower)
      ];

      // Draw outer glow when streak is active
      if (glowIntensity > 0) {
        const glowLayers = 3;
        for (let i = glowLayers; i > 0; i--) {
          const glowSize = size + i * 8 * glowIntensity;
          const glowAlpha = 0.3 * glowIntensity / i;
          
          ctx.beginPath();
          ctx.moveTo(x, y - glowSize);
          ctx.lineTo(x + glowSize * 0.8, y);
          ctx.lineTo(x, y + glowSize);
          ctx.lineTo(x - glowSize * 0.8, y);
          ctx.closePath();
          
          ctx.fillStyle = `rgba(255, 215, 0, ${glowAlpha})`;
          ctx.fill();
        }
      }

      // Draw diamond body with gradient
      const gradient = ctx.createLinearGradient(x - size, y - size, x + size, y + size);
      gradient.addColorStop(0, '#87CEEB');   // Light blue
      gradient.addColorStop(0.3, '#4169E1'); // Royal blue
      gradient.addColorStop(0.7, '#0000CD'); // Medium blue
      gradient.addColorStop(1, '#191970');   // Midnight blue

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      points.forEach(point => ctx.lineTo(point.x, point.y));
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw white shine/highlight
      ctx.beginPath();
      ctx.moveTo(x - size * 0.3, y - size * 0.5);
      ctx.quadraticCurveTo(x - size * 0.1, y - size * 0.3, x, y - size * 0.4);
      ctx.quadraticCurveTo(x - size * 0.2, y - size * 0.1, x - size * 0.3, y - size * 0.5);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fill();

      // Draw streak number inside diamond
      ctx.font = `bold ${size * 0.6}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#000033';
      ctx.lineWidth = 2;
      ctx.strokeText(currentStreak.toString(), x, y + 2);
      ctx.fillText(currentStreak.toString(), x, y + 2);
    };

    // Resize canvas to match container
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        const dpr = window.devicePixelRatio || 1;
        const displayWidth = container.clientWidth;
        const displayHeight = container.clientHeight;
        
        // Set actual canvas size for sharp rendering
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
        
        // Scale canvas back down using CSS
        canvas.style.width = `${displayWidth}px`;
        canvas.style.height = `${displayHeight}px`;
        
        // Scale context to match DPR
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };

    // Main scene drawing function
    const drawScene = (deltaTime) => {
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Calculate horizon position for all layers
      const horizonY = height * (theme.positioning?.horizonRatio || 0.3);
      
      // Always fill canvas with theme colors first as a background
      // This prevents black showing through gaps in parallax layers
      if (theme.canvasColors) {
        // First fill entire canvas with above-horizon color
        ctx.fillStyle = theme.canvasColors.aboveHorizon;
        ctx.fillRect(0, 0, width, height);
        
        // Then draw below-horizon color on top with overlap to prevent gaps from subpixel rendering
        const belowHorizonStart = theme.positioning?.belowHorizonStart || 0.4;
        const belowHorizonY = height * belowHorizonStart;
        ctx.fillStyle = theme.canvasColors.belowHorizon;
        ctx.fillRect(0, belowHorizonY - 2, width, height - belowHorizonY + 2);
      }
      
      // Draw layer 7 (rear parallax - infinite distance, no scrolling) if available
      if (parallaxLayer7Image) {
        const layer7Width = parallaxLayer7Image.width;
        const layer7Height = parallaxLayer7Image.height;
        const layer7TilesNeeded = Math.ceil(width / layer7Width) + 1;
        
        // Layer 7 is stationary (no parallax) and fills from top
        for (let i = 0; i < layer7TilesNeeded; i++) {
          ctx.drawImage(parallaxLayer7Image, i * layer7Width, 0, layer7Width, layer7Height);
        }
      }
      
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
      
      // Draw parallax layer 4 (mid-distant layer)
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
      const pathTop = height * theme.positioning.pathTopOffset + theme.positioning.pathTopAdditional;
      const pathBottom = height * 0.75 + theme.positioning.pathTopAdditional;
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
        const stretchFactor = theme.layer2StretchFactor ?? 1.0;
        const offsetY = theme.layer2OffsetY ?? 0;
        // Apply both layer2OffsetY and layerPositions.layer2 offset
        const layer2PositionOffset = theme.layerPositions?.layer2 ?? 0;
        const startY = pathTop + offsetY + layer2PositionOffset;
        const totalLayer2Height = height - startY;
        const tilesX = Math.ceil(width / tileWidth) + 1;
        
        for (let col = -1; col < tilesX; col++) {
          const x = col * tileWidth - scrollOffset;
          const y = startY;
          ctx.drawImage(parallaxLayer2Image, x, y, tileWidth, totalLayer2Height);
        }
      }
      
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
        }, 50);
      }
      
      // Draw path tiles
      if (pathImage && pathForkImage) {
        const tileSize = 240;
        const tileOverlap = 1;
        const pathScrollOffset = scrollPos % tileSize;
        
        // Calculate fork screen position - shift right 10px to spill over canvas edge
        const forkScreenXPos = width - tileSize + 10;
        
        // Calculate how many tiles we need
        const tilesNeeded = Math.ceil(width / tileSize) + 2;
        
        // Draw straight path tiles and fork
        for (let i = -1; i < tilesNeeded; i++) {
          const tileX = i * tileSize - pathScrollOffset;
          
          // Calculate the world position for the left edge of this tile
          const tileWorldStartX = scrollPos + tileX;
          const tileWorldEndX = tileWorldStartX + tileSize;
          
          // Check if this tile is on screen
          const tileScreenX = tileX;
          const tileScreenRight = tileScreenX + tileSize;
          const tileOnScreen = tileScreenRight > 0 && tileScreenX < width;
          
          if (!tileOnScreen) continue;
          
          // Skip drawing the tile if fork is visible and this tile would be covered by the fork
          if (showChoice && !selectedPath && !isIdleAnimationMode && tileScreenX >= forkScreenXPos) {
            continue;
          }
          
          // Draw straight path with 1-pixel overlap to prevent vertical hairlines
          ctx.drawImage(pathImage, tileX - tileOverlap, pathTop + pathYOffset, tileSize + tileOverlap, pathHeight);
        }
        
        // Draw fork at fixed screen position with right edge aligned to canvas right edge
        // Hide fork during idle animation mode to show continuous path scrolling
        if (showChoice && !selectedPath && !isIdleAnimationMode) {
          ctx.drawImage(pathForkImage, forkScreenXPos, pathTop + pathYOffset, tileSize, pathHeight);
        }
      }
      
      // Draw learning checkpoint (emoji on path) if path has been selected and not answered
      // AND there's a valid question to display
      if (selectedPath && !questionAnswered && currentQuestion) {
        const checkpointScreenX = checkpointPositionRef.current - scrollPos;
        
        // Get character config to access yOffset for checkpoint positioning
        const characterData = getCharacterById(currentCharacter);
        const characterYOffset = characterData?.yOffset || 0;
        
        // Draw checkpoint emoji if it's visible on screen
        if (checkpointScreenX < width && checkpointScreenX > -100) {
          // Use theme's configurable checkpoint position
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
          const pulseTime = Date.now() / 1000;
          const pulseIntensity = (Math.sin(pulseTime * 2) + 1) / 2;
          
          const emojiToDisplay = currentQuestion ? currentQuestion.emoji : '❓';
          
          // Check if emoji is an SVG/PNG file
          if (currentQuestion && isEmojiSvg(emojiToDisplay)) {
            const svgPath = getEmojiSvgPath(emojiToDisplay, currentQuestion.category);
            
            // Get cached image (should be preloaded by useEffect)
            const emojiImg = emojiImageCache.current[svgPath];
            
            // Draw SVG/PNG image if loaded and ready
            if (emojiImg && emojiImg.complete && emojiImg.naturalWidth > 0) {
              // PNG images (150x150px) need to be rendered larger to match text emoji size
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
        const distanceFromPerson = checkpointScreenX - personX;
        if (distanceFromPerson <= 120 && distanceFromPerson > -50 && !showQuestion && !showFlashCards && currentQuestion) {
          setIsPaused(true);
          
          // Check game mode and show appropriate dialog
          if (gameMode === 'flashcard') {
            // Show flash cards instead of question dialog
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
      const personY = pathTop + (pathBottom - pathTop) * 0.5 - 50;
      
      // Get character config to access scale and offset properties
      const characterData = getCharacterById(currentCharacter);
      const characterScale = characterData?.scale || 1.0;
      const characterYOffset = characterData?.yOffset || 0;
      
      // Draw streak diamond behind the walker if streak is active
      if (streak > 0) {
        // Update diamond glow animation (smooth fade in/out)
        if (!isPaused || isVictoryAnimation || isIdleAnimationMode) {
          diamondGlowRef.current += 0.02;
        }
        
        // Calculate glow intensity using sine wave for smooth pulsing
        const glowIntensity = (Math.sin(diamondGlowRef.current) + 1) / 2;
        
        // Position diamond behind and to the left of the walker
        const diamondX = personX - 35;
        const diamondY = personY + characterYOffset;
        const diamondSize = 25;
        
        drawStreakDiamond(diamondX, diamondY, diamondSize, glowIntensity, streak);
      }
      
      if (walkerSpriteSheet) {
        // Update animation frame using time-based accumulation
        const isMoving = velocityRef.current > 0.5;
        if ((isMoving && !isPaused) || isVictoryAnimation || isPreviewMode || isIdleAnimationMode) {
          // Accumulate time for sprite frame changes
          frameAccumulatorRef.current += deltaTime * 1000;
          
          // Frame interval in milliseconds
          const frameIntervalMs = isVictoryAnimation ? 200 : (isIdleAnimationMode ? 150 : 100);
          
          if (frameAccumulatorRef.current >= frameIntervalMs) {
            frameAccumulatorRef.current -= frameIntervalMs;
            
            if (isVictoryAnimation) {
              walkerFrameRef.current = (walkerFrameRef.current + 1) % spriteConfig.totalFrames;
              victoryAnimationCounterRef.current++;
              
              if (victoryAnimationCounterRef.current >= spriteConfig.totalFrames) {
                setIsVictoryAnimation(false);
                victoryAnimationCounterRef.current = 0;
                walkerFrameRef.current = 0;
              }
            } else {
              walkerFrameRef.current = (walkerFrameRef.current + 1) % spriteConfig.totalFrames;
            }
          }
        } else {
          // When stopped at checkpoint, use the rightmost (6th) frame for idle pose
          walkerFrameRef.current = 5;
          frameAccumulatorRef.current = 0;
        }
        
        // Calculate which row to use (walking or victory)
        const currentRow = isVictoryAnimation ? spriteConfig.victoryRow : spriteConfig.walkingRow;
        
        // Calculate source position in sprite sheet
        const sourceX = walkerFrameRef.current * spriteConfig.frameWidth;
        const sourceY = currentRow * spriteConfig.frameHeight;
        
        // Calculate size to draw on canvas (scaled appropriately)
        const baseDrawWidth = 80;
        const drawWidth = baseDrawWidth * characterScale;
        const drawHeight = (spriteConfig.frameHeight / spriteConfig.frameWidth) * drawWidth;
        
        // Add bounce effect during victory animation
        let bounceOffset = 0;
        if (isVictoryAnimation) {
          const bounceProgress = walkerFrameRef.current / (spriteConfig.totalFrames - 1);
          bounceOffset = -20 * Math.sin(bounceProgress * Math.PI);
        }
        
        // Calculate walker position
        const walkerX = personX - drawWidth / 2 + 10;
        const walkerY = personY - drawHeight / 2 + bounceOffset + characterYOffset;
        
        // Draw the current frame from sprite sheet
        ctx.drawImage(
          walkerSpriteSheet,
          sourceX, sourceY,
          spriteConfig.frameWidth,
          spriteConfig.frameHeight,
          walkerX,
          walkerY,
          drawWidth,
          drawHeight
        );
        
        // Update walker bounds for click detection (Easter egg)
        walkerBoundsRef.current = {
          x: walkerX,
          y: walkerY,
          width: drawWidth,
          height: drawHeight
        };
      }
      
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

    // Animation loop
    const animate = (currentTime) => {
      // Calculate delta time for frame-rate independent animation
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
      }
      const deltaTime = Math.min((currentTime - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = currentTime;
      
      // Delta multiplier: scales frame-based values to time-based
      const deltaMultiplier = deltaTime * 60;
      
      // Calculate if fork is fully visible on screen
      const canvas = canvasRef.current;
      if (canvas) {
        const scrollPos = offsetRef.current;
        const forkScreenX = forkPositionRef.current - scrollPos;
        const forkTileSize = 240;
        
        // Check if choice dialog should be shown
        const shouldStopForChoice = forkScreenX <= canvas.width && forkScreenX > 0 && !selectedPath;
        
        // Check if checkpoint is approaching (to start decelerating early)
        const personX = canvas.width * 0.4;
        const checkpointScreenX = checkpointPositionRef.current - scrollPos;
        const distanceToCheckpoint = checkpointScreenX - personX;
        const shouldStopForCheckpoint = selectedPath && !questionAnswered && distanceToCheckpoint <= 120 && distanceToCheckpoint > 0;
        
        // Target speed and inertia parameters (now time-based)
        const targetSpeed = 4;
        const acceleration = 0.15 * deltaMultiplier;
        const deceleration = 0.2 * deltaMultiplier;
        
        // During idle animation mode, skip camera panning and use continuous scroll
        if (isIdleAnimationMode) {
          const idleScrollSpeed = 1.5;
          velocityRef.current = idleScrollSpeed;
          offsetRef.current += velocityRef.current * deltaMultiplier;
        } else if (targetOffsetRef.current !== null) {
          // Apply smooth camera panning if we have a target offset
          const cameraSpeed = 8;
          const distanceToTarget = targetOffsetRef.current - offsetRef.current;
          
          if (Math.abs(distanceToTarget) < 1) {
            offsetRef.current = targetOffsetRef.current;
          } else {
            offsetRef.current += (distanceToTarget / cameraSpeed) * deltaMultiplier;
          }
          
          velocityRef.current = 0;
        } else {
          // Determine if walker should be moving
          const shouldMove = (!isPaused && (!shouldStopForChoice || selectedPath) && !shouldStopForCheckpoint) || isPreviewMode;
          
          // Apply inertia - gradually change velocity toward target
          if (shouldMove) {
            if (velocityRef.current < targetSpeed) {
              velocityRef.current = Math.min(velocityRef.current + acceleration, targetSpeed);
            }
          } else {
            if (velocityRef.current > 0) {
              velocityRef.current = Math.max(velocityRef.current - deceleration, 0);
            }
          }
          
          // Apply velocity to offset
          offsetRef.current += velocityRef.current * deltaMultiplier;
        }
      } else {
        // Fallback if canvas not available
        if (isIdleAnimationMode) {
          const idleScrollSpeed = 1.5;
          velocityRef.current = idleScrollSpeed;
          offsetRef.current += velocityRef.current * deltaMultiplier;
        } else if (targetOffsetRef.current !== null) {
          const cameraSpeed = 8;
          const distanceToTarget = targetOffsetRef.current - offsetRef.current;
          if (Math.abs(distanceToTarget) < 1) {
            offsetRef.current = targetOffsetRef.current;
          } else {
            offsetRef.current += (distanceToTarget / cameraSpeed) * deltaMultiplier;
          }
          velocityRef.current = 0;
        } else {
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
          
          offsetRef.current += velocityRef.current * deltaMultiplier;
        }
      }
      
      drawScene(deltaTime);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Start animation with requestAnimationFrame
    lastTimeRef.current = 0;
    frameAccumulatorRef.current = 0;
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
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
    isPaused,
    showChoice,
    showQuestion,
    showFlashCards,
    selectedPath,
    questionAnswered,
    isVictoryAnimation,
    currentTheme,
    currentCharacter,
    currentQuestion,
    isPreviewMode,
    isIdleAnimationMode,
    streak,
    gameMode,
    forkCategories,
    checkpointFadeDuration,
  ]);
}
