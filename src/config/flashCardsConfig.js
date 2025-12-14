/**
 * Flash Cards Configuration
 * 
 * Unified configuration for all flash card categories
 * Card content is imported from individual category files in flashCards/
 */

import { foodFlashCards } from './flashCards/food.js';

/**
 * FEATURE FLAG: Enable/Disable Flash Cards
 * Set to false to disable flash cards feature globally
 * Useful for testing or temporarily disabling the feature
 */
export const FLASH_CARDS_ENABLED = true;

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
    // Text alignment configuration
    align: 'right', // 'left' or 'right' only (character and emoji auto-position opposite to text)
    leftMargin: 20, // Margin from edge (pixels from left when text is left-aligned, from right when right-aligned)
    
    // Spanish text configuration (main text)
    spanish: {
      fontSize: 36,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      color: '#333',
      maxWidth: 320, // Max width before wrapping
      lineHeight: 1.3,
    },
    // English text configuration (translation below)
    english: {
      fontSize: 24,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'normal',
      color: '#ff1313ff',
      maxWidth: 320,
      lineHeight: 1.2,
    },
    // Vertical spacing
    verticalSpacing: 15, // Space between Spanish and English text
    // Top margin for text
    topMargin: 20,
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
   * Card content by category
   * Imported from individual category files
   */
  cards: {
    food: foodFlashCards,
    // Add other categories here as they are created
    // animals: animalsFlashCards,
    // numbers: numbersFlashCards,
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
 * @returns {Object|null} Object with spanish text, english text, and image paths, or null if not found
 */
export const getFlashCardData = (category, cardIndex) => {
  // Get category cards from unified config
  const categoryCards = flashCardsConfig.cards[category];
  
  // Check if category has card mappings
  if (!categoryCards || !categoryCards[cardIndex]) {
    return null;
  }
  
  const cardConfig = categoryCards[cardIndex];
  
  // Get image paths (use card-specific or default)
  const background = cardConfig.background || flashCardsConfig.defaultBackground;
  const character = cardConfig.character || flashCardsConfig.defaultCharacter;
  const emotion = cardConfig.emotion || flashCardsConfig.defaultEmotion;
  const object = cardConfig.object;
  
  return {
    spanish: cardConfig.spanish,
    english: cardConfig.english,
    emoji: cardConfig.emoji, // Emoji string (e.g., '🍕')
    emojiPosition: cardConfig.emojiPosition, // Optional emoji positioning { x, y, size }
    // Optional card-specific overrides
    textAlign: cardConfig.textAlign,
    leftMargin: cardConfig.leftMargin,
    spanishColor: cardConfig.spanishColor,
    englishColor: cardConfig.englishColor,
    spanishPosition: cardConfig.spanishPosition,
    englishPosition: cardConfig.englishPosition,
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
