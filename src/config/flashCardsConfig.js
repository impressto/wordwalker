/**
 * Flash Cards Configuration
 * 
 * Defines the layout and properties of flash card sprite sheets
 * 
 * NOTE: This file is deprecated. New configuration is in src/config/flash-cards/
 * This file is kept for backward compatibility only.
 */

/**
 * FEATURE FLAG: Enable/Disable Flash Cards
 * Set to false to disable flash cards feature globally
 * This controls both the debug button and the category completion prompt
 */
export const FLASH_CARDS_ENABLED = true;

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
    
    // Text rendering configuration
    text: {
      // Spanish text configuration (main text)
      spanish: {
        fontSize: 28,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        color: '#333',
        maxWidth: 320, // Max width before wrapping
        lineHeight: 1.3,
      },
      // English text configuration (translation below)
      english: {
        fontSize: 18,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'normal',
        color: '#666',
        maxWidth: 320,
        lineHeight: 1.2,
      },
      // Vertical spacing
      verticalSpacing: 15, // Space between Spanish and English text
      // Top margin for text
      topMargin: 60,
    },
    
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
    
    // Flash card data: Maps card indices to question IDs
    // These are the featured vocabulary items shown in flash cards
    cards: [
      { questionId: 'food_001' }, // la sandía - the watermelon
      { questionId: 'food_002' }, // el plátano - the banana
      { questionId: 'food_003' }, // la manzana - the apple
      { questionId: 'food_004' }, // la naranja - the orange
      { questionId: 'food_009' }, // la piña - the pineapple
      { questionId: 'food_036' }, // la pizza - the pizza
      { questionId: 'food_037' }, // la hamburguesa - the hamburger
      { questionId: 'food_039' }, // el taco - the taco
      { questionId: 'food_043' }, // el pollo - the chicken
      { questionId: 'food_069' }, // el helado - the ice cream
    ],
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

/**
 * Get flash card data for a specific card index
 * @param {string} category - The category ID
 * @param {number} cardIndex - The index of the card (0-based)
 * @param {Object} questionsData - Questions data from the questions config
 * @param {Object} answerTranslations - Answer translations
 * @returns {Object|null} Object with spanish and english text, or null if not found
 */
export const getFlashCardData = (category, cardIndex, questionsData, answerTranslations) => {
  const config = getFlashCardConfig(category);
  
  // Check if category has card mappings
  if (!config.cards || !config.cards[cardIndex]) {
    return null;
  }
  
  const cardConfig = config.cards[cardIndex];
  const questionId = cardConfig.questionId;
  
  // Find the question in the questions data
  const question = questionsData.find(q => q.id === questionId);
  if (!question) {
    return null;
  }
  
  // Get the correct answer (Spanish text)
  const spanishText = question.correctAnswer;
  
  // Get the English translation
  const englishText = answerTranslations[spanishText] || '';
  
  return {
    spanish: spanishText,
    english: englishText,
    emoji: question.emoji,
  };
};
