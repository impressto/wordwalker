/**
 * Flash Cards Index
 * 
 * Central configuration for all flash card categories
 * Imports individual category configs and provides unified access
 */

import { foodFlashCardsConfig } from './food.js';
// Import other category configs as they are created
// import { animalsFlashCardsConfig } from './animals.js';
// import { numbersFlashCardsConfig } from './numbers.js';

/**
 * FEATURE FLAG: Enable/Disable Flash Cards
 * Set to false to disable flash cards feature globally
 * Useful for testing or temporarily disabling the feature
 */
export const FLASH_CARDS_ENABLED = false;

/**
 * Default configuration applied to all categories
 */
export const defaultFlashCardsConfig = {
  // Total number of cards in the sprite sheet
  totalCards: 10,
  
  // Sprite sheet dimensions
  spriteWidth: 3600,
  spriteHeight: 240,
  
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
};

/**
 * Flash card configurations by category
 */
export const flashCardsConfigByCategory = {
  food: foodFlashCardsConfig,
  // Add other categories here as they are created
  // animals: animalsFlashCardsConfig,
  // numbers: numbersFlashCardsConfig,
};

/**
 * Get flash card configuration for a specific category
 * @param {string} category - The category ID
 * @returns {Object} Configuration object with defaults merged
 */
export const getFlashCardConfig = (category) => {
  const categoryConfig = flashCardsConfigByCategory[category] || {};
  
  // Deep merge default with category-specific config
  const config = {
    ...defaultFlashCardsConfig,
    ...categoryConfig,
    // Deep merge nested objects
    text: {
      ...defaultFlashCardsConfig.text,
      ...(categoryConfig.text || {}),
      spanish: {
        ...defaultFlashCardsConfig.text.spanish,
        ...(categoryConfig.text?.spanish || {}),
      },
      english: {
        ...defaultFlashCardsConfig.text.english,
        ...(categoryConfig.text?.english || {}),
      },
    },
    diamond: {
      ...defaultFlashCardsConfig.diamond,
      ...(categoryConfig.diamond || {}),
    },
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
  const hasConfig = !!flashCardsConfigByCategory[category];
  console.log(`[Flash Cards] Category "${category}" has config: ${hasConfig}, feature enabled: ${FLASH_CARDS_ENABLED}`);
  return hasConfig;
};

/**
 * Get all categories that have flash cards configured
 * @returns {string[]} Array of category IDs (empty if feature is disabled)
 */
export const getFlashCardCategories = () => {
  if (!FLASH_CARDS_ENABLED) return [];
  return Object.keys(flashCardsConfigByCategory);
};
