/**
 * Flash Cards Configuration
 * 
 * Unified configuration for all flash card categories
 * Card mappings are defined per category in the cards object
 */

/**
 * FEATURE FLAG: Enable/Disable Flash Cards
 * Set to false to disable flash cards feature globally
 * Useful for testing or temporarily disabling the feature
 */
export const FLASH_CARDS_ENABLED = false;

/**
 * Unified Flash Cards Configuration
 * This configuration applies to ALL categories
 */
export const flashCardsConfig = {
  // Canvas display size
  canvasWidth: 360,
  canvasHeight: 240,
  
  // Default assets for dynamic card generation
  defaultBackground: 'purple.png',
  defaultCharacter: 'emma',
  defaultEmotion: 'happy.png',
  
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
    animationSpeed: 0.008,
    
    // Fade intensity range (min to max opacity)
    fadeMin: 0.4,
    fadeMax: 1.0,
    
    // Diamond size in pixels
    size: 45,
    
    // Position from top-left corner
    positionX: 30,
    positionY: 30,
  },

  /**
   * Card mappings by category
   * Each category defines which question IDs to show and their visual properties
   */
  cards: {
    food: [
      { 
        questionId: 'food_001', // la sandía - the watermelon
        object: 'la sandía.svg',
        emotion: 'pleased.png',
      },
      { 
        questionId: 'food_002', // el plátano - the banana
        object: 'el plátano.svg',
        emotion: 'happy.png',
      },
      { 
        questionId: 'food_003', // la manzana - the apple
        object: 'la manzana.svg',
        emotion: 'pleased.png',
      },
      { 
        questionId: 'food_004', // la naranja - the orange
        object: 'la naranja.svg',
        emotion: 'excited.png',
      },
      { 
        questionId: 'food_009', // la piña - the pineapple
        object: 'la piña.svg',
        emotion: 'happy.png',
      },
      { 
        questionId: 'food_036', // la pizza - the pizza
        object: 'la pizza.svg',
        emotion: 'pleased.png',
      },
      { 
        questionId: 'food_037', // la hamburguesa - the hamburger
        object: 'la hamburguesa.svg',
        emotion: 'happy.png',
      },
      { 
        questionId: 'food_039', // el taco - the taco
        object: 'el taco.svg',
        emotion: 'pleased.png',
      },
      { 
        questionId: 'food_043', // el pollo - the chicken
        object: 'el pollo.svg',
        emotion: 'excited.png',
      },
      { 
        questionId: 'food_069', // el helado - the ice cream
        object: 'el helado.svg',
        emotion: 'happy.png',
      },
    ],
    // Add other categories here as they are created
    // animals: [ ... ],
    // numbers: [ ... ],
  },
};

/**
 * Get flash card configuration (always returns the unified config)
 * @param {string} category - The category ID (for compatibility)
 * @returns {Object} The unified flash cards configuration
 */
export const getFlashCardConfig = (category) => {
  return flashCardsConfig;
};

/**
 * Get flash card data for a specific card index
 * @param {string} category - The category ID
 * @param {number} cardIndex - The index of the card (0-based)
 * @param {Object} questionsData - Questions data from the questions config
 * @param {Object} answerTranslations - Answer translations
 * @returns {Object|null} Object with spanish text, english text, and image paths, or null if not found
 */
export const getFlashCardData = (category, cardIndex, questionsData, answerTranslations) => {
  // Get category cards from unified config
  const categoryCards = flashCardsConfig.cards[category];
  
  // Check if category has card mappings
  if (!categoryCards || !categoryCards[cardIndex]) {
    return null;
  }
  
  const cardConfig = categoryCards[cardIndex];
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
  
  // Get image paths (use card-specific or default)
  const background = cardConfig.background || flashCardsConfig.defaultBackground;
  const character = cardConfig.character || flashCardsConfig.defaultCharacter;
  const emotion = cardConfig.emotion || flashCardsConfig.defaultEmotion;
  const object = cardConfig.object;
  
  return {
    spanish: spanishText,
    english: englishText,
    emoji: question.emoji,
    // Image paths for dynamic composition
    images: {
      background,
      character,
      emotion,
      object,
    },
  };
};

/**
 * Get total number of cards for a category
 * @param {string} category - The category ID
 * @returns {number} Number of cards in the category
 */
export const getCategoryCardCount = (category) => {
  const categoryCards = flashCardsConfig.cards[category];
  return categoryCards ? categoryCards.length : 0;
};

/**
 * Check if a category has flash cards configured
 * @param {string} category - The category ID
 * @returns {boolean} True if category has flash cards and feature is enabled
 */
export const hasFlashCards = (category) => {
  if (!FLASH_CARDS_ENABLED) {
    console.log('[Flash Cards] Feature is DISABLED globally');
    return false;
  }
  const hasConfig = !!flashCardsConfig.cards[category];
  console.log(`[Flash Cards] Category "${category}" has config: ${hasConfig}, feature enabled: ${FLASH_CARDS_ENABLED}`);
  return hasConfig;
};

/**
 * Get all categories that have flash cards configured
 * @returns {string[]} Array of category IDs (empty if feature is disabled)
 */
export const getFlashCardCategories = () => {
  if (!FLASH_CARDS_ENABLED) return [];
  return Object.keys(flashCardsConfig.cards);
};
