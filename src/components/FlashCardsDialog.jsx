import { useState, useEffect, useRef } from 'react';
import './FlashCardsDialog.css';
import { getFlashCardConfig, getFlashCardData, getCategoryCardCount, flashCardsConfig } from '../config/flashCardsConfig';
import { isEmojiSvg, getEmojiSvgPath } from '../utils/emojiUtils.jsx';
import FlashCardsParallax from './FlashCardsParallax';
import pronunciationAudio from '../utils/pronunciationAudio';
import { getQuestionsByCategory, getCategoryById } from '../config/questionsLoader';
import { getExampleTranslationsObject } from '../config/translationsLoader';
import EmojiDisplay from './EmojiDisplay';

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
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [speechBalloonBounds, setSpeechBalloonBounds] = useState(null);
  const [exampleAudioAvailable, setExampleAudioAvailable] = useState(false);
  const [exampleAudioLoading, setExampleAudioLoading] = useState(false);
  const [isPlayingExample, setIsPlayingExample] = useState(false);
  const [exampleTranslations, setExampleTranslations] = useState(null);
  const [currentCardData, setCurrentCardData] = useState(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef({});
  const animationFrameRef = useRef(null);

  // Get flash card configuration (unified for all categories)
  const config = getFlashCardConfig(category);
  
  // Get total cards for this category (now from questions) - load asynchronously
  const [totalCards, setTotalCards] = useState(0);
  useEffect(() => {
    getCategoryCardCount(category).then(setTotalCards);
  }, [category]);
  
  // Randomly select a character once when component mounts
  const selectedCharacterRef = useRef(null);
  if (selectedCharacterRef.current === null) {
    const characters = flashCardsConfig.availableCharacters;
    selectedCharacterRef.current = characters[Math.floor(Math.random() * characters.length)];
  }
  const selectedCharacter = selectedCharacterRef.current;
  
  // Create a shuffled index array once when totalCards is loaded
  // This ensures cards are shown in random order each time dialog opens
  const shuffledIndicesRef = useRef(null);
  const layoutOrientationRef = useRef(null);
  
  useEffect(() => {
    if (totalCards > 0 && shuffledIndicesRef.current === null) {
      const indices = Array.from({ length: totalCards }, (_, i) => i);
      shuffledIndicesRef.current = shuffleArray(indices);
      // Also initialize layout orientations
      layoutOrientationRef.current = Array.from({ length: totalCards }, () => Math.random() < 0.5);
    }
  }, [totalCards]);
  
  // Get the actual card index from the shuffled array
  const actualCardIndex = shuffledIndicesRef.current?.[currentCardIndex] ?? 0;
  const isReversedLayout = layoutOrientationRef.current?.[currentCardIndex] ?? false;

  // Load example translations on mount
  useEffect(() => {
    getExampleTranslationsObject().then(setExampleTranslations);
  }, []);
  
  // Load current card data whenever card changes
  useEffect(() => {
    getFlashCardData(category, actualCardIndex, selectedCharacter, currentTheme)
      .then(setCurrentCardData);
  }, [category, actualCardIndex, selectedCharacter, currentTheme, currentCardIndex]);

  // Get base path for assets
  const basePath = import.meta.env.BASE_URL || '/';

  // Preload all images for the current card
  useEffect(() => {
    const loadCardData = async () => {
      const cardData = await getFlashCardData(
        category, 
        actualCardIndex,
        selectedCharacter,
        currentTheme
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

    // Load speech bubble image if usageExample exists
    if (cardData.usageExample) {
      const speechBubblePath = `${basePath}images/flash-cards/speech-bubble.png`;
      const speechBubbleImg = new Image();
      imagePromises.push(
        new Promise((resolve) => {
          speechBubbleImg.onload = () => {
            imagesToLoad.speechBubble = speechBubbleImg;
            resolve();
          };
          speechBubbleImg.onerror = (error) => {
            console.warn(`Failed to load speech bubble: ${speechBubblePath}`, error);
            resolve(); // Continue even if image fails
          };
          speechBubbleImg.src = speechBubblePath;
        })
      );
    }

    // Wait for all images to load (or fail)
    Promise.all(imagePromises).then(() => {
      imagesRef.current = imagesToLoad;
    });
    };
    
    loadCardData();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [actualCardIndex, category, basePath, currentTheme, selectedCharacter]);

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
    const checkAudioAsync = async () => {
      setAudioLoading(true);
      setAudioAvailable(false);
      setIsPlaying(false); // Reset playing state when card changes

      if (!isOnline) {
        setAudioLoading(false);
        setAudioAvailable(false);
        return;
      }

      // Get the question data for the current card
      const categoryQuestions = await getQuestionsByCategory(category);
      if (!categoryQuestions || actualCardIndex >= categoryQuestions.length) {
        setAudioLoading(false);
        setAudioAvailable(false);
        return;
      }

      const currentQuestion = categoryQuestions[actualCardIndex];
      
      const exists = await pronunciationAudio.checkAudioExists(currentQuestion);
      
      setAudioAvailable(exists);
      setAudioLoading(false);
      // Preload if available for faster playback
      if (exists) {
        await pronunciationAudio.preloadAudio(currentQuestion);
      }
    };

    checkAudioAsync();
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

  // Check if example audio exists when modal opens
  useEffect(() => {
    if (!showUsageModal) {
      setExampleAudioAvailable(false);
      setExampleAudioLoading(false);
      setIsPlayingExample(false);
      return;
    }

    const checkExampleAudioAsync = async () => {
      const cardData = await getFlashCardData(category, actualCardIndex, selectedCharacter, currentTheme);
      if (!cardData?.usageExample || !isOnline) {
        setExampleAudioAvailable(false);
        setExampleAudioLoading(false);
        return;
      }

      setExampleAudioLoading(true);

      const exists = await pronunciationAudio.checkExampleAudioExists(
        cardData.usageExample,
        category
      );
      
      setExampleAudioAvailable(exists);
      setExampleAudioLoading(false);
      // Preload if available
      if (exists) {
        await pronunciationAudio.preloadExample(cardData.usageExample, category);
      }
    };

    checkExampleAudioAsync();
  }, [showUsageModal, category, actualCardIndex, selectedCharacter, currentTheme, isOnline]);

  const handlePlayAudio = async () => {
    if (isPlaying) return; // Prevent multiple clicks
    
    // Get the question data for the current card
    const categoryQuestions = await getQuestionsByCategory(category);
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

  const stopAllAudio = () => {
    // Stop any currently playing audio by pausing all cached audio elements
    pronunciationAudio.audioCache.forEach((audio) => {
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    // Reset playing states
    setIsPlaying(false);
    setIsPlayingExample(false);
  };

  const handlePlayExample = async () => {
    if (isPlayingExample) return; // Prevent multiple clicks
    
    const cardData = await getFlashCardData(category, actualCardIndex, selectedCharacter, currentTheme);
    if (!cardData?.usageExample) {
      return;
    }
    
    setIsPlayingExample(true);
    await pronunciationAudio.playExample(cardData.usageExample, category, volume);
    
    // Reset playing state after a delay (example sentences are typically longer)
    setTimeout(() => {
      setIsPlayingExample(false);
    }, 5000);
  };

  const handleNext = () => {
    // Stop any playing audio before navigating
    stopAllAudio();
    
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

  const handleCanvasClick = (e) => {
    if (!speechBalloonBounds) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    
    // Handle both mouse and touch events
    let clientX, clientY;
    if (e.type === 'touchend') {
      // For touch events, use the last touch position
      const touch = e.changedTouches[0];
      clientX = touch.clientX - rect.left;
      clientY = touch.clientY - rect.top;
    } else {
      // For mouse events
      clientX = e.clientX - rect.left;
      clientY = e.clientY - rect.top;
    }

    // Scale click coordinates to canvas coordinate system
    // Canvas may be scaled by CSS (e.g., 280px display vs 400px actual)
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = clientX * scaleX;
    const y = clientY * scaleY;

    // Check if click is within speech balloon bounds
    const { x: bx, y: by, width: bw, height: bh } = speechBalloonBounds;
    if (x >= bx && x <= bx + bw && y >= by && y <= by + bh) {
      setShowUsageModal(true);
    }
  };

  const handlePrevious = () => {
    // Stop any playing audio before navigating
    stopAllAudio();
    
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  // Draw flash card on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentCardData) return;

    const ctx = canvas.getContext('2d');
    
    const drawCard = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Use the pre-loaded card data from state
      const cardData = currentCardData;
      
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
      
      // 4. Draw speech balloon with ear icon if usageExample exists (BEFORE text so text renders on top)
      if (cardData.usageExample) {
        // Position the speech balloon near the character's head
        const balloonSize = config.speechBubble?.size || 45;
        const offsetXLeft = config.speechBubble?.offsetXLeft || -10;
        const offsetXRight = config.speechBubble?.offsetX || 50;
        const offsetY = config.speechBubble?.offsetY || -15;
        const imageScale = config.speechBubble?.imageScale || 1.5;
        const earIconOffsetY = config.speechBubble?.earIconOffsetY || 0;
        const opacity = config.speechBubble?.opacity !== undefined ? config.speechBubble.opacity : 1;
        
        // Calculate character position (same logic as character drawing)
        const baseWidth = config.characterWidth || 220;
        const baseHeight = config.characterHeight || 220;
        const scale = config.characterScale || 0.8;
        const charWidth = baseWidth * scale;
        const charHeight = baseHeight * scale;
        const charMargin = 10;
        const charX = isReversedLayout
          ? canvas.width - charWidth - charMargin
          : charMargin;
        const charY = canvas.height - charHeight;
        
        // Position balloon relative to character using appropriate offset for layout
        const balloonX = isReversedLayout
          ? charX + offsetXRight  // Character on right - use offsetX (offsetXRight)
          : charX + charWidth + offsetXLeft;   // Character on left - use offsetXLeft
        const balloonY = charY + offsetY;
        
        // Store bounds for click detection
        setSpeechBalloonBounds({
          x: balloonX,
          y: balloonY,
          width: balloonSize,
          height: balloonSize
        });
        
        // Draw speech balloon using PNG image
        if (imagesRef.current.speechBubble) {
          ctx.save();
          ctx.globalCompositeOperation = 'source-over';
          
          const img = imagesRef.current.speechBubble;
          const imgWidth = balloonSize * imageScale;
          const imgHeight = balloonSize * imageScale;
          const imgX = balloonX - (imgWidth - balloonSize) / 2;
          const imgY = balloonY - (imgHeight - balloonSize) / 2;
          
          // Set opacity for speech bubble
          ctx.globalAlpha = opacity;
          
          // Flip horizontally if layout is reversed (right side)
          if (isReversedLayout) {
            ctx.translate(imgX + imgWidth, imgY);
            ctx.scale(-1, 1);
            ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
          } else {
            ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);
          }
          
          ctx.restore(); // Restore BEFORE drawing dots
          
          // Draw dots in center of balloon to indicate interactivity (in new context)
          ctx.save();
          ctx.globalAlpha = 1; // Full opacity for dots
          ctx.font = `${balloonSize * 0.5}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#333'; // Ensure dots have a color
          ctx.fillText('...', balloonX + balloonSize/2, balloonY + balloonSize/2 + earIconOffsetY);
          ctx.restore();
        } else {
          // Fallback: Draw speech balloon background (circle) if image not loaded
          ctx.save();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.strokeStyle = '#666';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(balloonX + balloonSize/2, balloonY + balloonSize/2, balloonSize/2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          
          // Draw ear icon
          ctx.font = `${balloonSize * 0.6}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('...', balloonX + balloonSize/2, balloonY + balloonSize/2 + earIconOffsetY);
          ctx.restore();
        }
      } else {
        // No usage example - clear bounds
        setSpeechBalloonBounds(null);
      }

      // 5. Draw text overlay (AFTER speech balloon so text is always on top and fully visible)
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
        // Ensure text is drawn on top using source-over (default, but explicit)
        ctx.globalCompositeOperation = 'source-over';
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
  }, [actualCardIndex, config, category, currentCardData, currentCardIndex, isReversedLayout]);

  // Get category display name
  const categoryData = getCategoryById(category);
  const categoryDisplayName = categoryData?.displayName || categoryData?.name || category;

  return (
    <div className={`flash-cards-dialog ${isVisible ? 'visible' : ''}`}>
      <div className="flash-cards-content">
        <div className="flash-cards-header">
          <h2>🎓 Flash Cards - {categoryDisplayName}</h2>
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
            onClick={handleCanvasClick}
            onTouchEnd={handleCanvasClick}
            style={{ cursor: speechBalloonBounds ? 'pointer' : 'default' }}
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

        {/* Share Link - positioned absolutely in bottom right */}
        <a 
          href={`/?category=${category}`}
          className="flash-cards-share"
          title="Share this category"
          target="_blank"
          rel="noopener noreferrer"
        >
          🔗 Share
        </a>

        {/* Usage Example Modal */}
        {showUsageModal && currentCardData?.usageExample && (() => {
          const englishTranslation = exampleTranslations?.[currentCardData.usageExample];
          return (
            <div className="usage-modal-content">
              <button
                className="usage-modal-close"
                onClick={() => setShowUsageModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
              <h3 className="usage-modal-title">💬 Usage Example</h3>
              {currentCardData.emoji && (
                <div style={{ textAlign: 'center', margin: '10px 0' }}>
                  <EmojiDisplay 
                    emoji={currentCardData.emoji} 
                    category={category} 
                    size="48px"
                  />
                </div>
              )}
              <p className="usage-modal-text">{currentCardData.usageExample}</p>
              {englishTranslation && (
                <p className="usage-modal-translation">{englishTranslation}</p>
              )}
              {/* Example audio play button */}
              {exampleAudioAvailable && isOnline && (
                <div className="usage-modal-audio">
                  <button
                    onClick={handlePlayExample}
                    disabled={isPlayingExample || exampleAudioLoading}
                    className="btn-pronunciation"
                    title={exampleAudioLoading ? 'Loading audio...' : (isPlayingExample ? 'Playing...' : 'Hear Example')}
                  >
                    <span className="pronunciation-icon">
                      {exampleAudioLoading ? '⏳' : (isPlayingExample ? '🔊' : '🔉')}
                    </span>
                  </button>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default FlashCardsDialog;
