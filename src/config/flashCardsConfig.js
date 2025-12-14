/**
 * Flash Cards Configuration
 * 
 * Unified configuration for all flash card categories
 * Card content is imported from individual category files in flashCards/
 */

import { foodFlashCards, foodGlobalValues } from './flashCards/food.js';

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
    
    // Position from top-left corner (auto-positioned based on textAlign unless overridden per card)
    // positionX: auto (top-right when textAlign='left', top-left when textAlign='right')
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
  
  /**
   * Global values by category
   * These values are applied to all cards in a category
   * Individual cards can override these values
   */
  globalValues: {
    food: foodGlobalValues,
    // animals: animalsGlobalValues,
    // numbers: numbersGlobalValues,
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
  
  // Get global values for this category
  const globalValues = flashCardsConfig.globalValues?.[category] || {};
  
  // Merge global values with card config (card config takes precedence)
  const mergedConfig = { ...globalValues, ...cardConfig };
  
  // Get image paths (use card-specific or default)
  const background = mergedConfig.background || flashCardsConfig.defaultBackground;
  const character = mergedConfig.character || flashCardsConfig.defaultCharacter;
  const emotion = mergedConfig.emotion || flashCardsConfig.defaultEmotion;
  const object = mergedConfig.object;
  
  return {
    spanish: mergedConfig.spanish,
    english: mergedConfig.english,
    emoji: mergedConfig.emoji, // Emoji string (e.g., '🍕')
    emojiPosition: mergedConfig.emojiPosition, // Optional emoji positioning { x, y, size }
    // Optional card-specific overrides (can come from global or card-specific)
    textAlign: mergedConfig.textAlign,
    leftMargin: mergedConfig.leftMargin,
    spanishColor: mergedConfig.spanishColor,
    englishColor: mergedConfig.englishColor,
    spanishPosition: mergedConfig.spanishPosition,
    englishPosition: mergedConfig.englishPosition,
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
