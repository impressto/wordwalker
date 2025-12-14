import { useState, useEffect, useRef } from 'react';
import './FlashCardsDialog.css';
import { getStreakColor } from '../config/gameSettings';
import { getFlashCardConfig, getFlashCardData } from '../config/flash-cards';
import { foodQuestions } from '../config/questions/food';
import { foodAnswerTranslations } from '../config/translations/answers/food';

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
  const fontSize = parseInt(ctx.font);
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
const FlashCardsDialog = ({ category, onComplete, streak }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const canvasRef = useRef(null);
  const imagesRef = useRef({});
  const animationFrameRef = useRef(null);
  const diamondGlowRef = useRef(0);

  // Get flash card configuration for this category
  const config = getFlashCardConfig(category);
  
  // Get questions data based on category
  // TODO: Make this dynamic for other categories
  const questionsData = category === 'food' ? foodQuestions : [];
  const answerTranslations = category === 'food' ? foodAnswerTranslations : {};

  // Get base path for assets
  const basePath = import.meta.env.BASE_URL || '/';

  // Preload all images for the current card
  useEffect(() => {
    const cardData = getFlashCardData(
      category, 
      currentCardIndex, 
      questionsData, 
      answerTranslations
    );
    
    if (!cardData || !cardData.images) return;

    const imagesToLoad = {};
    const imagePromises = [];

    // Load background
    if (cardData.images.background) {
      const bgPath = `${basePath}images/flash-cards/backgrounds/${cardData.images.background}`;
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

    // Load object
    if (cardData.images.object) {
      const objPath = `${basePath}images/flash-cards/objects/${cardData.images.object}`;
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
  }, [currentCardIndex, category, basePath, questionsData, answerTranslations]);

  // Add a small delay before showing the dialog to allow DOM layout calculation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    if (currentCardIndex < config.totalCards - 1) {
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
        currentCardIndex, 
        questionsData, 
        answerTranslations
      );
      
      if (!cardData) {
        animationFrameRef.current = requestAnimationFrame(drawCard);
        return;
      }

      // Draw layers in order:
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

      // 2. Character with emotion
      if (isImageReady(imagesRef.current.character)) {
        // Position character on the left side
        const charWidth = canvas.width * 0.4; // 40% of canvas width
        const charHeight = canvas.height * 0.8; // 80% of canvas height
        const charX = canvas.width * 0.05; // 5% from left
        const charY = canvas.height * 0.15; // 15% from top
        
        ctx.drawImage(
          imagesRef.current.character,
          charX, charY, charWidth, charHeight
        );
      }

      // 3. Object
      if (isImageReady(imagesRef.current.object)) {
        // Position object on the right side
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
        
        // Center position
        const centerX = canvas.width / 2;
        let currentY = topMargin;
        
        // Draw Spanish text (main text)
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.font = `${spanishConfig.fontWeight || 'bold'} ${spanishConfig.fontSize || 28}px ${spanishConfig.fontFamily || 'Arial'}`;
        ctx.fillStyle = spanishConfig.color || '#333';
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = 3;
        
        const spanishHeight = drawWrappedText(
          ctx,
          cardData.spanish,
          centerX,
          currentY,
          spanishConfig.maxWidth || 320,
          spanishConfig.lineHeight || 1.3
        );
        
        currentY += spanishHeight + verticalSpacing;
        
        // Draw English text (translation)
        ctx.font = `${englishConfig.fontWeight || 'normal'} ${englishConfig.fontSize || 18}px ${englishConfig.fontFamily || 'Arial'}`;
        ctx.fillStyle = englishConfig.color || '#666';
        ctx.shadowBlur = 2;
        
        drawWrappedText(
          ctx,
          cardData.english,
          centerX,
          currentY,
          englishConfig.maxWidth || 320,
          englishConfig.lineHeight || 1.2
        );
        
        ctx.restore();
      }

      // Draw animated glowing diamond in top-left corner
      if (streak > 0) {
        // Get diamond animation config
        const diamondConfig = config.diamond || {};
        const diamondSize = diamondConfig.size || 45;
        const diamondX = diamondConfig.positionX || 30;
        const diamondY = diamondConfig.positionY || 30;
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
  }, [currentCardIndex, streak, config, category, questionsData, answerTranslations]);

  return (
    <div className={`flash-cards-dialog ${isVisible ? 'visible' : ''}`}>
      <div className="flash-cards-content">
        <div className="flash-cards-header">
          <h2>🎓 Flash Cards</h2>
          <p className="cards-progress">
            Card {currentCardIndex + 1} of {config.totalCards}
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
            {currentCardIndex < config.totalCards - 1 ? 'Next →' : 'Finish ✓'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashCardsDialog;
