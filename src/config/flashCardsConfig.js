/**
 * Flash Cards Configuration
 * 
 * Defines the layout and properties of flash card sprite sheets
 */

export const flashCardsConfig = {
  // Default configuration for all flash card categories
  default: {
    // Total number of cards in the sprite sheet
    totalCards: 10,
    
    // Sprite sheet dimensions
    spriteWidth: 3600,
    spriteHeight: 240,
    
    // Individual card dimensions (calculated automatically if not specified)
    // cardWidth: 340,  // spriteWidth / totalCards
    // cardHeight: 250, // same as spriteHeight
    
    // Canvas display size
    canvasWidth: 360,
    canvasHeight: 240,
    
    // Offset adjustments (if cards aren't perfectly aligned in sprite)
    offsetX: 0,
    offsetY: 0,
    
    // Spacing between cards in sprite (if there's padding)
    cardSpacing: 0,
    
    // Diamond animation configuration
    diamond: {
      // Animation speed (lower = slower fade, higher = faster fade)
      // Default 0.015 gives a gentle, smooth fade effect
      // Range: 0.01 (very slow) to 0.05 (very fast)
      animationSpeed: 0.008,
      
      // Fade intensity range (min to max opacity)
      // Default 0.4 to 1.0 means fades between 40% and 100% opacity
      fadeMin: 0.4,
      fadeMax: 1.0,
      
      // Diamond size in pixels
      size: 45,
      
      // Position from top-left corner
      positionX: 30,
      positionY: 30,
    },
  },
  
  // Category-specific overrides
  food: {
    // Use default values, but you can override here if needed
    // For example, if the food cards have different spacing:
    // cardSpacing: 0,
    // offsetX: 0,
    
    // Or customize diamond animation for this category:
    // diamond: {
    //   animationSpeed: 0.02,  // Faster animation for food category
    // },
  },
  
  // Add more categories as needed
  // animals: {
  //   totalCards: 10,
  //   spriteWidth: 3400,
  //   spriteHeight: 250,
  // },
};

/**
 * Get flash card configuration for a specific category
 * @param {string} category - The category ID
 * @returns {Object} Configuration object
 */
export const getFlashCardConfig = (category) => {
  const categoryConfig = flashCardsConfig[category] || {};
  const defaultConfig = flashCardsConfig.default;
  
  // Merge default with category-specific config
  const config = {
    ...defaultConfig,
    ...categoryConfig,
  };
  
  // Calculate card dimensions if not specified
  if (!config.cardWidth) {
    config.cardWidth = config.spriteWidth / config.totalCards;
  }
  if (!config.cardHeight) {
    config.cardHeight = config.spriteHeight;
  }
  
  return config;
};

/**
 * Calculate the source rectangle for a specific card
 * @param {number} cardIndex - The index of the card (0-based)
 * @param {Object} config - The flash card configuration
 * @returns {Object} Object with x, y, width, height for source rectangle
 */
export const getCardSourceRect = (cardIndex, config) => {
  return {
    x: (cardIndex * config.cardWidth) + (cardIndex * config.cardSpacing) + config.offsetX,
    y: config.offsetY,
    width: config.cardWidth,
    height: config.cardHeight,
  };
};
