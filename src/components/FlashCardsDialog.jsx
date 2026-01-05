import { useState, useEffect, useRef } from 'react';
import './FlashCardsDialog.css';
import { getFlashCardConfig, getFlashCardData, getCategoryCardCount, flashCardsConfig } from '../config/flashCardsConfig';
import { isEmojiSvg, getEmojiSvgPath } from '../utils/emojiUtils.jsx';
import FlashCardsParallax from './FlashCardsParallax';
import pronunciationAudio from '../utils/pronunciationAudio';
import { getQuestionsByCategory } from '../config/questions/index';

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
 * Helper function to shuffle an array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled copy of the array
 */
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * FlashCardsDialog Component
 * Shows flash cards after completing a category
 * Rendered on canvas with mini parallax background
 */
const FlashCardsDialog = ({ category, onComplete, onClose, streak, currentTheme = 'default', volume = 0.7 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [audioAvailable, setAudioAvailable] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(() => {
    // Load autoplay preference from localStorage
    const saved = localStorage.getItem('flashCardAutoPlay');
    return saved === 'true';
  });
  const canvasRef = useRef(null);
  const imagesRef = useRef({});
  const animationFrameRef = useRef(null);

  // Get flash card configuration (unified for all categories)
  const config = getFlashCardConfig(category);
  
  // Get total cards for this category (now from questions)
  const totalCards = getCategoryCardCount(category);
  
  // Randomly select a character once when component mounts
  const selectedCharacterRef = useRef(null);
  if (selectedCharacterRef.current === null) {
    const characters = flashCardsConfig.availableCharacters;
    selectedCharacterRef.current = characters[Math.floor(Math.random() * characters.length)];
  }
  const selectedCharacter = selectedCharacterRef.current;
  
  // Create a shuffled index array once when component mounts
  // This ensures cards are shown in random order each time dialog opens
  const shuffledIndicesRef = useRef(null);
  if (shuffledIndicesRef.current === null) {
    const indices = Array.from({ length: totalCards }, (_, i) => i);
    shuffledIndicesRef.current = shuffleArray(indices);
  }
  
  // Get the actual card index from the shuffled array
  const actualCardIndex = shuffledIndicesRef.current[currentCardIndex];
  
  // Randomly determine layout orientation for each card (50% chance)
  // true = reversed layout (character on right, text on left)
  // false = normal layout (character on left, text on right)
  const layoutOrientationRef = useRef(null);
  if (layoutOrientationRef.current === null) {
    layoutOrientationRef.current = Array.from({ length: totalCards }, () => Math.random() < 0.5);
  }
  const isReversedLayout = layoutOrientationRef.current[currentCardIndex];
  
  // Get base path for assets
  const basePath = import.meta.env.BASE_URL || '/';

  // Preload all images for the current card
  useEffect(() => {
    const cardData = getFlashCardData(
      category, 
      actualCardIndex,
      selectedCharacter
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
        const objPath = `${basePath}images/objects/${objectFileName}`;
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

    // Load emoji image if emoji is a PNG/SVG file
    if (cardData.emoji && isEmojiSvg(cardData.emoji)) {
      const emojiPath = getEmojiSvgPath(cardData.emoji, category);
      if (emojiPath) {
        const emojiImg = new Image();
        imagePromises.push(
          new Promise((resolve) => {
            emojiImg.onload = () => {
              imagesToLoad.emojiImage = emojiImg;
              resolve();
            };
            emojiImg.onerror = (error) => {
              console.warn(`Failed to load emoji image: ${emojiPath}`, error);
              resolve(); // Continue even if image fails
            };
            emojiImg.src = emojiPath;
          })
        );
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
  }, [actualCardIndex, category, basePath, currentTheme]);

  // Add a small delay before showing the dialog to allow DOM layout calculation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  // Listen for online/offline status changes
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check if audio file exists for current card
  useEffect(() => {
    setAudioLoading(true);
    setAudioAvailable(false);
    setIsPlaying(false); // Reset playing state when card changes

    if (!isOnline) {
      setAudioLoading(false);
      setAudioAvailable(false);
      return;
    }

    // Get the question data for the current card
    const categoryQuestions = getQuestionsByCategory(category);
    if (!categoryQuestions || actualCardIndex >= categoryQuestions.length) {
      setAudioLoading(false);
      setAudioAvailable(false);
      return;
    }

    const currentQuestion = categoryQuestions[actualCardIndex];
    let isMounted = true;

    const checkAudio = async () => {
      const exists = await pronunciationAudio.checkAudioExists(currentQuestion);
      
      if (isMounted) {
        setAudioAvailable(exists);
        setAudioLoading(false);
        // Preload if available for faster playback
        if (exists) {
          await pronunciationAudio.preloadAudio(currentQuestion);
        }
      }
    };

    checkAudio();

    return () => {
      isMounted = false;
    };
  }, [actualCardIndex, category, isOnline]);

  // Auto-play audio when enabled and audio is available
  useEffect(() => {
    if (autoPlayEnabled && audioAvailable && !audioLoading && isOnline && !isPlaying) {
      // Small delay to ensure audio is preloaded
      const timer = setTimeout(() => {
        handlePlayAudio();
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [actualCardIndex, audioAvailable, audioLoading, autoPlayEnabled, isOnline]);

  const handlePlayAudio = async () => {
    if (isPlaying) return; // Prevent multiple clicks
    
    // Get the question data for the current card
    const categoryQuestions = getQuestionsByCategory(category);
    if (!categoryQuestions || actualCardIndex >= categoryQuestions.length) {
      return;
    }

    const currentQuestion = categoryQuestions[actualCardIndex];
    
    setIsPlaying(true);
    await pronunciationAudio.playPronunciation(currentQuestion, volume);
    
    // Reset playing state after a short delay (assume 2-3 seconds for most pronunciations)
    setTimeout(() => {
      setIsPlaying(false);
    }, 3000);
  };

  const handleAutoPlayToggle = () => {
    const newValue = !autoPlayEnabled;
    setAutoPlayEnabled(newValue);
    // Save preference to localStorage
    localStorage.setItem('flashCardAutoPlay', newValue.toString());
  };

  const handleNext = () => {
    if (currentCardIndex < totalCards - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      // Completed all cards - use onClose if available (same as X button), fallback to onComplete
      if (onClose) {
        onClose();
      } else {
        onComplete();
      }
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  // Draw flash card on canvas
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
        actualCardIndex,
        selectedCharacter
      );
      
      if (!cardData) {
        animationFrameRef.current = requestAnimationFrame(drawCard);
        return;
      }

      // Draw layers in order:
      // Determine text alignment for positioning elements
      const textConfig = config.text || {};
      // Use isReversedLayout to determine alignment:
      // reversed = character on right, text on left
      // normal = character on left, text on right
      const textAlign = isReversedLayout ? 'left' : 'right';
      
      // 1. Background - SKIP drawing background to let parallax show through
      // The mini parallax is now drawn as a separate layer behind this canvas
      // No need to draw background here anymore

      // 2. Character with emotion (positioned based on layout orientation)
      if (isImageReady(imagesRef.current.character)) {
        // Use native character dimensions from config (220x220) with scale factor
        const baseWidth = config.characterWidth || 220;
        const baseHeight = config.characterHeight || 220;
        const scale = config.characterScale || 0.8;
        const charWidth = baseWidth * scale;
        const charHeight = baseHeight * scale;
        const charMargin = 10; // Margin from canvas edges
        // If reversed layout (text left), put character on right; otherwise put character on left
        const charX = isReversedLayout
          ? canvas.width - charWidth - charMargin  // Right side - position from right edge
          : charMargin; // Left side - position from left edge
        const charY = canvas.height - charHeight; // Align to bottom (bottom - height)
        
        // Flip character horizontally when on the right side to face the emoji
        ctx.save();
        if (isReversedLayout) {
          // Translate to the center of where the image will be, flip, then translate back
          ctx.translate(charX + charWidth, charY);
          ctx.scale(-1, 1);
          ctx.drawImage(
            imagesRef.current.character,
            0, 0, charWidth, charHeight
          );
        } else {
          ctx.drawImage(
            imagesRef.current.character,
            charX, charY, charWidth, charHeight
          );
        }
        ctx.restore();
      }

      // 3. Object (emoji or image) - positioned based on layout orientation
      if (cardData.emoji) {
        // Check if emoji is an image file (PNG/SVG)
        const isImageEmoji = isEmojiSvg(cardData.emoji);
        
        if (isImageEmoji) {
          // Only render if image is loaded - don't show text fallback for PNG/SVG emojis
          if (isImageReady(imagesRef.current.emojiImage)) {
            // Render emoji as image
            const emojiPosition = cardData.emojiPosition || {};
            const defaultSize = canvas.height * 0.4; // 40% of canvas height by default
            const emojiSize = emojiPosition.size !== undefined ? emojiPosition.size : defaultSize;
            
            // Position emoji on SAME side as text alignment
            // If reversed (text left), emoji on left; if normal (text right), emoji on right
            const defaultX = isReversedLayout
              ? canvas.width * 0.275 - (emojiSize / 2)  // Left side when reversed
              : canvas.width * 0.725 - (emojiSize / 2); // Right side when normal
            const defaultY = canvas.height - 20 - emojiSize; // 20px from bottom
            
            const emojiX = emojiPosition.x !== undefined ? emojiPosition.x : defaultX;
            const emojiY = emojiPosition.y !== undefined ? emojiPosition.y : defaultY;
            
            ctx.drawImage(
              imagesRef.current.emojiImage,
              emojiX, emojiY, emojiSize, emojiSize
            );
          }
          // If image not ready yet, don't draw anything (no text fallback)
        } else {
          // Render emoji as text (standard emoji character)
          const emojiPosition = cardData.emojiPosition || {};
          const emojiFontSize = emojiPosition.size !== undefined ? emojiPosition.size : (canvas.height * 0.4); // 40% of canvas height by default
          
          // Position emoji on SAME side as text alignment
          // If reversed (text left), emoji on left; if normal (text right), emoji on right
          const defaultX = isReversedLayout
            ? canvas.width * 0.275  // Left side when reversed
            : canvas.width * 0.725; // Right side when normal
          const defaultY = canvas.height - 20 - emojiFontSize; // 20px from bottom, accounting for emoji size
          
          const emojiX = emojiPosition.x !== undefined ? emojiPosition.x : defaultX;
          const emojiY = emojiPosition.y !== undefined ? emojiPosition.y : defaultY;
          
          ctx.save();
          ctx.font = `${emojiFontSize}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText(cardData.emoji, emojiX, emojiY);
          ctx.restore();
        }
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
        
        // Get text alignment configuration based on layout orientation
        const margin = textConfig.leftMargin || 20;
        
        // Get card-specific positioning overrides
        const spanishPositioning = cardData.spanishPosition || {};
        const englishPositioning = cardData.englishPosition || {};
        
        // Determine default X position based on layout orientation
        let defaultX;
        let canvasTextAlign;
        if (isReversedLayout) {
          // Reversed: text on left
          defaultX = margin;
          canvasTextAlign = 'left';
        } else {
          // Normal: text on right
          defaultX = canvas.width - margin;
          canvasTextAlign = 'right';
        }
        
        let currentY = topMargin;
        
        // Draw Spanish text (main text)
        ctx.save();
        ctx.textAlign = canvasTextAlign;
        ctx.textBaseline = 'top';
        ctx.font = `${spanishConfig.fontWeight || 'bold'} ${spanishConfig.fontSize || 28}px ${spanishConfig.fontFamily || 'Arial'}`;
        // Use card-specific color override or config color
        ctx.fillStyle = cardData.spanishColor || spanishConfig.color || '#333';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
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

      // Continue animation
      animationFrameRef.current = requestAnimationFrame(drawCard);
    };

    drawCard();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [actualCardIndex, config, category]);

  return (
    <div className={`flash-cards-dialog ${isVisible ? 'visible' : ''}`}>
      <div className="flash-cards-content">
        <div className="flash-cards-header">
          <h2>🎓 Flash Cards</h2>
          <button
            className="btn-close"
            onClick={onClose || onComplete}
            title="Close flash cards"
            aria-label="Close"
          >
            ✕
          </button>
          <p className="cards-progress">
            Card {currentCardIndex + 1} of {totalCards}
          </p>
        </div>

        <div className="flash-card-container">
          {/* Mini parallax background - uses theme-specific flash card parallax config */}
          <FlashCardsParallax 
            currentTheme={currentTheme}
            width={config.canvasWidth}
            height={config.canvasHeight}
          />
          
          <canvas
            id="flash-card-canvas"
            ref={canvasRef}
            width={config.canvasWidth}
            height={config.canvasHeight}
            className="flash-card-canvas"
          />
          
          {/* Debug: Display character name */}
          {/* <div className="flash-card-debug-character">
            {selectedCharacter}
          </div> */}
        </div>

        {/* Audio play button - only show if online and audio exists */}
        <div className="flash-card-audio-container">
          {audioAvailable && isOnline && (
            <>
              <label className="autoplay-checkbox-label">
                <input
                  type="checkbox"
                  checked={autoPlayEnabled}
                  onChange={handleAutoPlayToggle}
                  className="autoplay-checkbox"
                  disabled={audioLoading}
                />
                <span className="autoplay-label-text">Auto-play pronunciation</span>
              </label>
              <button
                onClick={handlePlayAudio}
                disabled={isPlaying || audioLoading}
                className="btn-pronunciation"
                title={audioLoading ? 'Loading audio...' : (isPlaying ? 'Playing...' : 'Hear Pronunciation')}
              >
                <span className="pronunciation-icon">
                  {audioLoading ? '⏳' : (isPlaying ? '🔊' : '🔉')}
                </span>
              </button>
            </>
          )}
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
