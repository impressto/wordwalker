import { useState, useEffect, useRef } from 'react';
import './FlashCardsDialog.css';
import { getStreakColor } from '../config/gameSettings';
import { getFlashCardConfig, getCardSourceRect } from '../config/flashCardsConfig';

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
  const flashCardImageRef = useRef(null);
  const animationFrameRef = useRef(null);
  const diamondGlowRef = useRef(0);

  // Get flash card configuration for this category
  const config = getFlashCardConfig(category);

  // Get base path for assets
  const basePath = import.meta.env.BASE_URL || '/';
  const flashCardImagePath = `${basePath}images/flash-cards/${category}/flash-cards-1.png`;

  // Load flash card image
  useEffect(() => {
    const img = new Image();
    img.src = flashCardImagePath;
    img.onload = () => {
      flashCardImageRef.current = img;
    };
    flashCardImageRef.current = img;

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [flashCardImagePath]);

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
    if (!canvas || !flashCardImageRef.current) return;

    const ctx = canvas.getContext('2d');
    
    const drawCard = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Get source rectangle for current card using config
      const sourceRect = getCardSourceRect(currentCardIndex, config);

      // Draw the flash card image
      if (flashCardImageRef.current.complete) {
        ctx.drawImage(
          flashCardImageRef.current,
          sourceRect.x, sourceRect.y, sourceRect.width, sourceRect.height,
          0, 0, canvas.width, canvas.height
        );
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
  }, [currentCardIndex, streak, config]);

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
