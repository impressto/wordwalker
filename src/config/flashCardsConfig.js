/**
 * Flash Cards Configuration
 * 
 * Unified configuration for all flash card categories
 * Flash cards now dynamically generated from questions data
 */

import { getQuestionsByCategory } from './questions/index.js';
import { getCategoryTranslation } from './translations/answers/index.js';

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
 * Now dynamically generated from questions data
 * @param {string} category - The category ID
 * @param {number} cardIndex - The index of the card (0-based)
 * @returns {Object|null} Object with spanish text, english text, emoji, and image paths, or null if not found
 */
export const getFlashCardData = (category, cardIndex) => {
  // Get questions for this category
  const categoryQuestions = getQuestionsByCategory(category);
  
  // Check if question exists at this index
  if (!categoryQuestions || cardIndex >= categoryQuestions.length) {
    return null;
  }
  
  const question = categoryQuestions[cardIndex];
  
  // Extract the correct answer as the Spanish text
  const spanish = question.correctAnswer;
  
  // Get English translation using the category-specific translation system
  const english = getCategoryTranslation(spanish, category) || spanish;
  
  return {
    spanish: spanish,
    english: english,
    emoji: question.emoji, // Use the emoji from the question
    emojiPosition: undefined, // Use default positioning
    textAlign: undefined, // Use default from config
    leftMargin: undefined,
    spanishColor: undefined,
    englishColor: undefined,
    spanishPosition: undefined,
    englishPosition: undefined,
    // Image paths for dynamic composition
    images: {
      background: flashCardsConfig.defaultBackground,
      character: flashCardsConfig.defaultCharacter,
      emotion: flashCardsConfig.defaultEmotion,
      object: undefined,
    },
  };
};

/**
 * Get total number of cards for a category
 * Now based on the number of questions in the category
 * @param {string} category - The category ID
 * @returns {number} Number of cards in the category
 */
export const getCategoryCardCount = (category) => {
  const categoryQuestions = getQuestionsByCategory(category);
  return categoryQuestions ? categoryQuestions.length : 0;
};

/**
 * Check if a category has flash cards configured
 * Now checks if category has questions
 * @param {string} category - The category ID
 * @returns {boolean} True if category has questions and feature is enabled
 */
export const hasFlashCards = (category) => {
  if (!FLASH_CARDS_ENABLED) {
    console.log('[Flash Cards] Feature is DISABLED globally');
    return false;
  }
  const categoryQuestions = getQuestionsByCategory(category);
  const hasQuestions = categoryQuestions && categoryQuestions.length > 0;
  console.log(`[Flash Cards] Category "${category}" has questions: ${hasQuestions}, feature enabled: ${FLASH_CARDS_ENABLED}`);
  return hasQuestions;
};

/**
 * Get all categories that have flash cards configured
 * Now returns all categories that have questions
 * @returns {string[]} Array of category IDs (empty if feature is disabled)
 */
export const getFlashCardCategories = () => {
  if (!FLASH_CARDS_ENABLED) return [];
  // For now, return a static list of known categories
  // This could be improved by scanning all question categories
  return ['food', 'shopping', 'entertainment', 'accommodation', 'transportation', 
          'directions', 'medical', 'greetings', 'numbers', 'grammar', 
          'recreation', 'plants_animals', 'weather', 'daily_routines', 'people',
          'emergencies', 'business', 'restaurant'];
};
