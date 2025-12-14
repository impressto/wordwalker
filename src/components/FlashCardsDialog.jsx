import { useState, useEffect, useRef } from 'react';
import './FlashCardsDialog.css';
import { getStreakColor } from '../config/gameSettings';
import { getFlashCardConfig, getFlashCardData } from '../config/flashCardsConfig';

/**
 * Helper function to check if an image is loaded and ready to draw
 * @param {HTMLImageElement} img - Image element to check
 * @returns {boolean} True if image is ready to draw
 */
const isImageReady = (img) => {
  if (!img) return false;
  if (!img.complete) return false;
  if (img.naturalWidth === 0) return false; // Image failed to load
  return true;
};

/**
 * Helper function to draw wrapped text on canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string} text - Text to draw
 * @param {number} x - X position (center)
 * @param {number} y - Y position (top)
 * @param {number} maxWidth - Maximum width before wrapping
 * @param {number} lineHeight - Line height multiplier
 * @returns {number} Total height of drawn text
 */
const drawWrappedText = (ctx, text, x, y, maxWidth, lineHeight) => {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  const lines = [];
  
  // Build lines
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    
    if (testWidth > maxWidth && i > 0) {
      lines.push(line.trim());
      line = words[i] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());
  
  // Draw lines
  // Extract font size from font string (e.g., "bold 28px Arial" or "18px Arial")
  const fontSizeMatch = ctx.font.match(/(\d+)px/);
  const fontSize = fontSizeMatch ? parseInt(fontSizeMatch[1]) : 16; // Default to 16 if parsing fails
  const actualLineHeight = fontSize * lineHeight;
  
  lines.forEach((line) => {
    ctx.fillText(line, x, currentY);
    currentY += actualLineHeight;
  });
  
  return lines.length * actualLineHeight;
};

/**
 * FlashCardsDialog Component
 * Shows flash cards after completing a category with a streak
 * Flash cards are extracted from a sprite sheet (3400x250px with 10 cards)
 * Rendered on canvas with animated glowing streak diamond
 */
const FlashCardsDialog = ({ category, onComplete, streak, currentTheme = 'default' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const canvasRef = useRef(null);
  const imagesRef = useRef({});
  const animationFrameRef = useRef(null);
  const diamondGlowRef = useRef(0);

  // Get flash card configuration (unified for all categories)
  const config = getFlashCardConfig(category);
  
  // Get total cards for this category
  const totalCards = config.cards[category]?.length || 0;
  
  // Get base path for assets
  const basePath = import.meta.env.BASE_URL || '/';

  // Preload all images for the current card
  useEffect(() => {
    const cardData = getFlashCardData(
      category, 
      currentCardIndex
    );
    
    if (!cardData || !cardData.images) return;

    const imagesToLoad = {};
    const imagePromises = [];

    // Load background (theme-specific)
    if (cardData.images.background) {
      // Build theme-specific path: backgrounds/{theme}/{background}.png
      const bgPath = `${basePath}images/flash-cards/backgrounds/${currentTheme}/${cardData.images.background}.png`;
      const bgImg = new Image();
      imagePromises.push(
        new Promise((resolve) => {
          bgImg.onload = () => {
            imagesToLoad.background = bgImg;
            resolve();
          };
          bgImg.onerror = (error) => {
            console.warn(`Failed to load background: ${bgPath}`, error);
            resolve(); // Continue even if image fails
          };
          bgImg.src = bgPath;
        })
      );
    }

    // Load character
    if (cardData.images.character && cardData.images.emotion) {
      const charPath = `${basePath}images/flash-cards/characters/${cardData.images.character}/${cardData.images.emotion}`;
      const charImg = new Image();
      imagePromises.push(
        new Promise((resolve) => {
          charImg.onload = () => {
            imagesToLoad.character = charImg;
            resolve();
          };
          charImg.onerror = (error) => {
            console.warn(`Failed to load character: ${charPath}`, error);
            resolve(); // Continue even if image fails
          };
          charImg.src = charPath;
        })
      );
    }

    // Load object - only load PNG files, skip SVG
    if (cardData.images.object) {
      const objectFileName = cardData.images.object;
      // Only load if it's a PNG file (skip SVG)
      if (objectFileName.toLowerCase().endsWith('.png')) {
        const objPath = `${basePath}images/flash-cards/objects/${objectFileName}`;
        const objImg = new Image();
        imagePromises.push(
          new Promise((resolve) => {
            objImg.onload = () => {
              imagesToLoad.object = objImg;
              resolve();
            };
            objImg.onerror = (error) => {
              console.warn(`Failed to load object: ${objPath}`, error);
              resolve(); // Continue even if image fails
            };
            objImg.src = objPath;
          })
        );
      } else {
        console.log(`Skipping non-PNG object: ${objectFileName}`);
      }
    }

    // Wait for all images to load (or fail)
    Promise.all(imagePromises).then(() => {
      imagesRef.current = imagesToLoad;
    });

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentCardIndex, category, basePath, currentTheme]);

  // Add a small delay before showing the dialog to allow DOM layout calculation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    if (currentCardIndex < totalCards - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      // Completed all cards
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  // Draw flash card on canvas with animated diamond
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    const drawCard = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Get flash card data (Spanish and English text, and image paths)
      const cardData = getFlashCardData(
        category, 
        currentCardIndex
      );
      
      if (!cardData) {
        animationFrameRef.current = requestAnimationFrame(drawCard);
        return;
      }

      // Draw layers in order:
      // Determine text alignment for positioning elements
      const textConfig = config.text || {};
      const textAlign = cardData.textAlign !== undefined ? cardData.textAlign : (textConfig.align || 'right');
      
      // 1. Background
      if (isImageReady(imagesRef.current.background)) {
        ctx.drawImage(
          imagesRef.current.background,
          0, 0, canvas.width, canvas.height
        );
      } else {
        // Draw fallback background color if image not ready
        ctx.fillStyle = '#9b59b6'; // Purple fallback
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // 2. Character with emotion (positioned based on text alignment)
      if (isImageReady(imagesRef.current.character)) {
        // Position character opposite to text alignment, aligned to bottom
        const charWidth = canvas.width * 0.4; // 40% of canvas width
        const charHeight = canvas.height * 0.8; // 80% of canvas height
        // If text is left-aligned, put character on right; if text is right-aligned, put character on left
        const charX = textAlign === 'left' 
          ? canvas.width * 0.55  // Right side when text is left
          : canvas.width * 0.05; // Left side when text is right
        const charY = canvas.height - charHeight; // Align to bottom (bottom - height)
        
        ctx.drawImage(
          imagesRef.current.character,
          charX, charY, charWidth, charHeight
        );
      }

      // 3. Object (emoji or image) - positioned based on text alignment
      if (cardData.emoji) {
        // Render emoji with optional position overrides
        const emojiPosition = cardData.emojiPosition || {};
        const emojiFontSize = emojiPosition.size !== undefined ? emojiPosition.size : (canvas.height * 0.4); // 40% of canvas height by default
        
        // Position emoji on SAME side as text alignment
        // If text is left-aligned, put emoji on left; if text is right-aligned, put emoji on right
        const defaultX = textAlign === 'left'
          ? canvas.width * 0.275  // Left side when text is left (5% + 22.5%)
          : canvas.width * 0.725; // Right side when text is right (55% + 17.5%)
        const defaultY = canvas.height - 20 - emojiFontSize; // 20px from bottom, accounting for emoji size
        
        const emojiX = emojiPosition.x !== undefined ? emojiPosition.x : defaultX;
        const emojiY = emojiPosition.y !== undefined ? emojiPosition.y : defaultY;
        
        ctx.save();
        ctx.font = `${emojiFontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(cardData.emoji, emojiX, emojiY);
        ctx.restore();
      } else if (isImageReady(imagesRef.current.object)) {
        // Render PNG image
        const objWidth = canvas.width * 0.35; // 35% of canvas width
        const objHeight = canvas.height * 0.5; // 50% of canvas height
        const objX = canvas.width * 0.55; // 55% from left (right side)
        const objY = canvas.height * 0.25; // 25% from top
        
        ctx.drawImage(
          imagesRef.current.object,
          objX, objY, objWidth, objHeight
        );
      }
      
      // 4. Draw text overlay
      if (cardData) {
        const textConfig = config.text || {};
        const spanishConfig = textConfig.spanish || {};
        const englishConfig = textConfig.english || {};
        const topMargin = textConfig.topMargin || 60;
        const verticalSpacing = textConfig.verticalSpacing || 15;
        
        // Get text alignment configuration (card-specific overrides global config)
        const margin = cardData.leftMargin !== undefined ? cardData.leftMargin : (textConfig.leftMargin || 20);
        
        // Get card-specific positioning overrides
        const spanishPositioning = cardData.spanishPosition || {};
        const englishPositioning = cardData.englishPosition || {};
        
        // Determine default X position based on alignment (left or right only)
        let defaultX;
        let canvasTextAlign;
        if (textAlign === 'left') {
          defaultX = margin;
          canvasTextAlign = 'left';
        } else {
          // Default to right alignment
          defaultX = canvas.width - margin;
          canvasTextAlign = 'right';
        }
        
        let currentY = topMargin;
        
        // Draw Spanish text (main text)
        ctx.save();
        ctx.textAlign = canvasTextAlign;
        ctx.textBaseline = 'top';
        ctx.font = `${spanishConfig.fontWeight || 'bold'} ${spanishConfig.fontSize || 28}px ${spanishConfig.fontFamily || 'Arial'}`;
        // Use card-specific color override or default
        ctx.fillStyle = cardData.spanishColor || spanishConfig.color || '#333';
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = 3;
        
        // Use card-specific position or defaults
        const spanishX = spanishPositioning.x !== undefined ? spanishPositioning.x : defaultX;
        const spanishY = spanishPositioning.y !== undefined ? spanishPositioning.y : currentY;
        
        const spanishHeight = drawWrappedText(
          ctx,
          cardData.spanish,
          spanishX,
          spanishY,
          spanishConfig.maxWidth || 320,
          spanishConfig.lineHeight || 1.3
        );
        
        // Update currentY for English text (if not using custom positioning)
        if (englishPositioning.y === undefined) {
          currentY = spanishY + spanishHeight + verticalSpacing;
        }
        
        // Draw English text (translation)
        ctx.font = `${englishConfig.fontWeight || 'normal'} ${englishConfig.fontSize || 22}px ${englishConfig.fontFamily || 'Arial'}`;
        
        const englishMaxWidth = englishConfig.maxWidth || 320;
        const englishLineHeight = englishConfig.lineHeight || 1.2;
        
        // Draw English text - use card-specific color override or default
        ctx.fillStyle = cardData.englishColor || englishConfig.color || '#FF3333';
        ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
        ctx.shadowBlur = 2;
        
        // Use card-specific position or defaults (both texts use same alignment)
        const englishX = englishPositioning.x !== undefined ? englishPositioning.x : defaultX;
        const englishY = englishPositioning.y !== undefined ? englishPositioning.y : currentY;
        
        drawWrappedText(
          ctx,
          cardData.english,
          englishX,
          englishY,
          englishMaxWidth,
          englishLineHeight
        );
        
        ctx.restore();
      }

      // Draw animated glowing diamond (position based on text alignment)
      if (streak > 0) {
        // Get diamond animation config
        const diamondConfig = config.diamond || {};
        const diamondSize = diamondConfig.size || 45;
        // Position diamond: top-right when text is left, top-left when text is right
        const defaultDiamondX = textAlign === 'left' 
          ? canvas.width - 30  // Top-right corner when text is left-aligned
          : 30;                // Top-left corner when text is right-aligned (default)
        const diamondX = diamondConfig.positionX !== undefined ? diamondConfig.positionX : defaultDiamondX;
        const diamondY = diamondConfig.positionY !== undefined ? diamondConfig.positionY : 30;
        
        console.log('Diamond position - textAlign:', textAlign, 'diamondX:', diamondX, 'canvas.width:', canvas.width);
        const animationSpeed = diamondConfig.animationSpeed || 0.015;
        const fadeMin = diamondConfig.fadeMin || 0.4;
        const fadeMax = diamondConfig.fadeMax || 1.0;
        
        // Animate glow (0 to 1 and back) - configurable speed
        diamondGlowRef.current += animationSpeed;
        if (diamondGlowRef.current > 1) {
          diamondGlowRef.current = 0;
        }
        const glowIntensity = Math.sin(diamondGlowRef.current * Math.PI);
        
        // Configurable fade intensity range
        const fadeRange = fadeMax - fadeMin;
        const fadeIntensity = fadeMin + (glowIntensity * fadeRange);
        
        // Get streak color
        const streakColor = getStreakColor(streak);
        
        // Apply overall fade to the entire diamond
        ctx.save();
        ctx.globalAlpha = fadeIntensity; // This makes the fade in/out more obvious
        
        // Draw outer glow effect - much more dramatic
        ctx.shadowColor = streakColor;
        ctx.shadowBlur = 30 + (glowIntensity * 30); // Increased from 20+15
        
        // Draw diamond shape
        ctx.beginPath();
        ctx.moveTo(diamondX, diamondY - diamondSize / 2);
        ctx.lineTo(diamondX + diamondSize / 2, diamondY);
        ctx.lineTo(diamondX, diamondY + diamondSize / 2);
        ctx.lineTo(diamondX - diamondSize / 2, diamondY);
        ctx.closePath();
        
        // Create radial gradient from white center to streak color
        const gradient = ctx.createRadialGradient(
          diamondX, diamondY, 0,  // Inner circle (center)
          diamondX, diamondY, diamondSize / 2  // Outer circle
        );
        
        // Animate the white center size based on glow intensity - more dramatic
        const whiteStop = 0.15 + (glowIntensity * 0.25); // Increased range
        gradient.addColorStop(0, 'white');
        gradient.addColorStop(whiteStop, streakColor);
        gradient.addColorStop(1, streakColor);
        
        // Fill diamond with gradient
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Add inner glow/shine effect - more dramatic
        ctx.shadowBlur = 12 + (glowIntensity * 10); // Increased from 8+5
        ctx.shadowColor = 'white';
        ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + (glowIntensity * 0.4)})`; // More intense shine
        
        // Draw smaller diamond for inner shine
        const shineSize = diamondSize * 0.6;
        ctx.beginPath();
        ctx.moveTo(diamondX, diamondY - shineSize / 2);
        ctx.lineTo(diamondX + shineSize / 2, diamondY);
        ctx.lineTo(diamondX, diamondY + shineSize / 2);
        ctx.lineTo(diamondX - shineSize / 2, diamondY);
        ctx.closePath();
        ctx.fill();
        
        // Draw streak number inside diamond - larger font for larger diamond
        ctx.shadowBlur = 2;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.fillStyle = '#333';
        ctx.font = 'bold 20px Arial'; // Increased from 14px
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(streak.toString(), diamondX, diamondY);
        
        ctx.restore();
      }

      // Continue animation
      animationFrameRef.current = requestAnimationFrame(drawCard);
    };

    drawCard();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentCardIndex, streak, config, category]);

  return (
    <div className={`flash-cards-dialog ${isVisible ? 'visible' : ''}`}>
      <div className="flash-cards-content">
        <div className="flash-cards-header">
          <h2>🎓 Flash Cards</h2>
          <p className="cards-progress">
            Card {currentCardIndex + 1} of {totalCards}
          </p>
        </div>

        <div className="flash-card-container">
          <canvas
            ref={canvasRef}
            width={config.canvasWidth}
            height={config.canvasHeight}
            className="flash-card-canvas"
          />
        </div>

        <div className="flash-cards-buttons">
          <button
            className="btn-previous"
            onClick={handlePrevious}
            disabled={currentCardIndex === 0}
          >
            ← Previous
          </button>
          
          <button
            className="btn-skip"
            onClick={handleSkip}
          >
            Skip
          </button>

          <button
            className="btn-next"
            onClick={handleNext}
          >
            {currentCardIndex < totalCards - 1 ? 'Next →' : 'Finish ✓'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashCardsDialog;
